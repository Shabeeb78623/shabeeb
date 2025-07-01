
import React, { useState } from 'react';
import { User } from '../types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Calendar, DollarSign } from 'lucide-react';

interface ReregistrationPopupProps {
  user: User;
  onReregister: () => void;
  onUpdateUser: (user: User) => void;
  activeYear: number;
  registrationFee: number;
}

const ReregistrationPopup: React.FC<ReregistrationPopupProps> = ({
  user,
  onReregister,
  onUpdateUser,
  activeYear,
  registrationFee
}) => {
  const [showPopup, setShowPopup] = useState(user.showReregistrationPopup || false);

  const handleReregister = () => {
    setShowPopup(false);
    const updatedUser = {
      ...user,
      showReregistrationPopup: false
    };
    onUpdateUser(updatedUser);
    onReregister();
  };

  const handleRemindLater = () => {
    setShowPopup(false);
    const updatedUser = {
      ...user,
      showReregistrationPopup: false,
      notifications: [
        ...user.notifications,
        {
          id: Date.now().toString(),
          title: 'Registration Reminder',
          message: `Don't forget to re-register for ${activeYear}. Registration fee: AED ${registrationFee}`,
          date: new Date().toISOString(),
          read: false,
          fromAdmin: 'System',
        }
      ]
    };
    onUpdateUser(updatedUser);
  };

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Re-registration Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Year: {activeYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Fee: AED {registrationFee}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-sm text-gray-600">
            A new registration year has begun. You must re-register to continue your membership 
            and access benefits.
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleReregister} className="flex-1">
              Re-register Now
            </Button>
            <Button onClick={handleRemindLater} variant="outline" className="flex-1">
              Remind Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReregistrationPopup;
