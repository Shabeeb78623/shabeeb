import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  UserCheck,
  UserX,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { getCurrentYearUsers, updateUser, currentYear } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [paymentSubmissions, setPaymentSubmissions] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const allUsers = getCurrentYearUsers();
    setUsers(allUsers);
    
    const pending = allUsers.filter(user => user.status === 'pending');
    setPendingUsers(pending);
    
    // Get users with payment submissions (including renewals)
    const paymentsSubmitted = allUsers.filter(user => 
      user.paymentSubmission && 
      user.paymentSubmission.submitted && 
      user.paymentSubmission.approvalStatus === 'pending'
    );
    setPaymentSubmissions(paymentsSubmitted);
  }, [getCurrentYearUsers]);

  const handleUserApproval = (userId: string, approved: boolean) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        status: approved ? 'approved' as const : 'rejected' as const
      };
      updateUser(updatedUser);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      
      toast({
        title: approved ? "User Approved" : "User Rejected",
        description: `${user.fullName} has been ${approved ? 'approved' : 'rejected'}.`,
      });
    }
  };

  const handlePaymentApproval = (userId: string, approved: boolean, adminRemarks?: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        paymentStatus: approved,
        paymentSubmission: {
          ...user.paymentSubmission!,
          approvalStatus: approved ? 'approved' as const : 'rejected' as const,
          adminRemarks: adminRemarks || '',
          approvalDate: new Date().toISOString()
        }
      };
      
      updateUser(updatedUser);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      setPaymentSubmissions(paymentSubmissions.filter(u => u.id !== userId));
      
      toast({
        title: approved ? "Payment Approved" : "Payment Rejected",
        description: `Payment for ${user.fullName} has been ${approved ? 'approved' : 'rejected'}.`,
      });
    }
  };

  const approvedUsers = users.filter(user => user.status === 'approved');
  const rejectedUsers = users.filter(user => user.status === 'rejected');
  const paidUsers = users.filter(user => user.paymentStatus === true);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard - {currentYear}</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Submissions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paymentSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              AED {paidUsers.reduce((sum, user) => sum + (user.paymentAmount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Users ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="payments">Payment Submissions ({paymentSubmissions.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved Users ({approvedUsers.length})</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Pending Users Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Users Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending users</p>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">Reg No: {user.regNo}</p>
                          <p className="text-sm text-gray-600">Email: {user.email}</p>
                          <p className="text-sm text-gray-600">Mobile: {user.mobileNo}</p>
                          <p className="text-sm text-gray-600">Emirates ID: {user.emiratesId}</p>
                          {user.isReregistration && (
                            <Badge variant="outline" className="text-orange-600">
                              Renewal Registration
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUserApproval(user.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserApproval(user.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Registered: {new Date(user.registrationDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Submissions Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Submissions for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentSubmissions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending payment submissions</p>
              ) : (
                <div className="space-y-4">
                  {paymentSubmissions.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">Reg No: {user.regNo}</p>
                          <p className="text-sm text-gray-600">Email: {user.email}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Amount:</span>
                            <Badge variant="outline" className="text-green-600">
                              AED {user.paymentSubmission?.amount || user.paymentAmount}
                            </Badge>
                          </div>
                          {user.paymentSubmission?.userRemarks && (
                            <div className="text-sm">
                              <span className="font-medium">User Remarks:</span>
                              <p className="text-gray-600 mt-1">{user.paymentSubmission.userRemarks}</p>
                            </div>
                          )}
                          {user.isReregistration && (
                            <Badge variant="outline" className="text-orange-600">
                              Renewal Payment
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePaymentApproval(user.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePaymentApproval(user.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Submitted: {user.paymentSubmission?.submissionDate ? 
                          new Date(user.paymentSubmission.submissionDate).toLocaleDateString() : 
                          'N/A'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Approved Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvedUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No approved users</p>
              ) : (
                <div className="space-y-4">
                  {approvedUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">Reg No: {user.regNo}</p>
                          <p className="text-sm text-gray-600">Email: {user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                          {user.paymentStatus && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              Paid
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Users:</span>
                  <span className="font-semibold">{users.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Approved:</span>
                  <span className="font-semibold text-green-600">{approvedUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-semibold text-orange-600">{pendingUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejected:</span>
                  <span className="font-semibold text-red-600">{rejectedUsers.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-semibold text-green-600">{paidUsers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Payments:</span>
                  <span className="font-semibold text-orange-600">{paymentSubmissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-semibold text-green-600">
                    AED {paidUsers.reduce((sum, user) => sum + (user.paymentAmount || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
