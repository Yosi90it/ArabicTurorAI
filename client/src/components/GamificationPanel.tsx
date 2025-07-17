import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  MessageCircle,
  Video
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

export default function GamificationPanel() {
  const { 
    stats, 
    achievements, 
    recentPoints, 
    getNextLevelPoints, 
    getCurrentLevelProgress 
  } = useGamification();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = achievements.filter(a => !a.unlockedAt && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt && a.progress === 0);

  return (
    <div className="space-y-6">
      {/* Recent Points Animation */}
      {recentPoints.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {recentPoints.map((points, index) => (
            <div
              key={index}
              className="bg-green-500 text-white px-4 py-2 rounded-full font-bold animate-bounce shadow-lg"
            >
              +{points} Punkte!
            </div>
          ))}
        </div>
      )}

      {/* Header with Level and Points */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Level {stats.level}</h2>
            <p className="text-purple-100">{stats.totalPoints} Punkte insgesamt</p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-sm text-purple-100">
              {stats.currentStreak} Tage Streak
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fortschritt zu Level {stats.level + 1}</span>
            <span>{stats.totalPoints} / {getNextLevelPoints()}</span>
          </div>
          <Progress 
            value={getCurrentLevelProgress()} 
            className="h-3 bg-purple-800"
          />
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.wordsLearned}</p>
          <p className="text-sm text-gray-600">Wörter gelernt</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{stats.currentStreak}</p>
          <p className="text-sm text-gray-600">Tage Streak</p>
        </Card>
        
        <Card className="p-4 text-center">
          <Video className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{stats.booksRead}</p>
          <p className="text-sm text-gray-600">Bücher gelesen</p>
        </Card>
        
        <Card className="p-4 text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <p className="text-2xl font-bold">{stats.chatMessages}</p>
          <p className="text-sm text-gray-600">Chat-Nachrichten</p>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Übersicht
        </Button>
        <Button
          variant={activeTab === 'achievements' ? 'default' : 'outline'}
          onClick={() => setActiveTab('achievements')}
          className="flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          Erfolge ({unlockedAchievements.length})
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Daily Goal */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Tägliches Ziel
              </h3>
              {stats.dailyGoalMet ? (
                <Badge className="bg-green-500">Erreicht! ✅</Badge>
              ) : (
                <Badge variant="outline">In Arbeit</Badge>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              Lerne heute mindestens 5 neue Wörter oder lese ein Kapitel
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={stats.dailyGoalMet ? 100 : (stats.wordsLearned % 5) * 20} />
              </div>
              <span className="text-sm font-medium">
                {stats.dailyGoalMet ? '5/5' : `${stats.wordsLearned % 5}/5`} Wörter
              </span>
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Neueste Erfolge
            </h3>
            {unlockedAchievements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Noch keine Erfolge freigeschaltet. Lerne weiter! 🌟
              </p>
            ) : (
              <div className="space-y-3">
                {unlockedAchievements.slice(-3).map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <Badge className="bg-yellow-500">Neu!</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Freigeschaltete Erfolge ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{achievement.title}</h4>
                      <p className="text-sm text-green-600">{achievement.description}</p>
                      <p className="text-xs text-green-500 mt-1">
                        Freigeschaltet: {new Date(achievement.unlockedAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-500">✓</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* In Progress Achievements */}
          {inProgressAchievements.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                In Arbeit ({inProgressAchievements.length})
              </h3>
              <div className="space-y-4">
                {inProgressAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800">{achievement.title}</h4>
                      <p className="text-sm text-blue-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(achievement.progress / achievement.target) * 100} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-blue-600 font-medium">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Noch nicht freigeschaltet ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-3xl grayscale">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-600">{achievement.title}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="text-gray-500">🔒</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}