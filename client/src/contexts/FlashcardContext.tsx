import { createContext, useContext, useState, ReactNode } from "react";
import { useSimpleGamification } from "./SimpleGamificationContext";
import { useToast } from "@/hooks/use-toast";

interface FlashcardEntry {
  id: number;
  arabic: string;
  translation: string;
  category: string;
  grammar?: string;
  sentence?: string;
}

interface FlashcardContextType {
  userFlashcards: FlashcardEntry[];
  addFlashcard: (word: string, translation: string, grammar: string) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [userFlashcards, setUserFlashcards] = useState<FlashcardEntry[]>([]);
  const { updateProgress } = useSimpleGamification();
  const { toast } = useToast();

  const addFlashcard = (word: string, translation: string, grammar: string) => {
    // Check if word already exists
    const wordExists = userFlashcards.some(card => card.arabic === word);
    
    if (!wordExists) {
      const newCard: FlashcardEntry = {
        id: Date.now(),
        arabic: word,
        translation: translation,
        category: "User Added",
        grammar: grammar,
        sentence: `هذا مثال على استخدام كلمة **${word}** في جملة.`
      };
      
      setUserFlashcards(prev => [...prev, newCard]);
      
      // Award points for adding a new word
      updateProgress('word', { word });
      toast({
        title: "Neues Wort hinzugefügt! +5 Punkte",
        description: `"${word}" wurde zu deinen Flashcards hinzugefügt.`,
      });
    }
    // No notification for duplicate words - silently ignore
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