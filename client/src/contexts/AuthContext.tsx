import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  name: string;
  email: string;
  trialStartDate?: string;
  subscriptionStatus: string;
  trialTimeRemaining?: string;
}

interface AuthContextType {
  // Admin auth
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  
  // User auth
  user: User | null;
  isAuthenticated: boolean;
  trialStatus: 'none' | 'active' | 'expired';
  login: (email: string, password: string) => Promise<boolean>;
  signupAndStartTrial: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [trialStatus, setTrialStatus] = useState<'none' | 'active' | 'expired'>('none');

  // Check if user is already logged in on app start
  useEffect(() => {
    const adminStatus = localStorage.getItem('adminLoggedIn');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }

    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        calculateTrialStatus(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('userToken');
    }
  };

  const calculateTrialStatus = (userData: User) => {
    if (!userData.trialStartDate) {
      setTrialStatus('none');
      return;
    }

    const trialStart = new Date(userData.trialStartDate);
    const now = new Date();
    const trialEnd = new Date(trialStart.getTime() + 72 * 60 * 60 * 1000); // 72 hours
    const timeRemaining = trialEnd.getTime() - now.getTime();

    if (timeRemaining > 0) {
      setTrialStatus('active');
      const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
      userData.trialTimeRemaining = `${hoursRemaining} hours`;
    } else {
      setTrialStatus('expired');
    }
  };

  const adminLogin = (password: string): boolean => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123secure';
    
    if (password === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem('adminLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('adminLoggedIn');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        calculateTrialStatus(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signupAndStartTrial = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userToken', data.token);
        setUser(data.user);
        setTrialStatus('active');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setTrialStatus('none');
    localStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{
      isAdmin,
      adminLogin,
      adminLogout,
      user,
      isAuthenticated: !!user,
      trialStatus,
      login,
      signupAndStartTrial,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}