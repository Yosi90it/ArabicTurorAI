import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: string;
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
  monthlyReadingGoal: number;
  monthlyReadingProgress: number;
  monthStartDate: string;
  // Rewards
  rewardPoints: number;
  hasActiveDiscount: boolean;
  discountExpiryDate?: string;
}

interface SimpleGamificationContextType {
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
  getWeeklyProgress: () => number;
  getMonthlyProgress: () => number;
  claimReward: () => void;
}

const SimpleGamificationContext = createContext<SimpleGamificationContextType | undefined>(undefined);

// Level requirements (points needed to reach each level)
const LEVEL_REQUIREMENTS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  2000,  // Level 6
  3500,  // Level 7
  5500,  // Level 8
  8000,  // Level 9
  12000, // Level 10
  15000  // Level 11+
];

const defaultAchievements: Achievement[] = [
  {
    id: 'first_word',
    title: 'Erste Schritte',
    description: 'Erstes Wort zu Karteikarten hinzugefügt',
    icon: '🌱',
    points: 25,
    progress: 0,
    target: 1,
    category: 'vocabulary'
  },
  {
    id: 'vocab_explorer',
    title: 'Wort-Entdecker',
    description: '50 Wörter gelernt',
    icon: '📚',
    points: 100,
    progress: 0,
    target: 50,
    category: 'vocabulary'
  },
  {
    id: 'vocab_master',
    title: 'Vokabel-Meister',
    description: '200 Wörter gelernt',
    icon: '🎓',
    points: 300,
    progress: 0,
    target: 200,
    category: 'vocabulary'
  }
];

export function SimpleGamificationProvider({ children }: { children: ReactNode }) {
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

  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [recentPoints, setRecentPoints] = useState<number[]>([]);

  // Load user data on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `gamification_${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setStats(data.stats || stats);
          setAchievements(data.achievements || defaultAchievements);
        } catch (error) {
          console.error('Error loading gamification data:', error);
        }
      }
    }
  }, [isAuthenticated, user]);

  // Save user data when stats change
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `gamification_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify({ stats, achievements }));
    }
  }, [stats, achievements, isAuthenticated, user]);

  const addPoints = (points: number, reason: string) => {
    setStats(prev => {
      const newPoints = prev.totalPoints + points;
      const newLevel = LEVEL_REQUIREMENTS.findIndex(req => newPoints < req);
      const actualLevel = newLevel === -1 ? LEVEL_REQUIREMENTS.length : newLevel;
      
      return {
        ...prev,
        totalPoints: newPoints,
        level: actualLevel
      };
    });

    setRecentPoints(prev => [...prev.slice(-9), points]);
    setTimeout(() => {
      setRecentPoints(prev => prev.slice(1));
    }, 3000);
  };

  const completeAchievement = (achievementId: string) => {
    setAchievements(prev => 
      prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlockedAt) {
          addPoints(achievement.points, `Erfolg: ${achievement.title}`);
          return { ...achievement, unlockedAt: new Date().toISOString() };
        }
        return achievement;
      })
    );
  };

  const updateProgress = (type: 'word' | 'book' | 'video' | 'chat' | 'reading') => {
    setStats(prev => {
      const newStats = { ...prev };
      
      switch (type) {
        case 'word':
          newStats.wordsLearned += 1;
          newStats.weeklyWordsLearned += 1;
          addPoints(5, 'Neues Wort gelernt');
          
          // Check achievements
          if (newStats.wordsLearned === 1) {
            setTimeout(() => completeAchievement('first_word'), 100);
          } else if (newStats.wordsLearned === 50) {
            setTimeout(() => completeAchievement('vocab_explorer'), 100);
          } else if (newStats.wordsLearned === 200) {
            setTimeout(() => completeAchievement('vocab_master'), 100);
          }
          
          // Check weekly goal
          if (newStats.weeklyWordsLearned >= newStats.weeklyWordGoal) {
            const bonus = newStats.weeklyWordGoal * 10;
            addPoints(bonus, `Wochenziel erreicht! ${newStats.weeklyWordGoal} Wörter`);
            newStats.rewardPoints += 50;
          }
          break;
          
        case 'reading':
          newStats.monthlyReadingProgress += 1;
          addPoints(15, 'Verse/Kapitel gelesen');
          
          // Check monthly goal
          if (newStats.monthlyReadingProgress >= newStats.monthlyReadingGoal) {
            const bonus = newStats.monthlyReadingGoal * 15;
            addPoints(bonus, `Monatsziel erreicht! ${newStats.monthlyReadingGoal} Verse gelesen`);
            newStats.rewardPoints += 200;
          }
          break;
          
        case 'book':
          newStats.booksRead += 1;
          addPoints(100, 'Buch abgeschlossen');
          break;
          
        case 'video':
          newStats.videosWatched += 1;
          addPoints(75, 'Video abgeschlossen');
          break;
          
        case 'chat':
          newStats.chatMessages += 1;
          addPoints(10, 'AI-Chat Nachricht');
          break;
      }
      
      return newStats;
    });
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

  const getNextLevelPoints = (): number => {
    const currentLevel = stats.level;
    return LEVEL_REQUIREMENTS[currentLevel] || LEVEL_REQUIREMENTS[LEVEL_REQUIREMENTS.length - 1];
  };

  const getCurrentLevelProgress = (): number => {
    const currentLevelReq = LEVEL_REQUIREMENTS[stats.level - 1] || 0;
    const nextLevelReq = getNextLevelPoints();
    const progressInLevel = stats.totalPoints - currentLevelReq;
    const levelRange = nextLevelReq - currentLevelReq;
    
    return Math.min((progressInLevel / levelRange) * 100, 100);
  };

  const setWeeklyWordGoal = (goal: number) => {
    setStats(prev => ({ ...prev, weeklyWordGoal: goal }));
  };

  const setMonthlyReadingGoal = (goal: number) => {
    setStats(prev => ({ ...prev, monthlyReadingGoal: goal }));
  };

  const getWeeklyProgress = (): number => {
    return Math.min((stats.weeklyWordsLearned / stats.weeklyWordGoal) * 100, 100);
  };

  const getMonthlyProgress = (): number => {
    return Math.min((stats.monthlyReadingProgress / stats.monthlyReadingGoal) * 100, 100);
  };

  const claimReward = () => {
    if (stats.rewardPoints >= 500) {
      const discountExpiry = new Date();
      discountExpiry.setMonth(discountExpiry.getMonth() + 1);
      
      setStats(prev => ({
        ...prev,
        rewardPoints: prev.rewardPoints - 500,
        hasActiveDiscount: true,
        discountExpiryDate: discountExpiry.toISOString()
      }));
    }
  };

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
    getWeeklyProgress,
    getMonthlyProgress,
    claimReward
  };

  return (
    <SimpleGamificationContext.Provider value={value}>
      {children}
    </SimpleGamificationContext.Provider>
  );
}

export function useSimpleGamification() {
  const context = useContext(SimpleGamificationContext);
  if (!context) {
    throw new Error('useSimpleGamification must be used within a SimpleGamificationProvider');
  }
  return context;
}