
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

  // Create a default current user if none exists
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, payments, and system settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Paid Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.paymentStatus).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-muted/30">
              <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Users</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Payments</TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Benefits</TabsTrigger>
              <TabsTrigger value="messages" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Messages</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Notifications</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Questions</TabsTrigger>
              <TabsTrigger value="custom-admin" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">Custom Admin</TabsTrigger>
              <TabsTrigger value="new-year" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-white">New Year</TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-6 mt-8">
            <TabsContent value="users" className="mt-8">
              <UsersDataTable 
                users={users} 
                onUpdateUser={handleUpdateUser} 
                onDeleteUser={handleDeleteUser}
                isMasterAdmin={defaultCurrentUser.role === 'master_admin'}
                userRole={defaultCurrentUser.role}
                userMandalam={defaultCurrentUser.mandalam}
              />
            </TabsContent>

            <TabsContent value="payments" className="mt-8">
              <EnhancedPaymentManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="benefits" className="mt-8">
              <EnhancedBenefitManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="messages" className="mt-8">
              <EnhancedMessageManager users={users} currentUser={defaultCurrentUser} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-8">
              <NotificationManager 
                users={users} 
                onUpdateUser={handleUpdateUser} 
                currentAdminName={defaultCurrentUser.fullName} 
              />
            </TabsContent>

            <TabsContent value="questions" className="mt-8">
              <RegistrationQuestionsManager />
            </TabsContent>

            <TabsContent value="custom-admin" className="mt-8">
              <CustomAdminManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="new-year" className="mt-8">
              <NewYearManager 
                users={users} 
                onNewYear={handleNewYear} 
                onUpdateUsers={handleUpdateUsers}
                currentYear={currentYear}
                availableYears={availableYears}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
