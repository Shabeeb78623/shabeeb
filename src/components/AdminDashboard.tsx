
import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import UsersOverview from './UsersOverview';
import UsersDataTable from './UsersDataTable';
import EnhancedPaymentManager from './EnhancedPaymentManager';
import EnhancedBenefitManager from './EnhancedBenefitManager';
import EnhancedMessageManager from './EnhancedMessageManager';
import CustomAdminManager from './CustomAdminManager';
import NewYearManager from './NewYearManager';
import RegistrationQuestionsManager from './RegistrationQuestionsManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Gift, 
  MessageSquare, 
  Settings, 
  Calendar,
  HelpCircle,
  RefreshCw,
  FileText,
  Shield
} from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onUpdateUsers: (users: User[]) => void;
  currentUser: User;
  currentYear: number;
  availableYears: number[];
  onNewYear: (year: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  onUpdateUser, 
  onUpdateUsers,
  currentUser,
  currentYear,
  availableYears,
  onNewYear
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load pending payments from localStorage
    const loadPendingPayments = () => {
      const payments = localStorage.getItem('pendingPayments');
      if (payments) {
        try {
          const parsedPayments = JSON.parse(payments);
          setPendingPayments(Array.isArray(parsedPayments) ? parsedPayments : []);
        } catch (error) {
          console.error('Error parsing pending payments:', error);
          setPendingPayments([]);
        }
      }
    };

    loadPendingPayments();
    
    // Set up interval to check for new payments
    const interval = setInterval(loadPendingPayments, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (userId: string) => {
    const userToUpdate = users.find(user => user.id === userId);
    if (userToUpdate) {
      const updatedUser = { ...userToUpdate, status: 'approved' as const };
      onUpdateUser(updatedUser);
      
      toast({
        title: "User Approved",
        description: `${updatedUser.fullName} has been approved.`,
      });
    }
  };

  const handleReject = (userId: string) => {
    const userToUpdate = users.find(user => user.id === userId);
    if (userToUpdate) {
      const updatedUser = { ...userToUpdate, status: 'rejected' as const };
      onUpdateUser(updatedUser);
      
      toast({
        title: "User Rejected",
        description: `${updatedUser.fullName} has been rejected.`,
        variant: "destructive"
      });
    }
  };

  const handlePaymentAction = (paymentId: string, action: 'approve' | 'reject') => {
    const payment = pendingPayments.find(p => p.id === paymentId);
    if (!payment) return;

    if (action === 'approve') {
      // Find user and update payment status
      const userToUpdate = users.find(user => user.id === payment.userId);
      if (userToUpdate) {
        const updatedUser = { ...userToUpdate, paymentStatus: true };
        onUpdateUser(updatedUser);
      }

      toast({
        title: "Payment Approved",
        description: `Payment from ${payment.userDetails?.fullName || 'Unknown User'} has been approved.`,
      });
    } else {
      toast({
        title: "Payment Rejected",
        description: `Payment from ${payment.userDetails?.fullName || 'Unknown User'} has been rejected.`,
        variant: "destructive"
      });
    }

    // Remove payment from pending list
    const updatedPayments = pendingPayments.filter(p => p.id !== paymentId);
    setPendingPayments(updatedPayments);
    localStorage.setItem('pendingPayments', JSON.stringify(updatedPayments));
  };

  const stats = {
    total: users.length,
    newUsers: users.filter(user => user.registrationYear === currentYear).length,
    reRegistrations: users.filter(user => user.registrationYear === currentYear && user.isRenewal).length,
    pending: users.filter(user => user.status === 'pending').length,
    approved: users.filter(user => user.status === 'approved').length,
    rejected: users.filter(user => user.status === 'rejected').length,
    paid: users.filter(user => user.paymentStatus === true).length,
    admins: users.filter(user => user.role === 'admin' || user.role === 'super_admin' || user.role === 'mandalam_admin').length,
    collected: users.filter(user => user.paymentStatus === true).reduce((total, user) => {
      return total + (user.isRenewal ? 50 : 60);
    }, 0)
  };

  const tabsConfig = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'users', label: 'Users', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: pendingPayments.length },
    { id: 'benefits', label: 'Benefits', icon: Gift },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'admins', label: 'Admins', icon: Shield },
    { id: 'newyear', label: 'New Year', icon: Calendar },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'import', label: 'Import', icon: RefreshCw },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage users, payments, and system settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {currentYear} Active
              </Badge>
              <Badge variant="secondary">
                {users.filter(u => u.registrationYear === currentYear).length} Users
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 sm:gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">Total Users</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-700">{stats.newUsers}</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">New Users</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-700">{stats.reRegistrations}</div>
                <div className="text-xs sm:text-sm text-purple-600 font-medium">Re-registration</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-yellow-700">{stats.pending}</div>
                <div className="text-xs sm:text-sm text-yellow-600 font-medium">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-700">{stats.approved}</div>
                <div className="text-xs sm:text-sm text-green-600 font-medium">Approved</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-700">{stats.rejected}</div>
                <div className="text-xs sm:text-sm text-red-600 font-medium">Rejected</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-indigo-700">{stats.paid}</div>
                <div className="text-xs sm:text-sm text-indigo-600 font-medium">Paid</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-teal-700">{stats.admins}</div>
                <div className="text-xs sm:text-sm text-teal-600 font-medium">Admins</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-orange-700">{stats.collected}</div>
                <div className="text-xs sm:text-sm text-orange-600 font-medium">Collected AED</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b bg-white rounded-t-lg">
              <TabsList className="w-full h-auto p-1 bg-transparent grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-11 gap-1">
                {tabsConfig.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 relative"
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline truncate">{tab.label}</span>
                      <span className="sm:hidden text-xs">{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                          {tab.badge}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <div className="p-4 sm:p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <UsersOverview users={users} currentYear={currentYear} />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <UsersDataTable 
                  users={users} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <EnhancedPaymentManager 
                  users={users}
                  onUpdateUser={onUpdateUser}
                  pendingPayments={pendingPayments}
                  onPaymentAction={handlePaymentAction}
                />
              </TabsContent>

              <TabsContent value="benefits" className="mt-0">
                <EnhancedBenefitManager 
                  users={users}
                  onUpdateUser={onUpdateUser}
                />
              </TabsContent>

              <TabsContent value="messaging" className="mt-0">
                <EnhancedMessageManager 
                  users={users}
                  currentUser={currentUser}
                />
              </TabsContent>

              <TabsContent value="admins" className="mt-0">
                <CustomAdminManager 
                  users={users}
                  onUpdateUser={onUpdateUser}
                />
              </TabsContent>

              <TabsContent value="newyear" className="mt-0">
                <NewYearManager 
                  users={users}
                  onNewYear={onNewYear}
                  onUpdateUsers={onUpdateUsers}
                  currentYear={currentYear}
                  availableYears={availableYears}
                />
              </TabsContent>

              <TabsContent value="questions" className="mt-0">
                <RegistrationQuestionsManager />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Reports & Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Reports section - Coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="import" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Import Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Data import section - Coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Settings section - Coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
