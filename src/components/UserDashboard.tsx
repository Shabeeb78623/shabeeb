
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

          {/* Membership Card */}
          {currentUser.status === 'approved' && (
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <CardTitle>Membership Card</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-lg font-semibold">{currentUser.name}</div>
                  <div className="text-sm opacity-90">
                    <p>Phone: {currentUser.phone}</p>
                    <p>Emirate: {currentUser.emirate}</p>
                    <p>ID: {currentUser.emiratesId}</p>
                  </div>
                  <div className="text-xs opacity-75 mt-4">
                    Member since {new Date(currentUser.registrationDate).getFullYear()}
                  </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{currentUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{currentUser.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirates ID</label>
                <p className="text-gray-900">{currentUser.emiratesId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emirate</label>
                <p className="text-gray-900">{currentUser.emirate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;
