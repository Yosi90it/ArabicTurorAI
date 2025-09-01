// Voice API functions for non-realtime voice pipeline

export async function recordClip(seconds: number): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Check for webm support, fallback to mp4
  let mimeType = 'audio/webm;codecs=opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'audio/mp4';
  }
  
  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  
  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
      resolve(blob);
    };
    
    mediaRecorder.onerror = (event) => {
      stream.getTracks().forEach(track => track.stop());
      reject(new Error('Recording failed'));
    };
    
    mediaRecorder.start();
    
    // Auto-stop after specified seconds
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, seconds * 1000);
  });
}

export async function transcribe(blob: Blob, durationMs: number): Promise<{ text: string; dailyUsage?: number; dailyLimit?: number }> {
  const formData = new FormData();
  formData.append('audio', blob, 'audio.webm');
  formData.append('durationMs', durationMs.toString());
  
  const response = await fetch('/api/voice/transcribe', {
    method: 'POST',
    headers: {
      'x-user-id': getAuthUserId() || ''
    },
    body: formData
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Transcription failed');
  }
  
  return data;
}

export async function chat(message: string): Promise<{ response: string; usage?: any }> {
  const response = await fetch('/api/voice/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getAuthUserId() || ''
    },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Chat request failed');
  }
  
  return data;
}

export async function tts(text: string): Promise<Blob> {
  const response = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getAuthUserId() || ''
    },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Text-to-speech failed');
  }
  
  return await response.blob();
}

// Helper function to get auth user ID
function getAuthUserId(): string | null {
  // This is a workaround since we can't use useAuth hook in a utility function
  // We'll read from localStorage or session storage where auth state is stored
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.userId || null;
    }
  } catch (error) {
    console.warn('Could not get auth user ID:', error);
  }
  return null;
}