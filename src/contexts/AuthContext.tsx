
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, YearlyData } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  currentYear: number;
  availableYears: number[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  switchYear: (year: number) => void;
  createNewYear: () => void;
  getCurrentYearUsers: () => User[];
  updateCurrentUser: (updatedUser: User) => void;
  submitPayment: (amount: number, remarks: string) => Promise<boolean>;
  updateUser: (updatedUser: User) => void;
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
  const [currentYear, setCurrentYear] = useState(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    const savedIsMasterAdmin = localStorage.getItem('isMasterAdmin');
    const savedCurrentYear = localStorage.getItem('currentYear');
    const savedAvailableYears = localStorage.getItem('availableYears');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedIsAdmin) {
      setIsAdmin(JSON.parse(savedIsAdmin));
    }
    if (savedIsMasterAdmin) {
      setIsMasterAdmin(JSON.parse(savedIsMasterAdmin));
    }
    if (savedCurrentYear) {
      setCurrentYear(JSON.parse(savedCurrentYear));
    }
    if (savedAvailableYears) {
      setAvailableYears(JSON.parse(savedAvailableYears));
    }

    // Initialize yearly data structure if not exists
    const yearlyData = localStorage.getItem('yearlyData');
    if (!yearlyData) {
      const initialData: YearlyData[] = [{
        year: 2025,
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        isActive: true
      }];
      localStorage.setItem('yearlyData', JSON.stringify(initialData));
    }
  }, []);

  const generateRegNo = (year: number) => {
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const currentYearData = yearlyData.find(data => data.year === year);
    const users = currentYearData?.users || [];
    const nextNumber = users.length + 1;
    return `${year}${nextNumber.toString().padStart(4, '0')}`;
  };

  const getCurrentYearUsers = (): User[] => {
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const currentYearData = yearlyData.find(data => data.year === currentYear);
    return currentYearData?.users || [];
  };

  const updateYearlyData = (year: number, users: User[]) => {
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const updatedData = yearlyData.map(data => 
      data.year === year ? { ...data, users } : data
    );
    localStorage.setItem('yearlyData', JSON.stringify(updatedData));
    
    if (year === currentYear) {
      localStorage.setItem('users', JSON.stringify(users));
    }
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

    // Check user credentials across all years
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    let foundUser: User | null = null;

    for (const data of yearlyData) {
      // Try email/phone login
      const user = data.users.find((u: User) => 
        u.email === email || u.mobileNo === email
      );
      if (user) {
        // Check password - imported users use Emirates ID as password, others use their set password
        const isCorrectPassword = user.isImported 
          ? user.emiratesId === password 
          : user.password === password;
        
        if (isCorrectPassword) {
          foundUser = user;
          break;
        }
      }
    }
    
    if (foundUser) {
      setCurrentUser(foundUser);
      const adminRoles = ['admin', 'master_admin', 'mandalam_admin', 'custom_admin'];
      setIsAdmin(adminRoles.includes(foundUser.role));
      setIsMasterAdmin(false);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      localStorage.setItem('isAdmin', adminRoles.includes(foundUser.role) ? 'true' : 'false');
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
      const users = getCurrentYearUsers();
      
      if (users.some((u: User) => u.email === userData.email || u.mobileNo === userData.mobileNo || u.emiratesId === userData.emiratesId)) {
        return false;
      }

      if (!/^\d{15}$/.test(userData.emiratesId)) {
        throw new Error('Emirates ID must be exactly 15 digits');
      }

      // Determine payment amount based on registration type
      let paymentAmount = 60; // Default for new users
      if (userData.isReregistration || userData.isImported) {
        paymentAmount = 50; // Renewal/imported users
      }

      const newUser: User = {
        id: Date.now().toString(),
        regNo: generateRegNo(currentYear),
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
        password: userData.password,
        isImported: userData.isImported || false,
        status: 'pending',
        role: 'user',
        registrationDate: new Date().toISOString(),
        registrationYear: currentYear,
        isReregistration: userData.isReregistration || false,
        originalUserId: userData.originalUserId,
        paymentStatus: false,
        paymentAmount: paymentAmount,
        paymentRemarks: '',
        paymentSubmission: {
          submitted: false,
          approvalStatus: 'pending'
        },
        benefitsUsed: [],
        notifications: [],
      };

      const updatedUsers = [...users, newUser];
      updateYearlyData(currentYear, updatedUsers);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    // This is a simplified implementation - in real app you'd verify the old password
    if (currentUser) {
      // In a real implementation, update password in database
      console.log('Password changed for user:', currentUser.email);
      return true;
    }
    return false;
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    // Generate reset token and send email (simplified)
    const token = Math.random().toString(36).substring(2, 15);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    
    // In real implementation, you'd send an email with the reset link
    console.log(`Password reset requested for ${email}. Token: ${token}`);
    return true;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    // Validate token and update password (simplified)
    console.log('Password reset with token:', token);
    return true;
  };

  const switchYear = (year: number) => {
    setCurrentYear(year);
    localStorage.setItem('currentYear', JSON.stringify(year));
    
    const users = getCurrentYearUsers();
    localStorage.setItem('users', JSON.stringify(users));
  };

  const createNewYear = () => {
    const newYear = Math.max(...availableYears) + 1;
    const newAvailableYears = [...availableYears, newYear];
    
    setAvailableYears(newAvailableYears);
    setCurrentYear(newYear);
    localStorage.setItem('availableYears', JSON.stringify(newAvailableYears));
    localStorage.setItem('currentYear', JSON.stringify(newYear));
    
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const newYearData: YearlyData = {
      year: newYear,
      users: [],
      isActive: true
    };
    
    const updatedYearlyData = yearlyData.map(data => ({ ...data, isActive: false }));
    updatedYearlyData.push(newYearData);
    
    localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));
    localStorage.setItem('users', JSON.stringify([]));
  };

  const updateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update in yearly data
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const updatedYearlyData = yearlyData.map(data => ({
      ...data,
      users: data.users.map(user => user.id === updatedUser.id ? updatedUser : user)
    }));
    localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));

    // Update current users array for current year
    const currentUsers = getCurrentYearUsers();
    const updatedCurrentUsers = currentUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    updateYearlyData(currentYear, updatedCurrentUsers);
  };

  const updateUser = (updatedUser: User) => {
    // Update in yearly data across all years
    const yearlyData: YearlyData[] = JSON.parse(localStorage.getItem('yearlyData') || '[]');
    const updatedYearlyData = yearlyData.map(data => ({
      ...data,
      users: data.users.map(user => user.id === updatedUser.id ? updatedUser : user)
    }));
    localStorage.setItem('yearlyData', JSON.stringify(updatedYearlyData));

    // Update current users if it's the current year
    if (updatedUser.registrationYear === currentYear) {
      const users = getCurrentYearUsers();
      const updatedUsers = users.map(user => user.id === updatedUser.id ? updatedUser : user);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

    // Update current user if it's the same user
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const submitPayment = async (amount: number, remarks: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const updatedUser = {
        ...currentUser,
        paymentSubmission: {
          submitted: true,
          submissionDate: new Date().toISOString(),
          approvalStatus: 'pending' as const,
          userRemarks: remarks,
          amount: amount
        }
      };
      
      updateCurrentUser(updatedUser);
      console.log('Payment submitted successfully:', updatedUser.paymentSubmission);
      return true;
    } catch (error) {
      console.error('Payment submission error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isMasterAdmin,
      currentYear,
      availableYears,
      login,
      logout,
      register,
      changePassword,
      requestPasswordReset,
      resetPassword,
      switchYear,
      createNewYear,
      getCurrentYearUsers,
      updateCurrentUser,
      submitPayment,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
