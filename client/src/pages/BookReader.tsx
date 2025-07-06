import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Volume2, ChevronLeft, ChevronRight, BookOpen, Loader2, Plus } from "lucide-react";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent } from "@/contexts/ContentContext";
import WordModal from "@/components/WordModal";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { analyzeArabicWord, type WordAnalysis } from "@/lib/openai";

// BookContent component to handle content rendering
interface BookContentProps {
  content: string;
  tashkeelEnabled: boolean;
  onWordClick: (event: React.MouseEvent) => void;
}

function BookContent({ content, tashkeelEnabled, onWordClick }: BookContentProps) {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const processContent = async () => {
      setIsTranslating(true);
      try {
        // Process content for tashkeel
        const withTashkeel = tashkeelEnabled ? content : content.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
        
        // Create a temporary DOM element to properly parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = withTashkeel;
        
        // Extract all text content while preserving structure
        const extractTextLines = (element: Element): string[] => {
          const lines: string[] = [];
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while (node = walker.nextNode()) {
            const text = node.textContent?.trim();
            if (text && /[\u0600-\u06FF]/.test(text)) {
              lines.push(text);
            }
          }
          
          return lines;
        };
        
        const textLines = extractTextLines(tempDiv);
        
        let result = '';
        for (const line of textLines) {
          if (line && /[\u0600-\u06FF]/.test(line)) {
            try {
              const analysis = await analyzeArabicWord(line);
              
              // Create words with clickable spans - ensure no word is missed
              const words = line.split(/(\s+|[^\u0600-\u06FF\s]+)/);
              const wordsHtml = words.map((word, index) => {
                const cleanWord = word.trim();
                if (cleanWord && /[\u0600-\u06FF]/.test(cleanWord)) {
                  // Apply tashkeel toggle to individual words
                  const displayWord = tashkeelEnabled ? word : word.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
                  const wordForData = cleanWord.replace(/[۔،؍؎؏ؘؙؚؐؑؒؓؔؕؖؗ؛؜؝؞؟ؠ]/g, '').replace(/[\u064B-\u065F\u0670\u0640]/g, '');
                  return `<span class="clickable-word cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors" data-word="${wordForData}" style="display: inline-block; margin: 0 1px;">${displayWord}</span>`;
                }
                return word;
              }).join('');
              
              result += `
                <div class="line-block mb-4">
                  <div class="arabic-text text-xl leading-relaxed mb-2" dir="rtl" style="line-height: 2.5; font-family: 'Arial', sans-serif; word-spacing: 0.3em;">
                    ${wordsHtml.join('')}
                  </div>
                  <div class="translation-text text-sm text-gray-600 italic mb-3">
                    ${analysis.translation}
                  </div>
                </div>
              `;
            } catch (error) {
              // Fallback for failed translations
              const words = line.split(/(\s+|[^\u0600-\u06FF\s]+)/);
              const wordsHtml = words.map((word, index) => {
                const cleanWord = word.trim();
                if (cleanWord && /[\u0600-\u06FF]/.test(cleanWord)) {
                  // Apply tashkeel toggle to individual words
                  const displayWord = tashkeelEnabled ? word : word.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
                  const wordForData = cleanWord.replace(/[۔،؍؎؏ؘؙؚؐؑؒؓؔؕؖؗ؛؜؝؞؟ؠ]/g, '').replace(/[\u064B-\u065F\u0670\u0640]/g, '');
                  return `<span class="clickable-word cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors" data-word="${wordForData}" style="display: inline-block; margin: 0 1px;">${displayWord}</span>`;
                }
                return word;
              }).join('');
              
              result += `
                <div class="line-block mb-4">
                  <div class="arabic-text text-xl leading-relaxed mb-2" dir="rtl" style="line-height: 2.5; font-family: 'Arial', sans-serif; word-spacing: 0.3em;">
                    ${wordsHtml}
                  </div>
                  <div class="translation-text text-sm text-gray-600 italic mb-3">
                    Translation not available
                  </div>
                </div>
              `;
            }
          }
        }
        
        setProcessedContent(result);
      } catch (error) {
        console.error('Error processing content:', error);
        setProcessedContent(content);
      } finally {
        setIsTranslating(false);
      }
    };

    if (content) {
      processContent();
    }
  }, [content, tashkeelEnabled]);

  if (isTranslating) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Translating content...</span>
      </div>
    );
  }

  return (
    <div 
      onClick={onWordClick}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

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
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    console.log('Click target:', target, 'Classes:', target.className, 'Data-word:', target.getAttribute('data-word'));
    
    if (target.classList.contains('clickable-word')) {
      // Get original word with tashkeel from textContent for flashcard storage
      const originalWord = target.textContent?.trim() || '';
      // Get cleaned word from data attribute for analysis
      const cleanedWord = target.getAttribute('data-word') || '';
      const rect = target.getBoundingClientRect();
      
      console.log('Clicked word - Original:', originalWord, 'Clean:', cleanedWord); // Debug log
      
      // Show loading state with original word
      setSelectedWord({
        word: originalWord, // Store original word with tashkeel
        translation: "Analyzing...",
        grammar: "Getting grammar information...",
        position: { x: rect.left + rect.width / 2, y: rect.top }
      });
      
      setIsAnalyzing(true);
      
      try {
        // Get word analysis from OpenAI using cleaned word
        const analysis = await analyzeArabicWord(cleanedWord);
        
        setSelectedWord({
          word: originalWord, // Keep original word with tashkeel for flashcard
          translation: analysis.translation,
          grammar: analysis.grammar,
          position: { x: rect.left + rect.width / 2, y: rect.top },
          examples: analysis.examples,
          pronunciation: analysis.pronunciation
        });
      } catch (error) {
        console.error('Error analyzing word:', error);
        setSelectedWord({
          word: originalWord, // Keep original word with tashkeel
          translation: "Translation service unavailable",
          grammar: "Grammar analysis unavailable",
          position: { x: rect.left + rect.width / 2, y: rect.top }
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // Create enhanced content processing function
  const makeWordsClickable = (content: string): string => {
    const processedContent = tashkeelEnabled ? content : content.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    
    // Create a temporary div to parse HTML properly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedContent;
    
    // Process all text nodes to make Arabic words clickable
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent && /[\u0600-\u06FF]/.test(node.textContent)) {
        textNodes.push(node as Text);
      }
    }
    
    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const words = text.split(/(\s+)/);
      
      if (words.length > 1) {
        const fragment = document.createDocumentFragment();
        
        words.forEach(word => {
          if (word.trim() && /[\u0600-\u06FF]/.test(word)) {
            const span = document.createElement('span');
            span.className = 'clickable-word cursor-pointer hover:bg-purple-100 px-1 rounded transition-colors';
            span.setAttribute('data-word', word.trim());
            span.textContent = word;
            fragment.appendChild(span);
          } else {
            fragment.appendChild(document.createTextNode(word));
          }
        });
        
        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    });
    
    return tempDiv.innerHTML;
  };

  // Auto-translate sentences using OpenAI
  const translateArabicSentences = async (content: string): Promise<string> => {
    // Split content into sentences
    const sentences = content.split(/[.!?۔]+/).filter(s => s.trim() && /[\u0600-\u06FF]/.test(s));
    let processedContent = content;
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence) {
        try {
          const analysis = await analyzeArabicWord(trimmedSentence);
          const translation = analysis.translation;
          
          // Replace the sentence with a formatted version including translation
          const sentencePattern = new RegExp(trimmedSentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          processedContent = processedContent.replace(sentencePattern, 
            `<div class="sentence-block mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <div class="arabic-text text-lg leading-relaxed mb-2" dir="rtl">${trimmedSentence}</div>
              <div class="translation-text text-sm text-gray-600 italic">${translation}</div>
            </div>`
          );
        } catch (error) {
          console.error('Translation error for sentence:', trimmedSentence, error);
        }
      }
    }
    
    return processedContent;
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
                      className="leading-relaxed space-y-4" 
                      onClick={handleContentClick}
                    >
                      {selectedBook && currentBookPages[currentPage] && (
                        <BookContent 
                          content={currentBookPages[currentPage]} 
                          tashkeelEnabled={tashkeelEnabled}
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
          examples={selectedWord.examples}
          pronunciation={selectedWord.pronunciation}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}
