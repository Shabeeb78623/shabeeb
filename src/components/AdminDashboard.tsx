import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, UserX, Clock, DollarSign, Gift, MessageSquare, Shield, Calendar } from 'lucide-react';
import UsersDataTable from './UsersDataTable';
import EnhancedPaymentManager from './EnhancedPaymentManager';
import EnhancedBenefitManager from './EnhancedBenefitManager';
import EnhancedMessageManager from './EnhancedMessageManager';
import CustomAdminManager from './CustomAdminManager';
import NewYearManager from './NewYearManager';
import CSVImport from './CSVImport';

interface AdminDashboardProps {
  users?: User[];
  onUpdateUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateUsers?: (users: User[]) => void;
  currentUser?: User;
  activeYear?: number;
  setActiveYear?: (year: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users = [],
  onUpdateUser = () => {},
  onDeleteUser = () => {},
  onUpdateUsers = () => {},
  currentUser,
  activeYear = new Date().getFullYear(),
  setActiveYear = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [localCurrentUser, setLocalCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize from localStorage if props are not provided
    if (users.length === 0) {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setLocalUsers(JSON.parse(storedUsers));
      }
    } else {
      setLocalUsers(users);
    }

    if (!currentUser) {
      const storedCurrentUser = localStorage.getItem('currentUser');
      if (storedCurrentUser) {
        setLocalCurrentUser(JSON.parse(storedCurrentUser));
      }
    } else {
      setLocalCurrentUser(currentUser);
    }
  }, [users, currentUser]);

  const effectiveUsers = users.length > 0 ? users : localUsers;
  const effectiveCurrentUser = currentUser || localCurrentUser;

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = effectiveUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    setLocalUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    onUpdateUser(updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = effectiveUsers.filter(user => user.id !== userId);
    setLocalUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    onDeleteUser(userId);
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setLocalUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    onUpdateUsers(updatedUsers);
  };

  const handleImportComplete = (importedUsers: User[]) => {
    const updatedUsers = [...effectiveUsers, ...importedUsers];
    handleUpdateUsers(updatedUsers);
    
    toast({
      title: "Import Complete",
      description: `${importedUsers.length} users have been imported and added to the system.`,
    });
  };

  const handleNewYear = (year: number) => {
    if (setActiveYear) {
      setActiveYear(year);
    }
    // Additional logic for handling new year creation
    console.log(`New year ${year} has been created`);
  };

  const isMasterAdmin = effectiveCurrentUser?.role === 'master_admin';
  const userRole = effectiveCurrentUser?.role || 'user';
  const userMandalam = effectiveCurrentUser?.mandalamAccess || effectiveCurrentUser?.mandalam;

  const UsersOverview = ({ users }: { users: User[] }) => {
    const totalUsers = users.length;
    const approvedUsers = users.filter(user => user.status === 'approved').length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    const rejectedUsers = users.filter(user => user.status === 'rejected').length;
    const paidUsers = users.filter(user => user.paymentStatus).length;
    const totalBenefitsUsed = users.reduce((sum, user) => sum + user.benefitsUsed.length, 0);
    const totalUnreadMessages = users.reduce((sum, user) => 
      sum + user.notifications.filter(n => !n.read).length, 0
    );

    const stats = [
      {
        title: "Total Users",
        value: totalUsers,
        icon: Users,
        color: "bg-blue-500"
      },
      {
        title: "Approved",
        value: approvedUsers,
        icon: UserCheck,
        color: "bg-green-500"
      },
      {
        title: "Pending",
        value: pendingUsers,
        icon: Clock,
        color: "bg-yellow-500"
      },
      {
        title: "Rejected",
        value: rejectedUsers,
        icon: UserX,
        color: "bg-red-500"
      },
      {
        title: "Paid Users",
        value: paidUsers,
        icon: DollarSign,
        color: "bg-purple-500"
      },
      {
        title: "Benefits Used",
        value: totalBenefitsUsed,
        icon: Gift,
        color: "bg-orange-500"
      },
      {
        title: "Unread Messages",
        value: totalUnreadMessages,
        icon: MessageSquare,
        color: "bg-pink-500"
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 text-white rounded p-1 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!effectiveCurrentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Year: {activeYear}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {effectiveCurrentUser.role.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="year">New Year</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UsersOverview users={effectiveUsers} />
        </TabsContent>

        <TabsContent value="users">
          <UsersDataTable 
            users={effectiveUsers} 
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            isMasterAdmin={isMasterAdmin}
            userRole={userRole}
            userMandalam={userMandalam}
          />
        </TabsContent>

        <TabsContent value="import">
          <CSVImport onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="payment">
          <EnhancedPaymentManager 
            users={effectiveUsers} 
            onUpdateUser={handleUpdateUser}
          />
        </TabsContent>

        <TabsContent value="benefits">
          <EnhancedBenefitManager 
            users={effectiveUsers} 
            onUpdateUser={handleUpdateUser}
          />
        </TabsContent>

        <TabsContent value="messages">
          <EnhancedMessageManager 
            users={effectiveUsers} 
            currentUser={effectiveCurrentUser}
          />
        </TabsContent>

        <TabsContent value="admins">
          <CustomAdminManager 
            users={effectiveUsers} 
            onUpdateUser={handleUpdateUser}
          />
        </TabsContent>

        <TabsContent value="year">
          <NewYearManager 
            users={effectiveUsers} 
            onUpdateUsers={handleUpdateUsers}
            onNewYear={handleNewYear}
            currentUser={effectiveCurrentUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
