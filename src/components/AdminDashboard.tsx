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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UsersDataTable from './UsersDataTable';
import EnhancedBenefitManager from './EnhancedBenefitManager';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
  const { logout, isMasterAdmin, currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
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
      // Check if user is from allowed mandalam for mandalam admin
      if (currentUser?.role === 'mandalam_admin' && 
          currentUser.mandalamAccess && 
          user.mandalam !== currentUser.mandalamAccess) {
        toast({
          title: "Access Denied",
          description: "You can only approve users from your assigned mandalam.",
          variant: "destructive"
        });
        return;
      }

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
      // Check if user is from allowed mandalam for mandalam admin
      if (currentUser?.role === 'mandalam_admin' && 
          currentUser.mandalamAccess && 
          user.mandalam !== currentUser.mandalamAccess) {
        toast({
          title: "Access Denied",
          description: "You can only reject users from your assigned mandalam.",
          variant: "destructive"
        });
        return;
      }

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

  const assignMandalamAdmin = (userId: string, mandalam: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        role: 'mandalam_admin' as const,
        mandalamAccess: mandalam as any
      };
      updateUser(updatedUser);
      toast({
        title: "Mandalam Admin Assigned",
        description: `${user.fullName} is now admin for ${mandalam} mandalam.`,
      });
    }
  };

  const togglePayment = (userId: string, amount: number = 0, remarks: string = '') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        paymentStatus: !user.paymentStatus,
        paymentAmount: amount || user.paymentAmount,
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
        paymentStatus: true,
        paymentAmount: user.paymentSubmission.amount || 0
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

  const resetPaymentSubmission = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        paymentSubmission: {
          submitted: false,
          approvalStatus: 'pending' as const,
          userRemarks: '',
          adminRemarks: ''
        }
      };
      updateUser(updatedUser);
      toast({
        title: "Payment Reset",
        description: `Payment submission for ${user.fullName} has been reset.`,
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
      'Payment Amount': user.paymentAmount || 0,
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

  // Filter users based on admin role
  const getVisibleUsers = () => {
    if (currentUser?.role === 'mandalam_admin' && currentUser.mandalamAccess) {
      return users.filter(user => user.mandalam === currentUser.mandalamAccess);
    }
    return users;
  };

  const visibleUsers = getVisibleUsers();

  const stats = {
    total: visibleUsers.length,
    pending: visibleUsers.filter(u => u.status === 'pending').length,
    approved: visibleUsers.filter(u => u.status === 'approved').length,
    rejected: visibleUsers.filter(u => u.status === 'rejected').length,
    paid: visibleUsers.filter(u => u.paymentStatus).length,
    admins: visibleUsers.filter(u => u.role === 'admin' || u.role === 'master_admin' || u.role === 'mandalam_admin').length,
    pendingPayments: visibleUsers.filter(u => u.paymentSubmission?.submitted && u.paymentSubmission.approvalStatus === 'pending').length,
    totalPaymentAmount: visibleUsers.filter(u => u.paymentStatus).reduce((sum, u) => sum + (u.paymentAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              {currentUser?.role === 'mandalam_admin' && (
                <p className="text-sm text-gray-600">Mandalam: {currentUser.mandalamAccess}</p>
              )}
            </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
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
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">AED {stats.totalPaymentAmount}</div>
              <div className="text-sm text-gray-600">Total Collected</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="users">Users Data</TabsTrigger>
            <TabsTrigger value="payments">Payment Management</TabsTrigger>
            <TabsTrigger value="payment-submissions">Payment Submissions</TabsTrigger>
            <TabsTrigger value="benefits">Benefit Management</TabsTrigger>
            {isMasterAdmin && <TabsTrigger value="admin-assignment">Admin Assignment</TabsTrigger>}
          </TabsList>

          {/* User Approvals Tab */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visibleUsers.filter(user => user.status === 'pending').map(user => (
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
                  {visibleUsers.filter(user => user.status === 'pending').length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending approvals</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Data Tab */}
          <TabsContent value="users">
            <UsersDataTable 
              users={visibleUsers}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
              isMasterAdmin={isMasterAdmin}
              userRole={currentUser?.role || 'user'}
              userMandalam={currentUser?.mandalamAccess}
            />
          </TabsContent>

          {/* Payment Management Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visibleUsers.filter(user => user.status === 'approved').map(user => (
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
                          {user.paymentAmount && (
                            <p className="text-sm font-semibold text-green-600">Amount: AED {user.paymentAmount}</p>
                          )}
                          {user.paymentRemarks && (
                            <p className="text-sm text-blue-600">Remarks: {user.paymentRemarks}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">Update Payment</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Payment Status</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  type="number"
                                  placeholder="Payment Amount (AED)"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                />
                                <Textarea
                                  placeholder="Payment remarks (optional)"
                                  value={paymentRemarks}
                                  onChange={(e) => setPaymentRemarks(e.target.value)}
                                />
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={user.paymentStatus}
                                    onCheckedChange={() => {
                                      togglePayment(user.id, paymentAmount, paymentRemarks);
                                      setPaymentAmount(0);
                                      setPaymentRemarks('');
                                    }}
                                  />
                                  <label className="text-sm">Mark as Paid</label>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total Amount Display */}
                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    Total Collected: AED {stats.totalPaymentAmount}
                  </div>
                  <p className="text-gray-600">From {stats.paid} paid members</p>
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
                  {visibleUsers.filter(user => user.paymentSubmission?.submitted).map(user => (
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
                          {user.paymentSubmission?.amount && (
                            <p className="text-sm font-semibold text-green-600">
                              Amount: AED {user.paymentSubmission.amount}
                            </p>
                          )}
                          {user.paymentSubmission?.userRemarks && (
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-sm font-medium text-gray-700">User Remarks:</p>
                              <p className="text-sm text-gray-600">{user.paymentSubmission.userRemarks}</p>
                            </div>
                          )}
                          {user.paymentSubmission?.adminRemarks && (
                            <p className="text-sm text-blue-600">
                              Admin Remarks: {user.paymentSubmission.adminRemarks}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {user.paymentSubmission?.approvalStatus === 'pending' ? (
                            <>
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
                            </>
                          ) : (
                            <Button 
                              onClick={() => resetPaymentSubmission(user.id)}
                              variant="outline"
                            >
                              Reset Submission
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleUsers.filter(user => user.paymentSubmission?.submitted).length === 0 && (
                    <p className="text-gray-500 text-center py-8">No payment submissions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Benefit Management Tab */}
          <TabsContent value="benefits">
            <EnhancedBenefitManager users={visibleUsers} onUpdateUser={updateUser} />
          </TabsContent>

          {/* Admin Assignment Tab - Only for Master Admin */}
          {isMasterAdmin && (
            <TabsContent value="admin-assignment">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.filter(user => user.status === 'approved' && user.role !== 'master_admin').map(user => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{user.fullName}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-600">Mandalam: {user.mandalam}</p>
                            <Badge className={
                              user.role === 'admin' ? 'bg-purple-500' : 
                              user.role === 'mandalam_admin' ? 'bg-orange-500' : 'bg-blue-500'
                            }>
                              {user.role === 'mandalam_admin' ? `Mandalam Admin (${user.mandalamAccess})` : user.role}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => toggleAdminRole(user.id)}
                              variant={user.role === 'admin' ? 'destructive' : 'default'}
                              size="sm"
                            >
                              {user.role === 'admin' ? 'Remove All Access Admin' : 'Make All Access Admin'}
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Assign Mandalam Admin
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Mandalam Admin</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p>Assign {user.fullName} as mandalam admin for:</p>
                                  <Select onValueChange={(mandalam) => assignMandalamAdmin(user.id, mandalam)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select mandalam" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
