import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Volume2, ZoomIn, ZoomOut, BookOpen, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useToast } from "@/hooks/use-toast";
import ClickableText from "@/components/ClickableText";
import WordModal from "@/components/WordModal";
import bookData from "../../../books/qiraatu-rashida-interactive.json";

interface BookPage {
  page: number;
  title: string;
  arabicText: string;
  translation: string;
  imageUrl: string;
}

interface SelectedWord {
  word: string;
  translation: string;
  grammar: string;
  position: { x: number; y: number };
  examples?: string[];
  pronunciation?: string;
}

export default function VisualBookReader() {
  const { strings } = useLanguage();
  const { tashkeelEnabled } = useTashkeel();
  const { toast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(0);
  const [showTextOverlay, setShowTextOverlay] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Transform book data into pages with image URLs
  const pages: BookPage[] = bookData.pages.map((page: any, index: number) => ({
    page: page.pageNumber || (index + 30), // Start from page 30 as per original structure
    title: page.title || `${strings.language === 'de' ? 'Seite' : 'Page'} ${page.pageNumber || (index + 30)}`,
    arabicText: page.content,
    translation: page.translation || '',
    imageUrl: `/Al-Qir\`atur.Rashida (1-2)-page-${String(page.pageNumber || (index + 30)).padStart(3, '0')}.jpg`
  }));

  const currentPageData = pages[currentPage];

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: strings.language === 'de' ? "Nicht unterstützt" : "Not Supported",
        description: strings.language === 'de' ? "Ihr Browser unterstützt kein Text-zu-Sprache" : "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
    }
  };

  const handleWordClick = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-word')) {
      const word = target.getAttribute('data-word');
      if (word) {
        setIsAnalyzing(true);
        try {
          // Call Weaviate API for translation
          const response = await fetch('/api/weaviate/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word })
          });
          
          const data = await response.json();
          const rect = target.getBoundingClientRect();
          
          setSelectedWord({
            word: data.word,
            translation: data.translation,
            grammar: data.grammar || strings.language === 'de' ? 'Grammatik-Info nicht verfügbar' : 'Grammar info not available',
            position: { 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            }
          });
        } catch (error) {
          console.error('Error analyzing word:', error);
          toast({
            title: strings.language === 'de' ? "Fehler" : "Error",
            description: strings.language === 'de' ? "Fehler beim Analysieren des Wortes" : "Error analyzing word",
            variant: "destructive"
          });
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  if (!currentPageData) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">
              {strings.language === 'de' ? 'Buchseite wird geladen...' : 'Loading book page...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{strings.visualBookReader || 'Visual Book Reader'}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {strings.page || 'Page'} {currentPageData.page}
            </Badge>
            <Badge variant="outline">
              {currentPage + 1} / {pages.length}
            </Badge>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={previousPage} disabled={currentPage === 0} variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {strings.language === 'de' ? 'Zurück' : 'Previous'}
            </Button>
            <Button onClick={nextPage} disabled={currentPage === pages.length - 1} variant="outline">
              {strings.language === 'de' ? 'Weiter' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowTextOverlay(!showTextOverlay)}
              variant="outline"
              size="sm"
            >
              {showTextOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {strings.textOverlay || 'Text Overlay'}
            </Button>
            <Button
              onClick={() => playAudio(currentPageData.arabicText)}
              variant="outline"
              size="sm"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button onClick={zoomOut} variant="outline" size="sm">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">{Math.round(zoomLevel * 100)}%</span>
            <Button onClick={zoomIn} variant="outline" size="sm">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Book Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {currentPageData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-auto border rounded-lg bg-gray-50" style={{ minHeight: '700px' }}>
            {/* Background Image */}
            <img 
              src={currentPageData.imageUrl}
              alt={`Page ${currentPageData.page}`}
              className="w-full object-contain"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                maxHeight: '800px'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.log('Image failed to load:', currentPageData.imageUrl);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', currentPageData.imageUrl);
              }}
            />
            
            {/* Text Overlay */}
            {showTextOverlay && currentPageData.arabicText && (
              <div 
                className="absolute top-4 right-4 max-w-md cursor-pointer"
                onClick={handleWordClick}
                dir="rtl"
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl border">
                  <h3 className="text-sm font-semibold mb-3 text-gray-600">
                    {strings.language === 'de' ? 'Seitentext' : 'Page Text'}
                  </h3>
                  <ClickableText 
                    text={tashkeelEnabled ? currentPageData.arabicText : currentPageData.arabicText.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                    className="text-lg leading-relaxed font-arabic text-black"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Translation Section */}
      {currentPageData.translation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {strings.language === 'de' ? strings.germanTranslation : strings.englishTranslation}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{currentPageData.translation}</p>
          </CardContent>
        </Card>
      )}

      {/* Page Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button onClick={previousPage} disabled={currentPage === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {strings.language === 'de' ? 'Vorherige Seite' : 'Previous Page'}
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {strings.language === 'de' ? 'Seite' : 'Page'}:
          </span>
          <select 
            value={currentPage} 
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            {pages.map((page, index) => (
              <option key={index} value={index}>
                {page.page}
              </option>
            ))}
          </select>
        </div>
        
        <Button onClick={nextPage} disabled={currentPage === pages.length - 1}>
          {strings.language === 'de' ? 'Nächste Seite' : 'Next Page'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord.word}
          translation={selectedWord.translation}
          grammar={selectedWord.grammar}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
          onAddToFlashcards={() => {
            toast({
              title: strings.language === 'de' ? "Wort hinzugefügt" : "Word Added",
              description: strings.language === 'de' ? "Wort zu Karteikarten hinzugefügt" : "Word added to flashcards"
            });
            setSelectedWord(null);
          }}
          examples={selectedWord.examples}
          pronunciation={selectedWord.pronunciation}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}