import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Edit, Trash2, Key, Calendar, Eye, EyeOff } from 'lucide-react';
import UserBenefitsView from './UserBenefitsView';

interface ChangeRequest {
  id: string;
  userId: string;
  field: string;
  currentValue: string;
  newValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

const AccountCenter: React.FC = () => {
  const { currentUser, updateCurrentUser, changePassword } = useAuth();
  const [editedUser, setEditedUser] = useState<User>(currentUser!);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeRequestField, setChangeRequestField] = useState('');
  const [changeRequestValue, setChangeRequestValue] = useState('');
  const [changeRequestReason, setChangeRequestReason] = useState('');
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  if (!currentUser) return null;

  const handleFieldUpdate = (field: keyof User, value: any) => {
    // Check if field has existing data
    const currentValue = currentUser[field];
    
    if (currentValue && currentValue !== '' && currentValue !== null && currentValue !== undefined) {
      // Field has existing data, require change request
      setChangeRequestField(field as string);
      setChangeRequestValue(value);
      setShowChangeRequest(true);
      return;
    }
    
    // Field is empty, can update directly
    const updatedUser = { ...currentUser, [field]: value };
    setEditedUser(updatedUser);
    updateCurrentUser(updatedUser);
    toast({
      title: "Profile Updated",
      description: `${field} has been updated successfully.`,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleFieldUpdate('photo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitChangeRequest = () => {
    if (!changeRequestReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the change.",
        variant: "destructive"
      });
      return;
    }

    const changeRequest: ChangeRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      field: changeRequestField,
      currentValue: currentUser[changeRequestField as keyof User] as string || '',
      newValue: changeRequestValue,
      reason: changeRequestReason,
      status: 'pending',
      submittedDate: new Date().toISOString()
    };

    // Store change request in localStorage
    const existingRequests = JSON.parse(localStorage.getItem('changeRequests') || '[]');
    localStorage.setItem('changeRequests', JSON.stringify([...existingRequests, changeRequest]));

    toast({
      title: "Change Request Submitted",
      description: "Your change request has been submitted to admin for approval.",
    });

    setShowChangeRequest(false);
    setChangeRequestField('');
    setChangeRequestValue('');
    setChangeRequestReason('');
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = () => {
    // Create deletion request
    const deleteRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };

    const existingDeleteRequests = JSON.parse(localStorage.getItem('deleteRequests') || '[]');
    localStorage.setItem('deleteRequests', JSON.stringify([...existingDeleteRequests, deleteRequest]));

    toast({
      title: "Deletion Request Submitted",
      description: "Your account deletion request has been submitted to admin.",
    });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <p className="text-lg">{currentUser.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-lg">{currentUser.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge className={
                currentUser.status === 'approved' ? 'bg-green-500' :
                currentUser.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
              }>
                {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Joined Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>{new Date(currentUser.registrationDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
              {currentUser.photo ? (
                <img 
                  src={currentUser.photo} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {currentUser.photo ? 'Change Photo' : 'Upload Photo'}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">WhatsApp Number</label>
              <Input
                placeholder="Enter WhatsApp number"
                value={editedUser.whatsApp || ''}
                onChange={(e) => handleFieldUpdate('whatsApp', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nominee</label>
              <Input
                placeholder="Enter nominee name"
                value={editedUser.nominee || ''}
                onChange={(e) => handleFieldUpdate('nominee', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Recommended By</label>
              <Input
                placeholder="Who recommended you?"
                value={editedUser.recommendedBy || ''}
                onChange={(e) => handleFieldUpdate('recommendedBy', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Address in UAE</label>
            <Textarea
              placeholder="Enter your UAE address"
              value={editedUser.addressUAE || ''}
              onChange={(e) => handleFieldUpdate('addressUAE', e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Address in India</label>
            <Textarea
              placeholder="Enter your India address"
              value={editedUser.addressIndia || ''}
              onChange={(e) => handleFieldUpdate('addressIndia', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <UserBenefitsView user={currentUser} />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button onClick={handlePasswordChange} className="w-full">
                    Change Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Request Account Deletion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Account Deletion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to request account deletion? This will send a request to the admin for review.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Submit Deletion Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Change Request Dialog */}
      <Dialog open={showChangeRequest} onOpenChange={setShowChangeRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Data Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This field already has data. To change existing information, you need admin approval.
            </p>
            <div>
              <label className="text-sm font-medium">Current Value:</label>
              <p className="text-sm text-gray-500">{currentUser[changeRequestField as keyof User] as string}</p>
            </div>
            <div>
              <label className="text-sm font-medium">New Value:</label>
              <p className="text-sm">{changeRequestValue}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Reason for Change *</label>
              <Textarea
                placeholder="Please explain why you need to change this information"
                value={changeRequestReason}
                onChange={(e) => setChangeRequestReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowChangeRequest(false)}>
                Cancel
              </Button>
              <Button onClick={submitChangeRequest}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountCenter;