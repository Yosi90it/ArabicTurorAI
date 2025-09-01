import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Phone } from "lucide-react";

interface VoiceChatProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  onVoiceInput?: () => void;
  voiceState?: 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
  voiceStateText?: string;
  recordingDuration?: number;
}

export default function VoiceChatComponent({ 
  onSendMessage, 
  isLoading, 
  input, 
  setInput, 
  onVoiceInput, 
  voiceState = 'idle', 
  voiceStateText,
  recordingDuration = 5
}: VoiceChatProps) {
  // Keep only synthesis for playing Arabic text
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech synthesis only
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  const speakText = (text: string, lang: string = 'ar-SA') => {
    if (!synthesis) return;
    
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    synthesis.speak(utterance);
  };

  // Exposed function for parent component to trigger speech
  useEffect(() => {
    (window as any).speakArabicText = speakText;
  }, [synthesis]);

  return (
    <>


      {/* Text Input with Voice Button */}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Nachricht eingeben oder Anruf starten..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage(input)}
          className="flex-1"
          disabled={isLoading}
        />
        {/* Voice Call Button */}
        {onVoiceInput && (
          <Button
            onClick={onVoiceInput}
            disabled={isLoading}
            variant={voiceState === 'idle' ? "outline" : "destructive"}
            className={`px-4 ${voiceState === 'speaking' ? 'bg-green-50 border-green-300' : ''}`}
            title={voiceState === 'idle' ? "Anruf starten" : "Anruf beenden"}
          >
            {voiceState === 'idle' ? (
              <Phone className="w-4 h-4 text-green-600" />
            ) : voiceState === 'recording' || voiceState === 'transcribing' || voiceState === 'thinking' || voiceState === 'speaking' ? (
              <Phone className="w-4 h-4 text-white" />
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
        <div className="text-sm text-center text-blue-600 mt-2 font-medium">
          {voiceStateText}
        </div>
      )}
    </>
  );
}