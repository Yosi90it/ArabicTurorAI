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

// Weitere fehlende Wörter aus den Logs
const missingPhrases = [
  { arabic: "بَعِيدَةٍ", german: "fern (weiblich)" },
  { arabic: "بَعِيدٌ", german: "fern" },
  { arabic: "بَعِيدَةً", german: "fern" },
  { arabic: "قَرِيبٌ", german: "nah" },
  { arabic: "قَرِيبَةٌ", german: "nah (weiblich)" },
  { arabic: "قَرِيبًا", german: "nahe" },
  { arabic: "قَرِيبَةً", german: "nahe" },
  
  // Häufige zusammengesetzte Wörter
  { arabic: "أَصْبَحَ", german: "er wurde" },
  { arabic: "أَصْبَحَتْ", german: "sie wurde" },
  { arabic: "أَصْبَحُوا", german: "sie wurden" },
  { arabic: "أَصْبَحْتُ", german: "ich wurde" },
  { arabic: "يُصْبِحُ", german: "er wird" },
  { arabic: "تُصْبِحُ", german: "sie wird" },
  { arabic: "نُصْبِحُ", german: "wir werden" },
  
  { arabic: "أَمْسَى", german: "er verbrachte den Abend" },
  { arabic: "أَمْسَتْ", german: "sie verbrachte den Abend" },
  { arabic: "يُمْسِي", german: "er verbringt den Abend" },
  
  { arabic: "ظَلَّ", german: "er blieb" },
  { arabic: "ظَلَّتْ", german: "sie blieb" },
  { arabic: "ظَلُّوا", german: "sie blieben" },
  { arabic: "يَظَلُّ", german: "er bleibt" },
  { arabic: "تَظَلُّ", german: "sie bleibt" },
  
  { arabic: "بَاتَ", german: "er übernachtete" },
  { arabic: "بَاتَتْ", german: "sie übernachtete" },
  { arabic: "يَبِيتُ", german: "er übernachtet" },
  
  { arabic: "مَا زَالَ", german: "er ist noch" },
  { arabic: "مَا زَالَتْ", german: "sie ist noch" },
  { arabic: "مَا زَالُوا", german: "sie sind noch" },
  
  { arabic: "لَا يَزَالُ", german: "er ist immer noch" },
  { arabic: "لَا تَزَالُ", german: "sie ist immer noch" },
  
  { arabic: "كَادَ", german: "er wäre fast" },
  { arabic: "كَادَتْ", german: "sie wäre fast" },
  { arabic: "يَكَادُ", german: "er wäre fast" },
  { arabic: "تَكَادُ", german: "sie wäre fast" },
  
  // Zeitausdrücke
  { arabic: "الآنَ", german: "jetzt" },
  { arabic: "الْيَوْمَ", german: "heute" },
  { arabic: "أَمْسِ", german: "gestern" },
  { arabic: "غَدًا", german: "morgen" },
  { arabic: "بَعْدَ غَدٍ", german: "übermorgen" },
  { arabic: "أَوَّلَ أَمْسِ", german: "vorgestern" },
  
  { arabic: "صَبَاحًا", german: "morgens" },
  { arabic: "مَسَاءً", german: "abends" },
  { arabic: "لَيْلًا", german: "nachts" },
  { arabic: "ظُهْرًا", german: "mittags" },
  
  { arabic: "الصَّبَاحُ", german: "der Morgen" },
  { arabic: "الْمَسَاءُ", german: "der Abend" },
  { arabic: "اللَّيْلُ", german: "die Nacht" },
  { arabic: "النَّهَارُ", german: "der Tag" },
  { arabic: "الظُّهْرُ", german: "der Mittag" },
  
  // Häufige Fragewörter
  { arabic: "مَنْ", german: "wer" },
  { arabic: "مَاذَا", german: "was" },
  { arabic: "مَتَى", german: "wann" },
  { arabic: "أَيْنَ", german: "wo" },
  { arabic: "كَيْفَ", german: "wie" },
  { arabic: "لِمَاذَا", german: "warum" },
  { arabic: "كَمْ", german: "wie viele" },
  { arabic: "أَيُّ", german: "welcher" },
  { arabic: "أَيَّةُ", german: "welche" },
  
  // Verneinungen
  { arabic: "لَمْ", german: "nicht (Vergangenheit)" },
  { arabic: "لَنْ", german: "nicht (Zukunft)" },
  { arabic: "مَا", german: "nicht" },
  { arabic: "غَيْرُ", german: "nicht" },
  { arabic: "بِلَا", german: "ohne" },
  { arabic: "بِغَيْرِ", german: "ohne" },
  
  // Richtungsangaben
  { arabic: "يَمِينًا", german: "rechts" },
  { arabic: "يَسَارًا", german: "links" },
  { arabic: "أَمَامًا", german: "vorwärts" },
  { arabic: "خَلْفًا", german: "rückwärts" },
  { arabic: "فَوْقَ", german: "oben" },
  { arabic: "تَحْتَ", german: "unten" },
  { arabic: "شَرْقًا", german: "östlich" },
  { arabic: "غَرْبًا", german: "westlich" },
  { arabic: "شَمَالًا", german: "nördlich" },
  { arabic: "جَنُوبًا", german: "südlich" },
  
  // Mengenangaben
  { arabic: "كُلُّ", german: "jeder/alle" },
  { arabic: "جَمِيعُ", german: "alle" },
  { arabic: "بَعْضُ", german: "einige" },
  { arabic: "كَثِيرٌ", german: "viel" },
  { arabic: "قَلِيلٌ", german: "wenig" },
  { arabic: "كَثِيرًا", german: "viel" },
  { arabic: "قَلِيلًا", german: "wenig" },
  { arabic: "أَكْثَرُ", german: "mehr" },
  { arabic: "أَقَلُّ", german: "weniger" },
  
  // Wichtige Partikel
  { arabic: "قَدْ", german: "schon/bereits" },
  { arabic: "سَوْفَ", german: "wird" },
  { arabic: "سَ", german: "wird" },
  { arabic: "كَانَ قَدْ", german: "hatte" },
  { arabic: "لَقَدْ", german: "wirklich" },
  { arabic: "إِنَّ", german: "wahrlich" },
  { arabic: "أَنَّ", german: "dass" },
  { arabic: "كَأَنَّ", german: "als ob" },
  { arabic: "لَعَلَّ", german: "vielleicht" },
  { arabic: "لَيْتَ", german: "wenn doch" }
];

async function addMissingPhrases() {
  console.log(`Adding ${missingPhrases.length} missing phrases and time expressions...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const phrase of missingPhrases) {
    try {
      const normalizedArabic = normalizeArabic(phrase.arabic);
      
      // Check if already exists
      const checkQuery = {
        query: `{
          Get {
            Vocabulary(where: {
              path: ["arabic_normalized"],
              operator: Equal,
              valueString: "${normalizedArabic}"
            }) {
              arabic
            }
          }
        }`
      };
      
      const existingResult = await weaviateRequest('/v1/graphql', 'POST', checkQuery);
      const existingEntries = existingResult.data?.Get?.Vocabulary || [];
      
      if (existingEntries.length > 0) {
        skipped++;
        continue;
      }
      
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: {
          arabic: phrase.arabic,
          arabic_normalized: normalizedArabic,
          german: phrase.german,
          context: `Ergänzende Phrasen: ${phrase.german}`
        }
      });
      
      successful++;
      console.log(`✓ ${phrase.arabic} → ${phrase.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${phrase.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Phrases import complete: ${successful} new, ${skipped} skipped, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Total vocabulary entries: ${totalCount}`);
}

addMissingPhrases();