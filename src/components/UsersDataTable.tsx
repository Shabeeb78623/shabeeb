
import React, { useState } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsersDataTableProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  isMasterAdmin: boolean;
  userRole: string;
  userMandalam?: string;
}

const UsersDataTable: React.FC<UsersDataTableProps> = ({ 
  users, 
  onUpdateUser, 
  onDeleteUser, 
  isMasterAdmin,
  userRole,
  userMandalam
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mandalamFilter, setMandalamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Filter users based on role access
  const getFilteredUsers = () => {
    let filteredUsers = users;

    // Mandalam admin can only see users from their mandalam
    if (userRole === 'mandalam_admin' && userMandalam) {
      filteredUsers = filteredUsers.filter(user => user.mandalam === userMandalam);
    }

    // Apply search filter
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNo.includes(searchTerm) ||
        user.emiratesId.includes(searchTerm)
      );
    }

    // Apply mandalam filter
    if (mandalamFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.mandalam === mandalamFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  const mandalamCounts = users.reduce((acc, user) => {
    acc[user.mandalam] = (acc[user.mandalam] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = users.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const saveUserEdit = () => {
    if (editingUser) {
      onUpdateUser(editingUser);
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
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
      onUpdateUser(updatedUser);
      toast({
        title: "Role Updated",
        description: `${user.fullName} is now ${updatedUser.role === 'admin' ? 'an admin' : 'a user'}.`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Data</CardTitle>
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, reg no, email, phone, or Emirates ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={mandalamFilter} onValueChange={setMandalamFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Mandalam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mandalams</SelectItem>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Mandalam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.regNo}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobileNo}</TableCell>
                  <TableCell>{user.mandalam}</TableCell>
                  <TableCell>
                    <Badge className={
                      user.status === 'approved' ? 'bg-green-500' :
                      user.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.role === 'admin' || user.role === 'master_admin' || user.role === 'mandalam_admin' ? 'bg-purple-500' : 'bg-blue-500'}>
                      {user.role === 'master_admin' ? 'Master' : user.role === 'mandalam_admin' ? 'Mandalam' : user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.paymentStatus ? 'bg-green-500' : 'bg-gray-500'}>
                      {user.paymentStatus ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  placeholder="Full Name"
                                  value={editingUser.fullName}
                                  onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                                />
                                <Input
                                  placeholder="Email"
                                  value={editingUser.email}
                                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                />
                                <Input
                                  placeholder="Mobile No"
                                  value={editingUser.mobileNo}
                                  onChange={(e) => setEditingUser({...editingUser, mobileNo: e.target.value})}
                                />
                                <Input
                                  placeholder="WhatsApp"
                                  value={editingUser.whatsApp}
                                  onChange={(e) => setEditingUser({...editingUser, whatsApp: e.target.value})}
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
                              </div>
                              <Button onClick={saveUserEdit} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {isMasterAdmin && (
                        <>
                          <Button
                            onClick={() => toggleAdminRole(user.id)}
                            variant={user.role === 'admin' ? 'destructive' : 'default'}
                            size="sm"
                          >
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteUser(user.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Total Users: {filteredUsers.length}</p>
            </div>
            <div>
              <p className="font-medium">By Status:</p>
              <p>Approved: {statusCounts.approved || 0}</p>
              <p>Pending: {statusCounts.pending || 0}</p>
              <p>Rejected: {statusCounts.rejected || 0}</p>
            </div>
            <div>
              <p className="font-medium">By Mandalam:</p>
              {Object.entries(mandalamCounts).map(([mandalam, count]) => (
                <p key={mandalam}>{mandalam}: {count}</p>
              ))}
            </div>
            <div>
              <p className="font-medium">Payment Status:</p>
              <p>Paid: {users.filter(u => u.paymentStatus).length}</p>
              <p>Unpaid: {users.filter(u => !u.paymentStatus).length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersDataTable;
