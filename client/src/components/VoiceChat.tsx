import React, { useRef, useState } from "react";

export default function VoiceChat() {
  const [you, setYou] = useState("—");
  const [bot, setBot] = useState("—");
  const [used, setUsed] = useState(0);
  const [limit] = useState(10 * 60); // 10 Minuten in Sekunden
  const audioRef = useRef<HTMLAudioElement>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startAtRef = useRef<number>(0);

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch {
      mr = new MediaRecorder(stream);
    }
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.start();
    startAtRef.current = Date.now();
    recRef.current = mr;
  }

  async function stopRec() {
    const mr = recRef.current;
    if (!mr) return;
    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const durationMs = Date.now() - startAtRef.current;

    // 1) STT
    const fd = new FormData();
    fd.append("audio", blob, "clip.webm");
    fd.append("durationMs", String(durationMs));
    const tr = await fetch("/api/transcribe", {
      method: "POST",
      headers: { "x-user-id": "demo-user-123" }, // später durch echte User-ID ersetzen
      body: fd,
    }).then((r) => r.json());

    if (tr.error) {
      alert(tr.error);
      return;
    }
    setYou(tr.text || "—");
    setUsed(tr.usedSecondsToday || 0);

    // 2) Chat
    const history = [
      { role: "system", content: "Du bist eine geduldige Sprachtrainerin. Antworte kurz und stelle am Ende eine Rückfrage." },
      { role: "user", content: tr.text || "" },
    ];
    const chat = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "demo-user-123",
      },
      body: JSON.stringify({ messages: history }),
    }).then((r) => r.json());
    if (chat.error) {
      alert(chat.error);
      return;
    }
    const answer = (chat.answer || "").trim();
    setBot(answer);

    // 3) TTS
    const ttsRes = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "demo-user-123",
      },
      body: JSON.stringify({ text: answer }),
    });
    if (!ttsRes.ok) {
      try {
        const e = await ttsRes.json();
        alert(e.error || "TTS fehlgeschlagen");
      } catch {
        alert("TTS fehlgeschlagen");
      }
      return;
    }
    const mp3 = await ttsRes.blob();
    const url = URL.createObjectURL(mp3);
    if (audioRef.current) {
      audioRef.current.src = url;
      await audioRef.current.play().catch(() => {});
    }
    const usedHdr = ttsRes.headers.get("X-Used-Seconds-Today");
    if (usedHdr) setUsed(Number(usedHdr));
  }

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
      <h3>Sprachchat (nicht-Realtime)</h3>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={startRec}>🎙️ Aufnehmen</button>
        <button onClick={stopRec}>⏹️ Stop</button>
      </div>
      <p><strong>Du sagst:</strong> {you}</p>
      <p><strong>KI sagt:</strong> {bot}</p>
      <audio ref={audioRef} controls style={{ width: "100%", marginTop: 12 }} />
      <p style={{ marginTop: 12 }}>
        Heute verbraucht: <strong>{used}</strong> / <strong>{limit}</strong> Sekunden
      </p>
    </div>
  );
}
