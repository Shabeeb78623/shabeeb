
import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, DollarSign, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentRecipient {
  id: string;
  name: string;
  contact_info: string;
}

interface EnhancedPaymentManagerProps {
  users: User[];
  onUpdateUser: (user: User) => void;
}

const EnhancedPaymentManager: React.FC<EnhancedPaymentManagerProps> = ({ users, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mandalamFilter, setMandalamFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [paymentRecipients, setPaymentRecipients] = useState<PaymentRecipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentRecipients();
  }, []);

  const fetchPaymentRecipients = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_recipients')
        .select('*');

      if (error) throw error;
      setPaymentRecipients(data || []);
    } catch (error) {
      console.error('Error fetching payment recipients:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobileNo.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && user.paymentStatus) ||
      (statusFilter === 'unpaid' && !user.paymentStatus);
    
    const matchesMandalam = mandalamFilter === 'all' || user.mandalam === mandalamFilter;
    
    return matchesSearch && matchesStatus && matchesMandalam;
  });

  const handleMarkAsPaid = (recipientName: string, amount: number) => {
    if (!selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      paymentStatus: true,
      paymentAmount: amount,
      paymentRemarks: `Paid to: ${recipientName}`,
    };

    onUpdateUser(updatedUser);
    setSelectedUser(null);
    setSelectedRecipient('');
    setPaidAmount('');

    toast({
      title: "Payment Updated",
      description: `Payment marked as paid to ${recipientName}`,
    });
  };

  const totalPaid = filteredUsers.filter(u => u.paymentStatus).reduce((sum, u) => sum + (u.paymentAmount || 0), 0);
  const totalUnpaid = filteredUsers.filter(u => !u.paymentStatus).length;

  // Calculate recipient-wise payment summary
  const recipientSummary = paymentRecipients.map(recipient => {
    const paymentsToRecipient = users.filter(u => 
      u.paymentStatus && u.paymentRemarks?.includes(`Paid to: ${recipient.name}`)
    );
    const totalAmount = paymentsToRecipient.reduce((sum, u) => sum + (u.paymentAmount || 0), 0);
    return {
      name: recipient.name,
      count: paymentsToRecipient.length,
      total: totalAmount
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Enhanced Payment Management
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Payment Summary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Payment Summary by Recipient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {recipientSummary.map((summary) => (
                    <div key={summary.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{summary.name}</p>
                        <p className="text-sm text-gray-600">{summary.count} payments</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">AED {summary.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, reg no, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={mandalamFilter} onValueChange={setMandalamFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Mandalam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mandalams</SelectItem>
              <SelectItem value="BALUSHERI">BALUSHERI</SelectItem>
              <SelectItem value="KUNNAMANGALAM">KUNNAMANGALAM</SelectItem>
              <SelectItem value="KODUVALLI">KODUVALLI</SelectItem>
              <SelectItem value="NADAPURAM">NADAPURAM</SelectItem>
              <SelectItem value="KOYLANDI">KOYLANDI</SelectItem>
              <SelectItem value="VADAKARA">VADAKARA</SelectItem>
              <SelectItem value="BEPUR">BEPUR</SelectItem>
              <SelectItem value="KUTTIYADI">KUTTIYADI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-700">AED {totalPaid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Unpaid Users</p>
                <p className="text-2xl font-bold text-red-700">{totalUnpaid}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-700">{filteredUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reg No</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Mandalam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.regNo}</TableCell>
                  <TableCell>{user.mobileNo}</TableCell>
                  <TableCell>{user.mandalam}</TableCell>
                  <TableCell>
                    <Badge variant={user.paymentStatus ? "default" : "destructive"}>
                      {user.paymentStatus ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.paymentAmount ? `AED ${user.paymentAmount}` : '-'}
                  </TableCell>
                  <TableCell>
                    {user.paymentRemarks?.replace('Paid to: ', '') || '-'}
                  </TableCell>
                  <TableCell>
                    {!user.paymentStatus && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedUser(user)}
                          >
                            Mark as Paid
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mark Payment as Paid</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="font-medium">User: {user.fullName}</p>
                              <p className="text-sm text-gray-600">Reg No: {user.regNo}</p>
                            </div>
                            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select who received payment" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentRecipients.map((recipient) => (
                                  <SelectItem key={recipient.id} value={recipient.name}>
                                    {recipient.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Amount (AED)"
                              value={paidAmount}
                              onChange={(e) => setPaidAmount(e.target.value)}
                            />
                            <Button
                              onClick={() => handleMarkAsPaid(selectedRecipient, Number(paidAmount))}
                              disabled={!selectedRecipient || !paidAmount}
                              className="w-full"
                            >
                              Confirm Payment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPaymentManager;
