import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFlashcards } from "@/contexts/FlashcardContext";

interface FlashcardData {
  id: number;
  arabic: string;
  translation: string;
  category: string;
  grammar?: string;
  sentence?: string;
}

interface Category {
  name: string;
  icon: string;
  totalCards: number;
  progress: number;
}

interface Story {
  title: string;
  arabicText: string;
  translation: string;
  usedWords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const flashcards: FlashcardData[] = [
  { 
    id: 1, 
    arabic: "بيت", 
    translation: "House", 
    category: "Home & Family",
    sentence: "أنا أسكن في **بيت** كبير مع عائلتي."
  },
  { 
    id: 2, 
    arabic: "طعام", 
    translation: "Food", 
    category: "Food & Drink",
    sentence: "أحب **الطعام** العربي كثيراً."
  },
  { 
    id: 3, 
    arabic: "سيارة", 
    translation: "Car", 
    category: "Transportation",
    sentence: "أذهب إلى العمل بـ**السيارة** كل يوم."
  }
];

const categories: Category[] = [
  { name: "Home & Family", icon: "🏠", totalCards: 50, progress: 60 },
  { name: "Food & Drink", icon: "🍽️", totalCards: 75, progress: 30 },
  { name: "Transportation", icon: "🚗", totalCards: 40, progress: 80 }
];

export default function Flashcards() {
  const { userFlashcards } = useFlashcards();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Combine predefined flashcards with user-added ones
  const allFlashcards = [...flashcards, ...userFlashcards];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % allFlashcards.length);
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    setCurrentCard((prev) => (prev - 1 + allFlashcards.length) % allFlashcards.length);
    setIsFlipped(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Arabic Flashcards</h2>
        <p className="text-gray-600">Master Arabic vocabulary with interactive flashcards</p>
      </div>

      {/* Flashcard Interface */}
      <div className="max-w-md mx-auto mb-8">
        <Card 
          className="h-64 flex flex-col justify-center transform hover:scale-105 transition-transform duration-200 cursor-pointer"
          onClick={handleFlip}
        >
          <CardContent className="text-center p-8">
            {allFlashcards.length > 0 ? (
              !isFlipped ? (
                <>
                  <div className="text-4xl mb-4">{allFlashcards[currentCard].arabic}</div>
                  <Button variant="ghost" className="text-primary-purple hover:text-active-purple transition-colors">
                    Click to flip
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-4 text-gray-600">{allFlashcards[currentCard].translation}</div>
                  {allFlashcards[currentCard].grammar && (
                    <div className="text-sm text-gray-500 mb-2">{allFlashcards[currentCard].grammar}</div>
                  )}
                  {allFlashcards[currentCard].sentence && (
                    <div className="mt-4 p-3 bg-soft-gray rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Example sentence:</p>
                      <p 
                        className="text-sm text-right leading-relaxed"
                        dir="rtl"
                        dangerouslySetInnerHTML={{
                          __html: allFlashcards[currentCard].sentence!.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary-purple">$1</strong>')
                        }}
                      />
                    </div>
                  )}
                  <Button variant="ghost" className="text-primary-purple hover:text-active-purple transition-colors">
                    Click to flip back
                  </Button>
                </>
              )
            ) : (
              <div className="text-gray-500">No flashcards available</div>
            )}
          </CardContent>
        </Card>
        
        {allFlashcards.length > 0 && (
          <div className="flex justify-center space-x-4 mt-4">
            <Button onClick={handlePrevious} variant="outline" className="rounded-2xl">
              Previous
            </Button>
            <Button onClick={handleNext} className="bg-primary-purple hover:bg-active-purple rounded-2xl">
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Flashcard Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">{category.icon}</div>
              <CardTitle className="text-base mb-1">{category.name}</CardTitle>
              <p className="text-sm text-gray-600 mb-3">{category.totalCards} cards</p>
              <Progress value={category.progress} className="w-full h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
