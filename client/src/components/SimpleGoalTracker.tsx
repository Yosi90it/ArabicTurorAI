import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Calendar, 
  Gift, 
  Settings,
  CheckCircle,
  Trophy,
  Flame
} from 'lucide-react';
import { useSimpleGamification } from '@/contexts/SimpleGamificationContext';

export default function SimpleGoalTracker() {
  const {
    stats,
    setWeeklyWordGoal,
    setMonthlyReadingGoal,
    claimReward,
    getWeeklyProgress,
    getMonthlyProgress
  } = useSimpleGamification();

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Persönliche Lernziele
        </h1>
        <p className="text-gray-600">
          Setze dir Ziele und sammle Belohnungen für deine Fortschritte
        </p>
      </div>

      {/* Rewards Section */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-600" />
            🎁 Belohnungs-System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">Belohnungspunkte</p>
              <p className="text-sm text-gray-600">
                Bei 500 Punkten: <strong>50% Rabatt</strong> auf das Premium-Abo für einen Monat!
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-600">{stats.rewardPoints}</p>
              <p className="text-sm text-gray-500">/ 500</p>
            </div>
          </div>
          
          <Progress 
            value={(stats.rewardPoints / 500) * 100} 
            className="h-4"
          />
          
          {stats.hasActiveDiscount ? (
            <div className="text-center">
              <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                🎉 50% Rabatt aktiv bis {new Date(stats.discountExpiryDate!).toLocaleDateString()}
              </Badge>
              <p className="text-sm text-green-600 mt-2">
                Nutze deinen Rabatt jetzt im Abo-Bereich!
              </p>
            </div>
          ) : stats.rewardPoints >= 500 ? (
            <div className="text-center">
              <Button 
                onClick={claimReward}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-lg py-3"
                size="lg"
              >
                <Gift className="w-5 h-5 mr-2" />
                🎁 50% Rabatt einlösen - Nur 7,49€ statt 14,99€!
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">
                Noch <strong>{500 - stats.rewardPoints} Punkte</strong> bis zur nächsten Belohnung
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Lerne neue Wörter und erreiche deine Ziele, um Punkte zu sammeln!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
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
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.weeklyWordsLearned}/{stats.weeklyWordGoal}
              </div>
              <p className="text-gray-600">Neue Wörter diese Woche</p>
            </div>
            
            <Progress 
              value={weeklyProgress} 
              className={`h-4 ${weeklyCompleted ? 'bg-green-100' : ''}`}
            />
            
            {weeklyCompleted ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <Badge className="bg-green-500 text-white">
                  🎉 Wochenziel erreicht! +{stats.weeklyWordGoal * 10} Bonus-Punkte
                </Badge>
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                Noch <strong>{stats.weeklyWordGoal - stats.weeklyWordsLearned} Wörter</strong> bis zum Ziel
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
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.monthlyReadingProgress}/{stats.monthlyReadingGoal}
              </div>
              <p className="text-gray-600">Verse/Kapitel diesen Monat</p>
            </div>
            
            <Progress 
              value={monthlyProgress} 
              className={`h-4 ${monthlyCompleted ? 'bg-green-100' : ''}`}
            />
            
            {monthlyCompleted ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <Badge className="bg-green-500 text-white">
                  🏆 Monatsziel erreicht! +{stats.monthlyReadingGoal * 15} Bonus-Punkte
                </Badge>
              </div>
            ) : (
              <p className="text-gray-600 text-center">
                Noch <strong>{stats.monthlyReadingGoal - stats.monthlyReadingProgress} Verse</strong> bis zum Ziel
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goal Settings */}
      {showSettings && (
        <Card className="border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Ziele anpassen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
      <div className="grid grid-cols-3 gap-4">
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

        <Card className="text-center p-4">
          <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.wordsLearned}</p>
          <p className="text-sm text-gray-600">Wörter gelernt</p>
        </Card>
      </div>

      {/* How to earn points */}
      <Card>
        <CardHeader>
          <CardTitle>Wie sammle ich Punkte?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">+5</span>
                </div>
                <span>Neues Wort zu Karteikarten hinzufügen</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">+10</span>
                </div>
                <span>AI-Chat Nachricht senden</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">+15</span>
                </div>
                <span>Verse/Kapitel lesen</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-600">+75</span>
                </div>
                <span>Video abschließen</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-red-600">+100</span>
                </div>
                <span>Buch vollständig lesen</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-600">Bonus</span>
                </div>
                <span>Wöchentliche/Monatliche Ziele erreichen</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}