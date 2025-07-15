import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface InterlinearTextProps {
  text: string;
  className?: string;
}

interface WordTranslation {
  arabic: string;
  german: string;
  loading: boolean;
}

// Weaviate translation function
async function translateWord(word: string): Promise<string> {
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
    return data.translation || "–";
  } catch (error) {
    console.error('Translation error:', error);
    return "–";
  }
}

// Clean Arabic word by removing punctuation and extra marks
function cleanArabicWord(word: string): string {
  return word.replace(/[،؟!.:؛\s]/g, '').trim();
}

export default function InterlinearText({ text, className = "" }: InterlinearTextProps) {
  const [wordTranslations, setWordTranslations] = useState<WordTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    // Translate all words in parallel
    const translateAllWords = async () => {
      const translationPromises = words.map(async (word, index) => {
        const cleanedWord = cleanArabicWord(word);
        if (!cleanedWord) {
          return { index, german: "–", loading: false };
        }

        try {
          const translation = await translateWord(cleanedWord);
          return { index, german: translation, loading: false };
        } catch (error) {
          return { index, german: "–", loading: false };
        }
      });

      // Process translations as they complete
      Promise.allSettled(translationPromises).then(results => {
        const updates: { [key: number]: { german: string; loading: boolean } } = {};
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            updates[result.value.index] = {
              german: result.value.german,
              loading: false
            };
          } else {
            updates[index] = {
              german: "–",
              loading: false
            };
          }
        });

        setWordTranslations(prev => 
          prev.map((word, index) => ({
            ...word,
            german: updates[index]?.german || word.german,
            loading: updates[index]?.loading ?? word.loading
          }))
        );
        setIsLoading(false);
      });

      // Update translations individually as they complete for better UX
      translationPromises.forEach(async (promise, index) => {
        try {
          const result = await promise;
          setWordTranslations(prev => 
            prev.map((word, i) => 
              i === result.index 
                ? { ...word, german: result.german, loading: false }
                : word
            )
          );
        } catch (error) {
          setWordTranslations(prev => 
            prev.map((word, i) => 
              i === index 
                ? { ...word, german: "–", loading: false }
                : word
            )
          );
        }
      });
    };

    translateAllWords();
  }, [text]);

  if (!text) {
    return null;
  }

  return (
    <div className={`interlinear-container ${className}`} dir="rtl">
      <div className="flex flex-wrap gap-x-6 gap-y-8 justify-end items-start">
        {wordTranslations.map((wordData, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center min-w-fit max-w-[120px]"
          >
            {/* Arabic word */}
            <div className="text-2xl font-arabic text-gray-900 dark:text-white leading-tight mb-2 text-center">
              {wordData.arabic}
            </div>
            
            {/* German translation */}
            <div className="text-xs text-purple-600 dark:text-purple-400 leading-tight text-center min-h-[16px] flex items-center border-t border-gray-300 pt-1 w-full justify-center">
              {wordData.loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="font-semibold bg-purple-50 px-2 py-1 rounded text-center break-words">
                  {wordData.german}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center mt-6 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Übersetzungen werden geladen...
        </div>
      )}
    </div>
  );
}