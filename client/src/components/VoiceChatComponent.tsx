import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Volume2, Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OpenAI from "openai";

interface VoiceChatProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  onVoiceInput?: () => void;
  voiceState?: 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
  voiceStateText?: string;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "YOUR_API_KEY_HERE",
  dangerouslyAllowBrowser: true
});

export default function VoiceChatComponent({ onSendMessage, isLoading, input, setInput, onVoiceInput, voiceState = 'idle', voiceStateText }: VoiceChatProps) {
  const { toast } = useToast();
  
  // Voice conversation state
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = 'ar-SA'; // Arabic language
        setRecognition(recognizer);
      }
      
      if (window.speechSynthesis) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  // Voice mode functions
  const startVoiceMode = async () => {
    if (!recognition || !synthesis) {
      toast({
        title: "Fehler",
        description: "Sprachfunktion wird von Ihrem Browser nicht unterstützt",
        variant: "destructive"
      });
      return;
    }

    setIsVoiceModeActive(true);
    
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
        onSendMessage(finalTranscript);
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

  // Exposed function for parent component to trigger speech
  useEffect(() => {
    (window as any).speakArabicText = speakText;
  }, [synthesis]);

  return (
    <>
      {/* Voice Mode Toggle */}
      <div className="flex justify-center mb-4">
        <Button
          onClick={isVoiceModeActive ? stopVoiceMode : startVoiceMode}
          className={`px-6 py-3 rounded-full ${
            isVoiceModeActive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isVoiceModeActive ? (
            <>
              <PhoneOff className="w-5 h-5 mr-2" />
              Gespräch beenden
            </>
          ) : (
            <>
              <Phone className="w-5 h-5 mr-2" />
              Sprachgespräch starten
            </>
          )}
        </Button>
      </div>

      {/* Voice Status */}
      {isVoiceModeActive && (
        <div className="flex justify-center items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-600">Hört zu...</span>
              </>
            ) : (
              <>
                <MicOff className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Bereit</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <>
                <Volume2 className="w-5 h-5 text-blue-500 animate-pulse" />
                <span className="text-sm font-medium text-blue-600">KI spricht...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Stille</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Text Input with Voice Button */}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder={isVoiceModeActive ? "Sprechen Sie oder tippen Sie..." : "Nachricht auf Arabisch oder Englisch..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage(input)}
          className="flex-1"
          disabled={isLoading}
        />
        {/* Voice Pipeline Button */}
        {onVoiceInput && (
          <Button
            onClick={onVoiceInput}
            disabled={isLoading || voiceState !== 'idle'}
            variant="outline"
            className="px-3"
            title="Voice input (5 seconds)"
          >
            {voiceState === 'idle' ? (
              <Mic className="w-4 h-4" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </Button>
        )}
        <Button 
          onClick={() => onSendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="px-6"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Voice State Indicator */}
      {voiceState !== 'idle' && (
        <div className="text-sm text-center text-gray-600 mt-2">
          {voiceStateText}
        </div>
      )}
    </>
  );
}