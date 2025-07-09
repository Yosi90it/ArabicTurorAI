import weaviate from "weaviate-client";
import fs from "fs";

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Connecting to:", WEAVIATE_URL);

const client = weaviate.client({
  scheme: "https",
  host: WEAVIATE_URL.replace(/^https?:\/\//, ""),
  apiKey: new weaviate.ApiKey(WEAVIATE_APIKEY),
});

// Lese Deine Vokabelliste
const raw    = fs.readFileSync("vocab.md", "utf-8").trim();
const blocks = raw.split("\n\n");

async function importData() {
  console.log(`Starting import of ${blocks.length} vocabulary entries...`);
  
  for (const block of blocks) {
    const [arabic, german] = block.split("\n");
    if (arabic && german) {
      try {
        const response = await client.data.creator()
          .withClassName("Vocabulary")
          .withProperties({ 
            arabic: arabic.trim(), 
            german: german.trim() 
          })
          .do();
        console.log(`✓ ${arabic} → ${german}`);
      } catch (error) {
        console.error(`✗ Failed to import ${arabic}:`, error.message);
      }
    }
  }
  console.log("✅ Import complete");
}

importData().catch(err => {
  console.error("Import fehlgeschlagen:", err);
  process.exit(1);
});
