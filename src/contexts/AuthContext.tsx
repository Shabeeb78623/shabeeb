import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  authUser: AuthUser | null;
  session: Session | null;
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
  getCurrentYearUsers: () => Promise<User[]>;
  updateCurrentUser: (updatedUser: User) => void;
  submitPayment: (amount: number, remarks: string) => Promise<boolean>;
  updateUser: (updatedUser: User) => void;
  loading: boolean;
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
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [currentYear, setCurrentYear] = useState(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025]);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setAuthUser(session?.user ?? null);
        
        // Defer loading profile data
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
          setIsMasterAdmin(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Load available years
    loadYears();

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get user role
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('role, mandalam_access')
        .eq('user_id', userId);

      if (roleError) throw roleError;

      const userRole = roles?.[0]?.role || 'user';
      const isMaster = userRole === 'master_admin';
      const isAdminUser = userRole === 'mandalam_admin' || isMaster;

      // Get notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Get benefits used
      const { data: benefits } = await supabase
        .from('user_benefits')
        .select('*')
        .eq('user_id', userId)
        .order('used_date', { ascending: false });

      // Map to User type
      const mappedUser: User = {
        id: profile.id,
        regNo: `${profile.registration_year}${profile.id.substring(0, 4)}`,
        fullName: profile.full_name,
        mobileNo: profile.phone_number,
        whatsApp: profile.phone_number,
        nominee: '',
        relation: '',
        emirate: profile.emirate,
        mandalam: profile.mandalam,
        email: profile.email || '',
        addressUAE: '',
        addressIndia: '',
        kmccMember: false,
        kmccMembershipNumber: '',
        pratheekshaMember: false,
        pratheekshaMembershipNumber: '',
        recommendedBy: '',
        photo: profile.profile_photo_url || '',
        emiratesId: profile.emirates_id || '',
        password: '',
        isImported: false,
        status: profile.status || 'pending',
        role: userRole,
        mandalamAccess: roles?.[0]?.mandalam_access,
        registrationDate: profile.created_at,
        registrationYear: profile.registration_year,
        isReregistration: false,
        paymentStatus: !!profile.payment_date,
        paymentAmount: Number(profile.payment_amount) || 0,
        paymentRemarks: '',
        paymentDate: profile.payment_date,
        paymentSubmission: {
          submitted: !!profile.payment_date,
          approvalStatus: profile.status === 'approved' ? 'approved' : 'pending'
        },
        benefitsUsed: benefits?.map(b => ({
          id: b.id,
          type: b.benefit_type as 'hospital' | 'death' | 'gulf_returnee' | 'cancer',
          remarks: b.remarks || '',
          amountPaid: Number(b.amount_paid) || 0,
          date: b.used_date
        })) || [],
        notifications: notifications?.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          date: n.created_at,
          isRead: n.is_read,
          sentBy: n.sent_by
        })) || [],
      };

      setCurrentUser(mappedUser);
      setIsAdmin(isAdminUser);
      setIsMasterAdmin(isMaster);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadYears = async () => {
    try {
      const { data, error } = await supabase
        .from('year_configs')
        .select('year')
        .order('year', { ascending: true });

      if (error) throw error;

      const years = data?.map(y => y.year) || [2025];
      setAvailableYears(years);
    } catch (error) {
      console.error('Error loading years:', error);
      setAvailableYears([2025]);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try standard login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle login failure
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAuthUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsMasterAdmin(false);
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      // Validate Emirates ID format
      if (!/^\d{15}$/.test(userData.emiratesId)) {
        throw new Error('Emirates ID must be exactly 15 digits');
      }

      // Check if user already exists
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id')
        .or(`email.eq.${userData.email},phone_number.eq.${userData.mobileNo},emirates_id.eq.${userData.emiratesId}`)
        .limit(1);

      if (existingProfiles && existingProfiles.length > 0) {
        return false;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.fullName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Upload photo if provided
      let profilePhotoUrl = '';
      if (userData.photo) {
        const fileName = `${authData.user.id}/profile.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, await fetch(userData.photo).then(r => r.blob()), {
            upsert: true
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);
          profilePhotoUrl = publicUrl;
        }
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: userData.fullName,
          phone_number: userData.mobileNo,
          email: userData.email,
          emirates_id: userData.emiratesId,
          mandalam: userData.mandalam,
          emirate: userData.emirate,
          registration_year: currentYear,
          status: 'pending',
          profile_photo_url: profilePhotoUrl,
        });

      if (profileError) throw profileError;

      // Create default user role
      await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'user'
        });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const switchYear = (year: number) => {
    setCurrentYear(year);
  };

  const createNewYear = async () => {
    const newYear = Math.max(...availableYears) + 1;
    
    try {
      await supabase
        .from('year_configs')
        .insert({ year: newYear, is_active: true });

      setAvailableYears([...availableYears, newYear]);
      setCurrentYear(newYear);
    } catch (error) {
      console.error('Error creating new year:', error);
    }
  };

  const getCurrentYearUsers = async (): Promise<User[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('registration_year', currentYear);

      if (error) throw error;

      return profiles?.map(p => ({
        id: p.id,
        regNo: `${p.registration_year}${p.id.substring(0, 4)}`,
        fullName: p.full_name,
        mobileNo: p.phone_number,
        whatsApp: p.phone_number,
        nominee: '',
        relation: '',
        emirate: p.emirate,
        mandalam: p.mandalam,
        email: p.email || '',
        addressUAE: '',
        addressIndia: '',
        kmccMember: false,
        kmccMembershipNumber: '',
        pratheekshaMember: false,
        pratheekshaMembershipNumber: '',
        recommendedBy: '',
        photo: p.profile_photo_url || '',
        emiratesId: p.emirates_id || '',
        password: '',
        isImported: false,
        status: p.status || 'pending',
        role: 'user',
        registrationDate: p.created_at,
        registrationYear: p.registration_year,
        isReregistration: false,
        paymentStatus: !!p.payment_date,
        paymentAmount: Number(p.payment_amount) || 0,
        paymentRemarks: '',
        paymentDate: p.payment_date,
        paymentSubmission: {
          submitted: !!p.payment_date,
          approvalStatus: p.status === 'approved' ? 'approved' : 'pending'
        },
        benefitsUsed: [],
        notifications: [],
      })) || [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  const updateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    // Update will be handled by realtime subscriptions
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.fullName,
          phone_number: updatedUser.mobileNo,
          email: updatedUser.email,
          status: updatedUser.status,
          payment_date: updatedUser.paymentDate,
          payment_amount: updatedUser.paymentAmount,
        })
        .eq('id', updatedUser.id);

      // Reload if it's current user
      if (currentUser?.id === updatedUser.id) {
        await loadUserProfile(updatedUser.id);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const submitPayment = async (amount: number, remarks: string): Promise<boolean> => {
    if (!authUser) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          payment_amount: amount,
          payment_date: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (error) throw error;

      // Reload profile
      await loadUserProfile(authUser.id);
      return true;
    } catch (error) {
      console.error('Payment submission error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      authUser,
      session,
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
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};