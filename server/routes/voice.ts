import { Router, Request, Response } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Extend Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Daily limit tracking (in memory for simplicity)
let dailyUsage = 0;
const DAILY_LIMIT = parseInt(process.env.DAILY_MINUTES || '10') * 60; // Convert to seconds
let lastResetDate = new Date().toDateString();

function checkAndResetDailyLimit() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyUsage = 0;
    lastResetDate = today;
  }
}

function checkDailyLimit(durationSeconds: number): boolean {
  checkAndResetDailyLimit();
  return (dailyUsage + durationSeconds) <= DAILY_LIMIT;
}

function updateDailyUsage(durationSeconds: number) {
  dailyUsage += durationSeconds;
}

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ ok: true });
});

// Transcribe audio using OpenAI Whisper
router.post('/transcribe', upload.single('audio'), async (req: MulterRequest, res: Response) => {
  let tempFilePath: string | null = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const durationMs = parseInt(req.body.durationMs || '0');
    const durationSeconds = Math.ceil(durationMs / 1000);

    // Check daily limit
    if (!checkDailyLimit(durationSeconds)) {
      return res.status(429).json({ 
        error: 'Daily usage limit exceeded',
        dailyUsage,
        dailyLimit: DAILY_LIMIT
      });
    }

    // Create temporary file for OpenAI API
    const fileExtension = req.file.mimetype.split('/')[1] || 'webm';
    tempFilePath = join(tmpdir(), `audio_${Date.now()}.${fileExtension}`);
    writeFileSync(tempFilePath, req.file.buffer);

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: 'whisper-1',
      language: 'ar' // Arabic language for proper recognition
    });

    // Update daily usage
    updateDailyUsage(durationSeconds);

    res.json({ 
      text: transcription.text,
      dailyUsage,
      dailyLimit: DAILY_LIMIT
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    
    if (error?.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI-Guthaben aufgebraucht. Bitte laden Sie Ihr OpenAI-Konto auf.',
        details: 'insufficient_quota'
      });
    }
    
    res.status(500).json({ 
      error: 'Transcription failed',
      details: error?.message || 'Unknown error'
    });
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
  }
});

// Chat with GPT-4o-mini
router.post('/chat', async (req: Request, res: Response) => {
  console.log('Voice chat request received:', req.body);
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const systemPrompt = 'أنت مُعَلِّمُ اللُّغَةِ الْعَرَبِيَّةِ الْمُفِيدُ. أَجِبْ بِاللُّغَةِ الْعَرَبِيَّةِ الْفُصْحَى مَعَ تَشْكِيلٍ كَامِلٍ لِكُلِّ حَرْفٍ. اِسْتَخْدِمِ الضَّمَّةَ وَالْفَتْحَةَ وَالْكَسْرَةَ وَالسُّكُونَ وَالتَّنْوِينَ وَالشَّدَّةَ وَالْمَدَّةَ. مِثَالٌ: مَرْحَباً بِكَ فِي تَعَلُّمِ الْعَرَبِيَّةِ! كَيْفَ يُمْكِنُنِي مُسَاعَدَتُكَ الْيَوْمَ؟ أَنَا هُنَا لِمُسَاعَدَتِكَ فِي تَعَلُّمِ هَذِهِ اللُّغَةِ الْجَمِيلَةِ.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const responseText = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

    res.json({ 
      response: responseText,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    
    if (error?.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI-Guthaben aufgebraucht. Bitte laden Sie Ihr OpenAI-Konto auf.',
        details: 'insufficient_quota'
      });
    }
    
    res.status(500).json({ 
      error: 'Chat request failed',
      details: error?.message || 'Unknown error'
    });
  }
});

// Text-to-Speech using OpenAI TTS
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, speed = 0.8 } = req.body; // Slower default speed

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Clamp speed between 0.25 and 4.0 (OpenAI limits)
    const clampedSpeed = Math.max(0.25, Math.min(4.0, speed));

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd', // Use HD model for more natural voice
      voice: 'nova', // More natural female voice
      input: text.substring(0, 4096), // Limit text length
      response_format: 'mp3',
      speed: clampedSpeed
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
      'Content-Disposition': 'inline; filename="speech.mp3"'
    });

    res.send(buffer);

  } catch (error: any) {
    console.error('TTS error:', error);
    
    if (error?.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI-Guthaben aufgebraucht. Bitte laden Sie Ihr OpenAI-Konto auf.',
        details: 'insufficient_quota'
      });
    }
    
    res.status(500).json({ 
      error: 'Text-to-speech failed',
      details: error?.message || 'Unknown error'
    });
  }
});

export default router;