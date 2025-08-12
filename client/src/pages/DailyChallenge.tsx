import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Trophy, 
  Calendar,
  Sparkles,
  RefreshCw,
  Flame,
  TrendingUp,
  Clock
} from "lucide-react";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useFlashcards } from "@/contexts/FlashcardContext";

interface Challenge {
  id: string;
  type: 'vocabulary' | 'translation' | 'conversation' | 'listening' | 'grammar';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  timeLimit?: number;
  content: {
    arabic?: string;
    german?: string;
    english?: string;
    options?: string[];
    correctAnswer?: string;
    audio?: string;
  };
  completed: boolean;
  progress: number;
}

export default function DailyChallenge() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(3); // Mock data
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { stats, updateProgress } = useSimpleGamification();
  const { words } = useFlashcards();

  // Generate personalized challenges based on user's vocabulary and progress
  const generateChallenges = () => {
    setIsGenerating(true);
    
    // Get user's recent flashcards for personalized content
    const recentFlashcards = words.slice(-10);
    
    const challengeTemplates: Omit<Challenge, 'id' | 'completed' | 'progress'>[] = [
      // Vocabulary Challenge
      {
        type: 'vocabulary',
        title: 'Vokabel-Meister',
        description: 'Übersetzen Sie diese arabischen Wörter ins Deutsche',
        difficulty: 'beginner',
        points: 15,
        timeLimit: 2,
        content: {
          arabic: recentFlashcards[0]?.word || 'مدرسة',
          correctAnswer: recentFlashcards[0]?.translation || 'Schule',
        }
      },
      // Multiple Choice Translation
      {
        type: 'translation',
        title: 'Übersetzungs-Quiz',
        description: 'Wählen Sie die richtige deutsche Übersetzung',
        difficulty: 'intermediate',
        points: 20,
        content: {
          arabic: recentFlashcards[1]?.word || 'كتاب',
          options: [
            recentFlashcards[1]?.translation || 'Buch',
            'Tisch',
            'Stuhl',
            'Fenster'
          ],
          correctAnswer: recentFlashcards[1]?.translation || 'Buch',
        }
      },
      // Grammar Challenge
      {
        type: 'grammar',
        title: 'Grammatik-Experte',
        description: 'Bilden Sie den korrekten arabischen Satz',
        difficulty: 'advanced',
        points: 30,
        timeLimit: 5,
        content: {
          german: 'Das ist ein Buch',
          correctAnswer: 'هذا كتاب',
        }
      },
      // Listening Challenge
      {
        type: 'listening',
        title: 'Hörverständnis',
        description: 'Hören Sie zu und schreiben Sie das arabische Wort',
        difficulty: 'intermediate',
        points: 25,
        content: {
          arabic: recentFlashcards[2]?.word || 'بيت',
          audio: recentFlashcards[2]?.word || 'بيت',
          correctAnswer: recentFlashcards[2]?.word || 'بيت',
        }
      },
      // Conversation Challenge
      {
        type: 'conversation',
        title: 'Konversations-Profi',
        description: 'Antworten Sie auf Arabisch',
        difficulty: 'advanced',
        points: 35,
        content: {
          german: 'Wie heißen Sie?',
          correctAnswer: 'ما اسمك؟',
        }
      }
    ];

    // Generate daily challenges
    const todaysChallenges = challengeTemplates.map((template, index) => ({
      ...template,
      id: `challenge-${Date.now()}-${index}`,
      completed: false,
      progress: 0
    }));

    setChallenges(todaysChallenges);
    
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Neue Herausforderungen generiert! 🚀",
        description: `${todaysChallenges.length} personalisierte Aufgaben warten auf Sie`,
      });
    }, 1500);
  };

  // Handle challenge completion
  const handleChallengeComplete = (challengeId: string, success: boolean) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, progress: 100 }
        : challenge
    ));

    if (success) {
      setCompletedToday(prev => prev + 1);
      updateProgress('chat');
    }
  };

  // Generate challenges on component mount
  useEffect(() => {
    generateChallenges();
  }, []);

  const totalChallenges = challenges.length;
  const completionRate = totalChallenges > 0 ? (completedToday / totalChallenges) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Tägliche Sprachherausforderung
        </h1>
        <p className="text-gray-600">
          Personalisierte Aufgaben basierend auf Ihrem Lernfortschritt
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{completedToday}</div>
            <div className="text-sm text-gray-600">Heute erledigt</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-sm text-gray-600">Tage Streak</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <div className="text-sm text-gray-600">Gesamt Punkte</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <div className="text-sm text-gray-600">Heute erledigt</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Heutiger Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Abgeschlossene Herausforderungen</span>
              <span>{completedToday}/{totalChallenges}</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
          
          {completionRate === 100 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Herzlichen Glückwunsch!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Sie haben alle heutigen Herausforderungen gemeistert! 🎉
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate New Challenges Button */}
      <div className="flex justify-center">
        <Button 
          onClick={generateChallenges} 
          disabled={isGenerating}
          className="px-6 py-3"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generiere neue Aufgaben...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Neue Herausforderungen
            </>
          )}
        </Button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <DailyChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={handleChallengeComplete}
          />
        ))}
      </div>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Lerntipps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">⏰ Beste Lernzeiten:</h4>
              <p className="text-gray-600">
                Morgens ist das Gehirn besonders aufnahmefähig für neue Sprachen.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Wiederholung:</h4>
              <p className="text-gray-600">
                Wiederholen Sie schwierige Wörter 3-4 Mal über mehrere Tage.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Fokus:</h4>
              <p className="text-gray-600">
                Konzentrieren Sie sich auf 5-10 neue Wörter pro Tag.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📢 Aussprache:</h4>
              <p className="text-gray-600">
                Sprechen Sie neue Wörter laut aus, um sie besser zu merken.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}