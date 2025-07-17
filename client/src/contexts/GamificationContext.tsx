import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
  category: 'reading' | 'vocabulary' | 'streak' | 'general';
}

interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  wordsLearned: number;
  booksRead: number;
  videosWatched: number;
  chatMessages: number;
  dailyGoalMet: boolean;
  lastActivityDate: string;
  // Weekly goals
  weeklyWordGoal: number;
  weeklyWordsLearned: number;
  weekStartDate: string;
  // Monthly goals
  monthlyReadingGoal: number; // verses/chapters
  monthlyReadingProgress: number;
  monthStartDate: string;
  // Rewards
  rewardPoints: number;
  hasActiveDiscount: boolean;
  discountExpiryDate?: string;
}

interface GamificationContextType {
  stats: UserStats;
  achievements: Achievement[];
  recentPoints: number[];
  addPoints: (points: number, reason: string) => void;
  completeAchievement: (achievementId: string) => void;
  updateProgress: (type: 'word' | 'book' | 'video' | 'chat' | 'reading') => void;
  checkDailyGoal: () => void;
  getNextLevelPoints: () => number;
  getCurrentLevelProgress: () => number;
  setWeeklyWordGoal: (goal: number) => void;
  setMonthlyReadingGoal: (goal: number) => void;
  checkWeeklyGoal: () => void;
  checkMonthlyGoal: () => void;
  claimReward: () => void;
  getWeeklyProgress: () => number;
  getMonthlyProgress: () => number;
  getTimeUntilWeekReset: () => string;
  getTimeUntilMonthReset: () => string;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const LEVEL_POINTS = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 15000];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_word',
    title: 'Erstes Wort',
    description: 'Füge dein erstes Wort zu den Karteikarten hinzu',
    icon: '🌟',
    progress: 0,
    target: 1,
    category: 'vocabulary'
  },
  {
    id: 'vocab_explorer',
    title: 'Wortschatz-Entdecker',
    description: 'Lerne 50 neue Wörter',
    icon: '📚',
    progress: 0,
    target: 50,
    category: 'vocabulary'
  },
  {
    id: 'vocab_master',
    title: 'Wortschatz-Meister',
    description: 'Lerne 200 neue Wörter',
    icon: '🧠',
    progress: 0,
    target: 200,
    category: 'vocabulary'
  },
  {
    id: 'first_book',
    title: 'Erster Leser',
    description: 'Lies dein erstes Buch vollständig',
    icon: '📖',
    progress: 0,
    target: 1,
    category: 'reading'
  },
  {
    id: 'book_worm',
    title: 'Bücherwurm',
    description: 'Lies 5 Bücher vollständig',
    icon: '🐛',
    progress: 0,
    target: 5,
    category: 'reading'
  },
  {
    id: 'streak_3',
    title: '3-Tage-Streak',
    description: 'Lerne 3 Tage in Folge',
    icon: '🔥',
    progress: 0,
    target: 3,
    category: 'streak'
  },
  {
    id: 'streak_7',
    title: 'Wochenkämpfer',
    description: 'Lerne 7 Tage in Folge',
    icon: '⚡',
    progress: 0,
    target: 7,
    category: 'streak'
  },
  {
    id: 'streak_30',
    title: 'Monats-Champion',
    description: 'Lerne 30 Tage in Folge',
    icon: '👑',
    progress: 0,
    target: 30,
    category: 'streak'
  },
  {
    id: 'chat_master',
    title: 'Chat-Experte',
    description: 'Führe 100 Unterhaltungen mit dem AI-Chat',
    icon: '💬',
    progress: 0,
    target: 100,
    category: 'general'
  },
  {
    id: 'level_5',
    title: 'Level 5 erreicht',
    description: 'Erreiche Level 5',
    icon: '🏆',
    progress: 0,
    target: 1,
    category: 'general'
  }
];

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    wordsLearned: 0,
    booksRead: 0,
    videosWatched: 0,
    chatMessages: 0,
    dailyGoalMet: false,
    lastActivityDate: '',
    weeklyWordGoal: 10,
    weeklyWordsLearned: 0,
    weekStartDate: new Date().toISOString(),
    monthlyReadingGoal: 20,
    monthlyReadingProgress: 0,
    monthStartDate: new Date().toISOString(),
    rewardPoints: 0,
    hasActiveDiscount: false
  });
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [recentPoints, setRecentPoints] = useState<number[]>([]);

  // Load saved data on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedStats = localStorage.getItem(`gamification_stats_${user.id}`);
      const savedAchievements = localStorage.getItem(`gamification_achievements_${user.id}`);
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
      
      checkDailyGoal();
    }
  }, [isAuthenticated, user]);

  // Save data when it changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`gamification_stats_${user.id}`, JSON.stringify(stats));
    }
  }, [stats, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`gamification_achievements_${user.id}`, JSON.stringify(achievements));
    }
  }, [achievements, isAuthenticated, user]);

  const addPoints = (points: number, reason: string) => {
    setStats(prev => {
      const newPoints = prev.totalPoints + points;
      const newLevel = calculateLevel(newPoints);
      
      // Check for level achievement
      if (newLevel > prev.level && newLevel === 5) {
        setTimeout(() => completeAchievement('level_5'), 100);
      }
      
      return {
        ...prev,
        totalPoints: newPoints,
        level: newLevel,
        lastActivityDate: new Date().toISOString()
      };
    });

    // Show recent points animation
    setRecentPoints(prev => [...prev, points].slice(-3));
    setTimeout(() => {
      setRecentPoints(prev => prev.slice(1));
    }, 2000);

    console.log(`🎉 +${points} Punkte für: ${reason}`);
  };

  const calculateLevel = (points: number): number => {
    for (let i = LEVEL_POINTS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_POINTS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getNextLevelPoints = (): number => {
    if (stats.level >= LEVEL_POINTS.length) {
      return LEVEL_POINTS[LEVEL_POINTS.length - 1];
    }
    return LEVEL_POINTS[stats.level];
  };

  const getCurrentLevelProgress = (): number => {
    const currentLevelMin = LEVEL_POINTS[stats.level - 1] || 0;
    const nextLevelMin = getNextLevelPoints();
    const progress = ((stats.totalPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  const completeAchievement = (achievementId: string) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId && !achievement.unlockedAt
          ? { ...achievement, unlockedAt: new Date(), progress: achievement.target }
          : achievement
      )
    );
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      addPoints(50, `Erfolg: ${achievement.title}`);
      
      // Show achievement notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🏆 Erfolg freigeschaltet: ${achievement.title}`, {
          body: achievement.description,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const updateProgress = (type: 'word' | 'book' | 'video' | 'chat' | 'reading') => {
    setStats(prev => {
      const newStats = { ...prev };
      
      switch (type) {
        case 'word':
          newStats.wordsLearned += 1;
          newStats.weeklyWordsLearned += 1;
          addPoints(5, 'Neues Wort gelernt');
          
          // Weekly goal will be checked after function definition
          
          // Check achievements
          if (newStats.wordsLearned === 1) {
            setTimeout(() => completeAchievement('first_word'), 100);
          } else if (newStats.wordsLearned === 50) {
            setTimeout(() => completeAchievement('vocab_explorer'), 100);
          } else if (newStats.wordsLearned === 200) {
            setTimeout(() => completeAchievement('vocab_master'), 100);
          }
          break;
          
        case 'book':
          newStats.booksRead += 1;
          addPoints(100, 'Buch abgeschlossen');
          
          if (newStats.booksRead === 1) {
            setTimeout(() => completeAchievement('first_book'), 100);
          } else if (newStats.booksRead === 5) {
            setTimeout(() => completeAchievement('book_worm'), 100);
          }
          break;
          
        case 'video':
          newStats.videosWatched += 1;
          addPoints(75, 'Video abgeschlossen');
          break;
          
        case 'chat':
          newStats.chatMessages += 1;
          addPoints(10, 'AI-Chat Nachricht');
          
          if (newStats.chatMessages === 100) {
            setTimeout(() => completeAchievement('chat_master'), 100);
          }
          break;
          
        case 'reading':
          newStats.monthlyReadingProgress += 1;
          addPoints(15, 'Verse/Kapitel gelesen');
          
          // Monthly goal will be checked after function definition
          break;
      }
      
      return newStats;
    });

    updateStreak();
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate).toDateString() : '';
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      setStats(prev => {
        let newStreak = 1;
        
        if (lastActivity === yesterday.toDateString()) {
          newStreak = prev.currentStreak + 1;
        }
        
        const newLongestStreak = Math.max(newStreak, prev.longestStreak);
        
        // Check streak achievements
        if (newStreak === 3) {
          setTimeout(() => completeAchievement('streak_3'), 100);
        } else if (newStreak === 7) {
          setTimeout(() => completeAchievement('streak_7'), 100);
        } else if (newStreak === 30) {
          setTimeout(() => completeAchievement('streak_30'), 100);
        }
        
        return {
          ...prev,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: new Date().toISOString()
        };
      });
    }
  };

  const checkDailyGoal = () => {
    const today = new Date().toDateString();
    const lastActivity = stats.lastActivityDate ? new Date(stats.lastActivityDate).toDateString() : '';
    
    if (lastActivity === today) {
      setStats(prev => ({ ...prev, dailyGoalMet: true }));
    } else {
      setStats(prev => ({ ...prev, dailyGoalMet: false }));
    }
  };

  // Update achievement progress
  useEffect(() => {
    setAchievements(prev => 
      prev.map(achievement => {
        if (achievement.unlockedAt) return achievement;
        
        let progress = achievement.progress;
        
        switch (achievement.id) {
          case 'first_word':
          case 'vocab_explorer':
          case 'vocab_master':
            progress = Math.min(stats.wordsLearned, achievement.target);
            break;
          case 'first_book':
          case 'book_worm':
            progress = Math.min(stats.booksRead, achievement.target);
            break;
          case 'streak_3':
          case 'streak_7':
          case 'streak_30':
            progress = Math.min(stats.currentStreak, achievement.target);
            break;
          case 'chat_master':
            progress = Math.min(stats.chatMessages, achievement.target);
            break;
          case 'level_5':
            progress = stats.level >= 5 ? 1 : 0;
            break;
        }
        
        return { ...achievement, progress };
      })
    );
  }, [stats]);

  const value = {
    stats,
    achievements,
    recentPoints,
    addPoints,
    completeAchievement,
    updateProgress,
    checkDailyGoal,
    getNextLevelPoints,
    getCurrentLevelProgress,
    setWeeklyWordGoal,
    setMonthlyReadingGoal,
    checkWeeklyGoal,
    checkMonthlyGoal,
    claimReward,
    getWeeklyProgress,
    getMonthlyProgress,
    getTimeUntilWeekReset,
    getTimeUntilMonthReset
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}