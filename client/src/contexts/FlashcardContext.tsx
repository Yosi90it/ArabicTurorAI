import { createContext, useContext, useState, ReactNode } from "react";

interface FlashcardEntry {
  id: number;
  arabic: string;
  translation: string;
  category: string;
  grammar?: string;
}

interface FlashcardContextType {
  userFlashcards: FlashcardEntry[];
  addFlashcard: (word: string, translation: string, grammar: string) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [userFlashcards, setUserFlashcards] = useState<FlashcardEntry[]>([]);

  const addFlashcard = (word: string, translation: string, grammar: string) => {
    const newCard: FlashcardEntry = {
      id: Date.now(),
      arabic: word,
      translation: translation,
      category: "User Added",
      grammar: grammar
    };
    
    setUserFlashcards(prev => [...prev, newCard]);
  };

  return (
    <FlashcardContext.Provider value={{ userFlashcards, addFlashcard }}>
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
}