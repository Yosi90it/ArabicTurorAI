import { normalizeArabic } from './normalize-arabic.js';

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Updating Weaviate vocabulary with normalized Arabic and context...");

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

// Delete existing vocabulary class
async function deleteVocabularyClass() {
  try {
    await weaviateRequest('/v1/schema/Vocabulary', 'DELETE');
    console.log("✓ Deleted existing Vocabulary class");
  } catch (error) {
    console.log("No existing Vocabulary class to delete");
  }
}

// Create new vocabulary class with context field (no vectorization)
async function createVocabularyClass() {
  const classObj = {
    class: 'Vocabulary',
    properties: [
      {
        name: 'arabic',
        dataType: ['text'],
        description: 'Arabic word or phrase'
      },
      {
        name: 'arabic_normalized',
        dataType: ['text'],
        description: 'Normalized Arabic text without diacritics'
      },
      {
        name: 'german',
        dataType: ['text'],
        description: 'German translation'
      },
      {
        name: 'context',
        dataType: ['text'],
        description: 'Context and usage information'
      }
    ],
    vectorizer: 'none'  // Disable vectorization to avoid OpenAI requirement
  };
  
  await weaviateRequest('/v1/schema', 'POST', classObj);
  console.log("✓ Created new Vocabulary class with context field (no vectorization)");
}

// Enhanced vocabulary with context
async function importEnhancedVocabulary() {
  const enhancedVocabulary = [
    // Religious terms
    { arabic: "الله", german: "Allah/Gott", context: "Der eine Gott im Islam" },
    { arabic: "القرآن", german: "der Koran", context: "Das heilige Buch der Muslime" },
    { arabic: "الصلاة", german: "das Gebet", context: "Religiöse Pflicht im Islam" },
    { arabic: "المسجد", german: "die Moschee", context: "Islamisches Gebetshaus" },
    { arabic: "النبي", german: "der Prophet", context: "Gesandter Gottes" },
    { arabic: "الرسول", german: "der Gesandte", context: "Prophet Muhammad" },
    
    // Family terms  
    { arabic: "أب", german: "Vater", context: "Männlicher Elternteil" },
    { arabic: "أم", german: "Mutter", context: "Weiblicher Elternteil" },
    { arabic: "ابن", german: "Sohn", context: "Männliches Kind" },
    { arabic: "ابنة", german: "Tochter", context: "Weibliches Kind" },
    { arabic: "أخ", german: "Bruder", context: "Männlicher Geschwister" },
    { arabic: "أخت", german: "Schwester", context: "Weiblicher Geschwister" },
    
    // Numbers
    { arabic: "واحد", german: "eins", context: "Zahl 1" },
    { arabic: "اثنان", german: "zwei", context: "Zahl 2" },
    { arabic: "ثلاثة", german: "drei", context: "Zahl 3" },
    { arabic: "أربعة", german: "vier", context: "Zahl 4" },
    { arabic: "خمسة", german: "fünf", context: "Zahl 5" },
    { arabic: "ستة", german: "sechs", context: "Zahl 6" },
    { arabic: "سبعة", german: "sieben", context: "Zahl 7" },
    { arabic: "ثمانية", german: "acht", context: "Zahl 8" },
    { arabic: "تسعة", german: "neun", context: "Zahl 9" },
    { arabic: "عشرة", german: "zehn", context: "Zahl 10" },
    
    // Common verbs
    { arabic: "ذهب", german: "gehen", context: "Bewegung von einem Ort zum anderen" },
    { arabic: "جاء", german: "kommen", context: "Bewegung zu einem Ort" },
    { arabic: "أكل", german: "essen", context: "Nahrung zu sich nehmen" },
    { arabic: "شرب", german: "trinken", context: "Flüssigkeit zu sich nehmen" },
    { arabic: "نام", german: "schlafen", context: "Ruhe und Erholung" },
    { arabic: "قال", german: "sagen", context: "Sprechen oder mitteilen" },
    { arabic: "فعل", german: "tun/machen", context: "Eine Handlung ausführen" },
    
    // Daily vocabulary
    { arabic: "بيت", german: "Haus", context: "Wohngebäude" },
    { arabic: "مدرسة", german: "Schule", context: "Bildungseinrichtung" },
    { arabic: "كتاب", german: "Buch", context: "Schriftwerk zum Lesen" },
    { arabic: "قلم", german: "Stift", context: "Schreibwerkzeug" },
    { arabic: "ماء", german: "Wasser", context: "Lebenswichtige Flüssigkeit" },
    { arabic: "طعام", german: "Essen", context: "Nahrung" },
    { arabic: "يوم", german: "Tag", context: "24-Stunden-Periode" },
    { arabic: "ليلة", german: "Nacht", context: "Dunkle Tageszeit" },
    
    // Prepositions
    { arabic: "في", german: "in", context: "Präposition des Ortes" },
    { arabic: "على", german: "auf", context: "Präposition der Position" },
    { arabic: "من", german: "von", context: "Präposition der Herkunft" },
    { arabic: "إلى", german: "zu", context: "Präposition der Richtung" },
    { arabic: "مع", german: "mit", context: "Präposition der Begleitung" },
    { arabic: "عند", german: "bei", context: "Präposition der Nähe" },
    
    // Specific book vocabulary
    { arabic: "وأحسن", german: "und ich verbessere", context: "Verbesserung und Fortschritt" },
    { arabic: "الرجال", german: "die Männer", context: "Männliche Erwachsene" },
    { arabic: "الأطفال", german: "die Kinder", context: "Junge Menschen" },
    { arabic: "تعلم", german: "lernen", context: "Wissen erwerben" },
    { arabic: "حفظ", german: "memorieren", context: "Auswendig lernen" },
    { arabic: "قرأ", german: "lesen", context: "Text verstehen" },
    { arabic: "كتب", german: "schreiben", context: "Text erstellen" },
    
    // Common adjectives
    { arabic: "كبير", german: "groß", context: "Große Größe oder Bedeutung" },
    { arabic: "صغير", german: "klein", context: "Geringe Größe" },
    { arabic: "جميل", german: "schön", context: "Ästhetisch ansprechend" },
    { arabic: "جديد", german: "neu", context: "Kürzlich entstanden" },
    { arabic: "قديم", german: "alt", context: "Seit langer Zeit existierend" },
    
    // Colors
    { arabic: "أحمر", german: "rot", context: "Farbe des Blutes" },
    { arabic: "أزرق", german: "blau", context: "Farbe des Himmels" },
    { arabic: "أخضر", german: "grün", context: "Farbe der Natur" },
    { arabic: "أصفر", german: "gelb", context: "Farbe der Sonne" },
    { arabic: "أبيض", german: "weiß", context: "Farbe der Reinheit" },
    { arabic: "أسود", german: "schwarz", context: "Dunkle Farbe" }
  ];

  console.log(`Starting import of ${enhancedVocabulary.length} enhanced vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const vocab of enhancedVocabulary) {
    try {
      const normalizedArabic = normalizeArabic(vocab.arabic);
      
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: {
          arabic: vocab.arabic,
          arabic_normalized: normalizedArabic,
          german: vocab.german,
          context: vocab.context
        }
      });
      
      successful++;
      console.log(`✓ ${vocab.arabic} (${normalizedArabic}) → ${vocab.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${vocab.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Enhanced import complete: ${successful} successful, ${failed} failed`);
  return successful > 0;
}

async function updateWeaviate() {
  try {
    await deleteVocabularyClass();
    await createVocabularyClass();
    await importEnhancedVocabulary();
    console.log("🎉 Weaviate updated with normalized Arabic and context!");
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }
}

updateWeaviate();