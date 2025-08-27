import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Volume2, ChevronLeft, ChevronRight, BookOpen, ToggleLeft, ToggleRight } from "lucide-react";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent, type Book } from "@/contexts/ContentContext";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import WordModal from "@/components/WordModal";
import QiratuRashidaPages from "@/components/QiratuRashidaPages";
import QasasAlAnbiyaPages from "@/components/QasasAlAnbiyaPages";
import QasasAlAnbiyaPart2Pages from "@/components/QasasAlAnbiyaPart2Pages";
import MinAkhlaqPages from "@/components/MinAkhlaqPages";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReminder } from "@/contexts/ReminderContext";

interface SelectedWord {
  word: string;
  translation: string;
  grammar: string;
  position: { x: number; y: number };
}

export default function BookReader() {
  const { tashkeelEnabled, toggleTashkeel } = useTashkeel();
  const { books, fetchTranslation } = useContent();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { strings } = useLanguage();
  const { studySessionStarted, studySessionEnded } = useReminder();
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [interlinearEnabled, setInterlinearEnabled] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("alle");
  const [searchQuery, setSearchQuery] = useState("");

  // Track when user leaves the book reader
  useEffect(() => {
    return () => {
      if (selectedBook) {
        studySessionEnded();
      }
    };
  }, [selectedBook, studySessionEnded]);

  // Book library data with progress and difficulty levels
  const bookLibrary = [
    {
      id: 1,
      title: "قصص الأنبياء",
      author: "من التراث الإسلامي", 
      level: "mittelstufe",
      progress: 75,
      status: "in-bearbeitung",
      wordCount: 28,
      description: "Geschichten der Propheten Ibrahim und Yusuf"
    },
    {
      id: 2, 
      title: "قراءة الراشدة",
      author: "من المنهج التقليدي",
      level: "anfänger", 
      progress: 100,
      status: "abgeschlossen",
      wordCount: 32,
      description: "Klassisches arabisches Lesebuch für Anfänger"
    },
    {
      id: 3,
      title: "قصص الأنبياء - الجزء الثاني",
      author: "من التراث الإسلامي",
      level: "mittelstufe",
      progress: 0,
      status: "bereit", 
      wordCount: 0,
      description: "Weitere Prophetengeschichten - Musa, Isa und andere Propheten"
    },
    {
      id: 4,
      title: "مدن الملوك", 
      author: "عبد الرحمن منيف",
      level: "mittelstufe",
      progress: 100,
      status: "abgeschlossen", 
      wordCount: 32,
      description: "Moderne arabische Literatur"
    },
    {
      id: 4,
      title: "من أخلاق الرسول",
      author: "عبد المحسن العباد البدر",
      level: "mittelstufe",
      progress: 0,
      status: "bereit",
      wordCount: 0,
      description: "Über die edlen Charaktereigenschaften des Propheten Muhammad"
    },
    {
      id: 5,
      title: "موسم الهجرة إلى الشمال",
      author: "الطيب صالح", 
      level: "fortgeschritten",
      progress: 50,
      status: "in-bearbeitung",
      wordCount: 28,
      description: "Klassiker der arabischen Moderne"
    }
  ];

  const filteredBooks = bookLibrary.filter(book => {
    const matchesFilter = selectedFilter === "alle" || book.level === selectedFilter;
    const matchesSearch = searchQuery === "" || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch(level) {
      case "anfänger": return "bg-green-100 text-green-800 border-green-200";
      case "mittelstufe": return "bg-orange-100 text-orange-800 border-orange-200"; 
      case "fortgeschritten": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-600";
    if (progress >= 50) return "bg-blue-600";
    return "bg-gray-600";
  };

  const handleContentClick = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-word') || target.classList.contains('word')) {
      const word = target.getAttribute('data-word') || target.textContent;
      if (word) {
        const cleanedWord = word.replace(/[،؟!.:]/g, '');
        const rect = target.getBoundingClientRect();
        
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
          const translation = await fetchTranslation(cleanedWord);
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

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    toast({
      title: strings.addedToFlashcards,
      description: `"${word}" ${strings.wordAdded}`
    });
    setSelectedWord(null);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Modern Book Library Interface */}
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Filter Section */}
        {!selectedBook && (
          <>
            <Card className="mb-8 shadow-sm border-0">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    {[
                      { key: "alle", label: "Alle" },
                      { key: "anfänger", label: "Anfänger" }, 
                      { key: "mittelstufe", label: "Mittelstufe" },
                      { key: "fortgeschritten", label: "Fortgeschritten" }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setSelectedFilter(filter.key)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                          selectedFilter === filter.key
                            ? "bg-black text-white shadow-lg"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filteredBooks.map((book) => (
                <Card 
                  key={book.id} 
                  className="shadow-sm border-0 hover:shadow-lg transition-all cursor-pointer bg-white"
                  onClick={() => {
                    const matchingBook = books.find(b => b.id === book.id);
                    if (matchingBook) {
                      setSelectedBook(matchingBook);
                      setCurrentPage(0);
                      studySessionStarted(); // Track study session
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Book Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
                              {book.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              von {book.author}
                            </p>
                          </div>
                          
                          {/* Level Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(book.level)}`}>
                            {book.level}
                          </span>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">
                                Fortschritt: {book.progress}%
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                book.status === "abgeschlossen" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                              }`}>
                                {book.status === "abgeschlossen" ? "Abgeschlossen" : "In Bearbeitung"}
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${getProgressColor(book.progress)}`}
                                style={{ width: `${book.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{book.wordCount} Wörter ca.</span>
                            <span>{book.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Reading Area - Only show when book is selected */}
        {selectedBook && (
          <Card className="shadow-sm border-0">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedBook(null)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Zurück zur Bibliothek
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedBook.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {bookLibrary.find(b => b.id === selectedBook.id)?.author}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Tashkeel Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTashkeel()}
                    className="flex items-center gap-2"
                  >
                    {tashkeelEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {tashkeelEnabled ? strings.tashkeelOn : strings.tashkeelOff}
                  </Button>

                  {/* Interlinear Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInterlinearEnabled(!interlinearEnabled)}
                    className="flex items-center gap-2"
                  >
                    {interlinearEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {interlinearEnabled ? strings.interlinearOn : strings.interlinearOff}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="max-w-4xl mx-auto">
                {selectedBook.id === 1 && (
                  <QasasAlAnbiyaPages onWordClick={handleContentClick} />
                )}
                {selectedBook.id === 2 && (
                  <QiratuRashidaPages />
                )}
                {selectedBook.id === 3 && (
                  <QasasAlAnbiyaPart2Pages onWordClick={handleContentClick} />
                )}
                {selectedBook.id === 4 && (
                  <MinAkhlaqPages onWordClick={handleContentClick} />
                )}
                {![1, 2, 3, 4].includes(selectedBook.id) && (
                  <div className="min-h-[600px] p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl leading-relaxed text-lg text-right">
                    <p className="text-gray-600 text-center">Dieser Buchinhalt wird bald verfügbar sein.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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