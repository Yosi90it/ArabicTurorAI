import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signupAndStartTrial } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signupAndStartTrial({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (success) {
        toast({
          title: "Welcome to ArabicAI!",
          description: "Your 72-hour free trial has started. Start learning now!"
        });
        setLocation('/learn');
      } else {
        toast({
          title: "Signup failed",
          description: "This email might already be registered. Please try a different email.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Start Your Free Trial</CardTitle>
            <p className="text-gray-600 mt-2">Get 72 hours of full access to master Arabic with AI</p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="pl-10 w-full py-3 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10 w-full py-3 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="pl-10 w-full py-3 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="pl-10 w-full py-3 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-colors mt-6"
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setLocation('/login')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">Free Trial Includes:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ 72 hours of full platform access</li>
                <li>✓ AI-powered Arabic lessons</li>
                <li>✓ Interactive reading & videos</li>
                <li>✓ Unlimited flashcards</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}