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

const missingPhrases = [
  { arabic: "يَا رَسُولَ اللَّهِ", german: "oh Gesandter Gottes" },
  { arabic: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ", german: "Friede sei mit ihm" },
  { arabic: "رَضِيَ اللَّهُ عَنْهُ", german: "möge Gott mit ihm zufrieden sein" },
  { arabic: "رَحِمَهُ اللَّهُ", german: "möge Gott ihm barmherzig sein" },
  { arabic: "بَارَكَ اللَّهُ فِيكَ", german: "möge Gott dich segnen" },
  { arabic: "جَزَاكَ اللَّهُ خَيْرًا", german: "möge Gott dich belohnen" },
  { arabic: "أَعُوذُ بِاللَّهِ", german: "ich suche Zuflucht bei Gott" },
  { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", german: "es gibt keine Macht außer bei Gott" },
  { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", german: "gepriesen sei Gott und gelobt" },
  { arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ", german: "ich bezeuge dass es keinen Gott gibt außer Allah" },
  { arabic: "وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ", german: "und ich bezeuge dass Mohammed der Gesandte Gottes ist" }
];

async function addMissingPhrases() {
  console.log(`Adding ${missingPhrases.length} missing phrases...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const phrase of missingPhrases) {
    try {
      const normalizedArabic = normalizeArabic(phrase.arabic);
      
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: {
          arabic: phrase.arabic,
          arabic_normalized: normalizedArabic,
          german: phrase.german,
          context: `Religiöse Phrase: ${phrase.german}`
        }
      });
      
      successful++;
      console.log(`✓ ${phrase.arabic} → ${phrase.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${phrase.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Added ${successful} phrases, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Total vocabulary entries: ${totalCount}`);
}

addMissingPhrases();