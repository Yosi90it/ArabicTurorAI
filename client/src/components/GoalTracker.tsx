import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Calendar, 
  Clock, 
  Gift, 
  Settings,
  CheckCircle,
  Trophy,
  Flame
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

export default function GoalTracker() {
  const {
    stats,
    setWeeklyWordGoal,
    setMonthlyReadingGoal,
    claimReward,
    getWeeklyProgress,
    getMonthlyProgress,
    getTimeUntilWeekReset,
    getTimeUntilMonthReset
  } = useGamification();

  const [showSettings, setShowSettings] = useState(false);
  const [newWeeklyGoal, setNewWeeklyGoal] = useState(stats.weeklyWordGoal);
  const [newMonthlyGoal, setNewMonthlyGoal] = useState(stats.monthlyReadingGoal);

  const weeklyProgress = getWeeklyProgress();
  const monthlyProgress = getMonthlyProgress();
  const weeklyCompleted = stats.weeklyWordsLearned >= stats.weeklyWordGoal;
  const monthlyCompleted = stats.monthlyReadingProgress >= stats.monthlyReadingGoal;

  const handleSaveGoals = () => {
    setWeeklyWordGoal(newWeeklyGoal);
    setMonthlyReadingGoal(newMonthlyGoal);
    setShowSettings(false);
  };

  return (
    <div className="space-y-6">
      {/* Rewards Section */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-600" />
            Belohnungen & Rabatte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Belohnungspunkte</p>
              <p className="text-sm text-gray-600">
                Sammle 500 Punkte für 50% Rabatt auf das Premium-Abo
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-600">{stats.rewardPoints}</p>
              <p className="text-sm text-gray-500">/ 500</p>
            </div>
          </div>
          
          <Progress 
            value={(stats.rewardPoints / 500) * 100} 
            className="h-3"
          />
          
          {stats.hasActiveDiscount ? (
            <Badge className="bg-green-500 text-white">
              🎁 50% Rabatt aktiv bis {new Date(stats.discountExpiryDate!).toLocaleDateString()}
            </Badge>
          ) : stats.rewardPoints >= 500 ? (
            <Button 
              onClick={claimReward}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              50% Rabatt einlösen
            </Button>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Noch {500 - stats.rewardPoints} Punkte bis zur nächsten Belohnung
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Goal */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Wöchentliches Ziel
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Neue Wörter lernen</p>
              <p className="text-sm text-gray-600">
                Ziel: {stats.weeklyWordGoal} Wörter diese Woche
              </p>
            </div>
            <div className="text-right">
              {weeklyCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.weeklyWordsLearned}/{stats.weeklyWordGoal}
                  </p>
                  <p className="text-sm text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {getTimeUntilWeekReset()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Progress 
            value={weeklyProgress} 
            className={`h-3 ${weeklyCompleted ? 'bg-green-100' : ''}`}
          />
          
          {weeklyCompleted ? (
            <Badge className="bg-green-500 text-white w-full justify-center">
              🎉 Wochenziel erreicht! +{stats.weeklyWordGoal * 10} Bonus-Punkte
            </Badge>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              Noch {stats.weeklyWordGoal - stats.weeklyWordsLearned} Wörter bis zum Ziel
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Goal */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Monatliches Ziel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Verse/Kapitel lesen</p>
              <p className="text-sm text-gray-600">
                Ziel: {stats.monthlyReadingGoal} Verse diesen Monat
              </p>
            </div>
            <div className="text-right">
              {monthlyCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.monthlyReadingProgress}/{stats.monthlyReadingGoal}
                  </p>
                  <p className="text-sm text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {getTimeUntilMonthReset()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Progress 
            value={monthlyProgress} 
            className={`h-3 ${monthlyCompleted ? 'bg-green-100' : ''}`}
          />
          
          {monthlyCompleted ? (
            <Badge className="bg-green-500 text-white w-full justify-center">
              🏆 Monatsziel erreicht! +{stats.monthlyReadingGoal * 15} Bonus-Punkte
            </Badge>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              Noch {stats.monthlyReadingGoal - stats.monthlyReadingProgress} Verse bis zum Ziel
            </p>
          )}
        </CardContent>
      </Card>

      {/* Goal Settings */}
      {showSettings && (
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Ziele anpassen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Wöchentliches Wörter-Ziel
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={newWeeklyGoal}
                onChange={(e) => setNewWeeklyGoal(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Empfohlen: 5-20 Wörter pro Woche
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Monatliches Lese-Ziel (Verse/Kapitel)
              </label>
              <Input
                type="number"
                min="1"
                max="200"
                value={newMonthlyGoal}
                onChange={(e) => setNewMonthlyGoal(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Empfohlen: 10-50 Verse pro Monat
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveGoals} className="flex-1">
                Ziele speichern
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(false)}
                className="flex-1"
              >
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center p-4">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">{stats.totalPoints}</p>
          <p className="text-sm text-gray-600">Gesamt-Punkte</p>
        </Card>
        
        <Card className="text-center p-4">
          <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{stats.currentStreak}</p>
          <p className="text-sm text-gray-600">Tage-Streak</p>
        </Card>
      </div>
    </div>
  );
}