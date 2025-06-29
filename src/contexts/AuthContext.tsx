
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
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
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    const savedIsMasterAdmin = localStorage.getItem('isMasterAdmin');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedIsAdmin) {
      setIsAdmin(JSON.parse(savedIsAdmin));
    }
    if (savedIsMasterAdmin) {
      setIsMasterAdmin(JSON.parse(savedIsMasterAdmin));
    }
  }, []);

  const generateRegNo = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const nextNumber = users.length + 1;
    return nextNumber.toString().padStart(4, '0');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check master admin credentials
    if (email === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      setIsMasterAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isMasterAdmin', 'true');
      return true;
    }

    // Check user credentials
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
      setIsMasterAdmin(false);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAdmin', user.role === 'admin' ? 'true' : 'false');
      localStorage.setItem('isMasterAdmin', 'false');
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    setIsMasterAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isMasterAdmin');
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.some((u: User) => u.email === userData.email || u.mobileNo === userData.mobileNo || u.emiratesId === userData.emiratesId)) {
        return false;
      }

      // Validate Emirates ID (15 digits)
      if (!/^\d{15}$/.test(userData.emiratesId)) {
        throw new Error('Emirates ID must be exactly 15 digits');
      }

      const newUser: User = {
        id: Date.now().toString(),
        regNo: generateRegNo(),
        fullName: userData.fullName,
        mobileNo: userData.mobileNo,
        whatsApp: userData.whatsApp,
        nominee: userData.nominee,
        relation: userData.relation,
        emirate: userData.emirate,
        mandalam: userData.mandalam,
        email: userData.email,
        addressUAE: userData.addressUAE,
        addressIndia: userData.addressIndia,
        kmccMember: userData.kmccMember,
        kmccMembershipNumber: userData.kmccMembershipNumber,
        pratheekshaMember: userData.pratheekshaMember,
        pratheekshaMembershipNumber: userData.pratheekshaMembershipNumber,
        recommendedBy: userData.recommendedBy,
        photo: userData.photo,
        emiratesId: userData.emiratesId,
        status: 'pending',
        role: 'user',
        registrationDate: new Date().toISOString(),
        paymentStatus: false,
        paymentSubmission: {
          submitted: false,
          approvalStatus: 'pending'
        },
        benefitsUsed: [],
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
      isMasterAdmin,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
