import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();
  const { adminLogin } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter the admin password.",
        variant: "destructive"
      });
      return;
    }

    const success = adminLogin(password);
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to the Admin Panel."
      });
      setLocation('/admin-panel');
    } else {
      toast({
        title: "Access denied",
        description: "Invalid admin password. Please try again.",
        variant: "destructive"
      });
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
            <p className="text-gray-600 mt-2">Enter the admin password to access the control panel</p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Access Admin Panel
              </Button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Restricted Access</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This area is restricted to authorized administrators only.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}