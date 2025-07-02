
import React, { useState } from 'react';
import { User } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

interface UsersOverviewProps {
  users: User[];
}

const UsersOverview: React.FC<UsersOverviewProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mandalamFilter, setMandalamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const getFilteredUsers = () => {
    let filteredUsers = users;

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

    // Apply filters
    if (mandalamFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.mandalam === mandalamFilter);
    }
    if (statusFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    if (roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    if (paymentFilter !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        paymentFilter === 'paid' ? user.paymentStatus : !user.paymentStatus
      );
    }

    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

  // Calculate statistics
  const stats = {
    total: filteredUsers.length,
    byMandalam: filteredUsers.reduce((acc, user) => {
      acc[user.mandalam] = (acc[user.mandalam] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: filteredUsers.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byRole: filteredUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPayment: {
      paid: filteredUsers.filter(u => u.paymentStatus).length,
      unpaid: filteredUsers.filter(u => !u.paymentStatus).length
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Overview</CardTitle>
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="mandalam_admin">Mandalam Admin</SelectItem>
              <SelectItem value="custom_admin">Custom Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
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
                <TableHead>Emirates ID</TableHead>
                <TableHead>Mandalam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.regNo}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.mobileNo}</TableCell>
                  <TableCell>{user.emiratesId}</TableCell>
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
                    <Badge className={
                      user.role === 'master_admin' ? 'bg-red-500' :
                      user.role === 'admin' ? 'bg-purple-500' :
                      user.role === 'mandalam_admin' ? 'bg-orange-500' :
                      user.role === 'custom_admin' ? 'bg-pink-500' : 'bg-blue-500'
                    }>
                      {user.role === 'master_admin' ? 'Master' : 
                       user.role === 'mandalam_admin' ? 'Mandalam' :
                       user.role === 'custom_admin' ? 'Custom' : user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.paymentStatus ? 'bg-green-500' : 'bg-gray-500'}>
                      {user.paymentStatus ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.registrationYear}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Statistics Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">Statistics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-600">Total Users: {stats.total}</p>
            </div>
            
            <div>
              <p className="font-medium mb-2">By Mandalam:</p>
              {Object.entries(stats.byMandalam).map(([mandalam, count]) => (
                <p key={mandalam} className="text-gray-600">{mandalam}: {count}</p>
              ))}
            </div>
            
            <div>
              <p className="font-medium mb-2">By Status:</p>
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <p key={status} className="text-gray-600 capitalize">{status}: {count}</p>
              ))}
            </div>
            
            <div>
              <p className="font-medium mb-2">Payment Status:</p>
              <p className="text-gray-600">Paid: {stats.byPayment.paid}</p>
              <p className="text-gray-600">Unpaid: {stats.byPayment.unpaid}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersOverview;
