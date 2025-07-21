import { createContext, useContext, useState, ReactNode } from "react";
import { useSimpleGamification } from "./SimpleGamificationContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "./LanguageContext";

interface VerbConjugation {
  tense: string;
  person: string;
  arabic: string;
  german: string;
}

interface FlashcardEntry {
  id: number;
  arabic: string;
  translation: string;
  category: string;
  grammar?: string;
  sentence?: string;
  conjugations?: VerbConjugation[];
}

interface FlashcardContextType {
  userFlashcards: FlashcardEntry[];
  addFlashcard: (word: string, translation: string, grammar: string) => void;
  addVerbConjugation: (verb: string, translation: string, conjugations: VerbConjugation[]) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const [userFlashcards, setUserFlashcards] = useState<FlashcardEntry[]>([]);
  const { updateProgress } = useSimpleGamification();
  const { toast } = useToast();
  const { strings } = useLanguage();

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
        title: strings.addedToFlashcards,
        description: `"${word}" ${strings.wordAdded}`,
      });
    }
    // No notification for duplicate words - silently ignore
  };

  const addVerbConjugation = (verb: string, translation: string, conjugations: VerbConjugation[]) => {
    // Check if verb already exists
    const verbExists = userFlashcards.some(card => card.arabic === verb && card.category === "Verben und Konjugationen");
    
    if (!verbExists) {
      const newCard: FlashcardEntry = {
        id: Date.now(),
        arabic: verb,
        translation: translation,
        category: "Verben und Konjugationen",
        grammar: "Verb",
        conjugations: conjugations,
        sentence: `Konjugationstabelle für das Verb **${verb}**`
      };
      
      setUserFlashcards(prev => [...prev, newCard]);
      
      // Award points for adding a verb
      updateProgress('word', { word: verb });
      toast({
        title: strings.language === 'de' ? 'Verb-Konjugation gespeichert!' : 'Verb Conjugation Saved!',
        description: strings.language === 'de' ? `Konjugationstabelle für "${verb}" wurde zu Ihren Karteikarten hinzugefügt.` : `Conjugation table for "${verb}" added to your flashcards.`,
      });
    } else {
      toast({
        title: strings.language === 'de' ? 'Verb bereits vorhanden' : 'Verb Already Exists',
        description: strings.language === 'de' ? `Die Konjugation für "${verb}" ist bereits in Ihren Karteikarten.` : `The conjugation for "${verb}" is already in your flashcards.`,
      });
    }
  };

  return (
    <FlashcardContext.Provider value={{ userFlashcards, addFlashcard, addVerbConjugation }}>
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