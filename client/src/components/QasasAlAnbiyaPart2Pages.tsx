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
  words: string[];
  fullText?: string;
}

interface Page {
  number: number;
  title: string;
  paragraphs: Paragraph[];
}

interface QasasAlAnbiyaPart2PagesProps {
  onWordClick: (event: React.MouseEvent) => Promise<void>;
}

function QasasAlAnbiyaPart2Pages({ onWordClick }: QasasAlAnbiyaPart2PagesProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const { tashkeelEnabled } = useTashkeel();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { strings } = useLanguage();

  const { data: pagesData, isLoading, error } = useQuery({
    queryKey: ['/api/qasas-pages-2'],
    staleTime: 0, // Always fresh data
    gcTime: 0, // No caching (TanStack Query v5)
  });

  const pages: Page[] = pagesData?.pages || [];
  const currentPage = pages[currentPageIndex];

  const handleWordClick = (word: string, translation: string, root: string, pos: string) => {
    console.log('Word clicked:', word, translation);
    setSelectedWord(word);
    
    // Pass to parent component if provided
    if (onWordClick) {
      // Create synthetic event for compatibility with BookReader
      const syntheticEvent = {
        target: {
          classList: {
            contains: () => true
          },
          getAttribute: (attr: string) => word,
          getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 })
        }
      } as unknown as React.MouseEvent;
      onWordClick(syntheticEvent);
    }
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

  const handleAddToFlashcards = async () => {
    if (!selectedWord) return;
    
    try {
      await addFlashcard({
        front: selectedWord,
        back: "Translation will be added", // Placeholder
        notes: `From Qasas al-Anbiya Teil 2, page ${currentPage?.number || 1}`,
        category: "قصص الأنبياء - الجزء الثاني"
      });
      
      toast({
        title: strings.flashcardAdded || "Added to Flashcards",
        description: `Word "${selectedWord}" was added to your flashcards.`,
      });
    } catch (error) {
      toast({
        title: strings.error || "Error",
        description: strings.flashcardAddError || "Failed to add flashcard.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{strings.loading || "Loading pages..."}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{strings.error || "Error loading pages"}</p>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">{strings.noContent || "No content available yet"}</p>
        <p className="text-sm text-gray-500 mt-2">Content will be added by the user</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">قصص الأنبياء - الجزء الثاني</h3>
            <p className="text-sm text-gray-600">
              {strings.page || "Page"} {currentPageIndex + 1} {strings.of || "of"} {pages.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPageIndex === pages.length - 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {currentPage && (
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="text-center border-b bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="text-2xl text-gray-900 font-bold" dir="rtl">
              {currentPage.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6" dir="rtl">
              {currentPage.paragraphs.map((paragraph, paragraphIndex) => (
                <div key={paragraphIndex} className="text-right leading-loose">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {paragraph.words && paragraph.words.length > 0 ? (
                      paragraph.words.map((word, wordIndex) => (
                        <span key={wordIndex}>
                          <span
                            className={`word cursor-pointer hover:bg-purple-100 transition-colors duration-200 px-1 py-0.5 rounded ${
                              selectedWord === word ? 'bg-purple-200' : ''
                            }`}
                            onClick={() => handleWordClick(word, "", "", "")}
                          >
                            {tashkeelEnabled ? word : word.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                          </span>
                          {wordIndex < paragraph.words.length - 1 && ' '}
                        </span>
                      ))
                    ) : (
                      // Fallback for simple text
                      paragraph.fullText?.split(' ').map((word, wordIndex, array) => (
                        <span key={wordIndex}>
                          <span
                            className={`word cursor-pointer hover:bg-purple-100 transition-colors duration-200 px-1 py-0.5 rounded ${
                              selectedWord === word ? 'bg-purple-200' : ''
                            }`}
                            onClick={() => handleWordClick(word, "", "", "")}
                          >
                            {tashkeelEnabled ? word : word.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                          </span>
                          {wordIndex < array.length - 1 && ' '}
                        </span>
                      ))
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add to Flashcards Button */}
      {selectedWord && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={handleAddToFlashcards}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {strings.addToFlashcards || "Add to Flashcards"}
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="flex justify-center space-x-1 mt-6">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              index === currentPageIndex 
                ? 'bg-purple-600' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentPageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default QasasAlAnbiyaPart2Pages;