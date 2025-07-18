import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export default function GlobalHeader() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { strings } = useLanguage();
  const { toast } = useToast();

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: strings.loggedOut,
        description: strings.loggedOutSuccessfully
      });
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: strings.error, 
        description: strings.logoutError,
        variant: "destructive"
      });
    }
  };

  // Check if user is authenticated either by state or by token in localStorage
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
  const shouldShowLogout = isAuthenticated || !!hasToken;

  console.log('GlobalHeader - isAuthenticated:', isAuthenticated, 'hasToken:', !!hasToken, 'user:', user);

  // Always show logout button if there's a token, regardless of auth state
  if (!hasToken && !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="bg-white/95 hover:bg-white text-gray-700 border-gray-300 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{strings.logout}</span>
        <span className="sm:hidden">{strings.out}</span>
      </Button>
    </div>
  );
}