
import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Trash2, Users, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface YearConfig {
  id: string;
  year: number;
  is_active: boolean;
  registration_fee: number;
  created_at: string;
}

interface NewYearManagerProps {
  users: User[];
  onNewYear: (year: number) => void;
  onUpdateUsers: (users: User[]) => void;
}

const NewYearManager: React.FC<NewYearManagerProps> = ({ users, onNewYear, onUpdateUsers }) => {
  const [yearConfigs, setYearConfigs] = useState<YearConfig[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);
  const [registrationFee, setRegistrationFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchYearConfigs();
  }, []);

  const fetchYearConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('year_configs')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setYearConfigs(data || []);
    } catch (error) {
      console.error('Error fetching year configs:', error);
    }
  };

  const handleCreateNewYear = async () => {
    setLoading(true);
    try {
      // Deactivate all existing years
      await supabase
        .from('year_configs')
        .update({ is_active: false })
        .neq('id', '');

      // Create new year config
      const { error } = await supabase
        .from('year_configs')
        .insert([{
          year: selectedYear,
          is_active: true,
          registration_fee: registrationFee,
        }]);

      if (error) throw error;

      // Notify all users about new year registration
      const updatedUsers = users.map(user => ({
        ...user,
        notifications: [
          ...user.notifications,
          {
            id: Date.now().toString() + Math.random(),
            title: 'New Year Registration Open',
            message: `Registration for ${selectedYear} is now open. Please re-register to continue your membership.`,
            date: new Date().toISOString(),
            read: false,
            fromAdmin: 'System',
          }
        ]
      }));

      onUpdateUsers(updatedUsers);
      onNewYear(selectedYear);
      await fetchYearConfigs();

      toast({
        title: "New Year Created",
        description: `Registration for ${selectedYear} is now active. All users have been notified.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new year configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (yearId: string, year: number) => {
    try {
      const { error } = await supabase
        .from('year_configs')
        .delete()
        .eq('id', yearId);

      if (error) throw error;

      await fetchYearConfigs();

      toast({
        title: "Year Deleted",
        description: `Year ${year} configuration has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete year configuration",
        variant: "destructive"
      });
    }
  };

  const activeYear = yearConfigs.find(config => config.is_active);
  const totalUsers = users.length;
  const reregisteredUsers = users.filter(user => user.registrationYear === activeYear?.year).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          New Year Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeYear && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-blue-800">Active Year: {activeYear.year}</h3>
                <p className="text-sm text-blue-600">Registration Fee: AED {activeYear.registration_fee}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">{reregisteredUsers}/{totalUsers}</p>
                <p className="text-sm text-blue-600">Users Re-registered</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Create New Year</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Year
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Year Registration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Registration Fee (AED)</label>
                  <Input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(Number(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Warning:</p>
                      <p className="text-yellow-700">
                        Creating a new year will deactivate the current year and notify all users 
                        to re-register. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={loading}>
                      {loading ? 'Creating...' : 'Create New Year'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a new registration year ({selectedYear}) and notify all {totalUsers} users. 
                        The current year will be deactivated. All users will need to re-register.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCreateNewYear}>
                        Yes, Create New Year
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Year History</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee (AED)</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearConfigs.map((config) => {
                const yearUsers = users.filter(u => u.registrationYear === config.year);
                return (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">{config.year}</TableCell>
                    <TableCell>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{config.registration_fee}</TableCell>
                    <TableCell>{new Date(config.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {yearUsers.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!config.is_active && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Year Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the year {config.year} configuration? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteYear(config.id, config.year)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewYearManager;
