import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  Volume2,
  BookOpen,
  Sparkles
} from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";

interface FlashcardData {
  id: number;
  arabic: string;
  translation: string;
  category: string;
  grammar?: string;
  sentence?: string;
}

export default function FlashcardsNew() {
  const { userFlashcards } = useFlashcards();
  const { strings } = useLanguage();
  const { tashkeelEnabled, formatText } = useTashkeel();
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'stories'>('learn');

  // Static flashcard data for demo
  const staticFlashcards: FlashcardData[] = [
    { 
      id: 1, 
      arabic: "عَنْ", 
      translation: "von, über, wegen", 
      category: "Präpositionen",
      sentence: "أتحدث **عَنْ** اللغة العربية."
    },
    { 
      id: 2, 
      arabic: "بيت", 
      translation: "Haus", 
      category: "Familie & Zuhause",
      sentence: "أنا أسكن في **بيت** كبير مع عائلتي."
    },
    { 
      id: 3, 
      arabic: "طعام", 
      translation: "Essen", 
      category: "Essen & Trinken",
      sentence: "أحب **الطعام** العربي كثيراً."
    },
    { 
      id: 4, 
      arabic: "سيارة", 
      translation: "Auto", 
      category: "Transport",
      sentence: "سأشتري **سيارة** جديدة الشهر القادم."
    }
  ];

  // Combine user and static flashcards
  const allFlashcards = [...userFlashcards, ...staticFlashcards];
  const currentCard = allFlashcards[currentCardIndex];

  const nextCard = () => {
    if (currentCardIndex < allFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
    setShowAnswer(false);
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(allFlashcards.length - 1);
    }
    setShowAnswer(false);
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleCorrect = () => {
    updateProgress('flashcard', 10);
    toast({
      title: "Richtig!",
      description: "Gut gemacht! Weiter zur nächsten Karte.",
    });
    nextCard();
  };

  const handleIncorrect = () => {
    toast({
      title: "Nochmal üben",
      description: "Kein Problem, übe diese Karte nochmal.",
    });
    // Keep the same card for practice
    setShowAnswer(false);
  };

  const speakArabic = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Keine Flashcards verfügbar</h2>
          <p className="text-gray-600">Füge Wörter zu deinen Flashcards hinzu, um zu beginnen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'learn'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen size={18} />
              Lernen
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'stories'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles size={18} />
              Geschichten
            </button>
          </div>
        </div>

        {activeTab === 'learn' && (
          <>
            {/* Main Flashcard */}
            <div className="mb-8">
              <Card 
                className="w-full h-96 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                onClick={handleFlipCard}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 relative">
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 right-4 bg-white/80 text-gray-700"
                  >
                    {currentCard.category}
                  </Badge>

                  {/* Bookmark Icon */}
                  <div className="absolute top-4 right-16 w-8 h-8 bg-gray-200 rounded border-2 border-gray-300"></div>

                  {/* Main Content */}
                  <div className="text-center space-y-6">
                    {!showAnswer ? (
                      <>
                        {/* Arabic Word */}
                        <div className="space-y-4">
                          <h2 className="text-6xl font-bold text-gray-900 font-arabic">
                            {formatText(currentCard.arabic)}
                          </h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakArabic(currentCard.arabic);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Volume2 size={20} />
                          </Button>
                        </div>
                        
                        {/* Hint */}
                        <p className="text-lg text-gray-500 font-medium">
                          Klicke zum Umdrehen
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Translation */}
                        <div className="space-y-4">
                          <h2 className="text-4xl font-bold text-gray-900">
                            {currentCard.translation}
                          </h2>
                          
                          {/* Example Sentence */}
                          {currentCard.sentence && (
                            <div className="mt-6 p-4 bg-white/60 rounded-lg">
                              <p className="text-lg text-gray-700 font-arabic text-right">
                                {formatText(currentCard.sentence.replace(/\*\*/g, ''))}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={previousCard}
                className="w-16 h-16 rounded-lg border-2"
              >
                <ChevronLeft size={24} />
              </Button>

              {/* Progress */}
              <div className="flex-1 mx-8">
                <div className="text-center mb-2">
                  <span className="text-sm text-gray-600">
                    Karte {currentCardIndex + 1} von {allFlashcards.length}
                  </span>
                </div>
                <Progress 
                  value={((currentCardIndex + 1) / allFlashcards.length) * 100} 
                  className="h-3 bg-gray-200"
                />
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={nextCard}
                className="w-16 h-16 rounded-lg border-2"
              >
                <ChevronRight size={24} />
              </Button>
            </div>

            {/* Answer Buttons */}
            {showAnswer && (
              <div className="flex gap-4">
                <Button
                  onClick={handleIncorrect}
                  className="flex-1 h-14 text-lg font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl"
                >
                  <RotateCcw size={20} className="mr-2" />
                  Nochmal üben
                </Button>
                
                <Button
                  onClick={handleCorrect}
                  className="flex-1 h-14 text-lg font-medium bg-green-500 hover:bg-green-600 text-white rounded-xl"
                >
                  <Check size={20} className="mr-2" />
                  Gewusst
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'stories' && (
          <div className="text-center py-16">
            <Sparkles size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Geschichten</h2>
            <p className="text-gray-600">Geschichten-Feature kommt bald!</p>
          </div>
        )}
      </div>
    </div>
  );
}