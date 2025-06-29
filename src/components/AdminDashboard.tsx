
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import BenefitManager from './BenefitManager';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
  const { logout, isMasterAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(savedUsers);
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast({
      title: "User Deleted",
      description: "User has been permanently deleted.",
    });
  };

  const approveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        status: 'approved' as const,
        approvalDate: new Date().toISOString()
      };
      updateUser(updatedUser);
      toast({
        title: "User Approved",
        description: `${user.fullName} has been approved.`,
      });
    }
  };

  const rejectUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, status: 'rejected' as const };
      updateUser(updatedUser);
      toast({
        title: "User Rejected",
        description: `${user.fullName} has been rejected.`,
      });
    }
  };

  const toggleAdminRole = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        role: user.role === 'admin' ? 'user' as const : 'admin' as const
      };
      updateUser(updatedUser);
      toast({
        title: "Role Updated",
        description: `${user.fullName} is now ${updatedUser.role === 'admin' ? 'an admin' : 'a user'}.`,
      });
    }
  };

  const togglePayment = (userId: string, remarks: string = '') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        paymentStatus: !user.paymentStatus,
        paymentRemarks: remarks || user.paymentRemarks
      };
      updateUser(updatedUser);
      toast({
        title: "Payment Status Updated",
        description: `Payment status for ${user.fullName} has been updated.`,
      });
    }
  };

  const approvePaymentSubmission = (userId: string, remarks: string = '') => {
    const user = users.find(u => u.id === userId);
    if (user && user.paymentSubmission) {
      const updatedUser = {
        ...user,
        paymentSubmission: {
          ...user.paymentSubmission,
          approvalStatus: 'approved' as const,
          adminRemarks: remarks
        },
        paymentStatus: true
      };
      updateUser(updatedUser);
      toast({
        title: "Payment Approved",
        description: `Payment for ${user.fullName} has been approved.`,
      });
    }
  };

  const declinePaymentSubmission = (userId: string, remarks: string = '') => {
    const user = users.find(u => u.id === userId);
    if (user && user.paymentSubmission) {
      const updatedUser = {
        ...user,
        paymentSubmission: {
          ...user.paymentSubmission,
          approvalStatus: 'declined' as const,
          adminRemarks: remarks
        }
      };
      updateUser(updatedUser);
      toast({
        title: "Payment Declined",
        description: `Payment for ${user.fullName} has been declined.`,
      });
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
      'Reg No': user.regNo,
      'Full Name': user.fullName,
      'Mobile No': user.mobileNo,
      'WhatsApp': user.whatsApp,
      'Email': user.email,
      'Emirates ID': user.emiratesId,
      'Emirate': user.emirate,
      'Mandalam': user.mandalam,
      'Nominee': user.nominee,
      'Relation': user.relation,
      'Address UAE': user.addressUAE,
      'Address India': user.addressIndia,
      'KMCC Member': user.kmccMember ? 'Yes' : 'No',
      'KMCC Membership No': user.kmccMembershipNumber || '',
      'Pratheeksha Member': user.pratheekshaMember ? 'Yes' : 'No',
      'Pratheeksha Membership No': user.pratheekshaMembershipNumber || '',
      'Recommended By': user.recommendedBy,
      'Status': user.status,
      'Role': user.role,
      'Registration Date': new Date(user.registrationDate).toLocaleDateString(),
      'Payment Status': user.paymentStatus ? 'Paid' : 'Unpaid',
      'Payment Remarks': user.paymentRemarks || ''
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "User data has been exported to Excel.",
    });
  };

  const saveUserEdit = () => {
    if (editingUser) {
      updateUser(editingUser);
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
    }
  };

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    paid: users.filter(u => u.paymentStatus).length,
    admins: users.filter(u => u.role === 'admin').length,
    pendingPayments: users.filter(u => u.paymentSubmission?.submitted && u.paymentSubmission.approvalStatus === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <Button onClick={exportToExcel} variant="outline">
                Export to Excel
              </Button>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.paid}</div>
              <div className="text-sm text-gray-600">Paid</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">{stats.admins}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
              <div className="text-sm text-gray-600">Pending Payments</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="payments">Payment Management</TabsTrigger>
            <TabsTrigger value="payment-submissions">Payment Submissions</TabsTrigger>
            <TabsTrigger value="benefits">Benefit Management</TabsTrigger>
          </TabsList>

          {/* User Approvals Tab */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(user => user.status === 'pending').map(user => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">Phone: {user.mobileNo}</p>
                          <p className="text-sm text-gray-600">Emirates ID: {user.emiratesId}</p>
                          <p className="text-sm text-gray-600">Emirate: {user.emirate}</p>
                          <p className="text-sm text-gray-600">Mandalam: {user.mandalam}</p>
                          <p className="text-sm text-gray-600">
                            Registered: {new Date(user.registrationDate).toLocaleDateString()} at {new Date(user.registrationDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => approveUser(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => rejectUser(user.id)}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(user => user.status === 'pending').length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending approvals</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{user.fullName}</h3>
                            <Badge className={
                              user.status === 'approved' ? 'bg-green-500' :
                              user.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                              {user.status}
                            </Badge>
                            <Badge variant="secondary">
                              {user.regNo}
                            </Badge>
                            <Badge className={user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}>
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">Phone: {user.mobileNo}</p>
                          <p className="text-sm text-gray-600">Emirates ID: {user.emiratesId}</p>
                          <p className="text-sm text-gray-600">Emirate: {user.emirate}</p>
                          <p className="text-sm text-gray-600">Mandalam: {user.mandalam}</p>
                          <p className="text-sm text-gray-600">
                            Registered: {new Date(user.registrationDate).toLocaleDateString()} at {new Date(user.registrationDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline"
                                  onClick={() => setEditingUser(user)}
                                >
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                </DialogHeader>
                                {editingUser && (
                                  <div className="space-y-4 max-h-96 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                      <Input
                                        placeholder="Full Name"
                                        value={editingUser.fullName}
                                        onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                                      />
                                      <Input
                                        placeholder="Email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                      />
                                      <Input
                                        placeholder="Mobile No"
                                        value={editingUser.mobileNo}
                                        onChange={(e) => setEditingUser({...editingUser, mobileNo: e.target.value})}
                                      />
                                      <Input
                                        placeholder="WhatsApp"
                                        value={editingUser.whatsApp}
                                        onChange={(e) => setEditingUser({...editingUser, whatsApp: e.target.value})}
                                      />
                                      <Input
                                        placeholder="Emirates ID"
                                        value={editingUser.emiratesId}
                                        onChange={(e) => setEditingUser({...editingUser, emiratesId: e.target.value})}
                                      />
                                      <Input
                                        placeholder="Emirate"
                                        value={editingUser.emirate}
                                        onChange={(e) => setEditingUser({...editingUser, emirate: e.target.value})}
                                      />
                                    </div>
                                    <Button onClick={saveUserEdit} className="w-full">
                                      Save Changes
                                    </Button>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteUser(user.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          {/* Admin Role Toggle - Only for Master Admin */}
                          {isMasterAdmin && (
                            <Button
                              onClick={() => toggleAdminRole(user.id)}
                              variant={user.role === 'admin' ? 'destructive' : 'default'}
                              size="sm"
                            >
                              {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Management Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(user => user.status === 'approved').map(user => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{user.fullName}</h3>
                            <Badge className={user.paymentStatus ? 'bg-green-500' : 'bg-gray-500'}>
                              {user.paymentStatus ? 'Paid' : 'Unpaid'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.paymentRemarks && (
                            <p className="text-sm text-blue-600">Remarks: {user.paymentRemarks}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={user.paymentStatus}
                              onCheckedChange={() => {
                                const remarks = prompt('Payment remarks (optional):') || '';
                                togglePayment(user.id, remarks);
                              }}
                            />
                            <label className="text-sm">Paid</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Submissions Tab */}
          <TabsContent value="payment-submissions">
            <Card>
              <CardHeader>
                <CardTitle>Payment Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(user => user.paymentSubmission?.submitted).map(user => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{user.fullName}</h3>
                            <Badge className={
                              user.paymentSubmission?.approvalStatus === 'approved' ? 'bg-green-500' :
                              user.paymentSubmission?.approvalStatus === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                            }>
                              {user.paymentSubmission?.approvalStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(user.paymentSubmission?.submissionDate!).toLocaleDateString()}
                          </p>
                          {user.paymentSubmission?.adminRemarks && (
                            <p className="text-sm text-blue-600">
                              Admin Remarks: {user.paymentSubmission.adminRemarks}
                            </p>
                          )}
                        </div>
                        
                        {user.paymentSubmission?.approvalStatus === 'pending' && (
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700">
                                  Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approve Payment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Admin remarks (optional)"
                                    value={paymentRemarks}
                                    onChange={(e) => setPaymentRemarks(e.target.value)}
                                  />
                                  <Button 
                                    onClick={() => {
                                      approvePaymentSubmission(user.id, paymentRemarks);
                                      setPaymentRemarks('');
                                    }}
                                    className="w-full"
                                  >
                                    Approve Payment
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive">
                                  Decline
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Decline Payment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Reason for declining (required)"
                                    value={paymentRemarks}
                                    onChange={(e) => setPaymentRemarks(e.target.value)}
                                    required
                                  />
                                  <Button 
                                    onClick={() => {
                                      if (paymentRemarks.trim()) {
                                        declinePaymentSubmission(user.id, paymentRemarks);
                                        setPaymentRemarks('');
                                      } else {
                                        toast({
                                          title: "Error",
                                          description: "Please provide a reason for declining.",
                                          variant: "destructive"
                                        });
                                      }
                                    }}
                                    variant="destructive"
                                    className="w-full"
                                  >
                                    Decline Payment
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {users.filter(user => user.paymentSubmission?.submitted).length === 0 && (
                    <p className="text-gray-500 text-center py-8">No payment submissions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefit Management Tab */}
          <TabsContent value="benefits">
            <BenefitManager users={users} onUpdateUser={updateUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
