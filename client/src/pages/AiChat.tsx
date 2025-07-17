import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useWordByWord } from "@/contexts/WordByWordContext";
import { Send, Bot, User, Volume2, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { analyzeArabicWord, type WordAnalysis } from "@/lib/openai";
import WordModal from "@/components/WordModal";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import OpenAI from "openai";

interface Message {
  id: number;
  sender: "AI" | "ME";
  arabic: string;
  translation: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "YOUR_API_KEY_HERE",
  dangerouslyAllowBrowser: true
});

export default function AiChat() {
  const { tashkeelEnabled } = useTashkeel();
  const { wordByWordEnabled } = useWordByWord();
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  
  // Define messages with both tashkeel and without
  const getDisplayText = (withTashkeel: string, withoutTashkeel: string) => {
    return tashkeelEnabled ? withTashkeel : withoutTashkeel;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
    examples?: string[];
    pronunciation?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    const newMessage: Message = {
      id: messages.length + 1,
      sender: "ME",
      arabic: userMessage,
      translation: ""
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert Arabic language teacher. Always respond in Arabic and provide English translations. 
            Format your response as JSON:
            {
              "arabic": "your Arabic response",
              "translation": "English translation of your response"
            }`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      const aiResponse: Message = {
        id: messages.length + 2,
        sender: "AI",
        arabic: result.arabic || "عذراً، لم أتمكن من فهم سؤالك.",
        translation: result.translation || "Sorry, I couldn't understand your question."
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Award points for sending a chat message
      updateProgress('chat');
      toast({
        title: "Chat-Nachricht gesendet! +10 Punkte",
        description: "Du lernst aktiv durch Gespräche!",
      });
    } catch (error) {
      console.error("OpenAI API error:", error);
      const errorResponse: Message = {
        id: messages.length + 2,
        sender: "AI",
        arabic: "عذراً، حدث خطأ في الخدمة.",
        translation: "Sorry, there was a service error."
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How do I say 'thank you'?",
    "Teach me basic greetings",
    "Explain Arabic verb conjugations",
    "What are common Arabic phrases?",
    "Help me with pronunciation"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    
    setSelectedWord({
      word: word,
      translation: "Analyzing...",
      grammar: "Getting grammar information...",
      position: { x: rect.left + rect.width / 2, y: rect.top }
    });
    
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeArabicWord(word);
      
      setSelectedWord({
        word: analysis.word,
        translation: analysis.translation,
        grammar: analysis.grammar,
        position: { x: rect.left + rect.width / 2, y: rect.top },
        examples: analysis.examples,
        pronunciation: analysis.pronunciation
      });
    } catch (error) {
      console.error('Error analyzing word:', error);
      setSelectedWord({
        word: word,
        translation: "Translation service unavailable",
        grammar: "Grammar analysis unavailable",
        position: { x: rect.left + rect.width / 2, y: rect.top }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      speechSynthesis.speak(utterance);
    }
  };

  const addWholePhrase = (arabic: string, translation: string) => {
    addFlashcard(arabic, translation, "Phrase");
    toast({
      title: "Phrase added to flashcards",
      description: `"${arabic}" has been added to your collection.`,
    });
  };

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    addFlashcard(word, translation, grammar);
    toast({
      title: "Word added to flashcards",
      description: `"${word}" has been added to your collection.`,
    });
    setSelectedWord(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Chat Assistant</h2>
        <p className="text-gray-600">Practice Arabic conversation with our intelligent AI tutor</p>
      </div>

      {/* Chat Interface */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="h-96 bg-soft-gray rounded-2xl p-4 mb-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "ME" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "AI" && (
                    <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center text-white text-sm font-bold">
                      AI
                    </div>
                  )}
                  
                  <div className={`max-w-md ${
                    message.sender === "ME" ? "bg-blue-600 text-white" : "bg-white border"
                  } rounded-2xl p-3 shadow-sm relative group`}>
                    <div className="text-lg font-medium mb-1" dir="rtl" style={{lineHeight: '2', fontFamily: 'Arial, sans-serif'}}>
                      {message.sender === "AI" ? (
                        // AI messages: clickable words with optional word-by-word translation
                        <div>
                          {(tashkeelEnabled ? message.arabic : message.arabic.replace(/[\u064B-\u065F\u0670\u0640]/g, '')).split(' ').map((word, wordIndex) => (
                            <span
                              key={wordIndex}
                              className="word-container"
                              style={{display: 'inline-block', margin: '0 2px', textAlign: 'center', verticalAlign: 'top'}}
                            >
                              <span
                                className="clickable-word cursor-pointer hover:bg-purple-100 px-1 rounded transition-colors"
                                onClick={(e) => handleWordClick(word, e)}
                                style={{display: 'block'}}
                              >
                                {word}
                              </span>
                              {wordByWordEnabled && (
                                <span className="word-translation text-xs text-blue-600 block mt-1" style={{fontSize: '10px', lineHeight: '1.2'}}>
                                  Loading...
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        // User messages: plain text, not clickable
                        tashkeelEnabled ? message.arabic : message.arabic.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
                      )}
                    </div>
                    <div className="text-sm opacity-80 mb-2">
                      {message.translation}
                    </div>
                    {message.sender === "AI" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => playAudio(message.arabic)}
                          className="h-6 px-2 text-xs"
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addWholePhrase(message.arabic, message.translation)}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Phrase
                        </Button>
                      </div>
                    )}
                  </div>

                  {message.sender === "ME" && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
                      ME
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Try asking:</h4>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-50"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Input area */}
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message in Arabic or English..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-2xl mb-2">💬</div>
            <CardTitle className="text-base mb-1">Practice Phrases</CardTitle>
            <p className="text-sm text-gray-600">Common Arabic expressions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-2xl mb-2">🎯</div>
            <CardTitle className="text-base mb-1">Grammar Tips</CardTitle>
            <p className="text-sm text-gray-600">Learn Arabic grammar rules</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <CardContent className="p-4">
            <div className="text-2xl mb-2">🔊</div>
            <CardTitle className="text-base mb-1">Pronunciation</CardTitle>
            <p className="text-sm text-gray-600">Perfect your Arabic accent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
