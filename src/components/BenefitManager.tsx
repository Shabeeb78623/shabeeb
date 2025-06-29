
import React, { useState } from 'react';
import { User, BenefitUsage } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

interface BenefitManagerProps {
  users: User[];
  onUpdateUser: (user: User) => void;
}

const benefitTypes = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'death', label: 'Death' },
  { value: 'gulf_returnee', label: 'Gulf Returnee' },
  { value: 'cancer', label: 'Cancer' },
];

const BenefitManager: React.FC<BenefitManagerProps> = ({ users, onUpdateUser }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [benefitForm, setBenefitForm] = useState({
    type: '',
    remarks: '',
    amountPaid: 0,
  });
  const { toast } = useToast();

  const approvedUsers = users.filter(user => user.status === 'approved');
  
  const filteredUsers = approvedUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benefit Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name, reg no, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <Select onValueChange={(userId) => {
              const user = filteredUsers.find(u => u.id === userId);
              setSelectedUser(user || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select user to add benefit" />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName} - {user.regNo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{selectedUser.fullName}</h3>
                <Badge>Reg: {selectedUser.regNo}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={(value) => setBenefitForm({ ...benefitForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select benefit type" />
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
                  required
                />
              </div>

              <Textarea
                placeholder="Remarks"
                value={benefitForm.remarks}
                onChange={(e) => setBenefitForm({ ...benefitForm, remarks: e.target.value })}
              />

              <Button 
                onClick={handleAddBenefit} 
                disabled={!benefitForm.type || benefitForm.amountPaid <= 0}
              >
                Add Benefit
              </Button>

              {selectedUser.benefitsUsed && selectedUser.benefitsUsed.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Previous Benefits:</h4>
                  <div className="space-y-2">
                    {selectedUser.benefitsUsed.map((benefit) => (
                      <div key={benefit.id} className="border rounded p-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{benefitTypes.find(b => b.value === benefit.type)?.label}</span>
                          <span>AED {benefit.amountPaid}</span>
                        </div>
                        <div className="text-gray-600">{benefit.remarks}</div>
                        <div className="text-xs text-gray-500">{new Date(benefit.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BenefitManager;
