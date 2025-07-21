import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import jwt from 'jsonwebtoken';
import multer from 'multer';
import OpenAI from 'openai';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  // OpenAI Story Generation endpoint
  app.post("/api/weaviate/translate", async (req: Request, res: Response) => {
    try {
      const { word } = req.body;
      
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      const { searchWeaviateVocabulary } = await import("./weaviate.js");
      const translation = await searchWeaviateVocabulary(word);
      
      res.json({ 
        word, 
        translation,
        grammar: "noun", // Default since Weaviate only has translation
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

  // OpenAI Verb Conjugation endpoint
  app.post("/api/openai/conjugate-verb", async (req: Request, res: Response) => {
    try {
      const { verb } = req.body;
      
      if (!verb) {
        return res.status(400).json({ error: "Verb is required" });
      }

      // Test data for "استيقظ" (erwachen/aufwachen) - remove this when OpenAI is available
      if (verb.includes('استيقظ') || verb.includes('أستيقظ') || verb.includes('أسْتَيْقِظُ')) {
        const testConjugations = [
          // Present tense (المضارع)
          { tense: "المضارع (Present)", person: "أنا", arabic: "أَسْتَيْقِظُ", german: "ich erwache" },
          { tense: "المضارع (Present)", person: "أنت", arabic: "تَسْتَيْقِظُ", german: "du erwachst" },
          { tense: "المضارع (Present)", person: "أنتِ", arabic: "تَسْتَيْقِظِينَ", german: "du erwachst (fem.)" },
          { tense: "المضارع (Present)", person: "هو", arabic: "يَسْتَيْقِظُ", german: "er erwacht" },
          { tense: "المضارع (Present)", person: "هي", arabic: "تَسْتَيْقِظُ", german: "sie erwacht" },
          { tense: "المضارع (Present)", person: "نحن", arabic: "نَسْتَيْقِظُ", german: "wir erwachen" },
          { tense: "المضارع (Present)", person: "أنتم", arabic: "تَسْتَيْقِظُونَ", german: "ihr erwacht" },
          { tense: "المضارع (Present)", person: "أنتن", arabic: "تَسْتَيْقِظْنَ", german: "ihr erwacht (fem.)" },
          { tense: "المضارع (Present)", person: "هم", arabic: "يَسْتَيْقِظُونَ", german: "sie erwachen" },
          { tense: "المضارع (Present)", person: "هن", arabic: "يَسْتَيْقِظْنَ", german: "sie erwachen (fem.)" },
          
          // Past tense (الماضي)
          { tense: "الماضي (Past)", person: "أنا", arabic: "اسْتَيْقَظْتُ", german: "ich erwachte" },
          { tense: "الماضي (Past)", person: "أنت", arabic: "اسْتَيْقَظْتَ", german: "du erwachtest" },
          { tense: "الماضي (Past)", person: "أنتِ", arabic: "اسْتَيْقَظْتِ", german: "du erwachtest (fem.)" },
          { tense: "الماضي (Past)", person: "هو", arabic: "اسْتَيْقَظَ", german: "er erwachte" },
          { tense: "الماضي (Past)", person: "هي", arabic: "اسْتَيْقَظَتْ", german: "sie erwachte" },
          { tense: "الماضي (Past)", person: "نحن", arabic: "اسْتَيْقَظْنا", german: "wir erwachten" },
          { tense: "الماضي (Past)", person: "أنتم", arabic: "اسْتَيْقَظْتُمْ", german: "ihr erwachtet" },
          { tense: "الماضي (Past)", person: "أنتن", arabic: "اسْتَيْقَظْتُنَّ", german: "ihr erwachtet (fem.)" },
          { tense: "الماضي (Past)", person: "هم", arabic: "اسْتَيْقَظُوا", german: "sie erwachten" },
          { tense: "الماضي (Past)", person: "هن", arabic: "اسْتَيْقَظْنَ", german: "sie erwachten (fem.)" },
          
          // Imperative (الأمر)
          { tense: "الأمر (Imperative)", person: "أنت", arabic: "اسْتَيْقِظْ", german: "erwache!" },
          { tense: "الأمر (Imperative)", person: "أنتِ", arabic: "اسْتَيْقِظِي", german: "erwache! (fem.)" },
          { tense: "الأمر (Imperative)", person: "أنتم", arabic: "اسْتَيْقِظُوا", german: "erwacht!" },
          { tense: "الأمر (Imperative)", person: "أنتن", arabic: "اسْتَيْقِظْنَ", german: "erwacht! (fem.)" }
        ];

        return res.json({
          verb,
          conjugations: testConjugations
        });
      }

      // Try OpenAI for other verbs
      try {
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert Arabic grammar teacher. Generate complete verb conjugation tables in Arabic with German translations. Return JSON with this exact structure: { \"conjugations\": [{ \"tense\": \"Present\", \"person\": \"أنا\", \"arabic\": \"أكتب\", \"german\": \"ich schreibe\" }, ...] }"
            },
            {
              role: "user",
              content: `Generate a complete conjugation table for the Arabic verb "${verb}". Include Present (المضارع), Past (الماضي), and Imperative (الأمر) tenses for all persons (أنا، أنت، أنت، هو، هي، نحن، أنتم، أنتن، هم، هن). Provide German translations for each form.`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const result = JSON.parse(response.choices[0].message.content || '{"conjugations": []}');
        
        res.json({
          verb,
          conjugations: result.conjugations || []
        });
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Return a helpful message for other verbs when OpenAI is unavailable
        res.status(503).json({ 
          error: "OpenAI service temporarily unavailable", 
          message: "Verb conjugation service is currently unavailable. Please try again later or contact support.",
          verb
        });
      }
    } catch (error) {
      console.error('Verb conjugation error:', error);
      res.status(500).json({ 
        error: "Conjugation failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
