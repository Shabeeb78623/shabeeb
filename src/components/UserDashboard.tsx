
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminDashboard from './AdminDashboard';

const UserDashboard: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const { toast } = useToast();

  if (!currentUser) return null;

  const handlePaymentSubmission = () => {
    if (!paymentRemarks.trim()) {
      toast({
        title: "Error",
        description: "Please enter payment remarks before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingPayment(true);
    
    // Update user's payment submission status
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: any) => {
      if (user.id === currentUser.id) {
        return {
          ...user,
          paymentSubmission: {
            submitted: true,
            submissionDate: new Date().toISOString(),
            approvalStatus: 'pending',
            userRemarks: paymentRemarks.trim()
          }
        };
      }
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify({
      ...currentUser,
      paymentSubmission: {
        submitted: true,
        submissionDate: new Date().toISOString(),
        approvalStatus: 'pending',
        userRemarks: paymentRemarks.trim()
      }
    }));
    
    setSubmittingPayment(false);
    setPaymentRemarks('');
    toast({
      title: "Payment Submitted",
      description: "Your payment submission is now pending admin approval.",
    });
    
    // Refresh the page to show updated status
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending Approval';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getBenefitTypeLabel = (type: string) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'death': return 'Death';
      case 'gulf_returnee': return 'Gulf Returnee';
      case 'cancer': return 'Cancer';
      default: return type;
    }
  };

  // If user is admin, show both dashboards in tabs
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="user" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="user">User Dashboard</TabsTrigger>
              <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              {/* User Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Account Status
                      <Badge className={getStatusColor(currentUser.status)}>
                        {getStatusText(currentUser.status)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Registration Date: {new Date(currentUser.registrationDate).toLocaleDateString()}
                      </p>
                      {currentUser.status === 'pending' && (
                        <p className="text-sm text-yellow-600">
                          Your account is awaiting admin approval. You will be notified once approved.
                        </p>
                      )}
                      {currentUser.status === 'approved' && (
                        <p className="text-sm text-green-600">
                          Your account has been approved! You can now access all features.
                        </p>
                      )}
                      {currentUser.status === 'rejected' && (
                        <p className="text-sm text-red-600">
                          Your account application has been rejected. Please contact support.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Status Card */}
                {currentUser.status === 'approved' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentUser.paymentSubmission?.submitted ? (
                          <div className="space-y-2">
                            <Badge className={
                              currentUser.paymentSubmission.approvalStatus === 'approved' ? 'bg-green-500' :
                              currentUser.paymentSubmission.approvalStatus === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                            }>
                              Payment {currentUser.paymentSubmission.approvalStatus}
                            </Badge>
                            <p className="text-sm text-gray-600">
                              Submitted: {new Date(currentUser.paymentSubmission.submissionDate!).toLocaleDateString()}
                            </p>
                            {currentUser.paymentSubmission.userRemarks && (
                              <p className="text-sm text-gray-700">
                                Your Remarks: {currentUser.paymentSubmission.userRemarks}
                              </p>
                            )}
                            {currentUser.paymentSubmission.adminRemarks && (
                              <p className="text-sm text-blue-600">
                                Admin Remarks: {currentUser.paymentSubmission.adminRemarks}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">Submit your payment for approval</p>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Payment Remarks (Required)
                              </label>
                              <Textarea
                                placeholder="Enter payment details, transaction ID, or any relevant information..."
                                value={paymentRemarks}
                                onChange={(e) => setPaymentRemarks(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <Button 
                              onClick={handlePaymentSubmission}
                              disabled={submittingPayment || !paymentRemarks.trim()}
                              className="w-full"
                            >
                              {submittingPayment ? 'Submitting...' : 'Submit Payment'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Pratheeksha Membership Card */}
              {currentUser.status === 'approved' && (
                <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white mt-8">
                  <CardHeader>
                    <CardTitle className="text-center text-xl">PRATHEEKSHA MEMBERSHIP CARD</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      {currentUser.photo && (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                          <img 
                            src={currentUser.photo} 
                            alt={currentUser.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="text-lg font-bold">REG NO: {currentUser.regNo}</div>
                        <div className="text-lg font-semibold">{currentUser.fullName}</div>
                        <div className="text-sm opacity-90">
                          <p>Phone: {currentUser.mobileNo}</p>
                          <p>Mandalam: {currentUser.mandalam}</p>
                          <p>Emirate: {currentUser.emirate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs opacity-75 mt-4 text-center">
                      Member since {new Date(currentUser.registrationDate).getFullYear()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Benefits Used Section */}
              {currentUser.status === 'approved' && currentUser.benefitsUsed && currentUser.benefitsUsed.length > 0 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Benefits Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentUser.benefitsUsed.map((benefit) => (
                        <div key={benefit.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="font-medium">
                                  {getBenefitTypeLabel(benefit.type)}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {new Date(benefit.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{benefit.remarks}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                AED {benefit.amountPaid}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Information */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">{currentUser.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{currentUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <p className="text-gray-900">{currentUser.mobileNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <p className="text-gray-900">{currentUser.whatsApp}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID</label>
                      <p className="text-gray-900">{currentUser.emiratesId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
                      <p className="text-gray-900">{currentUser.emirate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mandalam</label>
                      <p className="text-gray-900">{currentUser.mandalam}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nominee</label>
                      <p className="text-gray-900">{currentUser.nominee} ({currentUser.relation})</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Regular user dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Account Status
              <Badge className={getStatusColor(currentUser.status)}>
                {getStatusText(currentUser.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Registration Date: {new Date(currentUser.registrationDate).toLocaleDateString()}
              </p>
              {currentUser.status === 'pending' && (
                <p className="text-sm text-yellow-600">
                  Your account is awaiting admin approval. You will be notified once approved.
                </p>
              )}
              {currentUser.status === 'approved' && (
                <p className="text-sm text-green-600">
                  Your account has been approved! You can now access all features.
                </p>
              )}
              {currentUser.status === 'rejected' && (
                <p className="text-sm text-red-600">
                  Your account application has been rejected. Please contact support.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Card */}
        {currentUser.status === 'approved' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentUser.paymentSubmission?.submitted ? (
                  <div className="space-y-2">
                    <Badge className={
                      currentUser.paymentSubmission.approvalStatus === 'approved' ? 'bg-green-500' :
                      currentUser.paymentSubmission.approvalStatus === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                    }>
                      Payment {currentUser.paymentSubmission.approvalStatus}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(currentUser.paymentSubmission.submissionDate!).toLocaleDateString()}
                    </p>
                    {currentUser.paymentSubmission.userRemarks && (
                      <p className="text-sm text-gray-700">
                        Your Remarks: {currentUser.paymentSubmission.userRemarks}
                      </p>
                    )}
                    {currentUser.paymentSubmission.adminRemarks && (
                      <p className="text-sm text-blue-600">
                        Admin Remarks: {currentUser.paymentSubmission.adminRemarks}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Submit your payment for approval</p>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Payment Remarks (Required)
                      </label>
                      <Textarea
                        placeholder="Enter payment details, transaction ID, or any relevant information..."
                        value={paymentRemarks}
                        onChange={(e) => setPaymentRemarks(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handlePaymentSubmission}
                      disabled={submittingPayment || !paymentRemarks.trim()}
                      className="w-full"
                    >
                      {submittingPayment ? 'Submitting...' : 'Submit Payment'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pratheeksha Membership Card */}
        {currentUser.status === 'approved' && (
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white mt-8">
            <CardHeader>
              <CardTitle className="text-center text-xl">PRATHEEKSHA MEMBERSHIP CARD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {currentUser.photo && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white">
                    <img 
                      src={currentUser.photo} 
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="text-lg font-bold">REG NO: {currentUser.regNo}</div>
                  <div className="text-lg font-semibold">{currentUser.fullName}</div>
                  <div className="text-sm opacity-90">
                    <p>Phone: {currentUser.mobileNo}</p>
                    <p>Mandalam: {currentUser.mandalam}</p>
                    <p>Emirate: {currentUser.emirate}</p>
                  </div>
                </div>
              </div>
              <div className="text-xs opacity-75 mt-4 text-center">
                Member since {new Date(currentUser.registrationDate).getFullYear()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Used Section */}
        {currentUser.status === 'approved' && currentUser.benefitsUsed && currentUser.benefitsUsed.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Benefits Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentUser.benefitsUsed.map((benefit) => (
                  <div key={benefit.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-medium">
                            {getBenefitTypeLabel(benefit.type)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(benefit.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{benefit.remarks}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          AED {benefit.amountPaid}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">{currentUser.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <p className="text-gray-900">{currentUser.mobileNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <p className="text-gray-900">{currentUser.whatsApp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID</label>
                <p className="text-gray-900">{currentUser.emiratesId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
                <p className="text-gray-900">{currentUser.emirate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mandalam</label>
                <p className="text-gray-900">{currentUser.mandalam}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominee</label>
                <p className="text-gray-900">{currentUser.nominee} ({currentUser.relation})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;
