import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClickableText from "./ClickableText";
import InterlinearText from "./InterlinearText";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useQuery } from "@tanstack/react-query";

interface PageData {
  number: number;
  title: string;
  paragraphs: Array<{
    words: string[];
    maxWordsPerLine: number;
  }>;
}

interface QiratuRashidaPagesProps {
  interlinearEnabled?: boolean;
}

export default function QiratuRashidaPages({ interlinearEnabled = false }: QiratuRashidaPagesProps) {
  const { strings } = useLanguage();
  const { tashkeelEnabled } = useTashkeel();
  const [currentPage, setCurrentPage] = useState(0);

  // API-Aufruf für dynamische Seiten aus HTML-Datei
  const { data: pagesData, isLoading, error } = useQuery({
    queryKey: ['/api/qiraatu-pages'],
    refetchInterval: 5000, // Aktualisiert alle 5 Sekunden
  });

  const pages: PageData[] = (pagesData as any)?.pages || [];

  // Create context-aware word data
  const createWordWithContext = (words: string[], index: number) => {
    const word = words[index];
    const prevWords = words.slice(Math.max(0, index - 2), index);
    const nextWords = words.slice(index + 1, Math.min(words.length, index + 3));
    const context = [...prevWords, word, ...nextWords].join(' ');
    return { word, context };
  };

  // Render paragraph with clickable words - simplified approach
  const renderParagraph = (words: string[], maxWordsPerLine: number, pageNum: number, paragraphIndex: number) => {
    // Create full text string for this paragraph
    let fullText = words.join(' ');
    
    // Apply tashkeel toggle
    if (!tashkeelEnabled) {
      fullText = fullText.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    }
    
    return (
      <div className="space-y-3 arabic-container">
        <div className="text-right arabic-text" style={{ direction: 'rtl', textAlign: 'right' }}>
          {interlinearEnabled ? (
            <InterlinearText
              text={fullText}
              className="text-lg leading-relaxed"
            />
          ) : (
            <ClickableText
              text={fullText}
              className="text-lg leading-relaxed"
            />
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">{strings.loading || "Lade Seiten..."}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-500">
          {strings.error || "Fehler beim Laden der Seiten"}
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">
          Keine Seiten gefunden. Bearbeiten Sie die "qiraatu al rashida.html" Datei um Inhalte hinzuzufügen.
        </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Seitentitel */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold arabic-text" style={{ direction: 'rtl' }}>
          {currentPageData.title}
        </h1>
      </div>

      {/* Arabischer Text-Container mit Rahmen wie im Bild */}
      <div className="border-2 border-gray-300 rounded-lg p-8 min-h-96 arabic-container bg-white">
        <div className="space-y-6" dir="rtl">
          {currentPageData.paragraphs.map((paragraph, paragraphIndex) => (
            <div key={paragraphIndex} className="text-right leading-loose">
              <div className="text-lg text-gray-700 leading-relaxed">
                {renderParagraph(paragraph.words, paragraph.maxWordsPerLine, currentPage, paragraphIndex)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation wie im Bild gezeigt */}
      <div className="flex justify-center items-center mt-6 gap-4">
        {/* Erste Seite */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
          className="p-2"
        >
          ≪
        </Button>
        
        {/* Vorherige Seite */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="p-2"
        >
          ‹
        </Button>

        {/* Seitenzahl-Anzeige */}
        <div className="text-sm text-gray-600 px-4">
          {currentPage + 1} of {pages.length}
        </div>

        {/* Nächste Seite */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="p-2"
        >
          ›
        </Button>

        {/* Letzte Seite */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage(pages.length - 1)}
          disabled={currentPage === pages.length - 1}
          className="p-2"
        >
          ≫
        </Button>
      </div>

      {/* Fortschrittsbalken */}
      <div className="mt-4 max-w-md mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Status-Anzeige */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Automatische Synchronisation aktiv</span>
        </div>
      </div>
    </div>
  );
}