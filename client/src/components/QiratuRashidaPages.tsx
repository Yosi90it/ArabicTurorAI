import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClickableText from "./ClickableText";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

interface PageData {
  number: number;
  title: string;
  paragraphs: Array<{
    words: string[];
    maxWordsPerLine: number;
  }>;
}

export default function QiratuRashidaPages() {
  const { strings } = useLanguage();
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
    const fullText = words.join(' ');
    
    return (
      <div className="space-y-3 arabic-container">
        <div className="text-right arabic-text" style={{ direction: 'rtl', textAlign: 'right' }}>
          <ClickableText
            text={fullText}
            className="text-lg leading-relaxed"
          />
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header mit Titel */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2 text-center arabic-text">
          {currentPageData.title}
        </h1>
        <div className="text-sm text-gray-500">
          {strings.page || "Seite"} {currentPage + 1} {strings.of || "von"} {pages.length}
        </div>

      </div>

      {/* Seiten-Inhalt */}
      <div className="p-8 min-h-96 arabic-container">
        <div className="space-y-6">
          {currentPageData.paragraphs.map((paragraph, paragraphIndex) => (
            <div key={paragraphIndex} className="text-lg leading-relaxed arabic-container">
              {renderParagraph(paragraph.words, paragraph.maxWordsPerLine, currentPage, paragraphIndex)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm" dir="rtl">السابق</span>
        </Button>

        <div className="flex gap-2">
          {pages.map((_, index) => (
            <Button
              key={index}
              variant={index === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(index)}
              className="w-8 h-8 p-0"
            >
              {index + 1}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2"
        >
          <span className="text-sm" dir="rtl">التالي</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
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