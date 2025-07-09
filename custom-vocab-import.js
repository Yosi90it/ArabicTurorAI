const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Importing custom vocabulary...");

// Function to make authenticated requests to Weaviate
async function weaviateRequest(endpoint, method = 'GET', body = null) {
  const url = `${WEAVIATE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${WEAVIATE_APIKEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Weaviate request failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

async function importCustomVocabulary() {
  // Hier kannst du deine eigenen Übersetzungen hinzufügen:
  const customVocabulary = [
    // Beispiel - füge hier deine korrigierten Übersetzungen hinzu:
    { arabic: "وأسمع", german: "und ich höre" },
    { arabic: "عُمَرُ:", german: "Umar:" },
    { arabic: "لَا", german: "nein" },
    { arabic: "الدُّكَّانُ", german: "der Laden" },
    { arabic: "كَبِيْرَةٌ", german: "groß (weiblich)" },
    
    // Füge weitere Vokabeln nach diesem Muster hinzu:
    // { arabic: "arabisches_wort", german: "deutsche_übersetzung" },
    
  ];

  console.log(`Starting import of ${customVocabulary.length} custom vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const vocab of customVocabulary) {
    try {
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: vocab
      });
      
      successful++;
      console.log(`✓ ${vocab.arabic} → ${vocab.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${vocab.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Custom import complete: ${successful} successful, ${failed} failed`);
  return successful > 0;
}

// Führe den Import aus
importCustomVocabulary().catch(err => {
  console.error("Custom import failed:", err);
  process.exit(1);
});