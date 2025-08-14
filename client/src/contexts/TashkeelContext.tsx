import { createContext, useContext, useState, ReactNode } from "react";

interface TashkeelContextType {
  tashkeelEnabled: boolean;
  setTashkeelEnabled: (enabled: boolean) => void;
  toggleTashkeel: () => void;
  removeTashkeel: (text: string) => string;
  formatText: (text: string) => string;
}

const TashkeelContext = createContext<TashkeelContextType | undefined>(undefined);

export function TashkeelProvider({ children }: { children: ReactNode }) {
  const [tashkeelEnabled, setTashkeelEnabled] = useState(true);

  const toggleTashkeel = () => {
    setTashkeelEnabled(prev => !prev);
  };

  const removeTashkeel = (text: string) => {
    return text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  };

  const formatText = (text: string) => {
    return tashkeelEnabled ? text : removeTashkeel(text);
  };

  return (
    <TashkeelContext.Provider value={{ 
      tashkeelEnabled, 
      setTashkeelEnabled, 
      toggleTashkeel, 
      removeTashkeel, 
      formatText 
    }}>
      {children}
    </TashkeelContext.Provider>
  );
}

export function useTashkeel() {
  const context = useContext(TashkeelContext);
  if (context === undefined) {
    throw new Error('useTashkeel must be used within a TashkeelProvider');
  }
  return context;
}