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

// Common book words that appear frequently
const bookWords = [
  { arabic: "كَثِيرًا", german: "viel", context: "Adverb der Menge" },
  { arabic: "الْحَوَائِجِ", german: "die Bedürfnisse", context: "Plural von Bedürfnis" },
  { arabic: "مُشْتَرَيَاتِ", german: "Einkäufe", context: "Plural von Einkauf" },
  { arabic: "أَشْيَاءَ", german: "Dinge", context: "Plural von Ding" },
  { arabic: "شَيْءٌ", german: "Ding", context: "Singular von Ding" },
  { arabic: "أَحْيَانًا", german: "manchmal", context: "Adverb der Zeit" },
  { arabic: "دَائِمًا", german: "immer", context: "Adverb der Zeit" },
  { arabic: "أَبَدًا", german: "nie", context: "Adverb der Zeit" },
  { arabic: "رُبَّمَا", german: "vielleicht", context: "Adverb der Möglichkeit" },
  { arabic: "لَكِنْ", german: "aber", context: "Konjunktion des Gegensatzes" },
  { arabic: "أَيْضًا", german: "auch", context: "Adverb der Hinzufügung" },
  { arabic: "فَقَطْ", german: "nur", context: "Adverb der Begrenzung" },
  { arabic: "جِدًّا", german: "sehr", context: "Adverb der Intensität" },
  { arabic: "قَلِيلًا", german: "wenig", context: "Adverb der Menge" },
  { arabic: "كُلُّ", german: "alle", context: "Quantifizierer" },
  { arabic: "بَعْضُ", german: "einige", context: "Quantifizierer" },
  { arabic: "جَمِيعُ", german: "alle", context: "Quantifizierer" },
  { arabic: "هُنَا", german: "hier", context: "Ortsadverb" },
  { arabic: "هُنَاكَ", german: "dort", context: "Ortsadverb" },
  { arabic: "أَيْنَ", german: "wo", context: "Fragewort für Ort" },
  { arabic: "مَتَى", german: "wann", context: "Fragewort für Zeit" },
  { arabic: "كَيْفَ", german: "wie", context: "Fragewort für Art" },
  { arabic: "مَاذَا", german: "was", context: "Fragewort für Objekt" },
  { arabic: "لِمَاذَا", german: "warum", context: "Fragewort für Grund" },
  { arabic: "مَنْ", german: "wer", context: "Fragewort für Person" },
  { arabic: "أَيُّ", german: "welcher", context: "Fragewort für Auswahl" },
  { arabic: "نَعَمْ", german: "ja", context: "Bejahung" },
  { arabic: "لَا", german: "nein", context: "Verneinung" },
  { arabic: "حَسَنًا", german: "gut", context: "Zustimmung" },
  { arabic: "شُكْرًا", german: "danke", context: "Höflichkeit" },
  { arabic: "عَفْوًا", german: "bitte", context: "Höflichkeit" },
  { arabic: "آسِفٌ", german: "entschuldigung", context: "Höflichkeit" },
  { arabic: "مَرْحَبًا", german: "hallo", context: "Begrüßung" },
  { arabic: "وَدَاعًا", german: "auf wiedersehen", context: "Abschied" },
  { arabic: "صَبَاحُ الْخَيْرِ", german: "guten morgen", context: "Begrüßung" },
  { arabic: "مَسَاءُ الْخَيْرِ", german: "guten abend", context: "Begrüßung" },
  { arabic: "تَصَبَّحُ عَلَى خَيْرٍ", german: "gute nacht", context: "Abschied" },
  { arabic: "إِنْ شَاءَ اللهُ", german: "so gott will", context: "Religiöse Formel" },
  { arabic: "مَا شَاءَ اللهُ", german: "was gott will", context: "Religiöse Formel" },
  { arabic: "بِسْمِ اللهِ", german: "im namen gottes", context: "Religiöse Formel" },
  { arabic: "الْحَمْدُ لِلهِ", german: "gott sei dank", context: "Religiöse Formel" },
  { arabic: "أَسْتَغْفِرُ اللهَ", german: "ich bitte gott um vergebung", context: "Religiöse Formel" },
  { arabic: "سُبْحَانَ اللهِ", german: "gott sei gepriesen", context: "Religiöse Formel" },
  { arabic: "لَا إِلَهَ إِلَّا اللهُ", german: "es gibt keinen gott außer allah", context: "Religiöse Formel" },
  { arabic: "اللهُ أَكْبَرُ", german: "gott ist größer", context: "Religiöse Formel" },
  { arabic: "رَضِيَ اللهُ عَنْهُ", german: "möge gott mit ihm zufrieden sein", context: "Religiöse Formel" },
  { arabic: "صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ", german: "möge gott ihn segnen und ihm frieden geben", context: "Religiöse Formel" },
  { arabic: "بَارَكَ اللهُ فِيكَ", german: "möge gott dich segnen", context: "Religiöse Formel" },
  { arabic: "جَزَاكَ اللهُ خَيْرًا", german: "möge gott dich belohnen", context: "Religiöse Formel" },
  { arabic: "أَعُوذُ بِاللهِ", german: "ich suche schutz bei gott", context: "Religiöse Formel" },
  { arabic: "تَوَكَّلْتُ عَلَى اللهِ", german: "ich vertraue auf gott", context: "Religiöse Formel" },
  { arabic: "قَدَرُ اللهِ", german: "gottes bestimmung", context: "Religiöse Formel" }
];

async function addBookWords() {
  console.log(`Adding ${bookWords.length} common book words...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const word of bookWords) {
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
  
  console.log(`\n✅ Added ${successful} book words, ${failed} failed`);
}

addBookWords();