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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header with Arabic greeting */}
        <div className="mb-8 p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">ع</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ArabicAI</h1>
              <p className="text-orange-600 font-medium">Intelligentes Arabisch Lernen</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3" dir="rtl">
            !مَرْحَبًا Willkommen zurück
          </h2>
          <p className="text-gray-700 text-lg">Setze deine Arabisch-Reise mit KI-unterstütztem Lernen fort</p>
        </div>

        {/* Weekly Goal Card */}
        <Card className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 border-0 text-white shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Wöchentliches Ziel</h3>
            </div>
            <p className="text-xl mb-6 text-orange-100">Fortschritt diese Woche</p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex-1">
                <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-500" style={{width: `${weeklyProgress}%`}}></div>
                </div>
              </div>
              <span className="text-3xl font-bold">{weeklyProgress}%</span>
            </div>
            <p className="text-orange-100 text-lg">Großartig! Du bist auf dem besten Weg dein Ziel zu erreichen.</p>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Learned Words */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-700 font-semibold">Gelernte Wörter</h4>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{learnedWords}</p>
              <p className="text-sm text-green-600 font-medium">+12 diese Woche</p>
            </CardContent>
          </Card>

          {/* Collected Phrases */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-700 font-semibold">Gesammelte Phrasen</h4>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Book className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{collectedPhrases}</p>
              <p className="text-sm text-blue-600 font-medium">Sammle mehr Phrasen!</p>
            </CardContent>
          </Card>

          {/* Books Read */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-700 font-semibold">Gelesene Bücher</h4>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{booksRead}</p>
              <p className="text-sm text-orange-600 font-medium">Al-Qir'atur Rashida</p>
            </CardContent>
          </Card>

          {/* Flashcards Wiederholung */}
          <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-gray-700 font-semibold">Flashcards Wiederholung</h4>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <RotateCcw className="w-7 h-7 text-white" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">{flashcardRepeats}</p>
              <p className="text-sm text-purple-600 font-medium">Wiederholung empfohlen</p>
            </CardContent>
          </Card>
        </div>

        {/* Learning Areas Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">LERNBEREICHE</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dashboard */}
            <Link href="/learn">
              <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-lg">Dashboard</span>
                  <p className="text-orange-100 text-sm">Übersicht & Fortschritt</p>
                </div>
              </div>
            </Link>

            {/* Bücher */}
            <Link href="/book-reader">
              <div className="flex items-center gap-4 p-6 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">Bücher</span>
                  <p className="text-gray-600 text-sm">Interaktives Lesen</p>
                </div>
              </div>
            </Link>

            {/* Videos */}
            <Link href="/video-trainer">
              <div className="flex items-center gap-4 p-6 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">Videos</span>
                  <p className="text-gray-600 text-sm">Hör- & Sprachtraining</p>
                </div>
              </div>
            </Link>

            {/* KI Chat */}
            <Link href="/ai-chat">
              <div className="flex items-center gap-4 p-6 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">KI Chat</span>
                  <p className="text-gray-600 text-sm">Konversationstraining</p>
                </div>
              </div>
            </Link>

            {/* Flashcards */}
            <Link href="/flashcards">
              <div className="flex items-center gap-4 p-6 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">Flashcards</span>
                  <p className="text-gray-600 text-sm">Vokabeln trainieren</p>
                </div>
              </div>
            </Link>

            {/* Alphabet Trainer */}
            <Link href="/alphabet-trainer">
              <div className="flex items-center gap-4 p-6 bg-white rounded-2xl cursor-pointer hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-lg">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ا</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-900">Alphabet</span>
                  <p className="text-gray-600 text-sm">Buchstaben lernen</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* User Status */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <p className="font-bold text-xl text-gray-900">Lernender</p>
                <p className="text-gray-600 text-lg">Auf dem Weg zur Meisterschaft</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-green-600 font-medium">Aktiv</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}