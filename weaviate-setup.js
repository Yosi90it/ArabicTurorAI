// weaviate-setup.js
import weaviate from "weaviate-client";

// URL und API-Key aus den Replit-Secrets ziehen
const WEAVIATE_URL    = process.env.WEAVIATE_URL;      // z.B. "https://wmd9hdhkqzs57xjvlfni8a.c0.europe-west3.gcp.weaviate.cloud"
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;   // dein Weaviate-API-Key

// URL aufsplitten, damit client scheme/host bekommt
const url = new URL(WEAVIATE_URL);

const client = weaviate.client({
  scheme: url.protocol.replace(":", ""), // "https"
  host:   url.host,                      // "wmd9hdhkqzs57xjvlfni8a.c0.europe-west3.gcp.weaviate.cloud"
  apiKey: new weaviate.ApiKey(WEAVIATE_APIKEY)
});

async function setupSchema() {
  // Bestehendes Schema abfragen
  const existing = await client.schema.getter().do();

  // Wenn Klasse noch nicht existiert, anlegen
  if (!existing.classes.find(c => c.class === "Vocabulary")) {
    await client.schema.classCreator()
      .withClass({
        class:       "Vocabulary",
        description: "Arabisch-Deutsch Vokabeln aus Qiraatul Rashida",
        vectorizer:  "text2vec-openai",
        properties: [
          { name: "arabic", dataType: ["text"]   },
          { name: "german", dataType: ["text"]   },
          { name: "context", dataType: ["text"]  }
        ]
      })
      .do();
    console.log("✅ Klasse ‘Vocabulary’ angelegt");
  } else {
    console.log("ℹ️ Klasse ‘Vocabulary’ existiert bereits");
  }
}

setupSchema().catch(err => {
  console.error("Schema-Anlage fehlgeschlagen:", err);
  process.exit(1);
});
