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

// Direkt aus den aktuellen Logs - alle fehlenden Wörter
const quickMissingWords = [
  { arabic: "نَظِيْفَةٌ", german: "sauber (weiblich)" },
  { arabic: "نَظِيفٌ", german: "sauber" },
  { arabic: "نَظِيفَةً", german: "sauber" },
  { arabic: "وَالدَّكَاكِيْنُ", german: "und die Läden" },
  { arabic: "الدَّكَاكِيْنُ", german: "die Läden" },
  { arabic: "دُكَّانٌ", german: "Laden" },
  { arabic: "دَكَاكِينُ", german: "Läden" },
  { arabic: "رَجُلٌ", german: "Mann" },
  { arabic: "رِجَالٌ", german: "Männer" },
  { arabic: "وَجَاءَ", german: "und er kam" },
  { arabic: "جَاءَ", german: "er kam" },
  { arabic: "يَأْتِي", german: "er kommt" },
  { arabic: "الْمُشْرِكِينَ", german: "die Götzendiener" },
  { arabic: "مُشْرِكٌ", german: "Götzendiener" },
  { arabic: "مُشْرِكُونَ", german: "Götzendiener" },
  { arabic: "وَسَيْفُ", german: "und das Schwert" },
  { arabic: "سَيْفٌ", german: "Schwert" },
  { arabic: "سُيُوفٌ", german: "Schwerter" },
  { arabic: "غِمْدِهِ", german: "seiner Scheide" },
  { arabic: "غِمْدٌ", german: "Scheide" },
  { arabic: "وَهُوَ", german: "und er" },
  { arabic: "هُوَ", german: "er" },
  { arabic: "هِيَ", german: "sie" },
  { arabic: "بِالسَّمُرَةِ", german: "mit der Bräune" },
  { arabic: "السَّمُرَةُ", german: "die Bräune" },
  { arabic: "أَسْمَرُ", german: "braun" },
  { arabic: "سَمْرَاءُ", german: "braun (weiblich)" },
  { arabic: "مُعَلَّقٌ", german: "hängend" },
  { arabic: "عَلَّقَ", german: "er hängte auf" },
  { arabic: "يُعَلِّقُ", german: "er hängt auf" },
  
  // Weitere wichtige Grundwörter
  { arabic: "هُمْ", german: "sie (männlich)" },
  { arabic: "هُنَّ", german: "sie (weiblich)" },
  { arabic: "نَحْنُ", german: "wir" },
  { arabic: "أَنْتَ", german: "du (männlich)" },
  { arabic: "أَنْتِ", german: "du (weiblich)" },
  { arabic: "أَنْتُمْ", german: "ihr (männlich)" },
  { arabic: "أَنْتُنَّ", german: "ihr (weiblich)" },
  { arabic: "أَنَا", german: "ich" },
  { arabic: "إِيَّايَ", german: "mich" },
  { arabic: "إِيَّاكَ", german: "dich" },
  { arabic: "إِيَّاهُ", german: "ihn" },
  { arabic: "إِيَّاهَا", german: "sie" },
  { arabic: "إِيَّانَا", german: "uns" },
  { arabic: "إِيَّاكُمْ", german: "euch" },
  { arabic: "إِيَّاهُمْ", german: "sie" },
  
  // Häufige Verben
  { arabic: "كَانَ", german: "er war" },
  { arabic: "كَانَتْ", german: "sie war" },
  { arabic: "كَانُوا", german: "sie waren" },
  { arabic: "كُنْتُ", german: "ich war" },
  { arabic: "كُنْتَ", german: "du warst" },
  { arabic: "كُنَّا", german: "wir waren" },
  { arabic: "يَكُونُ", german: "er ist/wird sein" },
  { arabic: "تَكُونُ", german: "sie ist/wird sein" },
  { arabic: "أَكُونُ", german: "ich bin/werde sein" },
  { arabic: "نَكُونُ", german: "wir sind/werden sein" },
  { arabic: "يَكُونُونَ", german: "sie sind/werden sein" },
  
  // Demonstrativpronomen
  { arabic: "هَذَا", german: "dieser" },
  { arabic: "هَذِهِ", german: "diese" },
  { arabic: "ذَلِكَ", german: "jener" },
  { arabic: "تِلْكَ", german: "jene" },
  { arabic: "هَؤُلَاءِ", german: "diese (Plural)" },
  { arabic: "أُولَئِكَ", german: "jene (Plural)" },
  { arabic: "هُنَا", german: "hier" },
  { arabic: "هُنَاكَ", german: "dort" },
  { arabic: "هُنَالِكَ", german: "dort" },
  
  // Relativpronomen
  { arabic: "الَّذِي", german: "der/welcher" },
  { arabic: "الَّتِي", german: "die/welche" },
  { arabic: "الَّذِينَ", german: "die/welche (männlich Plural)" },
  { arabic: "اللَّذَانِ", german: "die beiden (männlich)" },
  { arabic: "اللَّتَانِ", german: "die beiden (weiblich)" },
  { arabic: "اللَّوَاتِي", german: "die/welche (weiblich Plural)" },
  
  // Konjunktionen
  { arabic: "وَ", german: "und" },
  { arabic: "أَوْ", german: "oder" },
  { arabic: "لَكِنْ", german: "aber" },
  { arabic: "لَكِنَّ", german: "aber" },
  { arabic: "بَلْ", german: "sondern" },
  { arabic: "فَ", german: "dann/so" },
  { arabic: "ثُمَّ", german: "dann" },
  { arabic: "أَمْ", german: "oder" },
  { arabic: "إِذْ", german: "als" },
  { arabic: "إِذَا", german: "wenn" },
  { arabic: "لَمَّا", german: "als" },
  { arabic: "لَوْ", german: "wenn" },
  { arabic: "كَأَنَّ", german: "als ob" },
  
  // Weitere Verben
  { arabic: "قَالَ", german: "er sagte" },
  { arabic: "قَالَتْ", german: "sie sagte" },
  { arabic: "يَقُولُ", german: "er sagt" },
  { arabic: "تَقُولُ", german: "sie sagt" },
  { arabic: "أَقُولُ", german: "ich sage" },
  { arabic: "نَقُولُ", german: "wir sagen" },
  { arabic: "قُلْتُ", german: "ich sagte" },
  { arabic: "قُلْتَ", german: "du sagtest" },
  { arabic: "فَعَلَ", german: "er tat" },
  { arabic: "يَفْعَلُ", german: "er tut" },
  { arabic: "أَفْعَلُ", german: "ich tue" },
  { arabic: "نَفْعَلُ", german: "wir tun" },
  { arabic: "ذَهَبَ", german: "er ging" },
  { arabic: "يَذْهَبُ", german: "er geht" },
  { arabic: "أَذْهَبُ", german: "ich gehe" },
  { arabic: "نَذْهَبُ", german: "wir gehen" },
  { arabic: "رَأَى", german: "er sah" },
  { arabic: "يَرَى", german: "er sieht" },
  { arabic: "أَرَى", german: "ich sehe" },
  { arabic: "نَرَى", german: "wir sehen" },
  
  // Adjektive
  { arabic: "كَبِيرَةٌ", german: "groß (weiblich)" },
  { arabic: "صَغِيرَةٌ", german: "klein (weiblich)" },
  { arabic: "طَوِيلَةٌ", german: "lang (weiblich)" },
  { arabic: "قَصِيرَةٌ", german: "kurz (weiblich)" },
  { arabic: "جَمِيلَةٌ", german: "schön (weiblich)" },
  { arabic: "قَبِيحَةٌ", german: "hässlich (weiblich)" },
  { arabic: "جَدِيدَةٌ", german: "neu (weiblich)" },
  { arabic: "قَدِيمَةٌ", german: "alt (weiblich)" },
  { arabic: "سَرِيعَةٌ", german: "schnell (weiblich)" },
  { arabic: "بَطِيئَةٌ", german: "langsam (weiblich)" }
];

async function addMissingWords() {
  console.log(`Quick adding ${quickMissingWords.length} missing words...`);
  
  let successful = 0;
  let failed = 0;
  
  // Batch import für bessere Performance
  for (let i = 0; i < quickMissingWords.length; i += 10) {
    const batch = quickMissingWords.slice(i, i + 10);
    
    const promises = batch.map(async (word) => {
      try {
        const normalizedArabic = normalizeArabic(word.arabic);
        
        await weaviateRequest('/v1/objects', 'POST', {
          class: 'Vocabulary',
          properties: {
            arabic: word.arabic,
            arabic_normalized: normalizedArabic,
            german: word.german,
            context: `Schneller Import: ${word.german}`
          }
        });
        
        successful++;
        return `✓ ${word.arabic} → ${word.german}`;
      } catch (error) {
        failed++;
        return `✗ ${word.arabic} - ${error.message}`;
      }
    });
    
    const results = await Promise.all(promises);
    results.forEach(result => console.log(result));
    
    console.log(`Batch ${Math.floor(i/10) + 1} complete...`);
  }
  
  console.log(`\n✅ Quick import complete: ${successful} added, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Total vocabulary entries: ${totalCount}`);
}

addMissingWords();