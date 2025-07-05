
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());
  const [availableYears] = useState([2024, 2025]);
  const { toast } = useToast();

  useEffect(() => {
    console.log('AdminDashboard: Starting data load...');
    
    // Load users from localStorage
    const loadUsers = () => {
      console.log('AdminDashboard: Loading users...');
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          console.log('AdminDashboard: Parsed users:', parsedUsers);
          setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);
        } catch (error) {
          console.error('AdminDashboard: Error parsing users:', error);
          setUsers([]);
        }
      } else {
        console.log('AdminDashboard: No stored users found');
        setUsers([]);
      }
    };

    // Load current user from localStorage
    const loadCurrentUser = () => {
      console.log('AdminDashboard: Loading current user...');
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('AdminDashboard: Current user loaded:', parsedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('AdminDashboard: Error parsing current user:', error);
          setCurrentUser(null);
        }
      } else {
        console.log('AdminDashboard: No current user found in localStorage');
        setCurrentUser(null);
      }
    };

    // Load pending payments from localStorage
    const loadPendingPayments = () => {
      const payments = localStorage.getItem('pendingPayments');
      if (payments) {
        try {
          const parsedPayments = JSON.parse(payments);
          setPendingPayments(Array.isArray(parsedPayments) ? parsedPayments : []);
        } catch (error) {
          console.error('AdminDashboard: Error parsing pending payments:', error);
          setPendingPayments([]);
        }
      }
    };

    loadUsers();
    loadCurrentUser();
    loadPendingPayments();
    
    // Set loading to false after attempting to load data
    setTimeout(() => {
      console.log('AdminDashboard: Setting loading to false');
      setLoading(false);
    }, 100);
    
    // Set up interval to check for new payments
    const interval = setInterval(loadPendingPayments, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update current user if it's the same user
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleNewYear = (year: number) => {
    // Handle new year logic
    console.log('New year:', year);
    toast({
      title: "New Year Created",
      description: `New year ${year} has been created successfully.`,
    });
  };

  // Show loading state
  if (loading) {
    console.log('AdminDashboard: Still loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no current user found, try to create a default admin user for testing
  if (!currentUser) {
    console.log('AdminDashboard: No current user, creating default admin...');
    const defaultAdmin: User = {
      id: 'admin-001',
      regNo: 'ADMIN001',
      fullName: 'System Admin',
      mobileNo: '+971501234567',
      whatsApp: '+971501234567',
      nominee: 'System',
      relation: 'Father',
      emirate: 'Dubai',
      mandalam: 'BALUSHERI',
      email: 'admin@system.com',
      addressUAE: 'Dubai, UAE',
      addressIndia: 'Kerala, India',
      kmccMember: false,
      pratheekshaMember: false,
      recommendedBy: 'System',
      emiratesId: '784-0000-0000000-0',
      password: 'admin123',
      status: 'approved',
      role: 'master_admin',
      registrationDate: new Date().toISOString(),
      registrationYear: currentYear,
      paymentStatus: true,
      benefitsUsed: [],
      notifications: []
    };
    
    setCurrentUser(defaultAdmin);
    localStorage.setItem('currentUser', JSON.stringify(defaultAdmin));
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Setting up admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('AdminDashboard: Rendering dashboard for user:', currentUser);

  const stats = {
    total: users.length,
    newUsers: users.filter(user => user.registrationYear === currentYear).length,
    reRegistrations: users.filter(user => user.registrationYear === currentYear && user.isReregistration).length,
    pending: users.filter(user => user.status === 'pending').length,
    approved: users.filter(user => user.status === 'approved').length,
    rejected: users.filter(user => user.status === 'rejected').length,
    paid: users.filter(user => user.paymentStatus === true).length,
    admins: users.filter(user => user.role === 'admin' || user.role === 'master_admin' || user.role === 'mandalam_admin').length,
    collected: users.filter(user => user.paymentStatus === true).reduce((total, user) => {
      return total + (user.isReregistration ? 50 : 60);
    }, 0)
  };

  const tabsConfig = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'users', label: 'Users', icon: UserCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: pendingPayments.length },
    { id: 'benefits', label: 'Benefits', icon: Gift },
    { id: 'messaging', label: 'Messages', icon: MessageSquare },
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
              <p className="text-sm text-blue-600">Welcome, {currentUser.fullName}</p>
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
                <UsersOverview users={users} />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <UsersDataTable 
                  users={users}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={(userId: string) => {
                    const updatedUsers = users.filter(user => user.id !== userId);
                    handleUpdateUsers(updatedUsers);
                    toast({
                      title: "User Deleted",
                      description: "User has been deleted successfully.",
                      variant: "destructive"
                    });
                  }}
                  isMasterAdmin={currentUser?.role === 'master_admin'}
                  userRole={currentUser?.role || 'user'}
                  userMandalam={currentUser?.mandalam}
                />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <EnhancedPaymentManager 
                  users={users}
                  onUpdateUser={handleUpdateUser}
                />
              </TabsContent>

              <TabsContent value="benefits" className="mt-0">
                <EnhancedBenefitManager 
                  users={users}
                  onUpdateUser={handleUpdateUser}
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
                  onUpdateUser={handleUpdateUser}
                />
              </TabsContent>

              <TabsContent value="newyear" className="mt-0">
                <NewYearManager 
                  users={users}
                  onNewYear={handleNewYear}
                  onUpdateUsers={handleUpdateUsers}
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
