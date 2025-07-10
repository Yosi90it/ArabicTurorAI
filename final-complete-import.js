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

// Fehlende Wörter aus den Logs und der custom-vocab-import.js
const allMissingWords = [
  { arabic: "أَوْلَادَكُمْ", german: "euren Kindern" },
  { arabic: "أَبْنَاءُ", german: "Kinder" },
  { arabic: "أُبَالِيْ", german: "ich kümmere mich" },
  { arabic: "وَنَرْجِع", german: "und wir kehren zurück" },
  { arabic: "لِأَشْتَرِيَ", german: "um zu kaufen" },
  { arabic: "خَرَجَ", german: "er ging hinaus" },
  { arabic: "غَزْوَةٍ", german: "einem Feldzug" },
  { arabic: "مَرَّةً:", german: "einmal:" },
  { arabic: "عَنْهَا", german: "über sie" },
  { arabic: "الشَّجَرُ", german: "der Baum" },
  
  // Weitere aus custom-vocab-import.js
  { arabic: "النَّمْلَةُ", german: "Die Ameise" },
  { arabic: "لَسْتُ", german: "ich bin nicht" },
  { arabic: "أَرْضَى", german: "zufrieden" },
  { arabic: "بِالْكَسَلْ", german: "mit Faulheit" },
  { arabic: "طَالَ", german: "dehnt sich aus" },
  { arabic: "سَعْيِي", german: "meine Mühe" },
  { arabic: "بِالأَمَلْ", german: "mit Hoffnung" },
  { arabic: "وَأَسْتَعِدُّ لِلذَّهَابِ", german: "und bereite mich darauf vor zu gehen" },
  { arabic: "إِلَى الْمَدْرَسَةِ", german: "zur Schule" },
  { arabic: "عُمَرُ:", german: "Umar:" },
  { arabic: "الدُّكَّانُ", german: "der Laden" },
  { arabic: "كَبِيْرَةٌ", german: "groß (weiblich)" },
  { arabic: "الْرَاشِدَةِ", german: "al-Raschida" },
  { arabic: "أنامُ", german: "ich schlafe" },
  { arabic: "أَقُومُ", german: "ich stehe auf" },
  { arabic: "أسْتَيْقِظُ", german: "ich erwache" },
  { arabic: "مَسْجِدِ", german: "Moschee" },
  { arabic: "أَمَرَنِيْ", german: "befahl mir" },
  { arabic: "أُمِّيْ", german: "meiner Mutter" },
  { arabic: "مُرُّوا", german: "Gebt den Befehl" },
  { arabic: "سَبْعِ", german: "sieben" },
  { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
  { arabic: "عَلَيْهَا", german: "dazu" },
  { arabic: "عَشْرٍ", german: "zehn" },
  { arabic: "أَيَّامُ الصَّيْفِ", german: "Tage des Sommers" },
  { arabic: "وَأَتَغَدَّى", german: "und ich esse zu Mittag" },
  { arabic: "أَصِلُ", german: "ich komme an" },
  { arabic: "فِي الْمِيعَادِ", german: "pünktlich" },
  { arabic: "وَأَمْكُثُ", german: "und bleibe" },
  { arabic: "سِتَّ سَاعَاتٍ", german: "sechs Stunden" },
  { arabic: "انْتَهَى", german: "es endet" },
  { arabic: "وَضُرِبَ الْجَرَسُ", german: "und die Glocke läutet" },
  { arabic: "مِنْ الْمَدْرَسَةِ", german: "die Schule" },
  { arabic: "وَلَا أَقْرَأُ", german: "und ich lese nicht" },
  { arabic: "بَعْدَ صَلَاةِ الْعَصْرِ", german: "nach dem Nachmittagsgebet" },
  { arabic: "إِلَى الْمَغْرِبِ", german: "bis zum Sonnenuntergang" },
  { arabic: "فِي بَعْضِ الأَيَّامِ", german: "an manchen Tagen" },
  { arabic: "أَمْكُثُ فِي الْبَيْتِ", german: "bleibe ich zu Hause" },
  { arabic: "وَفِي بَعْضِ الأَيَّامِ", german: "und an anderen Tagen" },
  { arabic: "أَذْهَبُ إِلَى السُّوقِ", german: "gehe ich auf den Markt" },
  { arabic: "وَأَشْتَرِي حَوَائِجَ", german: "und kaufe Dinge" },
  { arabic: "أَخْرُجُ مَعَ أَبِي", german: "gehe ich mit meinem Vater" },
  { arabic: "أَوْ أَخِي إِلَى", german: "oder meinem Bruder zu" },
  { arabic: "بَعْضِ الْأَقَارِبِ", german: "einigen Verwandten" },
  { arabic: "أَوْ أَلْعَبُ مَعَ", german: "oder spiele mit" },
  
  // Häufige Verbformen
  { arabic: "أَشْتَرِي", german: "ich kaufe" },
  { arabic: "أَلْعَبُ", german: "ich spiele" },
  { arabic: "أَقْرَأُ", german: "ich lese" },
  { arabic: "أَكْتُبُ", german: "ich schreibe" },
  { arabic: "أَعْمَلُ", german: "ich arbeite" },
  { arabic: "أَدْرُسُ", german: "ich studiere" },
  { arabic: "أَتَعَلَّمُ", german: "ich lerne" },
  { arabic: "أَفْهَمُ", german: "ich verstehe" },
  { arabic: "أَحْفَظُ", german: "ich merke mir" },
  { arabic: "أَتَذَكَّرُ", german: "ich erinnere mich" },
  
  // Weitere Substantive
  { arabic: "الْأَقَارِبُ", german: "die Verwandten" },
  { arabic: "الْأَصْدِقَاءُ", german: "die Freunde" },
  { arabic: "الْجِيرَانُ", german: "die Nachbarn" },
  { arabic: "الْعَائِلَةُ", german: "die Familie" },
  { arabic: "الْوَالِدَانِ", german: "die Eltern" },
  { arabic: "الْأَجْدَادُ", german: "die Großeltern" },
  { arabic: "الْعَمُّ", german: "der Onkel" },
  { arabic: "الْعَمَّةُ", german: "die Tante" },
  { arabic: "الْخَالُ", german: "der Onkel mütterlicherseits" },
  { arabic: "الْخَالَةُ", german: "die Tante mütterlicherseits" },
  
  // Orte und Gebäude
  { arabic: "الْمَنْزِلُ", german: "das Haus" },
  { arabic: "الْغُرْفَةُ", german: "das Zimmer" },
  { arabic: "الْمَطْبَخُ", german: "die Küche" },
  { arabic: "الْحَمَّامُ", german: "das Badezimmer" },
  { arabic: "الْحَدِيقَةُ", german: "der Garten" },
  { arabic: "الشَّارِعُ", german: "die Straße" },
  { arabic: "الْمَدِينَةُ", german: "die Stadt" },
  { arabic: "الْقَرْيَةُ", german: "das Dorf" },
  { arabic: "الْمَكْتَبَةُ", german: "die Bibliothek" },
  { arabic: "الْمُسْتَشْفَى", german: "das Krankenhaus" },
  
  // Essen und Trinken
  { arabic: "الطَّعَامُ", german: "das Essen" },
  { arabic: "الشَّرَابُ", german: "das Getränk" },
  { arabic: "الْخُبْزُ", german: "das Brot" },
  { arabic: "الْلَحْمُ", german: "das Fleisch" },
  { arabic: "الْخُضَارُ", german: "das Gemüse" },
  { arabic: "الْفَوَاكِهُ", german: "das Obst" },
  { arabic: "الْأَرُزُّ", german: "der Reis" },
  { arabic: "الشَّايُ", german: "der Tee" },
  { arabic: "الْقَهْوَةُ", german: "der Kaffee" },
  { arabic: "السُّكَّرُ", german: "der Zucker" },
  
  // Kleidung
  { arabic: "الْمَلَابِسُ", german: "die Kleidung" },
  { arabic: "الْقَمِيصُ", german: "das Hemd" },
  { arabic: "الْبَنْطَلُونُ", german: "die Hose" },
  { arabic: "الْحِذَاءُ", german: "der Schuh" },
  { arabic: "الْقُبَّعَةُ", german: "die Mütze" },
  { arabic: "الْجَاكِيتُ", german: "die Jacke" },
  
  // Körperteile
  { arabic: "الرَّأْسُ", german: "der Kopf" },
  { arabic: "الْعَيْنُ", german: "das Auge" },
  { arabic: "الْأُذُنُ", german: "das Ohr" },
  { arabic: "الْأَنْفُ", german: "die Nase" },
  { arabic: "الْفَمُ", german: "der Mund" },
  { arabic: "الْيَدُ", german: "die Hand" },
  { arabic: "الْقَدَمُ", german: "der Fuß" },
  
  // Adjektive
  { arabic: "سَعِيدٌ", german: "glücklich" },
  { arabic: "حَزِينٌ", german: "traurig" },
  { arabic: "غَاضِبٌ", german: "wütend" },
  { arabic: "مُتَعَبٌ", german: "müde" },
  { arabic: "جَائِعٌ", german: "hungrig" },
  { arabic: "عَطْشَانُ", german: "durstig" },
  { arabic: "سَرِيعٌ", german: "schnell" },
  { arabic: "بَطِيءٌ", german: "langsam" },
  { arabic: "قَوِيٌّ", german: "stark" },
  { arabic: "ضَعِيفٌ", german: "schwach" }
];

async function importFinalBatch() {
  console.log(`Importing final batch of ${allMissingWords.length} words...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const word of allMissingWords) {
    try {
      const normalizedArabic = normalizeArabic(word.arabic);
      
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
          arabic: word.arabic,
          arabic_normalized: normalizedArabic,
          german: word.german,
          context: `Vollständiges Vokabular: ${word.german}`
        }
      });
      
      successful++;
      if (successful % 10 === 0) {
        console.log(`Progress: ${successful} imported...`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Final import complete: ${successful} new entries, ${skipped} skipped, ${failed} failed`);
}

importFinalBatch();