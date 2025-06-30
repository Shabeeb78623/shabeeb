
import React, { useState } from 'react';
import { User, BenefitUsage } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface EnhancedBenefitManagerProps {
  users: User[];
  onUpdateUser: (user: User) => void;
}

const benefitTypes = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'death', label: 'Death' },
  { value: 'gulf_returnee', label: 'Gulf Returnee' },
  { value: 'cancer', label: 'Cancer' },
];

const EnhancedBenefitManager: React.FC<EnhancedBenefitManagerProps> = ({ users, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [benefitTypeFilter, setBenefitTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<BenefitUsage | null>(null);
  const [benefitForm, setBenefitForm] = useState({
    type: '',
    remarks: '',
    amountPaid: 0,
  });
  const { toast } = useToast();

  // Get all benefits from all users
  const allBenefits = users.flatMap(user => 
    (user.benefitsUsed || []).map(benefit => ({
      ...benefit,
      userName: user.fullName,
      userRegNo: user.regNo,
      userId: user.id
    }))
  );

  // Filter benefits
  const filteredBenefits = allBenefits.filter(benefit => {
    const matchesSearch = 
      benefit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      benefit.userRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      benefit.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = benefitTypeFilter === 'all' || benefit.type === benefitTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAddBenefit = () => {
    if (!selectedUser || !benefitForm.type || benefitForm.amountPaid <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields and enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    const newBenefit: BenefitUsage = {
      id: Date.now().toString(),
      type: benefitForm.type as any,
      remarks: benefitForm.remarks,
      amountPaid: benefitForm.amountPaid,
      date: new Date().toISOString(),
    };

    const updatedUser = {
      ...selectedUser,
      benefitsUsed: [...(selectedUser.benefitsUsed || []), newBenefit],
    };

    onUpdateUser(updatedUser);
    setBenefitForm({ type: '', remarks: '', amountPaid: 0 });
    setSelectedUser(null);

    toast({
      title: "Benefit Added",
      description: `Benefit added for ${selectedUser.fullName}`,
    });
  };

  const handleEditBenefit = () => {
    if (!editingBenefit || !selectedUser) return;

    const updatedBenefits = selectedUser.benefitsUsed.map(benefit =>
      benefit.id === editingBenefit.id ? editingBenefit : benefit
    );

    const updatedUser = {
      ...selectedUser,
      benefitsUsed: updatedBenefits,
    };

    onUpdateUser(updatedUser);
    setEditingBenefit(null);
    setSelectedUser(null);

    toast({
      title: "Benefit Updated",
      description: "Benefit has been updated successfully.",
    });
  };

  const handleDeleteBenefit = (benefitId: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedBenefits = user.benefitsUsed.filter(benefit => benefit.id !== benefitId);
    const updatedUser = {
      ...user,
      benefitsUsed: updatedBenefits,
    };

    onUpdateUser(updatedUser);

    toast({
      title: "Benefit Deleted",
      description: "Benefit has been deleted successfully.",
    });
  };

  const totalAmount = filteredBenefits.reduce((sum, benefit) => sum + benefit.amountPaid, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Benefit Management
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Benefit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Benefit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select onValueChange={(userId) => {
                  const user = users.find(u => u.id === userId);
                  setSelectedUser(user || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.status === 'approved').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} - {user.regNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Select onValueChange={(value) => setBenefitForm({ ...benefitForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Benefit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {benefitTypes.map((benefit) => (
                        <SelectItem key={benefit.value} value={benefit.value}>
                          {benefit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Amount Paid (AED)"
                    value={benefitForm.amountPaid || ''}
                    onChange={(e) => setBenefitForm({ ...benefitForm, amountPaid: Number(e.target.value) })}
                    min="1"
                  />
                </div>

                <Textarea
                  placeholder="Remarks"
                  value={benefitForm.remarks}
                  onChange={(e) => setBenefitForm({ ...benefitForm, remarks: e.target.value })}
                />

                <Button 
                  onClick={handleAddBenefit} 
                  disabled={!selectedUser || !benefitForm.type || benefitForm.amountPaid <= 0}
                  className="w-full"
                >
                  Add Benefit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by user name, reg no, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={benefitTypeFilter} onValueChange={setBenefitTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {benefitTypes.map((benefit) => (
                <SelectItem key={benefit.value} value={benefit.value}>
                  {benefit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Benefit Type</TableHead>
                <TableHead>Amount (AED)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBenefits.map((benefit) => (
                <TableRow key={`${benefit.userId}-${benefit.id}`}>
                  <TableCell className="font-medium">{benefit.userName}</TableCell>
                  <TableCell>{benefit.userRegNo}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {benefitTypes.find(b => b.value === benefit.type)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    AED {benefit.amountPaid}
                  </TableCell>
                  <TableCell>{new Date(benefit.date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{benefit.remarks}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingBenefit(benefit);
                              setSelectedUser(users.find(u => u.id === benefit.userId) || null);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Benefit</DialogTitle>
                          </DialogHeader>
                          {editingBenefit && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Select 
                                  value={editingBenefit.type}
                                  onValueChange={(value) => setEditingBenefit({ ...editingBenefit, type: value as any })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {benefitTypes.map((benefit) => (
                                      <SelectItem key={benefit.value} value={benefit.value}>
                                        {benefit.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Input
                                  type="number"
                                  placeholder="Amount Paid (AED)"
                                  value={editingBenefit.amountPaid}
                                  onChange={(e) => setEditingBenefit({ ...editingBenefit, amountPaid: Number(e.target.value) })}
                                  min="1"
                                />
                              </div>

                              <Textarea
                                placeholder="Remarks"
                                value={editingBenefit.remarks}
                                onChange={(e) => setEditingBenefit({ ...editingBenefit, remarks: e.target.value })}
                              />

                              <Button onClick={handleEditBenefit} className="w-full">
                                Update Benefit
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Benefit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this benefit record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBenefit(benefit.id, benefit.userId)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Total Benefits: {filteredBenefits.length}</p>
              <p className="text-sm text-gray-600">
                {benefitTypes.map(type => 
                  `${type.label}: ${filteredBenefits.filter(b => b.type === type.value).length}`
                ).join(' | ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">AED {totalAmount}</p>
              <p className="text-sm text-gray-600">Total Amount Paid</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBenefitManager;
