import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LogoutButton() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { strings } = useLanguage();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
    >
      <LogOut className="w-4 h-4 mr-2" />
      {strings.logout}
    </Button>
  );
}