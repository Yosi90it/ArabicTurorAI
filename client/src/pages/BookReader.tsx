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
import BookSelector from "@/components/BookSelector";
import { QiratuRashidaPages } from "@/components/QiratuRashidaPages";
import { getWordInfo } from "@/data/arabicDictionary";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookContentProps {
  content: string;
  tashkeelEnabled: boolean;
  interlinearEnabled: boolean;
  onWordClick: (event: React.MouseEvent) => Promise<void>;
}

function BookContent({ content, tashkeelEnabled, interlinearEnabled, onWordClick }: BookContentProps) {
  const processContent = () => {
    if (!content) return "";
    
    // For interlinear mode, we need plain text
    if (interlinearEnabled) {
      let processedContent = content.replace(/<[^>]*>/g, ' ').trim();
      if (!tashkeelEnabled) {
        processedContent = processedContent.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
      }
      console.log("Interlinear mode enabled, content:", processedContent?.substring(0, 100));
      return <InterlinearText text={processedContent} className="leading-relaxed" />;
    }
    
    // For normal mode, render HTML with structure
    let processedContent = content;
    
    // Remove tashkeel if disabled
    if (!tashkeelEnabled) {
      processedContent = processedContent.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    }
    
    // Parse HTML and make Arabic text clickable
    const parseHtmlToClickable = (htmlContent: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      const processNode = (node: Node): React.ReactNode => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          if (text.trim()) {
            return <ClickableText key={Math.random()} text={text} className="leading-relaxed" />;
          }
          return null;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();
          
          const children = Array.from(element.childNodes).map(processNode).filter(Boolean);
          
          switch (tagName) {
            case 'h1':
              return <h1 key={Math.random()} className="text-3xl font-bold mb-6 text-purple-800">{children}</h1>;
            case 'h2':
              return <h2 key={Math.random()} className="text-2xl font-semibold mb-4 text-purple-700 mt-8">{children}</h2>;
            case 'h3':
              return <h3 key={Math.random()} className="text-xl font-medium mb-3 text-purple-600 mt-6">{children}</h3>;
            case 'p':
              return <p key={Math.random()} className="mb-4 text-lg">{children}</p>;
            case 'div':
              const style = element.getAttribute('style') || '';
              const className = style.includes('text-align: center') ? 'text-center mb-6' : 'mb-4';
              return <div key={Math.random()} className={className}>{children}</div>;
            case 'strong':
              return <strong key={Math.random()} className="font-bold text-purple-800">{children}</strong>;
            default:
              return <span key={Math.random()}>{children}</span>;
          }
        }
        
        return null;
      };
      
      return Array.from(doc.body.childNodes).map(processNode).filter(Boolean);
    };
    
    return parseHtmlToClickable(processedContent);
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
  const { books: contextBooks } = useContent();
  
  // Transform books to match BookSelector interface
  const books = contextBooks.map(book => ({
    id: book.id.toString(),
    title: book.title,
    level: book.level === 'beginner' ? 'anfänger' : book.level === 'intermediate' ? 'mittelstufe' : 'fortgeschritten',
    icon: book.icon,
    content: book.content
  }));
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { tashkeelEnabled } = useTashkeel();
  const { updateProgress } = useSimpleGamification();
  const { strings } = useLanguage();
  const [interlinearEnabled, setInterlinearEnabled] = useState(false);
  const [selectedBook, setSelectedBook] = useState(books.length > 0 ? books[0] : null);
  const [currentPage, setCurrentPage] = useState(0);
  const wordsPerPage = 100; // Content is already split into ~100 word pages
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
  } | null>(null);

  // Get available page images for complete Qiraatu book
  const qiraaturPages = [
    30, 33, 35, 37, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 84, 85, 86, 87, 88, 89, 91, 94, 95, 96, 97, 116, 131, 226, 236, 238, 242, 245, 247
  ];

  // Split content into pages based on book type
  const currentBookPages = selectedBook 
    ? (() => {
        // For complete Qiraatu book with images, use page numbers
        if (selectedBook.title.includes("كامل مع الصور الأصلية")) {
          return qiraaturPages.map(pageNum => `Page ${pageNum}`);
        }
        
        // For other books, use existing pagebreak logic
        const existingPages = selectedBook.content.split("<!-- pagebreak -->").map(p => p.trim()).filter(p => p.length > 0);
        
        if (existingPages.length > 1) {
          return existingPages;
        }
        
        // Otherwise, split by word count
        const content = selectedBook.content.replace(/<[^>]*>/g, ' ').trim();
        const words = content.split(/\s+/);
        const pages = [];
        
        for (let i = 0; i < words.length; i += wordsPerPage) {
          const pageWords = words.slice(i, i + wordsPerPage);
          pages.push(pageWords.join(' '));
        }
        
        return pages;
      })()
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
      title: strings.addedToFlashcards,
      description: `"${word}" ${strings.wordAdded}`
    });
    setSelectedWord(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Book Library - Above the content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{strings.myLibrary}</CardTitle>
        </CardHeader>
        <CardContent>
          <BookSelector 
            books={books} 
            selectedBook={selectedBook} 
            onBookSelect={(book) => {
              setSelectedBook(book);
              setCurrentPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Reading Area */}
      <div className="w-full">
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
{strings.page} {currentPage + 1} {strings.of} {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newPage = Math.min(totalPages - 1, currentPage + 1);
                          setCurrentPage(newPage);
                        }}
                        disabled={currentPage === totalPages - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Only show controls for interactive books, not image-based */}
                  {!selectedBook?.title.includes("كامل مع الصور الأصلية") && (
                    <>
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
                        <span className="text-sm font-medium text-gray-700">{strings.wordByWordTranslation}</span>
                        <button
                          onClick={() => setInterlinearEnabled(!interlinearEnabled)}
                          className="flex items-center"
                          title={strings.wordByWordTranslation}
                        >
                          {interlinearEnabled ? (
                            <ToggleRight className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                  


                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedBook ? (
                <>
                  {/* Use new Qiraatu Rashida Pages based on HTML structure */}
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 min-h-[500px]">
                      <QiratuRashidaPages />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">{strings.selectBook}</p>
                </div>
              )}
            </CardContent>
          </Card>
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