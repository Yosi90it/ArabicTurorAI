import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import jwt from 'jsonwebtoken';
import multer from 'multer';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Dynamische HTML-Parser für beide Bücher
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { parseQiratuRashidaHTML, parseQasasAlAnbiyaPart2HTML } = require('./htmlParser.js');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Parser function for Qasas al-Anbiya HTML
function parseQasasAlAnbiyaHTML(htmlContent) {
  const pages = [];
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  
  const pageElements = document.querySelectorAll('.page[data-page]');
  console.log(`Found ${pageElements.length} page markers`);
  
  pageElements.forEach((pageElement) => {
    const pageNumber = parseInt(pageElement.getAttribute('data-page'));
    const titleElement = pageElement.querySelector('.page-title, h1');
    const title = titleElement ? titleElement.textContent.trim() : `الصفحة ${pageNumber}`;
    
    const paragraphElements = pageElement.querySelectorAll('.paragraph');
    const paragraphs = [];
    
    paragraphElements.forEach((paragraphElement) => {
      const wordElements = paragraphElement.querySelectorAll('.word');
      const words = [];
      
      wordElements.forEach((wordElement) => {
        words.push({
          arabic: wordElement.getAttribute('data-arabic') || wordElement.textContent.trim(),
          translation: wordElement.getAttribute('data-translation') || '',
          root: wordElement.getAttribute('data-root') || '',
          pos: wordElement.getAttribute('data-pos') || 'noun'
        });
      });
      
      // Also capture any text nodes that are not within .word spans
      const allText = paragraphElement.textContent.trim();
      
      paragraphs.push({
        words: words,
        fullText: allText
      });
    });
    
    pages.push({
      number: pageNumber,
      title: title,
      paragraphs: paragraphs
    });
    
    console.log(`Processed page ${pageNumber}: ${title} with ${paragraphs.length} paragraphs`);
  });
  
  return pages;
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase (optional - will be null if not configured)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  const authenticateToken = (req: any, res: Response, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Signup endpoint
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create user with trial
      const user = await storage.createUser(userData);
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      // Return user data and token
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          trialStartDate: user.trialStartDate,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ error: "Invalid input" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      // Return user data and token
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          trialStartDate: user.trialStartDate,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: "Invalid input" });
    }
  });

  // Get user profile
  app.get("/api/user/profile", authenticateToken, async (req: any, res: Response) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        trialStartDate: user.trialStartDate,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Supabase-only word translation for speed
  app.post("/api/translate-word-supabase", async (req: Request, res: Response) => {
    try {
      const { word } = req.body;
      
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      const normalizedWord = word.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').trim();

      // Only check Supabase - no Weaviate, no OpenAI for speed
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('word_translations')
            .select('*')
            .eq('arabic_word', normalizedWord)
            .single();

          if (!error && data) {
            return res.json({
              word: normalizedWord,
              translation: data.german_translation,
              grammar: data.grammar_info || "noun",
              context: data.context || "",
              source: 'supabase'
            });
          }
        } catch (cacheError) {
          console.log('Supabase lookup failed:', cacheError);
        }
      }

      // No translation found
      return res.status(404).json({
        word: normalizedWord,
        translation: "Nicht in Datenbank",
        grammar: "unknown",
        source: 'not_found'
      });

    } catch (error) {
      console.error("Supabase translation error:", error);
      res.status(500).json({ error: "Supabase translation failed" });
    }
  });

  // Enhanced word analysis with OpenAI grammar detection
  app.post("/api/weaviate/translate", async (req: Request, res: Response) => {
    try {
      const { word } = req.body;
      
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      const { searchWeaviateVocabulary } = await import("./weaviate.js");
      const translation = await searchWeaviateVocabulary(word);
      
      let grammar = "noun"; // Default
      
      // Skip OpenAI grammar analysis to improve speed when quota is exhausted
      // Use basic pattern-based grammar detection instead
      if (/[\u0600-\u06FF]/.test(word)) {
        // Simple Arabic grammar pattern detection
        if (word.includes('يُ') || word.includes('يَ') || word.includes('أُ') || word.includes('تُ')) {
          grammar = 'verb';
        } else if (word.includes('الْ')) {
          grammar = 'noun';
        } else if (word.length <= 3 && (word.includes('مِن') || word.includes('إلى') || word.includes('في'))) {
          grammar = 'preposition';
        } else {
          grammar = 'noun'; // Default for most Arabic words
        }
        console.log(`Pattern-based grammar: ${word} → ${grammar}`);
      }
      
      res.json({ 
        word, 
        translation,
        grammar,
        examples: [],
        pronunciation: ""
      });
    } catch (error) {
      console.error("Weaviate translation error:", error);
      res.status(500).json({ error: "Failed to translate word" });
    }
  });



  app.post("/api/openai/generate-story", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "Du bist ein erfahrener Arabischlehrer, der personalisierte Geschichten erstellt, um Vokabeln zu festigen. Antworte immer im angegebenen JSON-Format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const storyContent = JSON.parse(data.choices[0].message.content);
      
      res.json(storyContent);
    } catch (error) {
      console.error("Error generating story:", error);
      res.status(500).json({ error: "Failed to generate story" });
    }
  });

  // PDF to EPUB conversion proxy endpoint
  app.post("/api/pdf-convert", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      // Create FormData for Python service
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Add file buffer
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: 'application/pdf'
      });
      
      formData.append('start_page', req.body.start_page || '30');
      formData.append('end_page', req.body.end_page || '180');

      const response = await fetch('http://localhost:5001/convert', {
        method: 'POST',
        body: formData,
        headers: {
          ...formData.getHeaders()
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF conversion service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Update download URL to use our proxy
      if (result.download_url) {
        const filename = result.download_url.split('/').pop();
        result.download_url = `/api/pdf-download/${filename}`;
      }
      
      res.json(result);
    } catch (error) {
      console.error("PDF conversion error:", error);
      res.status(500).json({ 
        error: "PDF conversion failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Download EPUB file proxy
  app.get("/api/pdf-download/:filename", async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const response = await fetch(`http://localhost:5001/download/${filename}`);
      
      if (!response.ok) {
        throw new Error(`Download service error: ${response.status}`);
      }

      // Forward the file
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Download failed" });
    }
  });

  // ChatGPT translation with context (fallback when not in Supabase)
  app.post("/api/translate-word-openai", async (req: Request, res: Response) => {
    try {
      const { word, context } = req.body;
      
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI not configured" });
      }

      const normalizedWord = word.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').trim();

      // Use context if available, otherwise simple translation
      const prompt = context && context.trim() 
        ? `Übersetze das arabische Wort "${word}" ins Deutsche im Kontext: "${context}". Berücksichtige den Kontext für eine präzise Übersetzung.`
        : `Übersetze das arabische Wort "${word}" ins Deutsche.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Du bist ein Arabisch-Deutsch Übersetzer. Antworte im JSON-Format:
            {
              "word": "ursprüngliches arabisches Wort",
              "translation": "deutsche Übersetzung", 
              "grammar": "Wortart (Nomen, Verb, etc.)",
              "context_note": "Erklärung falls Kontext die Bedeutung beeinflusst"
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 150
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Cache the result in Supabase for future use
      if (supabase && result.translation) {
        try {
          await supabase
            .from('word_translations')
            .insert([
              {
                arabic_word: normalizedWord,
                german_translation: result.translation,
                grammar_info: result.grammar || "",
                context: context || "",
                contextual_meaning: result.context_note || "",
                created_at: new Date().toISOString(),
                source: 'openai'
              }
            ]);
          console.log(`Cached new OpenAI translation for: ${normalizedWord}`);
        } catch (cacheError) {
          console.log('Failed to cache OpenAI result:', cacheError);
        }
      }

      res.json({
        word: result.word || normalizedWord,
        translation: result.translation || "Übersetzung nicht verfügbar",
        grammar: result.grammar || "noun",
        context_note: result.context_note || "",
        examples: [],
        pronunciation: "",
        source: 'openai'
      });

    } catch (error) {
      console.error("OpenAI translation error:", error);
      res.status(500).json({ error: "OpenAI translation failed" });
    }
  });

  // OpenAI Verb Conjugation endpoint
  app.post("/api/openai/conjugate-verb", async (req: Request, res: Response) => {
    try {
      const { verb } = req.body;
      
      if (!verb) {
        return res.status(400).json({ error: "Verb is required" });
      }

      // Check database cache first
      try {
        const { verbConjugations } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        
        const [cached] = await db.select().from(verbConjugations).where(eq(verbConjugations.verb, verb));
        
        if (cached) {
          console.log(`Cache hit for verb: ${verb}`);
          return res.json({
            verb,
            source: 'cache',
            conjugations: cached.conjugation
          });
        }
      } catch (dbError) {
        console.log('Database not available, proceeding with generation');
      }

      // Enhanced prompt for OpenAI with dual forms (31 total forms)
      const prompt = `
Konjugiere bitte das arabische Verb "${verb}" vollständig im Hocharabischen (Fusha) mit vollständigem Tashkīl (Vokalzeichen).

Erstelle die Konjugationstabelle in drei Zeitformen mit ALLEN Personalformen inklusive Dual:

1. Vergangenheit (الماضي) - 13 Formen
2. Gegenwart (المضارع) - 13 Formen  
3. Imperativ (الأمر) - 5 Formen

Antwort als JSON-Array mit Objekten im Format:
{ "tense": "الماضي (Past)", "person": "أنا", "arabic": "...", "german": "..." }

Alle 31 Formen einschließen: أنا، أنتَ، أنتِ، أنتما، أنتم، أنتنّ، هو، هي، هما (m)، هما (f)، نحن، هم، هنّ für Vergangenheit und Gegenwart, plus Imperativ für أنتَ، أنتِ، أنتما، أنتم، أنتنّ.`;

      // Generate conjugations
      let conjugations: any[] = [];

      if (process.env.OPENAI_API_KEY) {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "Du bist ein arabischer Sprachlehrer und konjugierst Verben korrekt mit vollständigen Tashkīl."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
        });

        const content = completion.choices[0].message.content;
        conjugations = JSON.parse(content);
        
        console.log(`Generated ${conjugations.length} conjugation forms for verb: ${verb}`);
      } else {
        // Enhanced fallback data with dual forms (31 forms total)
        conjugations = [
          // Past tense (13 forms)
          { tense: "الماضي (Past)", person: "أنا", arabic: "اسْتَيْقَظْتُ", german: "ich erwachte" },
          { tense: "الماضي (Past)", person: "أنتَ", arabic: "اسْتَيْقَظْتَ", german: "du erwachtest" },
          { tense: "الماضي (Past)", person: "أنتِ", arabic: "اسْتَيْقَظْتِ", german: "du erwachtest (fem.)" },
          { tense: "الماضي (Past)", person: "أنتما", arabic: "اسْتَيْقَظْتُما", german: "ihr beide erwachtet" },
          { tense: "الماضي (Past)", person: "أنتم", arabic: "اسْتَيْقَظْتُمْ", german: "ihr erwachtet" },
          { tense: "الماضي (Past)", person: "أنتنّ", arabic: "اسْتَيْقَظْتُنَّ", german: "ihr erwachtet (fem.)" },
          { tense: "الماضي (Past)", person: "هو", arabic: "اسْتَيْقَظَ", german: "er erwachte" },
          { tense: "الماضي (Past)", person: "هي", arabic: "اسْتَيْقَظَتْ", german: "sie erwachte" },
          { tense: "الماضي (Past)", person: "هما (m)", arabic: "اسْتَيْقَظا", german: "sie beide erwachten (m.)" },
          { tense: "الماضي (Past)", person: "هما (f)", arabic: "اسْتَيْقَظَتا", german: "sie beide erwachten (f.)" },
          { tense: "الماضي (Past)", person: "نحن", arabic: "اسْتَيْقَظْنا", german: "wir erwachten" },
          { tense: "الماضي (Past)", person: "هم", arabic: "اسْتَيْقَظُوا", german: "sie erwachten" },
          { tense: "الماضي (Past)", person: "هنّ", arabic: "اسْتَيْقَظْنَ", german: "sie erwachten (fem.)" },
          
          // Present tense (13 forms)
          { tense: "المضارع (Present)", person: "أنا", arabic: "أَسْتَيْقِظُ", german: "ich erwache" },
          { tense: "المضارع (Present)", person: "أنتَ", arabic: "تَسْتَيْقِظُ", german: "du erwachst" },
          { tense: "المضارع (Present)", person: "أنتِ", arabic: "تَسْتَيْقِظِينَ", german: "du erwachst (fem.)" },
          { tense: "المضارع (Present)", person: "أنتما", arabic: "تَسْتَيْقِظانِ", german: "ihr beide erwacht" },
          { tense: "المضارع (Present)", person: "أنتم", arabic: "تَسْتَيْقِظُونَ", german: "ihr erwacht" },
          { tense: "المضارع (Present)", person: "أنتنّ", arabic: "تَسْتَيْقِظْنَ", german: "ihr erwacht (fem.)" },
          { tense: "المضارع (Present)", person: "هو", arabic: "يَسْتَيْقِظُ", german: "er erwacht" },
          { tense: "المضارع (Present)", person: "هي", arabic: "تَسْتَيْقِظُ", german: "sie erwacht" },
          { tense: "المضارع (Present)", person: "هما (m)", arabic: "يَسْتَيْقِظانِ", german: "sie beide erwachen (m.)" },
          { tense: "المضارع (Present)", person: "هما (f)", arabic: "تَسْتَيْقِظانِ", german: "sie beide erwachen (f.)" },
          { tense: "المضارع (Present)", person: "نحن", arabic: "نَسْتَيْقِظُ", german: "wir erwachen" },
          { tense: "المضارع (Present)", person: "هم", arabic: "يَسْتَيْقِظُونَ", german: "sie erwachen" },
          { tense: "المضارع (Present)", person: "هنّ", arabic: "يَسْتَيْقِظْنَ", german: "sie erwachen (fem.)" },
          
          // Imperative (5 forms)
          { tense: "الأمر (Imperative)", person: "أنتَ", arabic: "اسْتَيْقِظْ", german: "erwache!" },
          { tense: "الأمر (Imperative)", person: "أنتِ", arabic: "اسْتَيْقِظِي", german: "erwache! (fem.)" },
          { tense: "الأمر (Imperative)", person: "أنتما", arabic: "اسْتَيْقِظا", german: "erwacht! (beide)" },
          { tense: "الأمر (Imperative)", person: "أنتم", arabic: "اسْتَيْقِظُوا", german: "erwacht!" },
          { tense: "الأمر (Imperative)", person: "أنتنّ", arabic: "اسْتَيْقِظْنَ", german: "erwacht! (fem.)" }
        ];
        
        console.log(`Using fallback data with ${conjugations.length} forms for verb: ${verb}`);
      }

      // Cache in database for future use
      try {
        const { verbConjugations } = await import('@shared/schema');
        await db.insert(verbConjugations).values({
          verb,
          conjugation: conjugations
        });
        console.log(`Successfully cached conjugation for verb: ${verb}`);
      } catch (dbError) {
        console.log('Could not cache conjugation:', dbError);
      }

      res.json({
        verb,
        source: process.env.OPENAI_API_KEY ? 'openai' : 'fallback',
        conjugations
      });
    } catch (error) {
      console.error('Verb conjugation error:', error);
      res.status(500).json({ 
        error: "Conjugation failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Story generation with Supabase caching
  app.get("/api/getStory", async (req: Request, res: Response) => {
    try {
      const { vocab, wordCount } = req.query;
      
      // Validate parameters
      if (!vocab || !wordCount) {
        return res.status(400).json({ 
          error: "Missing required parameters: vocab and wordCount" 
        });
      }

      const vocabList = (vocab as string).split(',').map(word => word.trim());
      const parsedWordCount = parseInt(wordCount as string);
      
      if (isNaN(parsedWordCount) || parsedWordCount < 1) {
        return res.status(400).json({ 
          error: "wordCount must be a positive number" 
        });
      }

      // Create cache key from sorted vocab list
      const vocabKey = vocabList.sort().join(',');

      // Check Supabase cache first (if configured)
      let cachedStory = null;
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('vocab_key', vocabKey)
            .eq('word_count', parsedWordCount)
            .single();

          if (!error && data) {
            cachedStory = data;
            console.log(`Found cached story for vocab: ${vocabKey}`);
          }
        } catch (cacheError) {
          console.log('Cache lookup failed:', cacheError);
        }
      } else {
        console.log('Supabase not configured - skipping cache lookup');
      }

      // Return cached story if found
      if (cachedStory) {
        return res.json({
          story: cachedStory.story_text,
          vocab_used: cachedStory.vocab_list,
          word_count: cachedStory.word_count,
          source: 'cache',
          created_at: cachedStory.created_at
        });
      }

      // Generate new story with OpenAI
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
          error: "OpenAI API key not configured" 
        });
      }

      const prompt = `Erstelle eine kurze Geschichte auf Arabisch (Fusha), die etwa ${parsedWordCount} Wörter lang ist.
Benutze sinnvoll folgende Wörter im Text:
${vocabList.join(', ')}

Die Geschichte soll einfach, sinnvoll und grammatikalisch korrekt sein.
Gib nur den arabischen Fließtext zurück, ohne Übersetzung oder Kommentare.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Du bist ein arabischer Geschichtenerzähler, der einfache und schöne Geschichten auf Hocharabisch schreibt."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: parsedWordCount * 3 // Allow for Arabic text expansion
      });

      const storyText = completion.choices[0].message.content?.trim() || '';
      
      if (!storyText) {
        return res.status(500).json({ 
          error: "Failed to generate story" 
        });
      }

      // Save to Supabase cache (if configured)
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('stories')
            .insert([
              {
                vocab_key: vocabKey,
                vocab_list: vocabList,
                word_count: parsedWordCount,
                story_text: storyText,
                created_at: new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (error) {
            console.error('Failed to cache story:', error);
          } else {
            console.log(`Successfully cached new story for vocab: ${vocabKey}`);
          }
        } catch (cacheError) {
          console.error('Cache save failed:', cacheError);
        }
      } else {
        console.log('Supabase not configured - story not cached');
      }

      // Return the generated story
      res.json({
        story: storyText,
        vocab_used: vocabList,
        word_count: parsedWordCount,
        source: 'generated',
        created_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Story generation error:', error);
      res.status(500).json({ 
        error: "Story generation failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // API endpoint für dynamische HTML-Seiten
  app.get("/api/qiraatu-pages", async (req: Request, res: Response) => {
    try {
      console.log('Parsing HTML file for pages...');
      const pages = parseQiratuRashidaHTML();
      
      res.json({
        pages: pages,
        totalPages: pages.length,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error parsing HTML:', error);
      res.status(500).json({ 
        error: "Failed to parse HTML file",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // API endpoint for Qasas al-Anbiya pages
  app.get("/api/qasas-pages", async (req: Request, res: Response) => {
    try {
      console.log('Parsing Qasas al-Anbiya HTML file for pages...');
      
      // Parse the Qasas al-Anbiya HTML file
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'qasas-al-anbiya-complete-full.html'), 'utf-8');
      const pages = parseQasasAlAnbiyaHTML(htmlContent);
      
      console.log(`Found ${pages.length} pages in Qasas al-Anbiya`);
      pages.forEach((page, index) => {
        console.log(`Processed page ${page.number}: ${page.title} with ${page.paragraphs.length} paragraphs`);
      });
      
      res.json({
        pages: pages,
        totalPages: pages.length,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error parsing Qasas al-Anbiya HTML:', error);
      res.status(500).json({ 
        error: "Failed to parse Qasas al-Anbiya HTML file",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // API endpoint für Qasas al-Anbiya Teil 2 
  app.get("/api/qasas-pages-2", async (req: Request, res: Response) => {
    try {
      console.log('Parsing Qasas al-Anbiya Teil 2 HTML file for pages...');
      
      // Parse die Qasas al-Anbiya Teil 2 HTML-Datei
      const htmlContent = fs.readFileSync(path.join(process.cwd(), 'qasas-al-anbiya-teil-2.html'), 'utf-8');
      const pages = parseQasasAlAnbiyaPart2HTML(htmlContent);
      
      console.log(`Found ${pages.length} pages in Qasas al-Anbiya Teil 2`);
      pages.forEach((page) => {
        console.log(`Processed page ${page.number}: ${page.title} with ${page.paragraphs.length} paragraphs`);
      });
      
      res.json({
        pages: pages,
        totalPages: pages.length,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error parsing Qasas al-Anbiya Teil 2 HTML:', error);
      res.status(500).json({ 
        error: "Failed to parse Qasas al-Anbiya Teil 2 HTML file",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
