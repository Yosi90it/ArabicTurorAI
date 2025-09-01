import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Bot, MessageCircle, Target, BookOpen, ArrowLeft, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Link } from "wouter";
import VoiceChatComponent from "@/components/VoiceChatComponent";
import { recordClip, transcribe, voiceChat, tts } from "@/lib/voice";
// Removed unused imports

interface Message {
  id: number;
  sender: "ME" | "AI";
  arabic: string;
  translation: string;
}

export default function AiChat() {
  const { toast } = useToast();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice Pipeline state
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking'>('idle');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(5);
  const [isCallActive, setIsCallActive] = useState(false);

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

  // Suggestions
  const suggestions = [
    "كيف حالك؟",
    "ما اسمك؟", 
    "من أين أنت؟",
    "ماذا تفعل؟",
    "كم عمرك؟",
    "هل تتكلم العربية؟"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, practiceMessages]);

  // Simplified for now - no complex practice logic needed for voice testing

  const getWordsFromLastDays = (days: number) => {
    // Mock data for demo - in real app this would use actual flashcards
    return [];
  };

  const getWordsByDateGroup = () => {
    return { today: [], yesterday: [], dayBeforeYesterday: [] };
  };

  // Voice Pipeline Functions - Continuous Phone Call
  const handleVoiceInput = async () => {
    console.log('Voice input clicked, current state:', isCallActive);
    try {
      if (!isCallActive) {
        // Test microphone permission first
        console.log('Testing microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');
        stream.getTracks().forEach(track => track.stop()); // Clean up test stream
        
        // Start call
        console.log('Starting continuous call...');
        setIsCallActive(true);
        setVoiceState('recording');
        await startContinuousCall();
      } else {
        // End call
        console.log('Ending call...');
        setIsCallActive(false);
        setVoiceState('idle');
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
      setVoiceState('idle');
    }
  };

  const startContinuousCall = async () => {
    console.log('startContinuousCall called, isCallActive:', isCallActive);
    try {
      // Stop any playing audio
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      toast({
        title: "📞 Anruf aktiv",
        description: "Sprechen Sie jetzt, wir hören zu...",
      });
      
      console.log('Entering conversation loop...');
      while (isCallActive) {
        console.log('Loop iteration, isCallActive:', isCallActive);
        if (!isCallActive) break; // Double check for loop exit
        try {
          console.log('Starting voice recording...');
          setVoiceState('recording');
          const audioBlob = await recordClip(5); // 5 seconds recording chunks
          console.log('Audio recorded, blob size:', audioBlob.size);
          
          if (!isCallActive) break; // Exit if call ended during recording
          
          setVoiceState('transcribing');
          console.log('Sending audio for transcription...');
          const transcription = await transcribe(audioBlob, 5000);
          console.log('Transcription result:', transcription);
          
          if (!transcription.text.trim()) {
            console.log('No speech detected, continuing...');
            // No speech detected, continue listening
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
          
          // Add user message
          const userMessage: Message = {
            id: messages.length + 1,
            sender: "ME",
            arabic: transcription.text,
            translation: transcription.text
          };
          setMessages(prev => [...prev, userMessage]);
          
          setVoiceState('thinking');
          console.log('Sending message to chat:', transcription.text);
          const chatResponse = await voiceChat(transcription.text);
          console.log('Chat response received:', chatResponse);
          
          // Add AI response
          const aiMessage: Message = {
            id: messages.length + 2,
            sender: "AI", 
            arabic: chatResponse.response,
            translation: chatResponse.response
          };
          setMessages(prev => [...prev, aiMessage]);
          
          setVoiceState('speaking');
          console.log('Generating TTS for:', chatResponse.response);
          
          const ttsBlob = await tts(chatResponse.response);
          console.log('TTS generated, blob size:', ttsBlob.size);
          
          // Play TTS response
          const url = URL.createObjectURL(ttsBlob);
          const audio = new Audio(url);
          setAudioElement(audio);
          
          await audio.play();
          
          // Wait for audio to finish before continuing to listen
          await new Promise(resolve => {
            audio.onended = resolve;
          });
          
          // Continue the conversation loop
          await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
          
        } catch (error: any) {
          console.error("Voice pipeline error:", error);
          toast({
            title: "❌ Fehler im Gespräch",
            description: `${error.message || 'Unbekannter Fehler'}`,
            variant: "destructive"
          });
          // Continue listening even if there's an error
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
    } catch (error: any) {
      console.error("Continuous call error:", error);
      toast({
        title: "Fehler im Sprachchat",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
      setIsCallActive(false);
      setVoiceState('idle');
    }
  };

  const getVoiceButtonText = () => {
    if (!isCallActive) return '';
    switch (voiceState) {
      case 'recording': return '📞 Zuhören aktiv...';
      case 'transcribing': return '🔄 Verarbeitung...';
      case 'thinking': return '🤔 KI denkt nach...';
      case 'speaking': return '🗣️ KI spricht...';
      default: return '📞 Anruf aktiv...';
    }
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const result = await response.json();

      const aiMessage: Message = {
        id: messages.length + 2,
        sender: "AI",
        arabic: result.arabic || result.response,
        translation: result.translation || result.response
      };
      setMessages(prev => [...prev, aiMessage]);
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

              {/* Voice State Display */}
              {getVoiceButtonText() && (
                <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-700 font-medium">{getVoiceButtonText()}</div>
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
                        <div className="font-medium text-lg mb-1" dir="rtl" lang="ar">
                          {message.arabic}
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
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <VoiceChatComponent 
                onSendMessage={handleSend}
                isLoading={isLoading}
                input={input}
                setInput={setInput}
                onVoiceInput={handleVoiceInput}
                voiceState={voiceState}
                voiceStateText={getVoiceButtonText()}
                recordingDuration={recordingDuration}
              />
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
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                const dayBeforeYesterday = new Date(Date.now() - 172800000).toDateString();

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
                                {card.arabic} - {card.translation}
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
                                {card.arabic} - {card.translation}
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
                                {card.arabic} - {card.translation}
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
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div ref={messagesEndRef} />
    </div>
  );
}