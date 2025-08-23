import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReminderSettings {
  enabled: boolean;
  intervals: number[]; // in minutes: [15, 30, 60, 120]
  selectedInterval: number;
  lastShown: number;
  dailyGoal: number; // minutes per day
  streakTarget: number; // days
}

interface ReminderContextType {
  settings: ReminderSettings;
  updateSettings: (newSettings: Partial<ReminderSettings>) => void;
  dismissReminder: () => void;
  showReminder: boolean;
  setShowReminder: (show: boolean) => void;
  studySessionStarted: () => void;
  studySessionEnded: () => void;
  getTodayStudyTime: () => number;
  getCurrentStreak: () => number;
}

const defaultSettings: ReminderSettings = {
  enabled: true,
  intervals: [15, 30, 60, 120, 240], // 15min, 30min, 1h, 2h, 4h
  selectedInterval: 30, // default 30 minutes
  lastShown: 0,
  dailyGoal: 20, // 20 minutes per day
  streakTarget: 7 // 7 days streak goal
};

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    const saved = localStorage.getItem('arabic-learning-reminders');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  
  const [showReminder, setShowReminder] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<number | null>(null);
  const { toast } = useToast();

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('arabic-learning-reminders', JSON.stringify(settings));
  }, [settings]);

  // Timer for checking reminders
  useEffect(() => {
    if (!settings.enabled) return;

    const checkReminder = () => {
      const now = Date.now();
      const timeSinceLastReminder = now - settings.lastShown;
      const intervalMs = settings.selectedInterval * 60 * 1000;

      if (timeSinceLastReminder >= intervalMs) {
        setShowReminder(true);
        setSettings(prev => ({ ...prev, lastShown: now }));
      }
    };

    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    
    // Check immediately on mount if enough time has passed
    checkReminder();

    return () => clearInterval(interval);
  }, [settings.enabled, settings.selectedInterval, settings.lastShown]);

  const updateSettings = (newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const dismissReminder = () => {
    setShowReminder(false);
    setSettings(prev => ({ ...prev, lastShown: Date.now() }));
  };

  const studySessionStarted = () => {
    setStudyStartTime(Date.now());
    dismissReminder(); // Dismiss reminder when user starts studying
  };

  const studySessionEnded = () => {
    if (studyStartTime) {
      const sessionTime = Math.floor((Date.now() - studyStartTime) / 60000); // minutes
      const today = new Date().toDateString();
      const studyData = JSON.parse(localStorage.getItem('daily-study-data') || '{}');
      
      studyData[today] = (studyData[today] || 0) + sessionTime;
      localStorage.setItem('daily-study-data', JSON.stringify(studyData));
      
      setStudyStartTime(null);
      
      // Show congratulations if daily goal reached
      if (studyData[today] >= settings.dailyGoal) {
        toast({
          title: "🎉 Tagesziel erreicht!",
          description: `Du hast heute ${studyData[today]} Minuten gelernt. Großartig!`,
        });
      }
    }
  };

  const getTodayStudyTime = (): number => {
    const today = new Date().toDateString();
    const studyData = JSON.parse(localStorage.getItem('daily-study-data') || '{}');
    return studyData[today] || 0;
  };

  const getCurrentStreak = (): number => {
    const studyData = JSON.parse(localStorage.getItem('daily-study-data') || '{}');
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toDateString();
      const studyTime = studyData[dateStr] || 0;
      
      if (studyTime >= 5) { // At least 5 minutes counts as study day
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  return (
    <ReminderContext.Provider value={{
      settings,
      updateSettings,
      dismissReminder,
      showReminder,
      setShowReminder,
      studySessionStarted,
      studySessionEnded,
      getTodayStudyTime,
      getCurrentStreak
    }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminder() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
}