import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import WordModal from "./WordModal";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";

interface InterlinearTextProps {
  text: string;
  className?: string;
}

interface WordTranslation {
  arabic: string;
  german: string;
  loading: boolean;
  grammar?: string;
  examples?: string[];
  pronunciation?: string;
}

// Weaviate translation function with full details
async function translateWord(word: string): Promise<{translation: string, grammar: string, examples: string[], pronunciation: string}> {
  try {
    const response = await fetch('/api/weaviate/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to translate word');
    }
    
    const data = await response.json();
    return {
      translation: data.translation || "–",
      grammar: data.grammar || "noun",
      examples: data.examples || [],
      pronunciation: data.pronunciation || ""
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      translation: "–",
      grammar: "noun",
      examples: [],
      pronunciation: ""
    };
  }
}

// Clean Arabic word by removing punctuation and extra marks
function cleanArabicWord(word: string): string {
  return word.replace(/[،؟!.:؛\s]/g, '').trim();
}

export default function InterlinearText({ text, className = "" }: InterlinearTextProps) {
  const [wordTranslations, setWordTranslations] = useState<WordTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
    examples?: string[];
    pronunciation?: string;
  } | null>(null);

  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();

  console.log("InterlinearText rendered with text:", text?.substring(0, 100));

  useEffect(() => {
    if (!text) return;

    const words = text.split(/\s+/).filter(Boolean);
    const initialTranslations = words.map(word => ({
      arabic: word,
      german: "",
      loading: true
    }));
    
    setWordTranslations(initialTranslations);
    setIsLoading(true);

    // Translate words sequentially to avoid overwhelming the API
    const translateAllWords = async () => {
      const results = [];
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const cleanedWord = cleanArabicWord(word);
        
        if (!cleanedWord) {
          results.push({ index: i, german: "–", loading: false });
          continue;
        }

        try {
          console.log(`Translating word ${i + 1}/${words.length}: ${cleanedWord}`);
          const translationData = await translateWord(cleanedWord);
          results.push({ 
            index: i, 
            german: translationData.translation, 
            loading: false,
            grammar: translationData.grammar,
            examples: translationData.examples,
            pronunciation: translationData.pronunciation
          });
          
          // Update individual word immediately
          setWordTranslations(prev => 
            prev.map((wordData, index) => 
              index === i 
                ? { 
                    ...wordData, 
                    german: translationData.translation, 
                    loading: false,
                    grammar: translationData.grammar,
                    examples: translationData.examples,
                    pronunciation: translationData.pronunciation
                  }
                : wordData
            )
          );
          
          // Small delay to prevent API rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Failed to translate ${cleanedWord}:`, error);
          results.push({ index: i, german: "–", loading: false });
          
          setWordTranslations(prev => 
            prev.map((wordData, index) => 
              index === i 
                ? { ...wordData, german: "–", loading: false }
                : wordData
            )
          );
        }
      }
      
      setIsLoading(false);
      console.log(`Completed translating ${words.length} words`);
    };

    translateAllWords();
  }, [text]);

  if (!text) {
    return null;
  }

  const handleWordClick = (wordData: WordTranslation, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (wordData.loading || !wordData.german || wordData.german === "–") return;
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedWord({
      word: wordData.arabic,
      translation: wordData.german,
      grammar: wordData.grammar || "noun",
      examples: wordData.examples || [],
      pronunciation: wordData.pronunciation || "",
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
  };

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    toast({
      title: "Zu Flashcards hinzugefügt",
      description: `"${word}" wurde zu Ihren Flashcards hinzugefügt.`
    });
    setSelectedWord(null);
  };

  return (
    <div className={`interlinear-container ${className}`} dir="rtl">
      <div className="flex flex-wrap gap-x-2 gap-y-4 justify-end items-start">
        {wordTranslations.map((wordData, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center min-w-fit cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
            onClick={(e) => handleWordClick(wordData, e)}
          >
            {/* Arabic word */}
            <div className="text-xl font-arabic text-gray-900 dark:text-white leading-tight mb-1 text-center">
              {wordData.arabic}
            </div>
            
            {/* German translation */}
            <div className="text-xs text-blue-600 dark:text-blue-400 leading-tight text-center min-h-[16px] flex items-center border-t border-gray-200 pt-1 w-full justify-center">
              {wordData.loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="font-medium text-center break-words max-w-[80px]">
                  {wordData.german || "..."}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Übersetzungen werden geladen... ({wordTranslations.filter(w => !w.loading).length}/{wordTranslations.length})
        </div>
      )}
      
      {wordTranslations.length === 0 && (
        <div className="text-center text-red-500 p-4">
          Keine Wörter zum Übersetzen gefunden.
        </div>
      )}

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord.word}
          translation={selectedWord.translation}
          grammar={selectedWord.grammar}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
          onAddToFlashcards={handleAddToFlashcards}
          examples={selectedWord.examples}
          pronunciation={selectedWord.pronunciation}
        />
      )}
    </div>
  );
}