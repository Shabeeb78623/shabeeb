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

  useEffect(() => {
    // Load users from local storage or an API
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with some default users if needed
      setUsers([]);
    }
  }, []);

  const handleApprove = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, status: 'approved' as const } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleReject = (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, status: 'rejected' as const } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = users.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto p-1">
              <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">Users</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-2">Payments</TabsTrigger>
              <TabsTrigger value="benefits" className="text-xs sm:text-sm px-2 py-2">Benefits</TabsTrigger>
              <TabsTrigger value="messages" className="text-xs sm:text-sm px-2 py-2">Messages</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-2">Notifications</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs sm:text-sm px-2 py-2">Questions</TabsTrigger>
              <TabsTrigger value="custom-admin" className="text-xs sm:text-sm px-2 py-2">Custom Admin</TabsTrigger>
              <TabsTrigger value="new-year" className="text-xs sm:text-sm px-2 py-2">New Year</TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-6">
            <TabsContent value="users" className="mt-6">
              <UsersDataTable users={users} onApprove={handleApprove} onReject={handleReject} />
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <EnhancedPaymentManager users={users} onUpdateUser={handleUpdateUser} />
            </TabsContent>

            <TabsContent value="benefits" className="mt-6">
              <EnhancedBenefitManager />
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <EnhancedMessageManager />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationManager />
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              <RegistrationQuestionsManager />
            </TabsContent>

            <TabsContent value="custom-admin" className="mt-6">
              <CustomAdminManager />
            </TabsContent>

            <TabsContent value="new-year" className="mt-6">
              <NewYearManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
