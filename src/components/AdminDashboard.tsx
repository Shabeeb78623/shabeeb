
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
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
        description: `${user.name} has been approved.`,
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
        description: `${user.name} has been rejected.`,
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
        description: `Payment status for ${user.name} has been updated.`,
      });
    }
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
        </div>

        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="payments">Payment Management</TabsTrigger>
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
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">Phone: {user.phone}</p>
                          <p className="text-sm text-gray-600">Emirates ID: {user.emiratesId}</p>
                          <p className="text-sm text-gray-600">Emirate: {user.emirate}</p>
                          <p className="text-sm text-gray-600">
                            Registered: {new Date(user.registrationDate).toLocaleDateString()}
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
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge className={
                              user.status === 'approved' ? 'bg-green-500' :
                              user.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-600">Phone: {user.phone}</p>
                          <p className="text-sm text-gray-600">Emirates ID: {user.emiratesId}</p>
                          <p className="text-sm text-gray-600">Emirate: {user.emirate}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                            >
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            {editingUser && (
                              <div className="space-y-4">
                                <Input
                                  placeholder="Name"
                                  value={editingUser.name}
                                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                />
                                <Input
                                  placeholder="Email"
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                />
                                <Input
                                  placeholder="Phone"
                                  value={editingUser.phone}
                                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
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
                                <Button onClick={saveUserEdit} className="w-full">
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
                            <h3 className="font-semibold">{user.name}</h3>
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
