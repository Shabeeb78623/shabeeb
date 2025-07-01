
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Register from '../components/Register';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Index = () => {
  const { currentUser, isAdmin, isMasterAdmin, currentYear } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Show admin dashboard if user is master admin
  if (isMasterAdmin) {
    return <AdminDashboard currentUser={currentUser} />;
  }

  // Show user dashboard if user is logged in (includes assigned admins)
  if (currentUser || isAdmin) {
    return <UserDashboard />;
  }

  // Show login or register form
  if (showRegister) {
    return <Register onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return <Login onSwitchToRegister={() => setShowRegister(true)} />;
};

export default Index;
