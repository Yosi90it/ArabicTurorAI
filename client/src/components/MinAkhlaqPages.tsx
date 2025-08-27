import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

interface Page {
  number: number;
  title: string;
  content: string;
}

interface MinAkhlaqPagesProps {
  onWordClick: (event: React.MouseEvent) => Promise<void>;
}

function MinAkhlaqPages({ onWordClick }: MinAkhlaqPagesProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const { tashkeelEnabled } = useTashkeel();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { strings } = useLanguage();

  const { data: pagesData, isLoading, error } = useQuery({
    queryKey: ['/api/min-akhlaq-pages'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const pages: Page[] = pagesData?.pages || [];
  const currentPage = pages[currentPageIndex];

  const handleWordClick = (word: string) => {
    console.log('Word clicked:', word);
    setSelectedWord(word);
    // Event handling is done in the onClick handler directly
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

  const handleAddToFlashcards = () => {
    if (selectedWord) {
      addFlashcard(selectedWord, "", "noun");
      toast({
        title: strings.addedToFlashcards || "Added to Flashcards",
        description: `"${selectedWord}" ${strings.wordAdded || "has been added to your flashcards"}`
      });
      setSelectedWord('');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            من أخلاق الرسول - Min Akhlaq ar-Rasul
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Min Akhlaq ar-Rasul pages...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Error Loading Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load Min Akhlaq ar-Rasul pages. Please try again later.</p>
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
          <p>No pages found for Min Akhlaq ar-Rasul.</p>
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
            من أخلاق الرسول - Min Akhlaq ar-Rasul
          </div>
          <div className="text-sm text-muted-foreground">
            Page {currentPage.number} of {pages.length}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Page Title */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold text-green-800 font-arabic">
            {formatArabicText(currentPage.title)}
          </h1>
        </div>

        {/* Page Content */}
        <div 
          className="font-arabic text-lg leading-relaxed text-right"
          onClick={onWordClick}
          dangerouslySetInnerHTML={{
            __html: currentPage.content.replace(/class="word"/g, 'class="word clickable-word"')
          }}
          dir="rtl"
        />

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

export default MinAkhlaqPages;