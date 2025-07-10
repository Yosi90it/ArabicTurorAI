import { normalizeArabic } from './normalize-arabic.js';

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

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

const missingWords = [
  { arabic: "البُسْتَانِ", german: "des Gartens" },
  { arabic: "إِلَى الْبُسْتَانِ", german: "in den Garten" },
  { arabic: "تَعَالَ", german: "komm" },
  { arabic: "خَالِدٌ", german: "Khalid" },
  { arabic: "وَرَغْبَةٍ", german: "und Begeisterung" },
  { arabic: "ورغبة", german: "und Wunsch" },
  { arabic: "الْحَوَائِجِ", german: "die Bedürfnisse" },
  { arabic: "مُشْتَرَيَاتِ", german: "die Einkäufe" },
  { arabic: "أَشْيَاءَ", german: "Dinge" },
  { arabic: "شَيْءٌ", german: "ein Ding" },
  { arabic: "أَحْيَانًا", german: "manchmal" },
  { arabic: "جِدًّا", german: "sehr" },
  { arabic: "قَلِيلًا", german: "wenig" },
  { arabic: "كُلُّ", german: "alles" },
  { arabic: "بَعْضُ", german: "einige" },
  { arabic: "جَمِيعُ", german: "alle" },
  { arabic: "أَيْنَ", german: "wo" },
  { arabic: "أَيُّ", german: "welcher" },
  { arabic: "مَاذَا", german: "was" },
  { arabic: "لِمَاذَا", german: "warum" },
  { arabic: "كَيْفَ", german: "wie" },
  { arabic: "مَتَى", german: "wann" },
  { arabic: "مَنْ", german: "wer" }
];

async function addMissingWords() {
  console.log(`Adding ${missingWords.length} missing words...`);
  
  for (const word of missingWords) {
    try {
      const normalizedArabic = normalizeArabic(word.arabic);
      
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: {
          arabic: word.arabic,
          arabic_normalized: normalizedArabic,
          german: word.german,
          context: `Häufig verwendetes Wort: ${word.german}`
        }
      });
      
      console.log(`✓ ${word.arabic} (${normalizedArabic}) → ${word.german}`);
    } catch (error) {
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log("\n✅ Quick addition complete!");
}

addMissingWords();