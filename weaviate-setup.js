import weaviate from "weaviate-client";

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Connecting to Weaviate...");

const client = weaviate.client({
  scheme: "https",
  host: WEAVIATE_URL.replace(/^https?:\/\//, ""),
  apiKey: new weaviate.ApiKey(WEAVIATE_APIKEY),
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
