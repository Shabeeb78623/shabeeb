
import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UsersDataTable from './UsersDataTable';
import EnhancedPaymentManager from './EnhancedPaymentManager';
import EnhancedBenefitManager from './EnhancedBenefitManager';
import EnhancedMessageManager from './EnhancedMessageManager';
import NotificationManager from './NotificationManager';
import RegistrationQuestionsManager from './RegistrationQuestionsManager';
import CustomAdminManager from './CustomAdminManager';
import NewYearManager from './NewYearManager';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    // Load users from local storage or an API
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with some default users if needed
      setUsers([]);
    }

    // Load current user (admin)
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      setCurrentUser(JSON.parse(currentUserData));
    }

    // Load current year and available years
    const storedCurrentYear = localStorage.getItem('currentYear');
    if (storedCurrentYear) {
      setCurrentYear(JSON.parse(storedCurrentYear));
    }

    const storedAvailableYears = localStorage.getItem('availableYears');
    if (storedAvailableYears) {
      setAvailableYears(JSON.parse(storedAvailableYears));
    } else {
      setAvailableYears([currentYear]);
    }
  }, [currentYear]);

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleNewYear = (year: number) => {
    setCurrentYear(year);
    setAvailableYears(prev => [...prev, year].sort((a, b) => a - b));
    // Reset users for new year
    setUsers([]);
  };

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  // Create a default current user if none exists with all required User properties
  const defaultCurrentUser: User = currentUser || {
    id: 'admin',
    fullName: 'Admin User',
    email: 'admin@example.com',
    mobileNo: '',
    whatsApp: '',
    emiratesId: '',
    emirate: '',
    mandalam: '',
    regNo: 'ADMIN001',
    status: 'approved',
    role: 'master_admin',
    paymentStatus: true,
    registrationYear: currentYear,
    notifications: [],
    benefitsUsed: [],
    paymentSubmission: {
      submitted: false,
      approvalStatus: 'pending'
    },
    // Add all missing required properties
    nominee: '',
    relation: '',
    addressUAE: '',
    addressIndia: '',
    kmccMember: false,
    kmccMembershipNumber: '',
    pratheekshaMember: false,
    pratheekshaMembershipNumber: '',
    recommendedBy: '',
    photo: '',
    password: '',
    registrationDate: new Date().toISOString(),
    isReregistration: false,
    paymentAmount: 0,
    paymentRemarks: ''
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage users, payments, and system settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Paid Users</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {users.filter(u => u.paymentStatus).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 h-auto p-1 bg-muted/30 gap-1">
              <TabsTrigger value="users" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Payments</TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Benefits</TabsTrigger>
              <TabsTrigger value="messages" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Messages</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Notifications</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Questions</TabsTrigger>
              <TabsTrigger value="custom-admin" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Custom Admin</TabsTrigger>
              <TabsTrigger value="new-year" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">New Year</TabsTrigger>
              <TabsTrigger value="export" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Export</TabsTrigger>
              <TabsTrigger value="import" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Import</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs px-2 py-2 sm:py-3 data-[state=active]:bg-white whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
            <TabsContent value="users" className="mt-6 sm:mt-8">
              <UsersDataTable 
                users={users} 
                onUpdateUser={handleUpdateUser} 
                onDeleteUser={handleDeleteUser}
                isMasterAdmin={defaultCurrentUser.role === 'master_admin'}
                userRole={defaultCurrentUser.role}
                userMandalam={defaultCurrentUser.mandalam}
              />
            </TabsContent>

            <TabsContent value="payments" className="mt-6 sm:mt-8">
              <EnhancedPaymentManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="benefits" className="mt-6 sm:mt-8">
              <EnhancedBenefitManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="messages" className="mt-6 sm:mt-8">
              <EnhancedMessageManager users={users} currentUser={defaultCurrentUser} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6 sm:mt-8">
              <NotificationManager 
                users={users} 
                onUpdateUser={handleUpdateUser} 
                currentAdminName={defaultCurrentUser.fullName} 
              />
            </TabsContent>

            <TabsContent value="questions" className="mt-6 sm:mt-8">
              <RegistrationQuestionsManager />
            </TabsContent>

            <TabsContent value="custom-admin" className="mt-6 sm:mt-8">
              <CustomAdminManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="new-year" className="mt-6 sm:mt-8">
              <NewYearManager 
                users={users} 
                onNewYear={handleNewYear} 
                onUpdateUsers={handleUpdateUsers}
                currentYear={currentYear}
                availableYears={availableYears}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-6 sm:mt-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">Export Data</h3>
                  <p className="text-gray-600">Export functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import" className="mt-6 sm:mt-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">Import Data</h3>
                  <p className="text-gray-600">Import functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 sm:mt-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                  <p className="text-gray-600">System settings will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
