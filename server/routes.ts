import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

  const httpServer = createServer(app);
  return httpServer;
}
