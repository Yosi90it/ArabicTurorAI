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

  const httpServer = createServer(app);
  return httpServer;
}
