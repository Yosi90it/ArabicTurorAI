import { createContext, useContext, useState, ReactNode } from "react";

interface TashkeelContextType {
  tashkeelEnabled: boolean;
  setTashkeelEnabled: (enabled: boolean) => void;
}

const TashkeelContext = createContext<TashkeelContextType | undefined>(undefined);

export function TashkeelProvider({ children }: { children: ReactNode }) {
  const [tashkeelEnabled, setTashkeelEnabled] = useState(true);

  return (
    <TashkeelContext.Provider value={{ tashkeelEnabled, setTashkeelEnabled }}>
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