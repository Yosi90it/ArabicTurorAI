import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrial } from '@/contexts/TrialContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'wouter';
import TrialExpiredBanner from '@/components/TrialExpiredBanner';
import Header from '@/components/Header';
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
  const { isTrialActive } = useTrial();
  const { strings } = useLanguage();

  console.log('Learn page - trialStatus:', trialStatus, 'isTrialActive:', isTrialActive, 'user:', user);

  // Check both trial systems - prefer AuthContext trial status
  const hasActiveTrial = trialStatus === 'active' || isTrialActive;

  if (!hasActiveTrial && trialStatus === 'expired') {
    return <TrialExpiredBanner />;
  }

  const learningModules = [
    {
      title: strings.aiChat,
      description: "Practice conversations with your AI Arabic tutor",
      icon: Brain,
      route: "/ai-chat",
      color: "bg-purple-500"
    },
    {
      title: strings.bookReader,
      description: "Read Arabic stories with instant translation",
      icon: BookOpen,
      route: "/book-reader",
      color: "bg-blue-500"
    },
    {
      title: strings.videoTrainer,
      description: "Learn pronunciation through video lessons",
      icon: Play,
      route: "/video-trainer",
      color: "bg-green-500"
    },
    {
      title: strings.flashcards,
      description: "Build vocabulary with spaced repetition",
      icon: GraduationCap,
      route: "/flashcards",
      color: "bg-orange-500"
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Trial Status Banner */}
        {hasActiveTrial && (
          <Alert className="mb-8 border-green-200 bg-green-50">
            <Clock className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>{strings.trialActive}</strong> 
              {user?.trialTimeRemaining && ` ${user.trialTimeRemaining} remaining.`} 
              Enjoy full access to all features!
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {strings.welcomeBackUser}, {user?.name || 'Learner'}!
          </h1>
          <p className="text-xl text-gray-600">
            {strings.continueJourney}
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
                      {strings.startLearning}
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
              <h3 className="text-xl font-bold mb-2">{strings.weeklyPlan}</h3>
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
              <h3 className="text-xl font-bold mb-2">{strings.alphabetTrainer}</h3>
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