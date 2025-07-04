import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Volume2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import ClickableText from "@/components/ClickableText";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent } from "@/contexts/ContentContext";
import WordModal from "@/components/WordModal";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { getWordInfo } from "@/data/arabicDictionary";

export default function BookReader() {
  const { books } = useContent();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
  } | null>(null);
  const { tashkeelEnabled } = useTashkeel();

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

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const wordInfo = getWordInfo(word);
    
    if (wordInfo) {
      setSelectedWord({
        word: wordInfo.arabic,
        translation: wordInfo.translation,
        grammar: wordInfo.grammar,
        position: { x: rect.left + rect.width / 2, y: rect.top }
      });
    }
  };

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    toast({
      title: "Added to Flashcards",
      description: `"${word}" has been added to your flashcard collection.`,
    });
    setSelectedWord(null);
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
                  onClick={() => setSelectedBook(book)}
                  className={`flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors ${
                    selectedBook?.id === book.id ? "bg-soft-gray" : "hover:bg-soft-gray"
                  }`}
                >
                  <div className="w-10 h-12 bg-primary-purple rounded-lg flex items-center justify-center text-white text-xs">
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

        {/* Reading Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{selectedBook?.title || "No Book Selected"}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {selectedBook ? (
                  <div 
                    className="text-lg leading-relaxed text-right" 
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: selectedBook.content }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No books available. Please upload books in the Admin Panel.</p>
                  </div>
                )}
              </div>
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
