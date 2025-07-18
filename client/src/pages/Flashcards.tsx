import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Volume2, Check, X, BookOpen, Trophy, Star, Target, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useWordByWord } from "@/contexts/WordByWordContext";
import { useToast } from "@/hooks/use-toast";
import ClickableText from "@/components/ClickableText";
import WordModal from "@/components/WordModal";
import { analyzeArabicWord, type WordAnalysis } from "@/lib/openai";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";

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

export default function Flashcards() {
  const { userFlashcards } = useFlashcards();
  const { strings } = useLanguage();
  const { tashkeelEnabled } = useTashkeel();
  const { wordByWordEnabled } = useWordByWord();
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [studyMode, setStudyMode] = useState<'review' | 'test'>('review');
  
  // Story Generator States
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedWordsCount, setSelectedWordsCount] = useState(10);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
    examples?: string[];
    pronunciation?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Static flashcard data for demo
  const staticFlashcards: FlashcardData[] = [
    { 
      id: 1, 
      arabic: "بيت", 
      translation: strings.language === 'de' ? "Haus" : "House", 
      category: strings.homeFamily,
      sentence: "أنا أسكن في **بيت** كبير مع عائلتي."
    },
    { 
      id: 2, 
      arabic: "طعام", 
      translation: strings.language === 'de' ? "Essen" : "Food", 
      category: strings.foodDrink,
      sentence: "أحب **الطعام** العربي كثيراً."
    },
    { 
      id: 3, 
      arabic: "سيارة", 
      translation: strings.language === 'de' ? "Auto" : "Car", 
      category: strings.language === 'de' ? "Transport" : "Transportation",
      sentence: "سأشتري **سيارة** جديدة الشهر القادم."
    }
  ];

  // Combine user and static flashcards
  const allFlashcards = [...userFlashcards, ...staticFlashcards];
  const currentCard = allFlashcards[currentCardIndex];

  const nextCard = () => {
    if (currentCardIndex < allFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    } else {
      setCurrentCardIndex(allFlashcards.length - 1);
      setShowAnswer(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (studyMode === 'test') {
      setScore(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1
      }));
      
      // Award points for correct answers
      if (correct) {
        updateProgress('word', { word: currentCard.arabic });
        toast({
          title: `${strings.correct}! +5 ${strings.points}`,
          description: strings.language === 'de' 
            ? "Weiter so! Du hast eine Flashcard richtig beantwortet."
            : "Great job! You answered a flashcard correctly.",
        });
      }
    }
    setTimeout(nextCard, 1000);
  };

  const resetProgress = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setScore({ correct: 0, total: 0 });
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const generateStory = async () => {
    if (allFlashcards.length === 0) {
      toast({
        title: "Keine Flashcards",
        description: "Sie müssen zuerst Wörter zu Ihren Flashcards hinzufügen, bevor Sie eine Geschichte generieren können.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Select random words from flashcards
      const shuffled = [...allFlashcards].sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, Math.min(selectedWordsCount, allFlashcards.length));
      
      const wordList = selectedWords.map(card => `${card.arabic} (${card.translation})`).join(', ');
      
      const difficultyInstructions = {
        beginner: "Verwende einfache Sätze und grundlegende Grammatik. Die Geschichte sollte für Anfänger verständlich sein.",
        intermediate: "Verwende mittlere Komplexität mit verschiedenen Zeitformen und Satzstrukturen.",
        advanced: "Verwende komplexe Grammatik, verschiedene Stilmittel und anspruchsvolle Satzstrukturen."
      };

      const prompt = `Erstelle eine kurze arabische Geschichte (3-5 Sätze), die diese Vokabeln verwendet: ${wordList}

Anforderungen:
- Schwierigkeitsgrad: ${selectedDifficulty} (${difficultyInstructions[selectedDifficulty]})
- Verwende möglichst viele der gegebenen Wörter
- Die Geschichte soll zusammenhängend und interessant sein
- Füge Tashkeel (Diakritika) hinzu
- Gib auch eine deutsche Übersetzung an

Antworte im JSON-Format:
{
  "title": "Titel der Geschichte auf Deutsch",
  "arabicText": "Die arabische Geschichte mit Tashkeel",
  "translation": "Deutsche Übersetzung der Geschichte",
  "usedWords": ["verwendete", "arabische", "wörter"],
  "difficulty": "${selectedDifficulty}"
}`;

      const response = await fetch('/api/openai/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Generieren der Geschichte');
      }

      const story: Story = await response.json();
      setCurrentStory(story);
      
      toast({
        title: "Geschichte erstellt!",
        description: `Geschichte mit ${story.usedWords.length} Ihrer Vokabeln erstellt.`
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen der Geschichte. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWordClick = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-word')) {
      const word = target.getAttribute('data-word');
      if (word) {
        setIsAnalyzing(true);
        try {
          const analysis = await analyzeArabicWord(word);
          const rect = target.getBoundingClientRect();
          setSelectedWord({
            word: analysis.word,
            translation: analysis.translation,
            grammar: analysis.grammar,
            position: { 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            },
            examples: analysis.examples,
            pronunciation: analysis.pronunciation
          });
        } catch (error) {
          console.error('Error analyzing word:', error);
          toast({
            title: "Fehler",
            description: "Fehler beim Analysieren des Wortes",
            variant: "destructive"
          });
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{strings.flashcards}</h1>
        <p className="text-gray-600">
          {strings.language === 'de' 
            ? "Üben Sie Ihre gesammelten arabischen Vokabeln und erstellen Sie personalisierte Geschichten"
            : "Practice your collected Arabic vocabulary and create personalized stories"
          }
        </p>
      </div>

      <Tabs defaultValue="flashcards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
{strings.flashcards} ({allFlashcards.length})
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
{strings.storyGenerator}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-6">
          {/* Study Mode Selector */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Button 
                variant={studyMode === 'review' ? 'default' : 'outline'}
                onClick={() => setStudyMode('review')}
              >
{strings.reviewMode}
              </Button>
              <Button 
                variant={studyMode === 'test' ? 'default' : 'outline'}
                onClick={() => setStudyMode('test')}
              >
{strings.testMode}
              </Button>
              <Button variant="outline" onClick={resetProgress}>
                <RotateCcw className="w-4 h-4 mr-2" />
{strings.restart}
              </Button>
            </div>
          </div>

          {/* Progress and Score */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
{strings.progress}: {currentCardIndex + 1} / {allFlashcards.length}
              </span>
              {studyMode === 'test' && score.total > 0 && (
                <span className="text-sm font-medium">
{strings.score}: {score.correct} / {score.total} ({Math.round((score.correct / score.total) * 100)}%)
                </span>
              )}
            </div>
            <Progress value={((currentCardIndex + 1) / allFlashcards.length) * 100} className="w-full" />
          </div>

          {/* Flashcard */}
          <Card className="mb-6 min-h-[300px] cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
            <CardContent className="flex flex-col items-center justify-center h-full p-8">
              {allFlashcards.length > 0 ? (
                !showAnswer ? (
                  <>
                    <div className="text-4xl font-bold mb-4 text-center" dir="rtl">
                      {currentCard.arabic}
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => playAudio(currentCard.arabic)}
                      className="mb-4"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
{strings.language === 'de' ? "Audio abspielen" : "Play Audio"}
                    </Button>
                    <div className="text-gray-500">
                      {strings.language === 'de' ? "Klicken für Antwort" : "Click to reveal answer"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold mb-4 text-center" dir="rtl">
                      {currentCard.arabic}
                    </div>
                    <div className="text-2xl mb-4 text-center">
                      {currentCard.translation}
                    </div>
                    <Badge variant="outline" className="mb-4">
                      {currentCard.category}
                    </Badge>
                    {currentCard.sentence && (
                      <div className="text-sm text-gray-600 text-center mb-4" dir="rtl">
                        {currentCard.sentence}
                      </div>
                    )}
                    <div className="text-gray-500">Click to flip back</div>
                  </>
                )
              ) : (
                <div className="text-gray-500">No flashcards available</div>
              )}
            </CardContent>
          </Card>

          {/* Navigation and Test Buttons */}
          {allFlashcards.length > 0 && (
            <div className="flex justify-center space-x-4">
              <Button onClick={previousCard} variant="outline">
                Previous
              </Button>
              
              {studyMode === 'test' && showAnswer && (
                <>
                  <Button onClick={() => handleAnswer(false)} variant="destructive">
                    <X className="w-4 h-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button onClick={() => handleAnswer(true)} variant="default">
                    <Check className="w-4 h-4 mr-2" />
                    Correct
                  </Button>
                </>
              )}
              
              <Button onClick={nextCard}>
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          {/* Generation Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Personalisierte Geschichte erstellen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Verfügbare Flashcards:</span>
                <Badge variant="outline">{allFlashcards.length} Wörter</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Schwierigkeitsgrad</label>
                  <select 
                    value={selectedDifficulty} 
                    onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="beginner">Anfänger</option>
                    <option value="intermediate">Mittelstufe</option>
                    <option value="advanced">Fortgeschritten</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Anzahl Wörter</label>
                  <select 
                    value={selectedWordsCount} 
                    onChange={(e) => setSelectedWordsCount(Number(e.target.value))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={3}>3 Wörter</option>
                    <option value={5}>5 Wörter</option>
                    <option value={10}>10 Wörter</option>
                    <option value={15}>Alle verfügbaren</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={generateStory} 
                    disabled={isGenerating || allFlashcards.length === 0}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Erstelle...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Geschichte erstellen
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Story */}
          {currentStory && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  {currentStory.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {currentStory.difficulty}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => playAudio(currentStory.arabicText)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateStory}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Arabic Text */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Arabische Geschichte</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(currentStory.arabicText)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div 
                    dir="rtl" 
                    className="text-xl leading-relaxed font-arabic"
                    onClick={handleWordClick}
                  >
                    <ClickableText 
                      text={tashkeelEnabled ? currentStory.arabicText : currentStory.arabicText.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* German Translation */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-lg mb-3">Deutsche Übersetzung</h3>
                  <p className="text-lg leading-relaxed">{currentStory.translation}</p>
                </div>

                {/* Used Words */}
                <div className="p-4 bg-green-50 rounded-lg border">
                  <h3 className="font-semibold text-lg mb-3">Verwendete Vokabeln</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentStory.usedWords.map((word, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord.word}
          translation={selectedWord.translation}
          grammar={selectedWord.grammar}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
          onAddToFlashcards={() => {}}
          examples={selectedWord.examples}
          pronunciation={selectedWord.pronunciation}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}