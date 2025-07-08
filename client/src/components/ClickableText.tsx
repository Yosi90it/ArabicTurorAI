import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordModal from "./WordModal";

import { getWordInfo } from "@/data/arabicDictionary";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";

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
  } | null>(null);
  
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const wordInfo = getWordInfo(word);
    if (wordInfo) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setSelectedWord({
        word: wordInfo.arabic,
        translation: wordInfo.translation,
        grammar: wordInfo.grammar,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        }
      });
    } else {
      setSelectedWord({
        word: word,
        translation: "Translation not available",
        grammar: "Grammar info not available",
        position: {
          x: (event.target as HTMLElement).getBoundingClientRect().left,
          y: (event.target as HTMLElement).getBoundingClientRect().top
        }
      });
    }
  };



  const handleAddClick = (word: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const wordInfo = getWordInfo(word);
    if (wordInfo) {
      addFlashcard(wordInfo.arabic, wordInfo.translation, wordInfo.grammar);
      toast({
        title: "Added to Flashcards",
        description: `"${wordInfo.arabic}" has been added to your flashcard collection.`,
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
                className="cursor-pointer hover:bg-yellow-100 hover:rounded px-1 py-0.5 transition-colors"
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
        />
      )}
      

    </div>
  );
}