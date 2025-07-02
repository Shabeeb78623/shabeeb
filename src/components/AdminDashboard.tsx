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
import UsersOverview from './UsersOverview';
import EnhancedBenefitManager from './EnhancedBenefitManager';
import NotificationManager from './NotificationManager';
import CustomAdminManager from './CustomAdminManager';
import CSVImport from './CSVImport';
import * as XLSX from 'xlsx';

const AdminDashboard: React.FC = () => {
  const { logout, isMasterAdmin, currentUser, currentYear, availableYears, switchYear, createNewYear, getCurrentYearUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [confirmAction, setConfirmAction] = useState<{ action: () => void; title: string; description: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [currentYear]);

  const loadUsers = () => {
    const currentUsers = getCurrentYearUsers();
    setUsers(currentUsers);
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    
    // Update yearly data
    const yearlyData = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const updatedYearlyData = yearlyData.map((data: any) => 
      data.year === currentYear ? { ...data, users: updatedUsers } : data
    );
    localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    // Update yearly data
    const yearlyData = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const updatedYearlyData = yearlyData.map((data: any) => 
      data.year === currentYear ? { ...data, users: updatedUsers } : data
    );
    localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User Deleted",
      description: "User has been permanently deleted.",
    });
  };

  const hasPermission = (permission: keyof NonNullable<User['customPermissions']>): boolean => {
    if (isMasterAdmin || currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'mandalam_admin') {
      // Mandalam admin has most permissions for their mandalam
      return ['canViewUsers', 'canEditUsers', 'canApproveUsers', 'canManagePayments'].includes(permission);
    }
    if (currentUser?.role === 'custom_admin' && currentUser.customPermissions) {
      return currentUser.customPermissions[permission] === true;
    }
    return false;
  };

  const getVisibleUsers = () => {
    let filteredUsers = users;
    
    if (currentUser?.role === 'mandalam_admin' && currentUser.mandalamAccess) {
      filteredUsers = filteredUsers.filter(user => user.mandalam === currentUser.mandalamAccess);
    } else if (currentUser?.role === 'custom_admin' && currentUser.customPermissions?.mandalamAccess) {
      filteredUsers = filteredUsers.filter(user => 
        currentUser.customPermissions!.mandalamAccess!.includes(user.mandalam)
      );
    }
    
    return filteredUsers;
  };

  const confirmAndExecute = (action: () => void, title: string, description: string) => {
    setConfirmAction({ action, title, description });
  };

  const executeConfirmedAction = () => {
    if (confirmAction) {
      confirmAction.action();
      setConfirmAction(null);
    }
  };

  const rejectUser = (userId: string) => {
    if (!hasPermission('canApproveUsers')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reject users.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (user) {
      confirmAndExecute(
        () => {
          const updatedUser = { ...user, status: 'rejected' as const };
          updateUser(updatedUser);
          toast({
            title: "User Rejected",
            description: `${user.fullName} has been rejected.`,
          });
        },
        "Reject User",
        `Are you sure you want to reject ${user.fullName}?`
      );
    }
  };

  const togglePayment = (userId: string, amount: number = 0, remarks: string = '') => {
    if (!hasPermission('canManagePayments')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage payments.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (user) {
      confirmAndExecute(
        () => {
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
        },
        "Update Payment Status",
        `Are you sure you want to ${user.paymentStatus ? 'remove' : 'mark'} payment for ${user.fullName}?`
      );
    }
  };

  const approveUser = (userId: string) => {
    if (!hasPermission('canApproveUsers')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve users.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (user) {
      confirmAndExecute(
        () => {
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
        },
        "Approve User",
        `Are you sure you want to approve ${user.fullName}?`
      );
    }
  };

  const approvePaymentSubmission = (userId: string, remarks: string = '') => {
    if (!hasPermission('canManagePayments')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage payment submissions.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (user && user.paymentSubmission) {
      confirmAndExecute(
        () => {
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
        },
        "Approve Payment Submission",
        `Are you sure you want to approve payment submission for ${user.fullName}?`
      );
    }
  };

  const declinePaymentSubmission = (userId: string, remarks: string = '') => {
    if (!hasPermission('canManagePayments')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage payment submissions.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (user && user.paymentSubmission) {
      confirmAndExecute(
        () => {
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
        },
        "Decline Payment Submission",
        `Are you sure you want to decline payment submission for ${user.fullName}?`
      );
    }
  };

  const resetPaymentSubmission = (userId: string) => {
    if (!hasPermission('canManagePayments')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reset payment submissions.",
        variant: "destructive"
      });
      return;
    }

    const user = users.find(u => u.id === userId);
    if (user) {
      confirmAndExecute(
        () => {
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
        },
        "Reset Payment Submission",
        `Are you sure you want to reset payment submission for ${user.fullName}?`
      );
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

  const handleImportComplete = (importedUsers: User[]) => {
    const updatedUsers = [...users, ...importedUsers];
    setUsers(updatedUsers);
    
    // Update yearly data
    const yearlyData = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const updatedYearlyData = yearlyData.map((data: any) => 
      data.year === currentYear ? { ...data, users: updatedUsers } : data
    );
    localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Import Completed",
      description: `Successfully imported ${importedUsers.length} users with auto-approved accounts.`,
    });
  };

  const visibleUsers = getVisibleUsers();
  const stats = {
    total: visibleUsers.length,
    pending: visibleUsers.filter(u => u.status === 'pending').length,
    approved: visibleUsers.filter(u => u.status === 'approved').length,
    rejected: visibleUsers.filter(u => u.status === 'rejected').length,
    paid: visibleUsers.filter(u => u.paymentStatus).length,
    admins: visibleUsers.filter(u => u.role === 'admin' || u.role === 'master_admin' || u.role === 'mandalam_admin' || u.role === 'custom_admin').length,
    pendingPayments: visibleUsers.filter(u => u.paymentSubmission?.submitted && u.paymentSubmission.approvalStatus === 'pending').length,
    totalPaymentAmount: visibleUsers.filter(u => u.paymentStatus).reduce((sum, u) => sum + (u.paymentAmount || 0), 0),
    reregistrations: visibleUsers.filter(u => u.isReregistration).length,
    newRegistrations: visibleUsers.filter(u => !u.isReregistration).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Year:</span>
                  <Select value={currentYear.toString()} onValueChange={(year) => switchYear(parseInt(year))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isMasterAdmin && (
                    <Button onClick={createNewYear} variant="outline" size="sm">
                      New Year
                    </Button>
                  )}
                </div>
                {currentUser?.role === 'mandalam_admin' && (
                  <p className="text-sm text-gray-600">Mandalam: {currentUser.mandalamAccess}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {hasPermission('canViewUsers') && (
                <Button onClick={exportToExcel} variant="outline">
                  Export to Excel
                </Button>
              )}
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.newRegistrations}</div>
              <div className="text-sm text-gray-600">New</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.reregistrations}</div>
              <div className="text-sm text-gray-600">Re-registrations</div>
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
              <div className="text-2xl font-bold text-emerald-600">AED {stats.totalPaymentAmount}</div>
              <div className="text-sm text-gray-600">Collected</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList className="grid grid-cols-9 w-full">
            {hasPermission('canApproveUsers') && <TabsTrigger value="approvals">User Approvals</TabsTrigger>}
            {hasPermission('canViewUsers') && <TabsTrigger value="users">Users Data</TabsTrigger>}
            {hasPermission('canViewUsers') && <TabsTrigger value="overview">Users Overview</TabsTrigger>}
            {hasPermission('canManagePayments') && <TabsTrigger value="payments">Payment Management</TabsTrigger>}
            {hasPermission('canManagePayments') && <TabsTrigger value="payment-submissions">Payment Submissions</TabsTrigger>}
            {hasPermission('canManageBenefits') && <TabsTrigger value="benefits">Benefit Management</TabsTrigger>}
            {hasPermission('canSendNotifications') && <TabsTrigger value="notifications">Send Notifications</TabsTrigger>}
            {(isMasterAdmin || currentUser?.role === 'admin') && <TabsTrigger value="import">Import Users</TabsTrigger>}
            {isMasterAdmin && <TabsTrigger value="admin-assignment">Admin Assignment</TabsTrigger>}
          </TabsList>

          {/* User Approvals Tab */}
          {hasPermission('canApproveUsers') && (
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
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{user.fullName}</h3>
                              {user.isReregistration && (
                                <Badge className="bg-orange-500">Re-registration</Badge>
                              )}
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
          )}

          {/* Users Data Tab */}
          {hasPermission('canViewUsers') && (
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
          )}

          {/* Users Overview Tab */}
          {hasPermission('canViewUsers') && (
            <TabsContent value="overview">
              <UsersOverview users={visibleUsers} />
            </TabsContent>
          )}

          {/* Payment Management Tab */}
          {hasPermission('canManagePayments') && (
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
          )}

          {/* Payment Submissions Tab */}
          {hasPermission('canManagePayments') && (
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
          )}

          {/* Benefit Management Tab */}
          {hasPermission('canManageBenefits') && (
            <TabsContent value="benefits">
              <EnhancedBenefitManager users={visibleUsers} onUpdateUser={updateUser} />
            </TabsContent>
          )}

          {/* Notifications Tab */}
          {hasPermission('canSendNotifications') && (
            <TabsContent value="notifications">
              <NotificationManager 
                users={visibleUsers}
                onUpdateUser={updateUser}
                currentAdminName={currentUser?.fullName || 'Admin'}
              />
            </TabsContent>
          )}

          {/* Import Users Tab */}
          {(isMasterAdmin || currentUser?.role === 'admin') && (
            <TabsContent value="import">
              <CSVImport onImportComplete={handleImportComplete} />
            </TabsContent>
          )}

          {/* Admin Assignment Tab */}
          {isMasterAdmin && (
            <TabsContent value="admin-assignment">
              <CustomAdminManager 
                users={users}
                onUpdateUser={updateUser}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={executeConfirmedAction}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default AdminDashboard;
