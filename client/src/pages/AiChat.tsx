import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useWordByWord } from "@/contexts/WordByWordContext";
import { Bot, User, Volume2, Loader2, Plus, BookOpen, Target, CheckCircle, ToggleLeft, ToggleRight, Send, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import VoiceChatComponent from "@/components/VoiceChatComponent";
import { Badge } from "@/components/ui/badge";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useToast } from "@/hooks/use-toast";
import { analyzeArabicWord, type WordAnalysis } from "@/lib/openai";
import WordModal from "@/components/WordModal";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import OpenAI from "openai";
import { recordClip, transcribe, chat as voiceChat, tts } from "@/lib/voice";

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
  const { tashkeelEnabled, toggleTashkeel, formatText } = useTashkeel();
  const { wordByWordEnabled } = useWordByWord();
  const { addFlashcard, userFlashcards, getWordsFromLastDays, getWordsByDateGroup } = useFlashcards();
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const { strings } = useLanguage();
  
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
  
  // Voice Pipeline state
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking'>('idle');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(5); // seconds
  

  
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



  // Voice mode functions
  const startVoiceMode = async () => {
    if (!recognition || !synthesis) {
      toast({
        title: strings.error || "Fehler",
        description: "Sprachfunktion wird von Ihrem Browser nicht unterstützt",
        variant: "destructive"
      });
      return;
    }

    setIsVoiceModeActive(true);
    setIsListening(true);
    
    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript.trim()) {
        setInput(finalTranscript);
        handleSend(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (isVoiceModeActive) {
        setTimeout(() => {
          recognition.start();
        }, 1000);
      }
    };

    recognition.start();
  };

  const stopVoiceMode = () => {
    setIsVoiceModeActive(false);
    setIsListening(false);
    setIsRecording(false);
    
    if (recognition) {
      recognition.stop();
    }
    
    if (synthesis) {
      synthesis.cancel();
    }
    
    setIsSpeaking(false);
  };

  const speakText = (text: string, lang: string = 'ar-SA') => {
    if (!synthesis) return;
    
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesis.speak(utterance);
  };

  const handleSend = async (voiceInput?: string) => {
    const messageText = voiceInput || input.trim();
    if (!messageText) return;

    setInput("");
    setIsLoading(true);

    const newMessage: Message = {
      id: messages.length + 1,
      sender: "ME",
      arabic: messageText,
      translation: ""
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a helpful Arabic tutor. Always respond in Arabic with English translations.
            Format your response as JSON:
            {
              "arabic": "your Arabic response",
              "translation": "English translation of your response"
            }`
          },
          ...messages.slice(-3).map(msg => ({
            role: msg.sender === "ME" ? "user" as const : "assistant" as const,
            content: msg.arabic
          })),
          {
            role: "user",
            content: messageText
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      const aiResponse: Message = {
        id: messages.length + 2,
        sender: "AI",
        arabic: result.arabic || "عذراً، لم أتمكن من فهم سؤالك.",
        translation: result.translation || "Sorry, I couldn't understand your question."
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Automatically speak AI response if in voice mode
      if (result.arabic && (window as any).speakArabicText) {
        (window as any).speakArabicText(result.arabic, 'ar-SA');
      }
      
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

  // Flashcard practice functions for last 3 days
  const startNewChallenge = () => {
    const recentWords = getWordsFromLastDays(3);
    
    if (recentWords.length === 0) {
      toast({
        title: "Keine neuen Wörter",
        description: "Sie haben in den letzten 3 Tagen keine neuen Wörter hinzugefügt. Fügen Sie Wörter aus dem Buchleser hinzu!",
        variant: "destructive"
      });
      return;
    }

    const challengeWords = recentWords.map(card => ({
      word: card.arabic,
      translation: card.translation,
      grammar: card.grammar || "noun"
    }));
    
    setCurrentChallengeWords(challengeWords);
    setPracticeStarted(true);
    setUsedWords(new Set()); // Reset used words for new session
    
    // AI suggests conversation starter with all recent words
    const wordList = challengeWords.map(w => `"${w.word}" (${w.translation})`).join(', ');
    const aiMessage: Message = {
      id: practiceMessages.length + 1,
      sender: "AI",
      arabic: `مرحباً! اليوم سنتدرب على الكلمات الجديدة من الأيام الثلاثة الماضية. الكلمات هي: ${challengeWords.map(w => w.word).join('، ')}. حاول أن تستخدم هذه الكلمات في محادثة طبيعية معي. ابدأ بسؤال أو جملة!`,
      translation: `Hello! Today we'll practice your new words from the last 3 days. The words are: ${wordList}. Try to use these words in natural conversation with me. Start with a question or sentence!`
    };
    
    setPracticeMessages([aiMessage]);
  };

  const getWordsUsedInMessage = (message: string): string[] => {
    return currentChallengeWords
      .filter(word => message.includes(word.word))
      .map(word => word.word);
  };

  const handlePracticeSend = async () => {
    if (!practiceInput.trim() || currentChallengeWords.length === 0) return;

    const userMessage = practiceInput.trim();
    setPracticeInput("");
    setIsPracticeLoading(true);

    const newMessage: Message = {
      id: practiceMessages.length + 1,
      sender: "ME",
      arabic: userMessage,
      translation: ""
    };
    setPracticeMessages(prev => [...prev, newMessage]);

    try {
      // Check which target words were used
      const wordsUsedInMessage = getWordsUsedInMessage(userMessage);
      const newlyUsedWords = wordsUsedInMessage.filter(word => !usedWords.has(word));
      
      // Update used words
      if (newlyUsedWords.length > 0) {
        setUsedWords(prev => new Set([...Array.from(prev), ...newlyUsedWords]));
      }

      const totalWordsToUse = currentChallengeWords.length;
      const totalWordsUsed = usedWords.size + newlyUsedWords.length;
      const remainingWords = currentChallengeWords.filter(w => !usedWords.has(w.word) && !newlyUsedWords.includes(w.word));
      
      // Call OpenAI API with practice context
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an Arabic conversation partner helping a student practice ${totalWordsToUse} new words: ${currentChallengeWords.map(w => `"${w.word}" (${w.translation})`).join(', ')}.
            
            Progress: ${totalWordsUsed}/${totalWordsToUse} words used successfully.
            ${newlyUsedWords.length > 0 ? 
              `Excellent! The student just used: ${newlyUsedWords.join(', ')}. Congratulate them!` :
              wordsUsedInMessage.length > 0 ?
              `Good! The student used words they've practiced before: ${wordsUsedInMessage.join(', ')}.` :
              `The student hasn't used any target words yet.`
            }
            ${remainingWords.length > 0 ? 
              `Still need to practice: ${remainingWords.map(w => w.word).join(', ')}. Gently encourage using these in natural conversation.` :
              `Amazing! All words have been practiced successfully!`
            }
            
            Always respond in Arabic naturally and provide English translations.
            Format your response as JSON:
            {
              "arabic": "your Arabic response",
              "translation": "English translation of your response"
            }`
          },
          ...practiceMessages.slice(-4).map(msg => ({
            role: msg.sender === "ME" ? "user" as const : "assistant" as const,
            content: msg.arabic
          })),
          {
            role: "user",
            content: messageText
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      const aiResponse: Message = {
        id: practiceMessages.length + 2,
        sender: "AI",
        arabic: result.arabic || "عذراً، لم أتمكن من فهم رسالتك.",
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
      
    } catch (error) {
      console.error("OpenAI API error:", error);
      const errorResponse: Message = {
        id: practiceMessages.length + 2,
        sender: "AI",
        arabic: "عذراً، حدث خطأ في الخدمة.",
        translation: "Sorry, there was a service error."
      };
      setPracticeMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsPracticeLoading(false);
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

  // Voice Pipeline Functions
  const handleVoiceInput = async () => {
    if (voiceState !== 'idle' && voiceState !== 'speaking') return;
    
    try {
      // Stop any playing audio
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      
      setVoiceState('recording');
      toast({
        title: "Aufnahme gestartet",
        description: `Sprechen Sie jetzt (${recordingDuration} Sekunden)...`,
      });
      
      const audioBlob = await recordClip(recordingDuration);
      
      setVoiceState('transcribing');
      toast({
        title: "Transkription läuft",
        description: "Ihre Sprache wird verarbeitet...",
      });
      
      const transcription = await transcribe(audioBlob, recordingDuration * 1000);
      
      if (!transcription.text.trim()) {
        toast({
          title: "Keine Sprache erkannt",
          description: "Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
        setVoiceState('idle');
        return;
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
      toast({
        title: "KI denkt nach",
        description: "Antwort wird generiert...",
      });
      
      const chatResponse = await voiceChat(transcription.text);
      
      // Add AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        sender: "AI", 
        arabic: chatResponse.response,
        translation: chatResponse.response
      };
      setMessages(prev => [...prev, aiMessage]);
      
      setVoiceState('speaking');
      toast({
        title: "Antwort wird gesprochen",
        description: "Audio wird generiert...",
      });
      
      const audioBlob2 = await tts(chatResponse.response);
      const audioUrl = URL.createObjectURL(audioBlob2);
      
      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      
      audio.onended = () => {
        setVoiceState('idle');
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
    } catch (error: any) {
      console.error('Voice pipeline error:', error);
      
      let errorMessage = "Ein Fehler ist aufgetreten";
      let errorDescription = "Bitte versuchen Sie es erneut";
      
      if (error.message?.includes('Daily usage limit exceeded')) {
        errorMessage = "Tageslimit erreicht";
        errorDescription = "Sie haben Ihr tägliches Sprachlimit erreicht";
      } else if (error.message?.includes('429')) {
        errorMessage = "Zu viele Anfragen";
        errorDescription = "Bitte warten Sie einen Moment";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
      
      setVoiceState('idle');
    }
  };

  const getVoiceButtonText = () => {
    switch (voiceState) {
      case 'recording': return 'Aufnahme läuft...';
      case 'transcribing': return 'Transkription...';
      case 'thinking': return 'KI denkt...';
      case 'speaking': return 'Spricht...';
      default: return '';
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

      <div className="mb-4 flex justify-between items-center">
        <Tabs defaultValue="general" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-2 bg-white rounded-xl p-1 shadow-sm border">
              <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg">
                <Bot className="w-4 h-4" />
                Allgemeiner Chat
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg">
                <Target className="w-4 h-4" />
                Wörter üben
              </TabsTrigger>
            </TabsList>
            
            {/* Tashkeel Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Tashkeel</span>
              <button
                onClick={toggleTashkeel}
                className="flex items-center"
                title="Tashkeel anzeigen/ausblenden"
              >
                {tashkeelEnabled ? (
                  <ToggleRight className="w-5 h-5 text-orange-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

        {/* General Chat Tab */}
        <TabsContent value="general" className="mt-6">
          <Card className="mb-6 border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="h-96 bg-gray-50 rounded-2xl p-4 mb-4 overflow-y-auto scrollbar-hide">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.sender === "ME" ? "justify-end" : ""
                      }`}
                    >
                      {message.sender === "AI" && (
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          AI
                        </div>
                      )}
                      
                      <div className={`max-w-md ${
                        message.sender === "ME" ? "bg-blue-600 text-white" : "bg-white border"
                      } rounded-2xl p-3 shadow-sm relative group`}>
                        <div className="text-lg font-medium mb-1" dir="rtl" style={{lineHeight: '2', fontFamily: 'Arial, sans-serif'}}>
                          {message.sender === "AI" ? (
                            <div>
                              {(tashkeelEnabled ? message.arabic : message.arabic.replace(/[\u064B-\u065F\u0670\u0640]/g, '')).split(' ').map((word, wordIndex) => (
                                <span
                                  key={wordIndex}
                                  className="word-container"
                                  style={{display: 'inline-block', margin: '0 2px', textAlign: 'center', verticalAlign: 'top'}}
                                >
                                  <span
                                    className="clickable-word cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors"
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
                      <p className="text-gray-500 mb-4">
                        Sie haben in den letzten 3 Tagen keine neuen Wörter hinzugefügt. Besuchen Sie den Buchleser und klicken Sie auf Wörter, um sie zu Ihren Karteikarten hinzuzufügen.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Practice Controls */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-800">Wörter der letzten 3 Tage</h4>
                          <div className="text-sm text-blue-600 space-y-1">
                            <div>Heute: {wordsByDate[today]?.length || 0} Wörter</div>
                            <div>Gestern: {wordsByDate[yesterday]?.length || 0} Wörter</div>
                            <div>Vorgestern: {wordsByDate[dayBeforeYesterday]?.length || 0} Wörter</div>
                            <div className="font-medium">Gesamt: {recentWords.length} Wörter</div>
                          </div>
                        </div>
                        <Button onClick={startNewChallenge} variant="outline" size="sm">
                          Übung starten
                        </Button>
                      </div>
                    </div>

                    {/* Show target words if practice started */}
                    {practiceStarted && currentChallengeWords.length > 0 && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Zu übende Wörter:</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentChallengeWords.map((word, index) => (
                            <Badge 
                              key={index} 
                              variant={usedWords.has(word.word) ? "default" : "outline"}
                              className={usedWords.has(word.word) ? "bg-green-600" : ""}
                            >
                              {usedWords.has(word.word) && <CheckCircle className="w-3 h-3 mr-1" />}
                              {word.word} ({word.translation})
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-green-600 mt-2">
                          Verwenden Sie diese Wörter in Ihrem Gespräch mit der KI
                        </p>
                      </div>
                    )}

                    {/* Chat area for practice */}
                    <div className="h-96 bg-gray-50 rounded-2xl p-4 mb-4 overflow-y-auto scrollbar-hide">
                      <div className="space-y-4">
                        {practiceMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              message.sender === "ME" ? "justify-end" : ""
                            }`}
                          >
                            {message.sender === "AI" && (
                              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                AI
                              </div>
                            )}
                            
                            <div className={`max-w-md ${
                              message.sender === "ME" ? "bg-blue-600 text-white" : "bg-white border"
                            } rounded-2xl p-3 shadow-sm`}>
                              <div className="text-lg font-medium mb-1" dir="rtl" style={{lineHeight: '2', fontFamily: 'Arial, sans-serif'}}>
                                {tashkeelEnabled ? message.arabic : message.arabic.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                              </div>
                              <div className="text-sm opacity-80">
                                {message.translation}
                              </div>
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

                    {/* Practice input */}
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder={practiceStarted ? 
                          "Verwenden Sie Ihre neuen Wörter in einem Satz oder einer Frage..." : 
                          "Starten Sie zuerst die Übung..."
                        }
                        value={practiceInput}
                        onChange={(e) => setPracticeInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handlePracticeSend()}
                        className="flex-1"
                        disabled={isPracticeLoading || !practiceStarted}
                      />
                      <Button 
                        onClick={handlePracticeSend}
                        disabled={isPracticeLoading || !practiceInput.trim() || !practiceStarted}
                        className="px-6"
                      >
                        {isPracticeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Progress indicator */}
                    {practiceStarted && currentChallengeWords.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Fortschritt: {usedWords.size} von {currentChallengeWords.length} Wörtern erfolgreich verwendet
                            {usedWords.size === currentChallengeWords.length && " 🎉 Alle Wörter gemeistert!"}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>

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