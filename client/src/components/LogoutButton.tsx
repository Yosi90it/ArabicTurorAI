import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export default function LogoutButton() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { strings } = useLanguage();
  const { toast } = useToast();

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet."
      });
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Fehler",
        description: "Beim Abmelden ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline" 
      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      {strings.logout}
    </Button>
  );
}