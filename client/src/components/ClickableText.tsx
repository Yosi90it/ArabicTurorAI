import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordModal from "./WordModal";

import { getWordInfo } from "@/data/arabicDictionary";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";

// Weaviate translation function
async function translateWithWeaviate(word: string): Promise<{word: string, translation: string, grammar: string, examples: string[], pronunciation: string}> {
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
  
  return response.json();
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

  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsAnalyzing(true);
    try {
      // Try Weaviate first, fallback to dictionary
      let result;
      try {
        result = await translateWithWeaviate(word);
      } catch (weaviateError) {
        console.log('Weaviate not available, using fallback dictionary');
        const fallbackWord = getWordInfo(word);
        result = {
          word: word,
          translation: fallbackWord?.translation || strings.translationNotFound,
          grammar: fallbackWord?.grammar || "noun",
          examples: [],
          pronunciation: ""
        };
      }
      
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setSelectedWord({
        ...result,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        }
      });
    } catch (error) {
      console.error('Error translating word:', error);
      toast({
        title: strings.error,
        description: strings.failedToTranslate,
        variant: "destructive"
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

  // Split text into words and render each as clickable
  const words = text.split(/\s+/);

  return (
    <div className={className}>
      {words.map((word, index) => {
        const cleanWord = word.replace(/[،؟!.]/g, ''); // Remove punctuation for lookup
        const punctuation = word.match(/[،؟!.]/g)?.[0] || '';
        
        return (
          <span key={index} className="inline-block ml-1">
            <span className="relative group">
              <span
                className="cursor-pointer hover:bg-yellow-100 hover:rounded px-1 py-0.5 transition-colors clickable-word"
                data-word={cleanWord}
                onClick={(e) => handleWordClick(cleanWord, e)}
              >
                {cleanWord}
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
            {punctuation}
          </span>
        );
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