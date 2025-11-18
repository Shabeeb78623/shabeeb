import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User } from '../types/user';
import { Edit, Shield, Clock, User as UserIcon } from 'lucide-react';
import UserProfileEditor from './UserProfileEditor';

interface AccountCenterProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onRequestChange: (field: string, oldValue: string, newValue: string, reason: string) => void;
}

const AccountCenter: React.FC<AccountCenterProps> = ({ 
  user, 
  onUpdateUser,
  onRequestChange 
}) => {
  const [changeRequest, setChangeRequest] = useState({
    field: '',
    oldValue: '',
    newValue: '',
    reason: ''
  });
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const { toast } = useToast();

  const handleRequestChange = (field: string, oldValue: string) => {
    setChangeRequest({ field, oldValue, newValue: '', reason: '' });
    setShowChangeDialog(true);
  };

  const submitChangeRequest = () => {
    if (!changeRequest.newValue.trim() || !changeRequest.reason.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    onRequestChange(
      changeRequest.field,
      changeRequest.oldValue,
      changeRequest.newValue,
      changeRequest.reason
    );

    toast({
      title: "Change Request Submitted",
      description: "Your change request has been sent to admin for approval",
    });

    setShowChangeDialog(false);
    setChangeRequest({ field: '', oldValue: '', newValue: '', reason: '' });
  };

  const canEditDirectly = (field: string, value: any) => {
    return !value || value === '' || value === null || value === undefined;
  };

  // Check if user has any missing required fields
  const hasMissingInfo = !user.fullName || !user.mobileNo || !user.emirate || !user.mandalam || !user.emiratesId;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">Registration Date</Label>
              <p className="font-medium">{new Date(user.registrationDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-gray-600">Registration Year</Label>
              <p className="font-medium">{user.registrationYear}</p>
            </div>
            <div>
              <Label className="text-gray-600">Member ID</Label>
              <p className="font-medium">{user.regNo}</p>
            </div>
            <div>
              <Label className="text-gray-600">Account Status</Label>
              <p className={`font-medium ${
                user.status === 'approved' ? 'text-green-600' : 
                user.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasMissingInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please complete your profile information. Once completed, this section will be hidden.
              </p>
              <UserProfileEditor user={user} onUpdateUser={onUpdateUser} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request Data Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Need to update existing information? Request changes for admin review.
          </p>
          <div className="space-y-2">
            {user.fullName && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequestChange('fullName', user.fullName)}
              >
                Request Name Change
              </Button>
            )}
            {user.mobileNo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequestChange('mobileNo', user.mobileNo)}
              >
                Request Mobile Change
              </Button>
            )}
            {user.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequestChange('email', user.email)}
              >
                Request Email Change
              </Button>
            )}
            {user.emiratesId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequestChange('emiratesId', user.emiratesId)}
              >
                Request Emirates ID Change
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {user.benefitsUsed && user.benefitsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Benefits History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.benefitsUsed.map((benefit, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{benefit.type}</h4>
                      <p className="text-sm text-gray-600">{benefit.remarks}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Amount: AED {benefit.amountPaid}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(benefit.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Change: {changeRequest.field}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Value</Label>
              <Input value={changeRequest.oldValue} disabled />
            </div>
            <div>
              <Label>New Value</Label>
              <Input
                value={changeRequest.newValue}
                onChange={(e) => setChangeRequest(prev => ({ ...prev, newValue: e.target.value }))}
                placeholder="Enter new value"
              />
            </div>
            <div>
              <Label>Reason for Change</Label>
              <Textarea
                value={changeRequest.reason}
                onChange={(e) => setChangeRequest(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why this change is needed"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitChangeRequest} className="flex-1">
                Submit Request
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowChangeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountCenter;