// weaviate-import.js
import fs from "fs";

// URL und API-Key aus deinen Replit-Secrets
const WEAVIATE_URL    = process.env.WEAVIATE_URL;    // z.B. "https://...weaviate.cloud"
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY; // dein API-Key

if (!WEAVIATE_URL || !WEAVIATE_APIKEY) {
  console.error("❌ Bitte WEAVIATE_URL und WEAVIATE_APIKEY als Secrets setzen.");
  process.exit(1);
}

console.log(`→ Importiere in: ${WEAVIATE_URL}`);

async function importCustomVocabulary() {
  // Lies deine vocab.md ein
  const raw = fs.readFileSync("vocab.md", "utf-8").trim();
  const blocks = raw.split("\n\n"); // jedes Wort-Paar

  let ok = 0, fail = 0;

  for (const block of blocks) {
    const [arabic, german] = block.split("\n");
    const body = {
      class: "Vocabulary",
      properties: { arabic, german }
    };

    try {
      const res = await fetch(`${WEAVIATE_URL}/v1/objects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WEAVIATE_APIKEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      console.log(`✓ ${arabic} → ${german}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${arabic}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Import fertig: ${ok} erfolgreich, ${fail} fehlgeschlagen.`);
}

importCustomVocabulary().catch(err => {
  console.error("❌ Unerwarteter Fehler:", err);
  process.exit(1);
});
