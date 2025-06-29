
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UserDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

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

          {/* Pratheeksha Membership Card */}
          {currentUser.status === 'approved' && (
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
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
        </div>

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
