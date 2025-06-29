
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedIsAdmin) {
      setIsAdmin(JSON.parse(savedIsAdmin));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check admin credentials
    if (email === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      return true;
    }

    // Check user credentials
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      setIsAdmin(false);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAdmin', 'false');
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some((u: User) => u.email === userData.email || u.emiratesId === userData.emiratesId)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        emiratesId: userData.emiratesId,
        emirate: userData.emirate,
        status: 'pending',
        registrationDate: new Date().toISOString(),
        paymentStatus: false,
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
