import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export default function Header() {
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
    <div className="absolute top-4 right-4 z-50">
      <Button
        onClick={handleLogout}
        variant="outline"
        className="bg-white/90 hover:bg-white text-gray-700 border-gray-200 shadow-lg"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {strings.logout}
      </Button>
    </div>
  );
}