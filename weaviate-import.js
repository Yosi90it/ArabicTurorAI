// weaviate-import.js
import weaviate from "weaviate-client";
import fs from "fs";

// URL und API-Key aus deinen Replit-Secrets
const WEAVIATE_URL    = process.env.WEAVIATE_URL;    // z.B. "https://…weaviate.cloud"
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY; // dein API-Key

// Baue den Weaviate-Client (ohne Destructuring)
const url = new URL(WEAVIATE_URL.startsWith("http") ? WEAVIATE_URL : `https://${WEAVIATE_URL}`);
const client = weaviate.client({
  scheme: url.protocol.replace(":", ""),
  host:   url.host,
  apiKey: new weaviate.ApiKey(WEAVIATE_APIKEY)
});

console.log("CLIENT METHODS:", Object.keys(client));

// Lese deine vocab.md
const raw = fs.readFileSync("vocab.md", "utf-8").trim();
const blocks = raw.split("\n\n");

async function importData() {
  for (const block of blocks) {
    const [arabic, german] = block.split("\n");
    // Hier muss client.data.creator() funktionieren
    await client.data
      .creator()
      .withClassName("Vocabulary")
      .withProperties({ arabic, german, context: "" })
      .do();
    console.log(`+ ${arabic} → ${german}`);
  }
  console.log("✅ Alle Vokabeln importiert");
}

importData().catch(err => {
  console.error("Import fehlgeschlagen:", err);
  process.exit(1);
});
