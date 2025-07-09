import { normalizeArabic } from './normalize-arabic.js';

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

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

// Words that were missing from the logs
const missingWords = [
  { arabic: "عَلَيْهِ", german: "auf ihm", context: "Präposition mit Pronomen" },
  { arabic: "رَسُوْلُ", german: "Gesandter", context: "Prophet oder Bote" },
  { arabic: "وَكَانَتْ", german: "und sie war", context: "Vergangenheitsform mit Konjunktion" },
  { arabic: "النين", german: "die beiden", context: "Dual-Form" },
  { arabic: "أُمِّيْ", german: "meine Mutter", context: "Possessiv-Form" },
  { arabic: "أُمِّي", german: "meine Mutter", context: "Possessiv-Form" },
  { arabic: "بِنَشَاطٍ", german: "mit Aktivität", context: "Präposition mit Substantiv" },
  { arabic: "السُّوقِ", german: "des Marktes", context: "Genitiv-Form" },
  { arabic: "مِنِّيْ", german: "von mir", context: "Präposition mit Pronomen" },
  { arabic: "يَمْنَعُكَ", german: "er hindert dich", context: "Verb mit Pronomen" },
  { arabic: "مِنْ", german: "von", context: "Präposition" },
  { arabic: "ذعبة", german: "Angst", context: "Emotion" },
  { arabic: "ورجعت", german: "und ich kehrte zurück", context: "Vergangenheitsform mit Konjunktion" },
  
  // Additional common words that might appear
  { arabic: "كان", german: "er war", context: "Vergangenheitsform von sein" },
  { arabic: "كانت", german: "sie war", context: "Vergangenheitsform von sein (weiblich)" },
  { arabic: "يكون", german: "er ist", context: "Präsensform von sein" },
  { arabic: "تكون", german: "sie ist", context: "Präsensform von sein (weiblich)" },
  { arabic: "هذا", german: "dieser", context: "Demonstrativpronomen (männlich)" },
  { arabic: "هذه", german: "diese", context: "Demonstrativpronomen (weiblich)" },
  { arabic: "ذلك", german: "jener", context: "Demonstrativpronomen (männlich, fern)" },
  { arabic: "تلك", german: "jene", context: "Demonstrativpronomen (weiblich, fern)" },
  { arabic: "له", german: "für ihn", context: "Präposition mit Pronomen" },
  { arabic: "لها", german: "für sie", context: "Präposition mit Pronomen" },
  { arabic: "منه", german: "von ihm", context: "Präposition mit Pronomen" },
  { arabic: "منها", german: "von ihr", context: "Präposition mit Pronomen" },
  { arabic: "به", german: "mit ihm", context: "Präposition mit Pronomen" },
  { arabic: "بها", german: "mit ihr", context: "Präposition mit Pronomen" },
];

async function addMissingWords() {
  console.log(`Adding ${missingWords.length} missing words...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const word of missingWords) {
    try {
      const normalizedArabic = normalizeArabic(word.arabic);
      
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: {
          arabic: word.arabic,
          arabic_normalized: normalizedArabic,
          german: word.german,
          context: word.context
        }
      });
      
      successful++;
      console.log(`✓ ${word.arabic} (${normalizedArabic}) → ${word.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Added ${successful} words, ${failed} failed`);
}

addMissingWords();