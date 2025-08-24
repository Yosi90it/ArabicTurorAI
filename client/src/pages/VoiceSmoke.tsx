import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Play, Square, Volume2 } from 'lucide-react';

interface ApiResponse {
  text?: string;
  response?: string;
  error?: string;
  dailyUsage?: number;
  dailyLimit?: number;
}

export default function VoiceSmoke() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [chatResponse, setChatResponse] = useState<string>('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [responseAudio, setResponseAudio] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        addLog(`Aufnahme beendet. Größe: ${audioBlob.size} bytes`);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      addLog('Aufnahme gestartet...');
      
      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 3000);
      
    } catch (error) {
      addLog(`Fehler beim Starten der Aufnahme: ${error}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoicePipeline = async () => {
    if (!audioBlob) {
      addLog('Keine Audiodatei vorhanden');
      return;
    }

    setIsProcessing(true);
    setTranscription('');
    setChatResponse('');
    setResponseAudio('');

    try {
      // Step 1: Transcribe
      addLog('Schritt 1: Transkription...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      formData.append('durationMs', '3000');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const transcribeData: ApiResponse = await transcribeResponse.json();
      
      if (!transcribeResponse.ok) {
        throw new Error(transcribeData.error || 'Transkription fehlgeschlagen');
      }

      const transcribedText = transcribeData.text || '';
      setTranscription(transcribedText);
      addLog(`Transkription: "${transcribedText}"`);

      // Step 2: Chat
      addLog('Schritt 2: KI-Chat...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcribedText })
      });

      const chatData: ApiResponse = await chatResponse.json();
      
      if (!chatResponse.ok) {
        throw new Error(chatData.error || 'Chat fehlgeschlagen');
      }

      const responseText = chatData.response || '';
      setChatResponse(responseText);
      addLog(`KI-Antwort: "${responseText}"`);

      // Step 3: TTS
      addLog('Schritt 3: Text-zu-Sprache...');
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: responseText })
      });

      if (!ttsResponse.ok) {
        const ttsError = await ttsResponse.json();
        throw new Error(ttsError.error || 'TTS fehlgeschlagen');
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setResponseAudio(audioUrl);
      addLog('Audio-Antwort generiert');

    } catch (error) {
      addLog(`Fehler: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const playResponseAudio = () => {
    if (audioRef.current && responseAudio) {
      audioRef.current.play();
    }
  };

  const testHealthEndpoint = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      addLog(`Health Check: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`Health Check Fehler: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-6 h-6" />
            Voice Pipeline Smoke Test
          </CardTitle>
          <CardDescription>
            Test der kompletten Voice-Pipeline: Aufnahme → Transkription → Chat → TTS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Recording Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Aufnahme (3 Sekunden)</h3>
            <div className="flex gap-2">
              <Button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? 'Aufnahme läuft...' : 'Aufnahme starten'}
              </Button>
              
              {isRecording && (
                <Button onClick={stopRecording} variant="outline">
                  Stop
                </Button>
              )}
              
              <Button onClick={testHealthEndpoint} variant="outline">
                Health Check
              </Button>
            </div>
            
            {audioBlob && (
              <div className="text-sm text-green-600">
                ✓ Audio aufgenommen ({audioBlob.size} bytes)
              </div>
            )}
          </div>

          {/* Pipeline Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Voice Pipeline</h3>
            <Button
              onClick={processVoicePipeline}
              disabled={!audioBlob || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? 'Verarbeitung läuft...' : 'Pipeline starten'}
            </Button>
          </div>

          {/* Results Section */}
          {(transcription || chatResponse) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Ergebnisse</h3>
              
              {transcription && (
                <div className="p-3 bg-blue-50 rounded">
                  <strong>Transkription:</strong> {transcription}
                </div>
              )}
              
              {chatResponse && (
                <div className="p-3 bg-green-50 rounded">
                  <strong>KI-Antwort:</strong> {chatResponse}
                </div>
              )}
              
              {responseAudio && (
                <div className="flex items-center gap-2">
                  <Button onClick={playResponseAudio} variant="outline" className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Audio abspielen
                  </Button>
                  <audio ref={audioRef} src={responseAudio} />
                </div>
              )}
            </div>
          )}

          {/* Logs Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Logs</h3>
            <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Keine Logs...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}