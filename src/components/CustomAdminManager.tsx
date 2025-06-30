import React, { useState } from 'react';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CustomAdminManagerProps {
  users: User[];
  onUpdateUser: (user: User) => void;
}

type MandalamType = 'BALUSHERI' | 'KUNNAMANGALAM' | 'KODUVALLI' | 'NADAPURAM' | 'KOYLANDI' | 'VADAKARA' | 'BEPUR' | 'KUTTIYADI';

const CustomAdminManager: React.FC<CustomAdminManagerProps> = ({ users, onUpdateUser }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState({
    canViewUsers: false,
    canEditUsers: false,
    canApproveUsers: false,
    canManagePayments: false,
    canManageBenefits: false,
    canSendNotifications: false,
    mandalamAccess: [] as MandalamType[]
  });
  const { toast } = useToast();

  const resetPermissions = () => {
    setPermissions({
      canViewUsers: false,
      canEditUsers: false,
      canApproveUsers: false,
      canManagePayments: false,
      canManageBenefits: false,
      canSendNotifications: false,
      mandalamAccess: []
    });
  };

  const assignCustomAdmin = () => {
    if (!selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      role: 'custom_admin' as const,
      customPermissions: {
        ...permissions,
        mandalamAccess: permissions.mandalamAccess
      }
    };

    onUpdateUser(updatedUser);
    toast({
      title: "Custom Admin Assigned",
      description: `${selectedUser.fullName} has been assigned custom admin permissions.`,
    });

    setSelectedUser(null);
    resetPermissions();
  };

  const removeAdminRole = (userId: string, newRole: 'user' | 'admin' | 'mandalam_admin' = 'user') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        role: newRole,
        customPermissions: undefined,
        mandalamAccess: newRole === 'mandalam_admin' ? user.mandalamAccess : undefined
      };
      onUpdateUser(updatedUser);
      toast({
        title: "Role Updated",
        description: `${user.fullName}'s role has been updated to ${newRole}.`,
      });
    }
  };

  const assignMandalamAdmin = (userId: string, mandalam: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        role: 'mandalam_admin' as const,
        mandalamAccess: mandalam as any,
        customPermissions: undefined
      };
      onUpdateUser(updatedUser);
      toast({
        title: "Mandalam Admin Assigned",
        description: `${user.fullName} is now admin for ${mandalam} mandalam.`,
      });
    }
  };

  const toggleAllAccessAdmin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        role: user.role === 'admin' ? 'user' as const : 'admin' as const,
        customPermissions: undefined,
        mandalamAccess: undefined
      };
      onUpdateUser(updatedUser);
      toast({
        title: "Role Updated",
        description: `${user.fullName} is now ${updatedUser.role === 'admin' ? 'an all access admin' : 'a user'}.`,
      });
    }
  };

  const handleMandalamToggle = (mandalam: MandalamType) => {
    setPermissions(prev => ({
      ...prev,
      mandalamAccess: prev.mandalamAccess.includes(mandalam)
        ? prev.mandalamAccess.filter(m => m !== mandalam)
        : [...prev.mandalamAccess, mandalam]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.filter(user => user.status === 'approved').map(user => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user.fullName}</h3>
                    <Badge className={
                      user.role === 'master_admin' ? 'bg-red-500' :
                      user.role === 'admin' ? 'bg-purple-500' :
                      user.role === 'mandalam_admin' ? 'bg-orange-500' :
                      user.role === 'custom_admin' ? 'bg-pink-500' : 'bg-blue-500'
                    }>
                      {user.role === 'master_admin' ? 'Master Admin' :
                       user.role === 'mandalam_admin' ? `Mandalam Admin (${user.mandalamAccess})` :
                       user.role === 'custom_admin' ? 'Custom Admin' :
                       user.role === 'admin' ? 'All Access Admin' : 'User'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">Mandalam: {user.mandalam}</p>
                  
                  {user.role === 'custom_admin' && user.customPermissions && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium">Custom Permissions:</p>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {user.customPermissions.canViewUsers && <span>• View Users</span>}
                        {user.customPermissions.canEditUsers && <span>• Edit Users</span>}
                        {user.customPermissions.canApproveUsers && <span>• Approve Users</span>}
                        {user.customPermissions.canManagePayments && <span>• Manage Payments</span>}
                        {user.customPermissions.canManageBenefits && <span>• Manage Benefits</span>}
                        {user.customPermissions.canSendNotifications && <span>• Send Notifications</span>}
                      </div>
                      {user.customPermissions.mandalamAccess && user.customPermissions.mandalamAccess.length > 0 && (
                        <p className="mt-1">Mandalam Access: {user.customPermissions.mandalamAccess.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {user.role !== 'master_admin' && (
                    <>
                      <Button
                        onClick={() => toggleAllAccessAdmin(user.id)}
                        variant={user.role === 'admin' ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {user.role === 'admin' ? 'Remove All Access' : 'Make All Access Admin'}
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Assign Mandalam Admin
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Mandalam Admin</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>Assign {user.fullName} as mandalam admin for:</p>
                            <Select onValueChange={(mandalam) => assignMandalamAdmin(user.id, mandalam)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mandalam" />
                              </SelectTrigger>
                              <SelectContent>
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
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              if (user.customPermissions) {
                                setPermissions({
                                  canViewUsers: user.customPermissions.canViewUsers,
                                  canEditUsers: user.customPermissions.canEditUsers,
                                  canApproveUsers: user.customPermissions.canApproveUsers,
                                  canManagePayments: user.customPermissions.canManagePayments,
                                  canManageBenefits: user.customPermissions.canManageBenefits,
                                  canSendNotifications: user.customPermissions.canSendNotifications,
                                  mandalamAccess: user.customPermissions.mandalamAccess || []
                                });
                              } else {
                                resetPermissions();
                              }
                            }}
                          >
                            Custom Admin
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Assign Custom Admin Permissions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p>Configure permissions for {selectedUser?.fullName}</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={permissions.canViewUsers}
                                    onCheckedChange={(checked) => 
                                      setPermissions(prev => ({ ...prev, canViewUsers: !!checked }))
                                    }
                                  />
                                  <label className="text-sm">Can View Users</label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={permissions.canEditUsers}
                                    onCheckedChange={(checked) => 
                                      setPermissions(prev => ({ ...prev, canEditUsers: !!checked }))
                                    }
                                  />
                                  <label className="text-sm">Can Edit Users</label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={permissions.canApproveUsers}
                                    onCheckedChange={(checked) => 
                                      setPermissions(prev => ({ ...prev, canApproveUsers: !!checked }))
                                    }
                                  />
                                  <label className="text-sm">Can Approve Users</label>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={permissions.canManagePayments}
                                    onCheckedChange={(checked) => 
                                      setPermissions(prev => ({ ...prev, canManagePayments: !!checked }))
                                    }
                                  />
                                  <label className="text-sm">Can Manage Payments</label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={permissions.canManageBenefits}
                                    onCheckedChange={(checked) => 
                                      setPermissions(prev => ({ ...prev, canManageBenefits: !!checked }))
                                    }
                                  />
                                  <label className="text-sm">Can Manage Benefits</label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={permissions.canSendNotifications}
                                    onCheckedChange={(checked) => 
                                      setPermissions(prev => ({ ...prev, canSendNotifications: !!checked }))
                                    }
                                  />
                                  <label className="text-sm">Can Send Notifications</label>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Mandalam Access:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {(['BALUSHERI', 'KUNNAMANGALAM', 'KODUVALLI', 'NADAPURAM', 'KOYLANDI', 'VADAKARA', 'BEPUR', 'KUTTIYADI'] as MandalamType[]).map(mandalam => (
                                  <div key={mandalam} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={permissions.mandalamAccess.includes(mandalam)}
                                      onCheckedChange={() => handleMandalamToggle(mandalam)}
                                    />
                                    <label className="text-sm">{mandalam}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Button onClick={assignCustomAdmin} className="w-full">
                              Assign Custom Admin
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {(user.role === 'admin' || user.role === 'mandalam_admin' || user.role === 'custom_admin') && (
                        <Button
                          onClick={() => removeAdminRole(user.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove Admin
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomAdminManager;
