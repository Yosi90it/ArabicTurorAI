import type { Express } from "express";
import http from "http";
import voiceRouter from "./voice"; // deine /api/transcribe, /api/chat, /api/tts

export async function registerRoutes(app: Express) {
  // hier ALLE API-Router einhängen
  app.use(voiceRouter);

  // ggf. weitere Router: app.use(authRouter); ...

  // http-Server an server/index.ts zurückgeben
  const server = http.createServer(app);
  return server;
}
