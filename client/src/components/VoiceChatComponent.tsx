import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, Mic, Settings } from "lucide-react";

interface VoiceChatProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  onVoiceInput?: () => void;
  voiceState?: 'idle' | 'recording' | 'transcribing' | 'thinking' | 'speaking';
  voiceStateText?: string;
  recordingDuration?: number;
  onRecordingDurationChange?: (duration: number) => void;
}

export default function VoiceChatComponent({ 
  onSendMessage, 
  isLoading, 
  input, 
  setInput, 
  onVoiceInput, 
  voiceState = 'idle', 
  voiceStateText,
  recordingDuration = 5,
  onRecordingDurationChange
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
      {/* Recording Duration Setting */}
      {onVoiceInput && onRecordingDurationChange && (
        <div className="flex items-center gap-2 mb-3 justify-center">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Aufnahmedauer:</span>
          <Select value={recordingDuration.toString()} onValueChange={(value) => onRecordingDurationChange(parseInt(value))}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3s</SelectItem>
              <SelectItem value="5">5s</SelectItem>
              <SelectItem value="8">8s</SelectItem>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="15">15s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Text Input with Voice Button */}
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Nachricht eingeben oder Mikrofon verwenden..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSendMessage(input)}
          className="flex-1"
          disabled={isLoading}
        />
        {/* Voice Input Button */}
        {onVoiceInput && (
          <Button
            onClick={onVoiceInput}
            disabled={isLoading || voiceState !== 'idle'}
            variant="outline"
            className="px-4"
            title={`${recordingDuration}-Sekunden Sprachaufnahme`}
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
        <div className="text-sm text-center text-blue-600 mt-2 font-medium">
          {voiceStateText}
        </div>
      )}
    </>
  );
}