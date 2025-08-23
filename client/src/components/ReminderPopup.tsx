import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Target, Flame, BookOpen, Settings, X } from 'lucide-react';
import { useReminder } from '@/contexts/ReminderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';

export default function ReminderPopup() {
  const { 
    showReminder, 
    dismissReminder, 
    studySessionStarted,
    getTodayStudyTime,
    getCurrentStreak,
    settings 
  } = useReminder();
  
  const { strings } = useLanguage();
  const [, setLocation] = useLocation();
  const [motivationalMessage, setMotivationalMessage] = useState('');

  const todayStudyTime = getTodayStudyTime();
  const currentStreak = getCurrentStreak();
  const progressPercent = Math.min((todayStudyTime / settings.dailyGoal) * 100, 100);

  const motivationalMessages = [
    "Zeit für deine tägliche Arabisch-Lerneinheit! 📚",
    "Halte deine Lernserie am Leben! 🔥",
    "Jede Minute zählt für deinen Lernfortschritt! ⏰",
    "Dein Arabisch wartet auf dich! 🌟",
    "Kleine Schritte führen zu großen Erfolgen! 💪",
    "Bleib dran - du machst großartige Fortschritte! 🎯"
  ];

  useEffect(() => {
    if (showReminder) {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setMotivationalMessage(randomMessage);
    }
  }, [showReminder]);

  const handleStartLearning = (section: string) => {
    studySessionStarted();
    dismissReminder();
    setLocation(section);
  };

  const handleSnooze = () => {
    dismissReminder();
  };

  if (!showReminder) return null;

  return (
    <Dialog open={showReminder} onOpenChange={() => dismissReminder()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-6 w-6 text-blue-600" />
              Lernzeit! 
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissReminder}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-center text-lg font-medium text-gray-700 mt-2">
            {motivationalMessage}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm font-medium">Heute</div>
            <div className="text-lg font-bold text-green-600">
              {todayStudyTime}min
            </div>
            <div className="text-xs text-gray-500">
              von {settings.dailyGoal}min
            </div>
          </Card>

          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-sm font-medium">Serie</div>
            <div className="text-lg font-bold text-orange-600">
              {currentStreak}
            </div>
            <div className="text-xs text-gray-500">Tage</div>
          </Card>

          <Card className="p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium">Fortschritt</div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round(progressPercent)}%
            </div>
            <div className="text-xs text-gray-500">Tagesziel</div>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tagesfortschritt</span>
            <span>{todayStudyTime}/{settings.dailyGoal} min</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Learning Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 text-center">
            Was möchtest du heute lernen?
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleStartLearning('/book-reader')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-purple-600 hover:bg-purple-700"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs">Bücher lesen</span>
            </Button>

            <Button
              onClick={() => handleStartLearning('/flashcards')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-blue-600 hover:bg-blue-700"
            >
              <Target className="h-5 w-5" />
              <span className="text-xs">Karteikarten</span>
            </Button>

            <Button
              onClick={() => handleStartLearning('/alphabet')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-green-600 hover:bg-green-700"
            >
              <span className="text-lg font-bold">أ</span>
              <span className="text-xs">Alphabet</span>
            </Button>

            <Button
              onClick={() => handleStartLearning('/daily-challenge')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-orange-600 hover:bg-orange-700"
            >
              <Flame className="h-5 w-5" />
              <span className="text-xs">Challenge</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleSnooze}
            className="flex-1"
          >
            <Clock className="h-4 w-4 mr-2" />
            Später erinnern
          </Button>
          
          <Button
            onClick={() => handleStartLearning('/dashboard')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Jetzt lernen!
          </Button>
        </div>

        {/* Settings hint */}
        <div className="text-center mt-4">
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              dismissReminder();
              setLocation('/settings');
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-3 w-3 mr-1" />
            Erinnerungen anpassen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}