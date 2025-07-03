
import React, { useState, useEffect } from 'react';
import { User, YearlyData } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Trash2, Users, AlertTriangle } from 'lucide-react';

interface NewYearManagerProps {
  users: User[];
  onNewYear: (year: number) => void;
  onUpdateUsers: (users: User[]) => void;
  currentYear: number;
  availableYears: number[];
}

const NewYearManager: React.FC<NewYearManagerProps> = ({ 
  users, 
  onNewYear, 
  onUpdateUsers,
  currentYear,
  availableYears 
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);
  const [registrationFee, setRegistrationFee] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateNewYear = async () => {
    setLoading(true);
    try {
      // Create new year data structure
      const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
      
      // Check if year already exists
      if (yearlyData.some(data => data.year === selectedYear)) {
        throw new Error('Year already exists');
      }

      // Deactivate all existing years
      const updatedYearlyData = yearlyData.map(data => ({ ...data, isActive: false }));
      
      // Add new year
      const newYearData: YearlyData = {
        year: selectedYear,
        users: [],
        isActive: true
      };
      updatedYearlyData.push(newYearData);

      // Update storage
      localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));
      localStorage.setItem('currentYear', JSON.stringify(selectedYear));
      localStorage.setItem('availableYears', JSON.stringify([...availableYears, selectedYear]));

      // Notify all users about new year registration
      const updatedUsers = users.map(user => ({
        ...user,
        notifications: [
          ...user.notifications,
          {
            id: Date.now().toString() + Math.random(),
            title: 'New Year Registration Open',
            message: `Registration for ${selectedYear} is now open. Click the renewal button to continue your membership for AED 50.`,
            date: new Date().toISOString(),
            read: false,
            fromAdmin: 'System',
          }
        ]
      }));

      onUpdateUsers(updatedUsers);
      onNewYear(selectedYear);
      setIsDialogOpen(false);

      toast({
        title: "New Year Created",
        description: `Registration for ${selectedYear} is now active. All users have been notified.`,
      });
    } catch (error) {
      console.error('Error creating new year:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create new year",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = (year: number) => {
    try {
      if (year === currentYear) {
        toast({
          title: "Cannot Delete",
          description: "Cannot delete the active year",
          variant: "destructive"
        });
        return;
      }

      const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
      const updatedYearlyData = yearlyData.filter(data => data.year !== year);
      const updatedAvailableYears = availableYears.filter(y => y !== year);

      localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));
      localStorage.setItem('availableYears', JSON.stringify(updatedAvailableYears));

      toast({
        title: "Year Deleted",
        description: `Year ${year} has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting year:', error);
      toast({
        title: "Error",
        description: "Failed to delete year",
        variant: "destructive"
      });
    }
  };

  const totalUsers = users.length;
  const reregisteredUsers = users.filter(user => user.registrationYear === currentYear).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          New Year Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-blue-800">Active Year: {currentYear}</h3>
              <p className="text-sm text-blue-600">Registration Fee: AED 50 (Renewal) / AED 60 (New)</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">{reregisteredUsers}/{totalUsers}</p>
              <p className="text-sm text-blue-600">Users Registered</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Create New Year</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <TableHead>Registrations</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableYears.map((year) => {
                const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
                const yearData = yearlyData.find(data => data.year === year);
                const yearUsers = yearData?.users || [];
                const isActive = year === currentYear;
                
                return (
                  <TableRow key={year}>
                    <TableCell className="font-medium">{year}</TableCell>
                    <TableCell>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {yearUsers.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!isActive && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Year</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete year {year}? 
                                This will remove all data for {yearUsers.length} users. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteYear(year)}>
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
