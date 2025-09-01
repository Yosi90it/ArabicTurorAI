// Continuous Voice Chat using VAD - based on working voice-loop.js
export class ContinuousVoiceChat {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  
  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private recordingStartTime = 0;
  
  // VAD (Voice Activity Detection)
  private vadThreshold = 0.02;
  private silenceTimeout = 700; // ms
  private minRecordingLength = 1000; // ms
  private lastSpeechTime = 0;
  private silenceTimer: NodeJS.Timeout | null = null;
  private isListening = false;
  
  // Conversation state
  private isActive = false;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;
  
  // Callbacks
  private onStatusChange?: (status: string) => void;
  private onMessage?: (message: { sender: 'user' | 'ai', text: string, audio?: string }) => void;
  private onError?: (error: string) => void;

  constructor(callbacks: {
    onStatusChange?: (status: string) => void;
    onMessage?: (message: { sender: 'user' | 'ai', text: string, audio?: string }) => void;
    onError?: (error: string) => void;
  } = {}) {
    this.onStatusChange = callbacks.onStatusChange;
    this.onMessage = callbacks.onMessage;
    this.onError = callbacks.onError;
  }

  async startConversation() {
    try {
      console.log('Starting conversation...');
      this.updateStatus('Mikrofonzugang anfordern...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      this.setupAudioContext(stream);
      this.isActive = true;
      this.updateStatus('Bereit - Sprechen Sie!');
      this.startListening();
      
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      this.onError?.(`Mikrofonzugang fehlgeschlagen: ${error.message}`);
    }
  }

  stopConversation() {
    console.log('Stopping conversation...');
    this.isActive = false;
    this.isListening = false;
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.updateStatus('Gestoppt');
  }

  private setupAudioContext(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.3;
    
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    // Set up MediaRecorder
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      this.processRecording();
    };
  }

  private startListening() {
    if (!this.isActive) return;
    
    this.isListening = true;
    this.detectVoiceActivity();
  }

  private detectVoiceActivity() {
    if (!this.isActive || !this.analyser || !this.dataArray) return;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const rms = Math.sqrt(sum / this.dataArray.length) / 255;
    
    const now = Date.now();
    const isSpeechDetected = rms > this.vadThreshold;
    
    if (isSpeechDetected) {
      this.lastSpeechTime = now;
      
      if (!this.isRecording && !this.isSpeaking) {
        console.log('Speech detected, starting recording...');
        this.startRecording();
      }
      
      // Clear silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    } else if (this.isRecording && (now - this.lastSpeechTime) > this.silenceTimeout) {
      // Silence detected for long enough
      const recordingDuration = now - this.recordingStartTime;
      if (recordingDuration >= this.minRecordingLength) {
        console.log('Silence detected, stopping recording...');
        this.stopRecording();
      }
    }
    
    if (this.isActive) {
      requestAnimationFrame(() => this.detectVoiceActivity());
    }
  }

  private startRecording() {
    if (!this.mediaRecorder || this.isRecording || this.isSpeaking) return;
    
    this.audioChunks = [];
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    
    this.updateStatus('🎤 Aufnahme läuft...');
    this.mediaRecorder.start();
  }

  private stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) return;
    
    this.isRecording = false;
    this.updateStatus('🔄 Verarbeitung...');
    this.mediaRecorder.stop();
  }

  private async processRecording() {
    if (this.audioChunks.length === 0) {
      this.startListening();
      return;
    }
    
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
    console.log('Processing audio blob, size:', audioBlob.size);
    
    try {
      // Transcribe
      const transcription = await this.transcribe(audioBlob);
      console.log('Transcription:', transcription);
      
      if (!transcription.trim()) {
        this.updateStatus('Bereit - Sprechen Sie!');
        this.startListening();
        return;
      }
      
      this.onMessage?.({ sender: 'user', text: transcription });
      
      // Get AI response
      this.updateStatus('🤔 KI denkt nach...');
      const aiResponse = await this.getAIResponse(transcription);
      console.log('AI response:', aiResponse);
      
      this.onMessage?.({ sender: 'ai', text: aiResponse });
      
      // Convert to speech and play
      this.updateStatus('🗣️ KI spricht...');
      await this.speakResponse(aiResponse);
      
      // Continue listening
      this.updateStatus('Bereit - Sprechen Sie!');
      this.startListening();
      
    } catch (error: any) {
      console.error('Processing error:', error);
      this.onError?.(`Verarbeitungsfehler: ${error.message}`);
      this.updateStatus('Bereit - Sprechen Sie!');
      this.startListening();
    }
  }

  private async transcribe(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('durationMs', '5000');
    
    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Transcription failed');
    }
    
    const data = await response.json();
    return data.text || '';
  }

  private async getAIResponse(message: string): Promise<string> {
    const response = await fetch('/api/voice/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error('AI response failed');
    }
    
    const data = await response.json();
    return data.response || 'عذراً، لم أتمكن من فهم رسالتك.';
  }

  private async speakResponse(text: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.isSpeaking = true;
        
        const response = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
          throw new Error('TTS failed');
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.onended = () => {
          this.isSpeaking = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        this.currentAudio.onerror = () => {
          this.isSpeaking = false;
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        
        await this.currentAudio.play();
        
      } catch (error) {
        this.isSpeaking = false;
        reject(error);
      }
    });
  }

  private updateStatus(status: string) {
    console.log('Status:', status);
    this.onStatusChange?.(status);
  }
}