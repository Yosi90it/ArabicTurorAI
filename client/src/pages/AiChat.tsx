import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bot, MessageCircle, Target, BookOpen, ArrowLeft, Send, Loader2, Phone, PhoneOff, Plus, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/hooks/useTashkeel";
import { ContinuousVoiceChat } from "@/lib/voiceChat";

interface Message {
  id: number;
  sender: "ME" | "AI";
  arabic: string;
  translation: string;
}

interface WordInfo {
  word: string;
  translation: string;
  grammar: string;
  position: { x: number; y: number };
  examples?: string[];
  pronunciation?: string;
}

export default function AiChat() {
  const { toast } = useToast();
  const { addFlashcard } = useFlashcards();
  const { updateProgress } = useSimpleGamification();
  const { strings } = useLanguage();
  const { showTashkeel, toggleTashkeel, removeTashkeel } = useTashkeel();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Word analysis state
  const [selectedWord, setSelectedWord] = useState<WordInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voice Pipeline state - using new VAD system
  const [voiceStatus, setVoiceStatus] = useState<string>('Bereit');
  const [isCallActive, setIsCallActive] = useState(false);
  const [voiceChat, setVoiceChat] = useState<ContinuousVoiceChat | null>(null);

  // Practice mode state
  const [practiceMessages, setPracticeMessages] = useState<Message[]>([]);
  const [practiceInput, setPracticeInput] = useState("");
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentChallengeWords, setCurrentChallengeWords] = useState<{
    word: string;
    translation: string;
    grammar: string;
  }[]>([]);
  const [practiceStarted, setPracticeStarted] = useState(false);

  // Suggestions with complete tashkeel for all words
  const suggestions = [
    "كَيْفَ حَالُكَ الْيَوْمَ؟",
    "مَا اسْمُكَ الْكَرِيمُ؟", 
    "مِنْ أَيْنَ أَنْتَ قَادِمٌ؟",
    "مَاذَا تَفْعَلُ فِي وَقْتِ الْفَرَاغِ؟",
    "كَمْ عُمْرُكَ الآنَ؟",
    "هَلْ تَتَكَلَّمُ الْعَرَبِيَّةَ بِطَلَاقَةٍ؟"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, practiceMessages]);

  // Load challenge words when starting practice
  useEffect(() => {
    if (practiceStarted && currentChallengeWords.length === 0) {
      const recentWords = getWordsFromLastDays(3);
      setCurrentChallengeWords(recentWords);
    }
  }, [practiceStarted]);

  const getWordsFromLastDays = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const allFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    return allFlashcards
      .filter((card: any) => new Date(card.dateAdded) >= cutoffDate)
      .map((card: any) => ({
        word: card.arabic,
        translation: card.translation,
        grammar: card.grammar || 'noun'
      }));
  };

  const getWordsByDateGroup = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const dayBeforeYesterday = new Date(Date.now() - 172800000).toDateString();
    
    const allFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    
    const groups = {
      today: allFlashcards.filter((card: any) => new Date(card.dateAdded).toDateString() === today),
      yesterday: allFlashcards.filter((card: any) => new Date(card.dateAdded).toDateString() === yesterday),
      dayBeforeYesterday: allFlashcards.filter((card: any) => new Date(card.dateAdded).toDateString() === dayBeforeYesterday)
    };
    
    return groups;
  };

  // Initialize voice chat with VAD
  useEffect(() => {
    const chat = new ContinuousVoiceChat({
      onStatusChange: (status) => setVoiceStatus(status),
      onMessage: (message) => {
        const newMessage: Message = {
          id: messages.length + 1,
          sender: message.sender === 'user' ? "ME" : "AI",
          arabic: message.text,
          translation: message.text
        };
        setMessages(prev => [...prev, newMessage]);
      },
      onError: (error) => {
        toast({
          title: "Voice Chat Fehler",
          description: error,
          variant: "destructive"
        });
      }
    });
    setVoiceChat(chat);
    
    return () => {
      chat.stopConversation();
    };
  }, []);

  // Voice Pipeline Functions - Using VAD system
  const handleVoiceInput = async () => {
    console.log('Voice input clicked, current state:', isCallActive);
    try {
      if (!isCallActive && voiceChat) {
        console.log('Starting VAD voice chat...');
        setIsCallActive(true);
        await voiceChat.startConversation();
        toast({
          title: "📞 Anruf aktiv",
          description: "VAD-System aktiviert - Sprechen Sie natürlich!",
        });
      } else if (voiceChat) {
        console.log('Stopping VAD voice chat...');
        setIsCallActive(false);
        voiceChat.stopConversation();
        toast({
          title: "📞 Anruf beendet",
          description: "Gespräch wurde beendet.",
        });
      }
    } catch (error: any) {
      console.error('Voice input error:', error);
      toast({
        title: "❌ Mikrofon-Fehler",
        description: `Fehler beim Zugriff auf das Mikrofon: ${error.message}`,
        variant: "destructive"
      });
      setIsCallActive(false);
    }
  };

  // Word Analysis Functions
  const analyzeWord = async (word: string, event: React.MouseEvent) => {
    const rect = (event.target as Element).getBoundingClientRect();
    setSelectedWord({
      word,
      translation: "Lade...",
      grammar: "Analysiere...",
      position: { x: rect.left, y: rect.bottom }
    });
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ word })
      });

      const result = await response.json();
      
      if (response.ok) {
        setSelectedWord({
          word,
          translation: result.translation || "Keine Übersetzung verfügbar",
          grammar: result.grammar || "Unbekannt",
          position: { x: rect.left, y: rect.bottom },
          examples: result.examples || [],
          pronunciation: result.pronunciation || ""
        });
      } else {
        setSelectedWord({
          word,
          translation: "Fehler beim Laden",
          grammar: "Unbekannt", 
          position: { x: rect.left, y: rect.bottom }
        });
      }
    } catch (error) {
      console.error("Word analysis error:", error);
      setSelectedWord({
        word,
        translation: "Fehler beim Laden",
        grammar: "Unbekannt",
        position: { x: rect.left, y: rect.bottom }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToFlashcards = () => {
    if (selectedWord) {
      addFlashcard(selectedWord.word, selectedWord.translation, selectedWord.grammar);
      updateProgress('word', { word: selectedWord.word });
      toast({
        title: "Wort hinzugefügt!",
        description: `"${selectedWord.word}" wurde zu deinen Lernkarten hinzugefügt.`,
      });
      setSelectedWord(null);
    }
  };

  const renderArabicText = (text: string) => {
    // Apply tashkeel toggle
    const displayText = removeTashkeel(text);
    
    // Split by spaces and render each word as clickable
    const words = displayText.trim().split(/\s+/);
    return (
      <div className="inline" dir="rtl" lang="ar">
        {words.map((word, index) => (
          <span key={index}>
            <span
              className="hover:bg-yellow-100 cursor-pointer transition-colors duration-200 px-1 rounded"
              onClick={(e) => analyzeWord(word, e)}
            >
              {word}
            </span>
            {index < words.length - 1 && " "}
          </span>
        ))}
      </div>
    );
  };

  const handleSend = async (message: string = input) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      id: messages.length + 1,
      sender: "ME",
      arabic: message,
      translation: message
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/voice/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          message,
          useFullTashkeel: true // Request complete tashkeel from AI
        })
      });

      const result = await response.json();

      const aiMessage: Message = {
        id: messages.length + 2,
        sender: "AI",
        arabic: result.response || result.arabic || "عَذْراً، لَمْ أَتَمَكَّنْ مِنْ فَهْمِ رِسَالَتِكَ.",
        translation: result.translation || result.response || "Sorry, I couldn't understand your message."
      };
      setMessages(prev => [...prev, aiMessage]);
      updateProgress('chat');
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  const handlePracticeMessage = async (message: string) => {
    if (!message.trim() || isPracticeLoading) return;

    setIsPracticeLoading(true);
    const userMessage: Message = {
      id: practiceMessages.length + 1,
      sender: "ME",
      arabic: message,
      translation: message
    };
    setPracticeMessages(prev => [...prev, userMessage]);
    setPracticeInput("");

    try {
      // Check which words from the challenge were used
      const wordsUsedInMessage = currentChallengeWords.filter(w => 
        message.includes(w.word)
      ).map(w => w.word);

      const newlyUsedWords = wordsUsedInMessage.filter(word => !usedWords.has(word));
      
      if (newlyUsedWords.length > 0) {
        setUsedWords(prev => new Set([...prev, ...newlyUsedWords]));
      }

      const totalWordsToUse = currentChallengeWords.length;
      const totalWordsUsed = usedWords.size + newlyUsedWords.length;
      const remainingWords = currentChallengeWords.filter(w => !usedWords.has(w.word) && !newlyUsedWords.includes(w.word));

      const response = await fetch("/api/voice/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          message,
          context: "practice",
          challengeWords: currentChallengeWords,
          usedWords: [...usedWords],
          newlyUsedWords
        })
      });

      const result = await response.json();
      
      const aiResponse: Message = {
        id: practiceMessages.length + 2,
        sender: "AI",
        arabic: result.response || "عذراً، لم أتمكن من فهم رسالتك.",
        translation: result.translation || "Sorry, I couldn't understand your message."
      };
      
      setPracticeMessages(prev => [...prev, aiResponse]);

      // Award points based on words used
      if (newlyUsedWords.length > 0) {
        const basePoints = 10 * newlyUsedWords.length;
        const bonusPoints = newlyUsedWords.length > 1 ? 10 : 0; // Bonus for using multiple words
        updateProgress('chat');
        newlyUsedWords.forEach(word => updateProgress('word', { word }));
        
        toast({
          title: `Excellent! +${basePoints + bonusPoints} Punkte`,
          description: `Du hast ${newlyUsedWords.length} neue Wörter verwendet: ${newlyUsedWords.join(', ')}`,
        });
      } else if (wordsUsedInMessage.length > 0) {
        updateProgress('chat');
        toast({
          title: "Gut gemacht! +10 Punkte",
          description: `Du wiederholst erfolgreich: ${wordsUsedInMessage.join(', ')}`,
        });
      } else {
        updateProgress('chat');
      }
      
    } catch (error: any) {
      console.error("Practice error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsPracticeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KI Chat Assistent</h1>
            <p className="text-gray-600">Üben Sie Arabisch mit unserem intelligenten KI-Tutor</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chat" className="max-w-4xl mx-auto px-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat & Voice
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Wörter üben
          </TabsTrigger>
        </TabsList>

        {/* Regular Chat Tab */}
        <TabsContent value="chat">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Intelligenter Chat-Assistent
                </CardTitle>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Voice Chat Toggle */}
              <div className="mb-6 flex justify-center">
                <Button
                  onClick={handleVoiceInput}
                  variant={isCallActive ? "destructive" : "default"}
                  size="lg"
                  className={`${isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {isCallActive ? (
                    <>
                      <PhoneOff className="w-5 h-5 mr-2" />
                      Anruf beenden
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Anruf starten
                    </>
                  )}
                </Button>
              </div>

              {/* Tashkeel Toggle */}
              <div className="mb-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  {showTashkeel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">Tashkeel anzeigen</span>
                  <Switch
                    checked={showTashkeel}
                    onCheckedChange={toggleTashkeel}
                  />
                </div>
              </div>

              {/* Voice Status Display */}
              {isCallActive && (
                <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-700 font-medium">{voiceStatus}</div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "ME" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.sender === "ME"
                            ? "bg-orange-500 text-white ml-4"
                            : "bg-white border border-gray-200 mr-4"
                        }`}
                      >
                        <div className="font-medium text-lg mb-1">
                          {renderArabicText(message.arabic)}
                        </div>
                        {message.translation && message.translation !== message.arabic && (
                          <div className="text-sm opacity-75">
                            {message.translation}
                          </div>
                        )}
                      </div>
                      
                      {message.sender === "AI" ? (
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">
                          AI
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
                          ME
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {messages.length === 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Try asking:</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-orange-50"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span dir="rtl" lang="ar">{removeTashkeel(suggestion)}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Text Input for Regular Chat */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message in Arabic..."
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={isLoading}
                  className="flex-1"
                  dir="rtl"
                />
                <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flashcard Practice Tab */}
        <TabsContent value="practice">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Wörter der letzten 3 Tage üben
                {practiceStarted && (
                  <Badge variant="secondary" className="ml-2">
                    {usedWords.size}/{currentChallengeWords.length} Wörter verwendet
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Üben Sie alle neu hinzugefügten Wörter der letzten 3 Tage in natürlichen Gesprächen
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {(() => {
                const recentWords = getWordsFromLastDays(3);
                const wordsByDate = getWordsByDateGroup();

                if (recentWords.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Keine neuen Wörter</h3>
                      <p className="text-gray-500 mb-6">
                        Du hast in den letzten 3 Tagen keine neuen Wörter zu deinen Lernkarten hinzugefügt.
                      </p>
                      <Link href="/book-reader">
                        <Button>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Bücher lesen und Wörter sammeln
                        </Button>
                      </Link>
                    </div>
                  );
                }

                if (!practiceStarted) {
                  return (
                    <div className="space-y-6">
                      {/* Word Overview by Date */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Neue Wörter nach Datum:</h4>
                        
                        {wordsByDate.today.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-2">Heute ({wordsByDate.today.length} Wörter)</h5>
                            <div className="flex flex-wrap gap-2">
                              {wordsByDate.today.map((card: any, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                  <span dir="rtl" lang="ar">{card.arabic}</span> - {card.translation}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {wordsByDate.yesterday.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2">Gestern ({wordsByDate.yesterday.length} Wörter)</h5>
                            <div className="flex flex-wrap gap-2">
                              {wordsByDate.yesterday.map((card: any, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                  <span dir="rtl" lang="ar">{card.arabic}</span> - {card.translation}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {wordsByDate.dayBeforeYesterday.length > 0 && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">Vorgestern ({wordsByDate.dayBeforeYesterday.length} Wörter)</h5>
                            <div className="flex flex-wrap gap-2">
                              {wordsByDate.dayBeforeYesterday.map((card: any, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                                  <span dir="rtl" lang="ar">{card.arabic}</span> - {card.translation}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Practice Button */}
                      <div className="text-center">
                        <Button 
                          onClick={() => setPracticeStarted(true)}
                          size="lg"
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Target className="w-5 h-5 mr-2" />
                          Alle {recentWords.length} Wörter üben
                        </Button>
                      </div>
                    </div>
                  );
                }

                // Practice mode active
                return (
                  <div className="space-y-6">
                    {/* Challenge Words Display */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-2">
                        Übungsfortschritt: {usedWords.size}/{currentChallengeWords.length} Wörter verwendet
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentChallengeWords.map((word, index) => (
                          <Badge 
                            key={index} 
                            variant={usedWords.has(word.word) ? "default" : "outline"}
                            className={usedWords.has(word.word) ? "bg-green-500 text-white" : ""}
                          >
                            <span dir="rtl" lang="ar">{word.word}</span> - {word.translation}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Practice Messages */}
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {practiceMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "ME" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.sender === "ME"
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <div className="font-medium">
                              {renderArabicText(message.arabic)}
                            </div>
                            {message.translation && message.translation !== message.arabic && (
                              <div className="text-sm opacity-75 mt-1">
                                {message.translation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Practice Input */}
                    <div className="flex gap-2">
                      <Input
                        value={practiceInput}
                        onChange={(e) => setPracticeInput(e.target.value)}
                        placeholder="Verwende die Übungswörter in einem arabischen Satz..."
                        onKeyPress={(e) => e.key === "Enter" && handlePracticeMessage(practiceInput)}
                        disabled={isPracticeLoading}
                        className="flex-1"
                        dir="rtl"
                      />
                      <Button 
                        onClick={() => handlePracticeMessage(practiceInput)} 
                        disabled={isPracticeLoading || !practiceInput.trim()}
                      >
                        {isPracticeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Word Analysis Popup */}
      {selectedWord && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm"
          style={{
            left: selectedWord.position.x,
            top: selectedWord.position.y + 10,
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg" dir="rtl" lang="ar">{selectedWord.word}</h3>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Übersetzung:</span>
                <p className="text-gray-800">{isAnalyzing ? "Lade..." : selectedWord.translation}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Grammatik:</span>
                <p className="text-gray-800">{isAnalyzing ? "Analysiere..." : selectedWord.grammar}</p>
              </div>
              
              {selectedWord.examples && selectedWord.examples.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Beispiele:</span>
                  <ul className="text-sm text-gray-700">
                    {selectedWord.examples.map((example, index) => (
                      <li key={index} dir="rtl" lang="ar">• {example}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <Button
              onClick={addToFlashcards}
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isAnalyzing}
            >
              <Plus className="w-4 h-4 mr-2" />
              Zu Lernkarten hinzufügen
            </Button>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}