class ContinuousVoiceChat {
    constructor() {
        // DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.conversation = document.getElementById('conversation');
        this.vadThresholdSlider = document.getElementById('vadThreshold');
        this.vadThresholdValue = document.getElementById('vadThresholdValue');
        this.silenceTimeoutInput = document.getElementById('silenceTimeout');
        this.minRecordingLengthInput = document.getElementById('minRecordingLength');
        this.vadBars = document.querySelectorAll('.vad-bar');
        
        // Audio context and analysis
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.dataArray = null;
        
        // Recording
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingStartTime = 0;
        
        // VAD (Voice Activity Detection)
        this.vadThreshold = 0.02;
        this.silenceTimeout = 700; // ms
        this.minRecordingLength = 1000; // ms
        this.lastSpeechTime = 0;
        this.silenceTimer = null;
        this.isListening = false;
        
        // Conversation state
        this.isActive = false;
        this.currentAudio = null;
        this.isSpeaking = false;
        this.messages = [];
        
        // Settings
        this.vadAnimationFrame = null;
        
        this.initializeEventListeners();
        this.loadSettings();
    }
    
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startConversation());
        this.stopBtn.addEventListener('click', () => this.stopConversation());
        
        // Settings
        this.vadThresholdSlider.addEventListener('input', (e) => {
            this.vadThreshold = parseFloat(e.target.value);
            this.vadThresholdValue.textContent = this.vadThreshold.toFixed(3);
            this.saveSettings();
        });
        
        this.silenceTimeoutInput.addEventListener('change', (e) => {
            this.silenceTimeout = parseInt(e.target.value);
            this.saveSettings();
        });
        
        this.minRecordingLengthInput.addEventListener('change', (e) => {
            this.minRecordingLength = parseInt(e.target.value);
            this.saveSettings();
        });
    }
    
    loadSettings() {
        const saved = localStorage.getItem('voiceChatSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.vadThreshold = settings.vadThreshold || 0.02;
            this.silenceTimeout = settings.silenceTimeout || 700;
            this.minRecordingLength = settings.minRecordingLength || 1000;
            
            this.vadThresholdSlider.value = this.vadThreshold;
            this.vadThresholdValue.textContent = this.vadThreshold.toFixed(3);
            this.silenceTimeoutInput.value = this.silenceTimeout;
            this.minRecordingLengthInput.value = this.minRecordingLength;
        }
    }
    
    saveSettings() {
        const settings = {
            vadThreshold: this.vadThreshold,
            silenceTimeout: this.silenceTimeout,
            minRecordingLength: this.minRecordingLength
        };
        localStorage.setItem('voiceChatSettings', JSON.stringify(settings));
    }
    
    async startConversation() {
        try {
            await this.initializeAudio();
            this.isActive = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.updateStatus('Initialisierung...', 'processing');
            
            this.addMessage('system', 'Gespräch gestartet. Sprechen Sie, wenn Sie bereit sind.');
            
            setTimeout(() => {
                this.startListening();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to start conversation:', error);
            this.updateStatus('Fehler: Mikrofon-Zugriff verweigert', 'error');
        }
    }
    
    async initializeAudio() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 16000
            }
        });
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.3;
        this.microphone.connect(this.analyser);
        
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Initialize MediaRecorder
        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
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
    
    startListening() {
        if (!this.isActive) return;
        
        this.isListening = true;
        this.updateStatus('Zuhören... (sprechen Sie jetzt)', 'listening');
        this.startVADMonitoring();
    }
    
    startVADMonitoring() {
        const checkVAD = () => {
            if (!this.isListening || !this.isActive) return;
            
            this.analyser.getByteFrequencyData(this.dataArray);
            const rms = this.calculateRMS(this.dataArray);
            
            // Update visual indicator
            this.updateVADVisualization(rms);
            
            const isSpeaking = rms > this.vadThreshold;
            
            if (isSpeaking) {
                this.lastSpeechTime = Date.now();
                
                if (!this.isRecording && !this.isSpeaking) {
                    this.startRecording();
                } else if (this.isSpeaking) {
                    // Barge-in: Stop current TTS if user starts speaking
                    this.stopCurrentAudio();
                }
                
                // Clear silence timer
                if (this.silenceTimer) {
                    clearTimeout(this.silenceTimer);
                    this.silenceTimer = null;
                }
            } else if (this.isRecording) {
                // Set silence timer if not already set
                if (!this.silenceTimer) {
                    this.silenceTimer = setTimeout(() => {
                        const recordingDuration = Date.now() - this.recordingStartTime;
                        if (recordingDuration >= this.minRecordingLength) {
                            this.stopRecording();
                        }
                        this.silenceTimer = null;
                    }, this.silenceTimeout);
                }
            }
            
            this.vadAnimationFrame = requestAnimationFrame(checkVAD);
        };
        
        this.vadAnimationFrame = requestAnimationFrame(checkVAD);
    }
    
    calculateRMS(dataArray) {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const value = (dataArray[i] - 128) / 128;
            sum += value * value;
        }
        return Math.sqrt(sum / dataArray.length);
    }
    
    updateVADVisualization(rms) {
        const normalizedRMS = Math.min(rms / (this.vadThreshold * 3), 1);
        const activeBars = Math.floor(normalizedRMS * this.vadBars.length);
        
        this.vadBars.forEach((bar, index) => {
            if (index < activeBars) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }
    
    startRecording() {
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.audioChunks = [];
        
        this.updateStatus('Aufnahme läuft...', 'processing');
        this.mediaRecorder.start();
    }
    
    stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        this.mediaRecorder.stop();
        this.updateStatus('Verarbeitung...', 'processing');
    }
    
    async processRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = Date.now() - this.recordingStartTime;
        
        try {
            // Transcribe
            const transcription = await this.transcribeAudio(audioBlob, duration);
            
            if (!transcription.trim()) {
                this.addMessage('system', 'Keine Sprache erkannt. Versuchen Sie es erneut.');
                this.startListening();
                return;
            }
            
            this.addMessage('user', transcription);
            
            // Get AI response
            this.updateStatus('KI denkt nach...', 'processing');
            const aiResponse = await this.getChatResponse();
            this.addMessage('ai', aiResponse);
            
            // Text-to-Speech
            this.updateStatus('Spreche Antwort...', 'speaking');
            await this.speakResponse(aiResponse);
            
            // Continue listening
            setTimeout(() => {
                this.startListening();
            }, 500);
            
        } catch (error) {
            console.error('Error processing recording:', error);
            
            if (error.message.includes('429')) {
                this.addMessage('system', 'Tageslimit erreicht. Versuchen Sie es später erneut.');
                this.updateStatus('Tageslimit erreicht', 'error');
            } else {
                this.addMessage('system', 'Fehler bei der Verarbeitung. Versuchen Sie es erneut.');
                this.startListening();
            }
        }
    }
    
    async transcribeAudio(audioBlob, durationMs) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');
        formData.append('durationMs', durationMs.toString());
        
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Transcription failed');
        }
        
        const result = await response.json();
        return result.text;
    }
    
    async getChatResponse() {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: this.messages.filter(m => m.role !== 'system').slice(-10) // Last 10 messages
            })
        });
        
        if (!response.ok) {
            throw new Error('Chat request failed');
        }
        
        const result = await response.json();
        return result.message;
    }
    
    async speakResponse(text) {
        return new Promise(async (resolve, reject) => {
            try {
                this.isSpeaking = true;
                
                const response = await fetch('/api/tts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: text,
                        voice: 'alloy'
                    })
                });
                
                if (!response.ok) {
                    throw new Error('TTS request failed');
                }
                
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                
                this.currentAudio = new Audio(audioUrl);
                
                this.currentAudio.onended = () => {
                    this.isSpeaking = false;
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    resolve();
                };
                
                this.currentAudio.onerror = () => {
                    this.isSpeaking = false;
                    URL.revokeObjectURL(audioUrl);
                    this.currentAudio = null;
                    reject(new Error('Audio playback failed'));
                };
                
                await this.currentAudio.play();
                
            } catch (error) {
                this.isSpeaking = false;
                reject(error);
            }
        });
    }
    
    stopCurrentAudio() {
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.isSpeaking = false;
        }
    }
    
    stopConversation() {
        this.isActive = false;
        this.isListening = false;
        this.isRecording = false;
        this.isSpeaking = false;
        
        if (this.vadAnimationFrame) {
            cancelAnimationFrame(this.vadAnimationFrame);
        }
        
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        this.stopCurrentAudio();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        this.updateStatus('Gespräch beendet', 'idle');
        this.addMessage('system', 'Gespräch beendet. Klicken Sie "Gespräch starten" für eine neue Session.');
        
        // Clear VAD visualization
        this.vadBars.forEach(bar => bar.classList.remove('active'));
    }
    
    updateStatus(message, type) {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }
    
    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = content;
        
        this.conversation.appendChild(messageDiv);
        this.conversation.scrollTop = this.conversation.scrollHeight;
        
        // Add to messages array for conversation context
        if (role === 'user') {
            this.messages.push({ role: 'user', content: content });
        } else if (role === 'ai') {
            this.messages.push({ role: 'assistant', content: content });
        }
        
        // Keep only last 20 messages to prevent memory issues
        if (this.messages.length > 20) {
            this.messages = this.messages.slice(-20);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.voiceChat = new ContinuousVoiceChat();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.voiceChat && window.voiceChat.isActive) {
        window.voiceChat.stopConversation();
    }
});