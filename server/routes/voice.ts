import { Router, type Request, type Response } from "express";
import multer from "multer";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

// --- OpenAI Client ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// --- Upload (Memory) ---
const upload = multer({ storage: multer.memoryStorage() });

// --- simples Tageslimit im RAM ---
const DAILY_MINUTES = Number(process.env.DAILY_MINUTES || 10);
type UsageRow = { date: string; seconds: number };
const usageMap = new Map<string, UsageRow>();
const todayStr = () => new Date().toISOString().slice(0, 10);
const getUserId = (req: Request) => (req.headers["x-user-id"] as string) || req.ip;

function hasBudgetLeft(userId: string, extraSeconds: number) {
  const t = todayStr();
  const row = usageMap.get(userId) || { date: t, seconds: 0 };
  const limit = DAILY_MINUTES * 60;
  return row.date !== t ? extraSeconds <= limit : row.seconds + extraSeconds <= limit;
}
function addUsageSeconds(userId: string, seconds: number) {
  const t = todayStr();
  const row = usageMap.get(userId) || { date: t, seconds: 0 };
  if (row.date !== t) {
    row.date = t;
    row.seconds = 0;
  }
  row.seconds += seconds;
  usageMap.set(userId, row);
  return row.seconds;
}

const router = Router();

/**
 * POST /api/transcribe
 * FormData: audio (file), durationMs (number)
 */
router.post("/api/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const durationMs = Number(req.body.durationMs || 0);
    const durationSec = Math.ceil(durationMs / 1000);

    if (!req.file) return res.status(400).json({ error: "No audio file" });
    if (!hasBudgetLeft(userId, durationSec)) {
      return res.status(429).json({ error: "Tageslimit erreicht" });
    }

    const file = await toFile(
      new Blob([req.file.buffer], { type: req.file.mimetype || "audio/webm" }),
      req.file.originalname || "clip.webm"
    );

    const result = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    const used = addUsageSeconds(userId, durationSec);
    res.json({ text: result.text, usedSeconds: durationSec, usedSecondsToday: used });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcribe failed" });
  }
});

/**
 * POST /api/chat
 * Body: { messages: [{role:"system"|"user"|"assistant", content:string}] }
 */
router.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages,
    });

    const answer = completion.choices[0]?.message?.content ?? "";
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

/**
 * POST /api/tts
 * Body: { text: string, estimateSec?: number }
 * Antwort: audio/mpeg (MP3)
 */
router.post("/api/tts", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { text, estimateSec } = req.body as { text: string; estimateSec?: number };
    if (!text) return res.status(400).json({ error: "Missing text" });

    // grobe Sprechdauer-Schätzung: ~12 Zeichen ≈ 1 Sek
    const est = Math.ceil(Number(estimateSec || text.length / 12));
    if (!hasBudgetLeft(userId, est)) {
      return res.status(429).json({ error: "Tageslimit erreicht" });
    }

    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts", // alternativ: "tts-1"
      voice: "alloy",           // Stimmen: alloy, verse, aria, ...
      input: text,
      format: "mp3",
    });

    const used = addUsageSeconds(userId, est);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("X-Used-Seconds-Today", String(used));

    const buf = Buffer.from(await speech.arrayBuffer());
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "TTS failed" });
  }
});

export default router;
