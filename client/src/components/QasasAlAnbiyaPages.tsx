import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Loader2, Plus } from "lucide-react";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

interface Word {
  arabic: string;
  translation: string;
  root: string;
  pos: string;
}

interface Paragraph {
  words: Word[];
  fullText: string;
}

interface Page {
  number: number;
  title: string;
  paragraphs: Paragraph[];
}

interface QasasAlAnbiyaPagesProps {
  onWordClick: (event: React.MouseEvent) => Promise<void>;
}

function QasasAlAnbiyaPages({ onWordClick }: QasasAlAnbiyaPagesProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const { tashkeelEnabled } = useTashkeel();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { strings } = useLanguage();

  const { data: pagesData, isLoading, error } = useQuery({
    queryKey: ['/api/qasas-pages'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const pages: Page[] = pagesData?.pages || [];
  const currentPage = pages[currentPageIndex];

  const handleWordClick = (word: string, translation: string, root: string, pos: string) => {
    console.log('Word clicked:', word, translation);
    setSelectedWord(word);
    // The actual event handling is now done in the onClick handler directly
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const formatArabicText = (text: string) => {
    return tashkeelEnabled ? text : text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            قصص الأنبياء - Stories of the Prophets
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Qasas al-Anbiya pages...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Book</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load Qasas al-Anbiya content. Please try refreshing the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentPage) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>No Content Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No pages found for Qasas al-Anbiya.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            قصص الأنبياء - Stories of the Prophets
          </div>
          <div className="text-sm text-muted-foreground">
            Page {currentPage.number} of {pages.length}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Page Title */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-blue-800 font-arabic">
            {formatArabicText(currentPage.title)}
          </h1>
        </div>

        {/* Page Content */}
        <div className="font-arabic text-lg leading-relaxed text-right">
          {currentPage.paragraphs.map((paragraph: Paragraph, pIndex: number) => (
            <div key={pIndex} className="text-right leading-loose">
              <div className="text-lg text-gray-700 leading-relaxed">
                {paragraph.words.map((word: Word, wIndex: number) => {
                  const displayText = formatArabicText(word.arabic);
                  return (
                    <span key={wIndex}>
                      <span
                        className="cursor-pointer hover:bg-blue-100 hover:rounded px-1 py-0.5 transition-colors duration-200 clickable-word"
                        data-word={word.arabic}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWordClick(word.arabic, word.translation, word.root, word.pos);
                          if (onWordClick) {
                            onWordClick(e);
                          }
                        }}
                        title={`${word.arabic} → ${word.translation}`}
                      >
                        {displayText}
                      </span>
                      {/* Add spaces and punctuation if they exist in the original text */}
                      {wIndex < paragraph.words.length - 1 && ' '}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{currentPageIndex + 1}</span>
            <span>/</span>
            <span>{pages.length}</span>
          </div>

          <Button
            onClick={handleNextPage}
            disabled={currentPageIndex === pages.length - 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QasasAlAnbiyaPages;