import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrial } from '@/contexts/TrialContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFlashcards } from '@/contexts/FlashcardContext';
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
  ArrowRight,
  Target,
  TrendingUp,
  Book,
  RotateCcw,
  Home
} from 'lucide-react';

export default function Learn() {
  const { user, trialStatus } = useAuth();
  const { isTrialActive } = useTrial();
  const { strings } = useLanguage();
  const { userFlashcards } = useFlashcards();

  console.log('Learn page - trialStatus:', trialStatus, 'isTrialActive:', isTrialActive, 'user:', user);

  // Check both trial systems - prefer AuthContext trial status
  const hasActiveTrial = trialStatus === 'active' || isTrialActive;

  if (!hasActiveTrial && trialStatus === 'expired') {
    return <TrialExpiredBanner />;
  }

  // Calculate statistics
  const learnedWords = userFlashcards.length;
  const collectedPhrases = 0; // Can be enhanced later
  const weeklyProgress = 75; // Mock data - can be enhanced
  const booksRead = 1; // Mock data
  const flashcardRepeats = 0; // Mock data

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header with Arabic greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">ع</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ArabLearn</h1>
              <p className="text-sm text-gray-600">Arabisch Lernen</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            !مَرْحَبًا Willkommen zurück
          </h2>
          <p className="text-gray-600">Setze deine Arabisch-Reise fort</p>
        </div>

        {/* Weekly Goal Card */}
        <Card className="mb-8 bg-gradient-to-r from-orange-400 to-orange-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6" />
              <h3 className="text-xl font-bold">Wöchentliches Ziel</h3>
            </div>
            <p className="text-lg mb-4">Fortschritt diese Woche</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="bg-black/20 rounded-full h-3 overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{width: `${weeklyProgress}%`}}></div>
                </div>
              </div>
              <span className="text-xl font-bold">{weeklyProgress}%</span>
            </div>
            <p className="text-orange-100">Großartig! Du bist auf dem besten Weg dein Ziel zu erreichen.</p>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Learned Words */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-600 font-medium">Gelernte Wörter</h4>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{learnedWords}</p>
            </CardContent>
          </Card>

          {/* Collected Phrases */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-600 font-medium">Gesammelte Phrasen</h4>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{collectedPhrases}</p>
            </CardContent>
          </Card>

          {/* Books Read */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-600 font-medium">Gelesene Bücher</h4>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{booksRead}</p>
            </CardContent>
          </Card>

          {/* Flashcards Wiederholung */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-600 font-medium">Flashcards Wiederholung</h4>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{flashcardRepeats}</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Areas Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Home className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">LERNBEREICHE</h3>
          </div>

          <div className="space-y-3">
            {/* Dashboard */}
            <Link href="/learn">
              <div className="flex items-center gap-4 p-4 bg-orange-100 text-orange-700 rounded-xl cursor-pointer hover:bg-orange-200 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </div>
            </Link>

            {/* Bücher */}
            <Link href="/book-reader">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border">
                <BookOpen className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Bücher</span>
              </div>
            </Link>

            {/* Videos */}
            <Link href="/video-trainer">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border">
                <Play className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Videos</span>
              </div>
            </Link>

            {/* KI Chat */}
            <Link href="/ai-chat">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border">
                <Brain className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">KI Chat</span>
              </div>
            </Link>

            {/* Flashcards */}
            <Link href="/flashcards">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Flashcards</span>
              </div>
            </Link>
          </div>
        </div>

        {/* User Status */}
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">L</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Lernender</p>
                <p className="text-sm text-gray-600">Auf dem Weg zur Meisterschaft</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}