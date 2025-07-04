import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface TrialContextType {
  trialStart: number | null;
  isTrialActive: boolean;
  startTrial: () => void;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export function TrialProvider({ children }: { children: ReactNode }) {
  const [trialStart, setTrialStart] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);

  // Check trial status
  const checkTrialStatus = () => {
    if (trialStart === null) {
      setIsTrialActive(false);
      return;
    }

    const now = Date.now();
    const trialDuration = 72 * 60 * 60 * 1000; // 72 hours in milliseconds
    const isActive = (now - trialStart) <= trialDuration;
    setIsTrialActive(isActive);

    // Set timeout to check again when trial should expire
    if (isActive) {
      const timeUntilExpiry = trialDuration - (now - trialStart);
      setTimeout(checkTrialStatus, timeUntilExpiry + 1000); // Check 1 second after expiry
    }
  };

  useEffect(() => {
    // Load trial start from localStorage
    const savedTrialStart = localStorage.getItem('trialStart');
    if (savedTrialStart) {
      const startTime = parseInt(savedTrialStart, 10);
      setTrialStart(startTime);
    }
  }, []);

  useEffect(() => {
    checkTrialStatus();
  }, [trialStart]);

  const startTrial = () => {
    const now = Date.now();
    setTrialStart(now);
    localStorage.setItem('trialStart', now.toString());
  };

  return (
    <TrialContext.Provider value={{
      trialStart,
      isTrialActive,
      startTrial
    }}>
      {children}
    </TrialContext.Provider>
  );
}

export function useTrial() {
  const context = useContext(TrialContext);
  if (context === undefined) {
    throw new Error('useTrial must be used within a TrialProvider');
  }
  return context;
}