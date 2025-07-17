import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Volume2, ChevronLeft, ChevronRight, BookOpen, Loader2, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent } from "@/contexts/ContentContext";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import ClickableText from "@/components/ClickableText";
import InterlinearText from "@/components/InterlinearText";
import WordModal from "@/components/WordModal";
import { getWordInfo } from "@/data/arabicDictionary";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";

interface BookContentProps {
  content: string;
  tashkeelEnabled: boolean;
  interlinearEnabled: boolean;
  onWordClick: (event: React.MouseEvent) => Promise<void>;
}

function BookContent({ content, tashkeelEnabled, interlinearEnabled, onWordClick }: BookContentProps) {
  const processContent = () => {
    if (!content) return "";
    
    // Remove HTML tags but keep the content
    let processedContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    // Remove tashkeel if disabled
    if (!tashkeelEnabled) {
      processedContent = processedContent.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    }
    
    // Handle interlinear mode - show translations under each word
    if (interlinearEnabled) {
      console.log("Interlinear mode enabled, content:", processedContent?.substring(0, 100));
      return <InterlinearText text={processedContent} className="leading-relaxed" />;
    }
    
    return <ClickableText text={processedContent} className="leading-relaxed text-xl" />;
  };

  return (
    <div 
      className="text-xl leading-relaxed font-arabic" 
      dir="rtl"
      onClick={interlinearEnabled ? undefined : onWordClick}
    >
      {processContent()}
    </div>
  );
}

// Direct Weaviate translation function
async function fetchTranslation(arabicWord: string): Promise<string> {
  const res = await fetch('/api/weaviate/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word: arabicWord })
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch translation');
  }
  
  const data = await res.json();
  return data.translation || "–";
}

export default function BookReader() {
  const { books } = useContent();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { tashkeelEnabled } = useTashkeel();
  const { updateProgress } = useSimpleGamification();
  const [interlinearEnabled, setInterlinearEnabled] = useState(false);
  const [selectedBook, setSelectedBook] = useState(books.length > 0 ? books[0] : null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
  } | null>(null);

  // Split content into pages
  const currentBookPages = selectedBook 
    ? selectedBook.content.split("<!-- pagebreak -->").map(p => p.trim()).filter(p => p.length > 0)
    : [];
  
  const totalPages = currentBookPages.length;

  // Update selected book when books change
  useEffect(() => {
    if (books.length > 0 && !selectedBook) {
      setSelectedBook(books[0]);
    }
  }, [books, selectedBook]);

  const handleContentClick = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-word')) {
      const word = target.getAttribute('data-word');
      if (word) {
        const cleanedWord = word.replace(/[،؟!.:]/g, ''); // Remove punctuation
        const rect = target.getBoundingClientRect();
        
        // Set initial loading state
        setSelectedWord({
          word: cleanedWord,
          translation: "Lädt…",
          grammar: "noun",
          position: { 
            x: rect.left + rect.width / 2, 
            y: rect.top 
          }
        });
        
        try {
          // Fetch translation from Weaviate
          const translation = await fetchTranslation(cleanedWord);
          
          // Update with actual translation
          setSelectedWord({
            word: cleanedWord,
            translation: translation,
            grammar: "noun",
            position: { 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            }
          });
        } catch (error) {
          console.error('Error fetching translation:', error);
          setSelectedWord({
            word: cleanedWord,
            translation: "–",
            grammar: "noun",
            position: { 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            }
          });
        }
      }
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    toast({
      title: "Added to Flashcards",
      description: `"${word}" has been added to your flashcards.`
    });
    setSelectedWord(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {books.length === 0 ? (
              <p className="text-center py-4 text-gray-500 text-sm">
                No books available. Upload books in Admin Panel.
              </p>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setCurrentPage(0);
                  }}
                  className={`flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors ${
                    selectedBook?.id === book.id ? "bg-purple-100" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="w-10 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs">
                    {book.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{book.title}</h3>
                    <p className="text-xs text-gray-500 capitalize">{book.level}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Reading Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {selectedBook?.title || "Select a Book"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedBook && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newPage = Math.max(0, currentPage - 1);
                          setCurrentPage(newPage);
                        }}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600 px-2">
                        Page {currentPage + 1} of {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newPage = Math.min(totalPages - 1, currentPage + 1);
                          setCurrentPage(newPage);
                          // Award points for reading a new page
                          updateProgress('reading');
                          toast({
                            title: "Seite gelesen! +15 Punkte",
                            description: "Großartig! Du machst Fortschritte beim Lesen.",
                          });
                        }}
                        disabled={currentPage === totalPages - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectedBook && playAudio(currentBookPages[currentPage])}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </Button>
                  
                  {/* Interlinear Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Interlinear</span>
                    <button
                      onClick={() => setInterlinearEnabled(!interlinearEnabled)}
                      className="flex items-center"
                      title="Zeigt deutsche Übersetzungen unter jedem arabischen Wort"
                    >
                      {interlinearEnabled ? (
                        <ToggleRight className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Word by Word Toggle */}

                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedBook ? (
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 min-h-[500px]">
                    <div 
                      className="leading-relaxed space-y-4" 
                      onClick={handleContentClick}
                    >
                      {selectedBook && currentBookPages[currentPage] && (
                        <BookContent 
                          content={currentBookPages[currentPage]} 
                          tashkeelEnabled={tashkeelEnabled}
                          interlinearEnabled={interlinearEnabled}
                          onWordClick={handleContentClick}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Please select a book from your library to start reading.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord.word}
          translation={selectedWord.translation}
          grammar={selectedWord.grammar}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
          onAddToFlashcards={handleAddToFlashcards}
        />
      )}
    </div>
  );
}