
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, Bell, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RenewalNotification: React.FC = () => {
  const { currentUser, currentYear, register, updateCurrentUser, submitPayment } = useAuth();
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const { toast } = useToast();

  if (!currentUser) return null;

  // Check if user needs to renew (not registered for current year)
  const needsRenewal = currentUser.registrationYear !== currentYear;
  
  // Check for renewal notifications
  const renewalNotifications = currentUser.notifications.filter(
    notification => notification.title.includes('New Year Registration') && !notification.read
  );

  const handleRenewal = async () => {
    if (!currentUser) return;

    setIsRenewing(true);
    try {
      const renewalData = {
        ...currentUser,
        isReregistration: true,
        originalUserId: currentUser.id,
        password: currentUser.password || currentUser.emiratesId,
        registrationYear: currentYear,
        paymentAmount: 50, // Renewal fee
        paymentStatus: false,
        paymentSubmission: {
          submitted: false,
          approvalStatus: 'pending' as const
        },
        status: 'pending' as const,
        registrationDate: new Date().toISOString()
      };

      const success = await register(renewalData);
      
      if (success) {
        // Mark renewal notifications as read
        const updatedUser = {
          ...currentUser,
          notifications: currentUser.notifications.map(notification => 
            notification.title.includes('New Year Registration') 
              ? { ...notification, read: true }
              : notification
          )
        };
        
        updateCurrentUser(updatedUser);
        setIsRenewalDialogOpen(false);
        setShowPaymentDialog(true); // Show payment dialog after successful renewal
        
        toast({
          title: "Renewal Successful",
          description: `You have successfully renewed your membership for ${currentYear}. Please proceed with payment.`,
        });
      } else {
        toast({
          title: "Renewal Failed",
          description: "Failed to renew membership. Please try again or contact admin.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Renewal error:', error);
      toast({
        title: "Error",
        description: "An error occurred during renewal.",
        variant: "destructive"
      });
    } finally {
      setIsRenewing(false);
    }
  };

  const handlePaymentSubmission = async () => {
    if (!currentUser) return;

    try {
      const success = await submitPayment(50, paymentRemarks);
      
      if (success) {
        setShowPaymentDialog(false);
        setPaymentRemarks('');
        
        toast({
          title: "Payment Submitted",
          description: "Your renewal payment has been submitted for admin approval.",
        });
      } else {
        toast({
          title: "Payment Submission Failed",
          description: "Failed to submit payment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: "Error",
        description: "An error occurred during payment submission.",
        variant: "destructive"
      });
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedUser = {
      ...currentUser,
      notifications: currentUser.notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    };
    updateCurrentUser(updatedUser);
  };

  if (!needsRenewal && renewalNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Renewal Status Card */}
      {needsRenewal && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Calendar className="h-5 w-5" />
              Membership Renewal Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-orange-700">
                Your membership is for year {currentUser.registrationYear}. 
                Please renew for {currentYear} to continue enjoying benefits.
              </p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Renewal Fee: AED 50</span>
              </div>
              <Button 
                onClick={() => setIsRenewalDialogOpen(true)}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Renew Membership for {currentYear}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renewal Notifications */}
      {renewalNotifications.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Bell className="h-5 w-5" />
              Renewal Notifications ({renewalNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {renewalNotifications.map((notification) => (
                <div key={notification.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">{notification.title}</h4>
                      <p className="text-sm text-blue-700 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setIsRenewalDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Renew Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renewal Dialog */}
      <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Renew Membership for {currentYear}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Renewal Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Year:</span>
                  <Badge variant="outline">{currentUser.registrationYear}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Renewing to:</span>
                  <Badge>{currentYear}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Renewal Fee:</span>
                  <span className="font-semibold text-green-600">AED 50</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">What happens after renewal:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Your membership will be renewed for {currentYear}</li>
                    <li>You'll need to complete payment of AED 50</li>
                    <li>Admin approval will be required</li>
                    <li>All benefits will be available once approved</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRenewal}
                disabled={isRenewing}
                className="flex-1"
              >
                {isRenewing ? 'Processing...' : 'Confirm Renewal'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRenewalDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Submit Renewal Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Payment Amount:</span>
                <span className="text-xl font-bold text-green-600">AED 50</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Renewal fee for {currentYear}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Remarks (Optional)</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Add any remarks about your payment..."
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After submitting your payment, it will be sent to admin for approval. 
                You'll receive a notification once it's processed.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePaymentSubmission}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Submit Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RenewalNotification;
