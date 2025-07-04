import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'wouter';
import { 
  Brain, 
  BookOpen, 
  Play, 
  GraduationCap, 
  Clock, 
  Crown,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function Learn() {
  const { user, trialStatus } = useAuth();
  const isTrialExpired = trialStatus === 'expired';
  const isInTrial = trialStatus === 'active';

  const learningModules = [
    {
      title: "AI Chat Assistant",
      description: "Practice conversations with your AI Arabic tutor",
      icon: Brain,
      route: "/ai-chat",
      color: "bg-purple-500"
    },
    {
      title: "Interactive Books",
      description: "Read Arabic stories with instant translation",
      icon: BookOpen,
      route: "/book-reader",
      color: "bg-blue-500"
    },
    {
      title: "Video Training",
      description: "Learn pronunciation through video lessons",
      icon: Play,
      route: "/video-trainer",
      color: "bg-green-500"
    },
    {
      title: "Smart Flashcards",
      description: "Build vocabulary with spaced repetition",
      icon: GraduationCap,
      route: "/flashcards",
      color: "bg-orange-500"
    }
  ];

  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Free trial expired!</strong> Your 72-hour trial has ended. 
              Subscribe now to continue your Arabic learning journey.
            </AlertDescription>
          </Alert>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-10 h-10 text-purple-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Continue Your Learning
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Unlock unlimited access to all Arabic learning features
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {learningModules.map((module, index) => (
                  <div key={index} className="p-4 bg-gray-100 rounded-xl opacity-50">
                    <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-500">{module.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                    <div className="text-xs text-gray-400 mt-2">🔒 Requires subscription</div>
                  </div>
                ))}
              </div>

              <Link href="/subscription">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold">
                  Choose Your Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Trial Status Banner */}
        {isInTrial && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <Clock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Free trial active!</strong> You have{' '}
              {user?.trialTimeRemaining || 'limited time'} remaining. 
              Enjoy full access to all features!
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome back, {user?.name || 'Learner'}!
          </h1>
          <p className="text-xl text-gray-600">
            Continue your Arabic learning journey with AI-powered lessons
          </p>
        </div>

        {/* Learning Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {learningModules.map((module, index) => (
            <Link key={index} href={module.route}>
              <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    <module.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                  <div className="mt-4">
                    <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl">
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Access Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">7-Day Learning Plan</h3>
              <p className="mb-4 text-purple-100">
                Follow our structured program to master Arabic fundamentals
              </p>
              <Link href="/weekly-plan">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl">
                  View Plan
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Alphabet Trainer</h3>
              <p className="mb-4 text-green-100">
                Master Arabic letters and pronunciation fundamentals
              </p>
              <Link href="/alphabet-trainer">
                <Button className="bg-white text-green-600 hover:bg-gray-100 rounded-xl">
                  Practice Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}