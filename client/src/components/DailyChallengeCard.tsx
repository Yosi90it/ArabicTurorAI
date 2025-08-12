import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  Star,
  Sparkles,
  Zap,
  BookOpen,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";

interface Challenge {
  id: string;
  type: 'vocabulary' | 'translation' | 'conversation' | 'listening' | 'grammar';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  timeLimit?: number; // in minutes
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

interface DailyChallengeCardProps {
  challenge: Challenge;
  onComplete: (challengeId: string, success: boolean) => void;
}

export default function DailyChallengeCard({ challenge, onComplete }: DailyChallengeCardProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit ? challenge.timeLimit * 60 : null);
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return <BookOpen className="w-4 h-4" />;
      case 'translation': return <Target className="w-4 h-4" />;
      case 'conversation': return <Sparkles className="w-4 h-4" />;
      case 'listening': return <Volume2 className="w-4 h-4" />;
      case 'grammar': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;

    const correct = userAnswer.toLowerCase().trim() === challenge.content.correctAnswer?.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      updateProgress('chat');
      toast({
        title: "Ausgezeichnet! ✅",
        description: `Richtige Antwort! +${challenge.points} Punkte`,
      });
      onComplete(challenge.id, true);
    } else {
      toast({
        title: "Nicht ganz richtig 📚",
        description: `Richtige Antwort: ${challenge.content.correctAnswer}`,
        variant: "destructive"
      });
      onComplete(challenge.id, false);
    }
  };

  const handleOptionSelect = (option: string) => {
    setUserAnswer(option);
    const correct = option === challenge.content.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      updateProgress('chat');
      toast({
        title: "Ausgezeichnet! ✅",
        description: `Richtige Antwort! +${challenge.points} Punkte`,
      });
      onComplete(challenge.id, true);
    } else {
      toast({
        title: "Nicht ganz richtig 📚",
        description: `Richtige Antwort: ${challenge.content.correctAnswer}`,
        variant: "destructive"
      });
      onComplete(challenge.id, false);
    }
  };

  const playAudio = () => {
    if (challenge.content.audio && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(challenge.content.arabic || challenge.content.audio);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (challenge.completed) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">{challenge.title}</h3>
                <p className="text-sm text-green-600">Abgeschlossen! +{challenge.points} Punkte</p>
              </div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(challenge.type)}
            <CardTitle className="text-lg">{challenge.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-purple-50">
              {challenge.points} Punkte
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">{challenge.description}</p>
        
        {challenge.timeLimit && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Clock className="w-4 h-4" />
            <span>Zeitlimit: {challenge.timeLimit} Minuten</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Challenge Content */}
        {challenge.content.arabic && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-xl font-arabic text-right" dir="rtl">
                {challenge.content.arabic}
              </p>
              {challenge.type === 'listening' && (
                <Button onClick={playAudio} size="sm" variant="outline">
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {challenge.content.german && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-lg">{challenge.content.german}</p>
          </div>
        )}

        {/* Answer Input */}
        {!showResult && (
          <div className="space-y-3">
            {challenge.content.options ? (
              // Multiple Choice
              <div className="grid grid-cols-1 gap-2">
                {challenge.content.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-3 h-auto text-left justify-start"
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              // Text Input
              <div className="flex gap-2">
                <Input
                  placeholder="Ihre Antwort..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                />
                <Button onClick={checkAnswer} disabled={!userAnswer.trim()}>
                  Prüfen
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Result Display */}
        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Target className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Richtig!' : 'Falsch'}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-sm text-red-700 mt-1">
                Richtige Antwort: {challenge.content.correctAnswer}
              </p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Fortschritt</span>
            <span>{challenge.progress}%</span>
          </div>
          <Progress value={challenge.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}