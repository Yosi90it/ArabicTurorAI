import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Volume2, ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent } from "@/contexts/ContentContext";
import WordModal from "@/components/WordModal";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { analyzeArabicWord, type WordAnalysis } from "@/lib/openai";

export default function BookReader() {
  const { books } = useContent();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState(books.length > 0 ? books[0] : null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
    examples?: string[];
    pronunciation?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { tashkeelEnabled } = useTashkeel();

  // Update selected book when books change
  useEffect(() => {
    if (books.length > 0 && !selectedBook) {
      setSelectedBook(books[0]);
    }
  }, [books, selectedBook]);

  // Split book content into pages
  const splitIntoPages = (content: string) => {
    const sections = content.split('<h2>').filter(section => section.trim());
    if (sections.length === 0) return [content];
    
    // First section starts with h1, others with h2
    const pages = sections.map((section, index) => {
      if (index === 0) return section;
      return '<h2>' + section;
    });
    
    return pages;
  };

  const currentBookPages = selectedBook ? splitIntoPages(selectedBook.content) : [];
  const totalPages = currentBookPages.length;



  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    toast({
      title: "Added to Flashcards",
      description: `"${word}" has been added to your flashcard collection.`,
    });
    setSelectedWord(null);
  };

  // Process HTML content and make Arabic words clickable
  const processHTMLContent = (htmlContent: string) => {
    // Create DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Function to make text content clickable
    const makeTextClickable = (text: string) => {
      return text.replace(/[\u0600-\u06FF\u0750-\u077F]+/g, (match) => {
        const cleanWord = match.replace(/[۔،؍؎؏ؘؙؚؐؑؒؓؔؕؖؗ؛؜؝؞؟ؠ]/g, '');
        return `<span class="clickable-word cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors" data-word="${cleanWord}">${match}</span>`;
      });
    };
    
    // Process all text nodes
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && /[\u0600-\u06FF\u0750-\u077F]/.test(node.textContent)) {
        textNodes.push(node as Text);
      }
    }
    
    textNodes.forEach(textNode => {
      const span = document.createElement('span');
      span.innerHTML = makeTextClickable(textNode.textContent || '');
      textNode.parentNode?.replaceChild(span, textNode);
    });
    
    return doc.body.innerHTML;
  };

  // Handle click events on the content area
  const handleContentClick = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-word')) {
      const word = target.getAttribute('data-word') || target.textContent || '';
      const rect = target.getBoundingClientRect();
      
      console.log('Clicked word:', word); // Debug log
      
      // Show loading state
      setSelectedWord({
        word: word,
        translation: "Analyzing...",
        grammar: "Getting grammar information...",
        position: { x: rect.left + rect.width / 2, y: rect.top }
      });
      
      setIsAnalyzing(true);
      
      try {
        // Get word analysis from OpenAI
        const analysis = await analyzeArabicWord(word);
        
        setSelectedWord({
          word: analysis.word,
          translation: analysis.translation,
          grammar: analysis.grammar,
          position: { x: rect.left + rect.width / 2, y: rect.top },
          examples: analysis.examples,
          pronunciation: analysis.pronunciation
        });
      } catch (error) {
        console.error('Error analyzing word:', error);
        setSelectedWord({
          word: word,
          translation: "Translation service unavailable",
          grammar: "Grammar analysis unavailable",
          position: { x: rect.left + rect.width / 2, y: rect.top }
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };



  const renderClickableText = (text: string) => {
    // Split text into words while preserving HTML tags
    const parts = text.split(/(\s+|<[^>]*>)/);
    
    return parts.map((part, index) => {
      // Skip whitespace and HTML tags
      if (/^\s+$/.test(part) || /^<[^>]*>$/.test(part)) {
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      }
      
      // Process Arabic words
      const arabicWords = part.match(/[\u0600-\u06FF\u0750-\u077F]+/g);
      if (arabicWords && arabicWords.length > 0) {
        return arabicWords.map((word, wordIndex) => {
          const cleanWord = word.replace(/[۔،؍؎؏ؘؙؚؐؑؒؓؔؕؖؗ؛؜؝؞؟ؠ]/g, '');
          return (
            <span
              key={`${index}-${wordIndex}`}
              className="clickable-word cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors"
              onClick={(e) => handleWordClick(cleanWord, e)}
            >
              {word}
            </span>
          );
        });
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Arabic Book Reader</h2>
        <p className="text-gray-600">Read Arabic stories and literature with translation support</p>
      </div>

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
                  <div>
                    <h3 className="font-medium text-sm">{book.title}</h3>
                    <p className="text-xs text-gray-500">{book.level}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Reading Content */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {selectedBook?.title || "Select a Book"}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {selectedBook && totalPages > 1 && (
                  <div className="flex items-center space-x-2 mr-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
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
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
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
                <Button variant="outline" size="sm">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedBook ? (
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 min-h-[500px]">
                    <div 
                      className="text-right leading-relaxed space-y-4" 
                      style={{ fontSize: '1.2rem', lineHeight: '2' }}
                      dir="rtl"
                      onClick={handleContentClick}
                      dangerouslySetInnerHTML={{ 
                        __html: currentBookPages[currentPage] ? processHTMLContent(currentBookPages[currentPage]) : ''
                      }}
                    />
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
          examples={selectedWord.examples}
          pronunciation={selectedWord.pronunciation}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}
