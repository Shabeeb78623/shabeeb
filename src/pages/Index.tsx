
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Register from '../components/Register';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';

const Index = () => {
  const { currentUser, isAdmin } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Show admin dashboard if user is admin
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Show user dashboard if user is logged in
  if (currentUser) {
    return <UserDashboard />;
  }

  // Show login or register form
  if (showRegister) {
    return <Register onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return <Login onSwitchToRegister={() => setShowRegister(true)} />;
};

export default Index;
