import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordModal from "./WordModal";

import { getWordInfo } from "@/data/arabicDictionary";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Fast Supabase-only translation function
async function translateFast(word: string): Promise<{word: string, translation: string, grammar: string, examples: string[], pronunciation: string, context?: string, source?: string}> {
  const response = await fetch('/api/translate-word-supabase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to translate word');
  }
  
  const result = await response.json();
  
  return {
    word: result.word,
    translation: result.translation,
    grammar: result.grammar || "noun",
    examples: [],
    pronunciation: "",
    context: result.context,
    source: result.source
  };
}

interface ClickableTextProps {
  text: string;
  className?: string;
}

export default function ClickableText({ text, className = "" }: ClickableTextProps) {
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
    examples?: string[];
    pronunciation?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { strings } = useLanguage();

  const handleWordClick = async (word: string, event: React.MouseEvent, context?: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    
    // Show loading state immediately
    setSelectedWord({
      word: word,
      translation: "Lädt…",
      grammar: "loading",
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
    
    setIsAnalyzing(true);
    try {
      let result;
      
      // 1. Try Supabase first (fast database lookup)
      try {
        result = await translateFast(word);
        console.log(`Translation from Supabase: ${result.source || 'supabase'}`);
      } catch (translationError) {
        console.log('No Supabase translation, trying ChatGPT');
        
        // 2. Fall back to ChatGPT if not in Supabase
        try {
          const response = await fetch('/api/translate-word-openai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              word: word,
              context: context || ""
            }),
          });
          
          if (response.ok) {
            result = await response.json();
            console.log('Used ChatGPT translation');
          } else {
            throw new Error('ChatGPT failed');
          }
        } catch (openaiError) {
          console.log('ChatGPT also failed, using local dictionary');
          const fallbackWord = getWordInfo(word);
          result = {
            word: word,
            translation: fallbackWord?.translation || "Übersetzung nicht verfügbar",
            grammar: fallbackWord?.grammar || "noun",
            examples: [],
            pronunciation: "",
            source: 'dictionary'
          };
        }
      }
      
      // Update with actual result
      setSelectedWord({
        ...result,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        }
      });
      
    } catch (error) {
      console.error('Error translating word:', error);
      // Still show something rather than failing completely
      setSelectedWord({
        word: word,
        translation: "Übersetzung fehlgeschlagen",
        grammar: "error",
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };



  const handleAddClick = (word: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const wordInfo = getWordInfo(word);
    if (wordInfo) {
      addFlashcard(wordInfo.arabic, wordInfo.translation, wordInfo.grammar);
      toast({
        title: strings.addedToFlashcards,
        description: `"${wordInfo.arabic}" ${strings.addedToFlashcardCollection}`,
      });
    }
  };

  const closeModal = () => {
    setSelectedWord(null);
  };

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    closeModal();
  };

  // Split text into words and punctuation while preserving structure
  const allParts = text.split(/(\s+|[،؟!.:؛])/);
  
  // Extract only actual words (not spaces or punctuation) for context building
  const actualWords = allParts.filter(part => part.trim() && !/^[،؟!.:؛\s]+$/.test(part));
  
  let wordIndex = 0;

  return (
    <div className={className} dir="rtl">
      {allParts.map((part, index) => {
        // Check if this is a word (not space or punctuation)
        if (part.trim() && !/^[،؟!.:؛\s]+$/.test(part)) {
          const currentWordIndex = wordIndex;
          wordIndex++;
          
          // Get context words (2 before and 2 after)
          const prev2 = currentWordIndex >= 2 ? actualWords[currentWordIndex - 2] : "";
          const prev1 = currentWordIndex >= 1 ? actualWords[currentWordIndex - 1] : "";
          const next1 = currentWordIndex < actualWords.length - 1 ? actualWords[currentWordIndex + 1] : "";
          const next2 = currentWordIndex < actualWords.length - 2 ? actualWords[currentWordIndex + 2] : "";
          
          const cleanWord = part.replace(/[،؟!.:؛]/g, ''); // Remove punctuation for lookup
          
          return (
            <span key={index} className="inline-block">
              <span className="relative group">
                <span
                  className="cursor-pointer hover:bg-yellow-100 hover:rounded px-1 py-0.5 transition-colors clickable-word"
                  data-word={cleanWord}
                  data-word-index={currentWordIndex}
                  data-prev2-word={prev2}
                  data-prev1-word={prev1}
                  data-next1-word={next1}
                  data-next2-word={next2}
                  data-context={`${prev2} ${prev1} ${cleanWord} ${next1} ${next2}`.trim()}
                  onClick={(e) => {
                    // Pass context data to handleWordClick
                    const context = `${prev2} ${prev1} ${cleanWord} ${next1} ${next2}`.trim();
                    handleWordClick(cleanWord, e, context);
                  }}
                >
                  {part}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 w-4 h-4 p-0 bg-primary-purple hover:bg-active-purple text-white rounded-full transition-opacity"
                  onClick={(e) => handleAddClick(cleanWord, e)}
                >
                  <Plus className="h-2 w-2" />
                </Button>
              </span>
            </span>
          );
        } else {
          // Return spaces and punctuation as-is
          return (
            <span key={index}>
              {part}
            </span>
          );
        }
      })}
      
      {selectedWord && (
        <WordModal
          word={selectedWord.word}
          translation={selectedWord.translation}
          grammar={selectedWord.grammar}
          position={selectedWord.position}
          onClose={closeModal}
          onAddToFlashcards={handleAddToFlashcards}
          examples={selectedWord.examples}
          pronunciation={selectedWord.pronunciation}
          isAnalyzing={isAnalyzing}
        />
      )}
      

    </div>
  );
}