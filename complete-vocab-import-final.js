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

// Alle verbleibenden Wörter aus custom-vocab-import.js ab Zeile 450
const remainingWords = [
  { arabic: "أَصْدِقَائِي", german: "meinen Freunden" },
  { arabic: "كَمَا أَنَّنِي", german: "und außerdem" },
  { arabic: "أُحِبُّ", german: "ich liebe" },
  { arabic: "الْكُتُبَ", german: "die Bücher" },
  { arabic: "كَثِيرًا", german: "sehr" },
  { arabic: "وَأَقْرَأُ", german: "und ich lese" },
  { arabic: "فِي وَقْتِ الْفَرَاغِ", german: "in der Freizeit" },
  { arabic: "الْحِكَايَاتِ", german: "die Erzählungen" },
  { arabic: "وَالْقِصَصَ", german: "und die Geschichten" },
  { arabic: "الْمُفِيدَةَ", german: "die nützlichen" },
  { arabic: "وَبَعْدَ صَلَاةِ الْمَغْرِبِ", german: "und nach dem Abendgebet" },
  { arabic: "أَذْهَبُ", german: "gehe ich" },
  { arabic: "مَعَ أَهْلِي", german: "mit meiner Familie" },
  { arabic: "لِزِيَارَةِ", german: "um zu besuchen" },
  { arabic: "أَصْدِقَائِنَا", german: "unsere Freunde" },
  { arabic: "وَأَقَارِبِنَا", german: "und unsere Verwandten" },
  { arabic: "أَوْ نَبْقَى", german: "oder wir bleiben" },
  { arabic: "فِي الْبَيْتِ", german: "zu Hause" },
  { arabic: "وَنَتَحَدَّثُ", german: "und unterhalten uns" },
  { arabic: "وَنَضْحَكُ", german: "und lachen" },
  { arabic: "وَنَلْعَبُ", german: "und spielen" },
  { arabic: "فِي الْحَدِيقَةِ", german: "im Garten" },
  { arabic: "وَأَحْيَانًا", german: "und manchmal" },
  { arabic: "نَذْهَبُ", german: "gehen wir" },
  { arabic: "إِلَى السِّينَمَا", german: "ins Kino" },
  { arabic: "أَوْ إِلَى الْمَلْعَبِ", german: "oder zum Spielplatz" },
  { arabic: "أَوْ إِلَى الْبَحْرِ", german: "oder zum Meer" },
  { arabic: "فِي نِهَايَةِ الأُسْبُوعِ", german: "am Wochenende" },
  { arabic: "وَأَنَا أُحِبُّ", german: "und ich liebe" },
  { arabic: "كُلَّ هَذِهِ", german: "all diese" },
  { arabic: "الأَشْيَاءَ", german: "Dinge" },
  { arabic: "كَثِيرًا", german: "sehr" },
  { arabic: "وَأَتَمَنَّى", german: "und ich wünsche mir" },
  { arabic: "أَنْ أَعِيشَ", german: "zu leben" },
  { arabic: "حَيَاةً", german: "ein Leben" },
  { arabic: "سَعِيدَةً", german: "glücklich" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "أُسْرَتِي", german: "meiner Familie" },
  { arabic: "وَأَصْدِقَائِي", german: "und meinen Freunden" },
  { arabic: "دَائِمًا", german: "immer" },
  
  // Dialog-Teile
  { arabic: "مُحَمَّدٌ:", german: "Mohammed:" },
  { arabic: "السَّلَامُ عَلَيْكُمْ", german: "Friede sei mit euch" },
  { arabic: "وَعَلَيْكُمُ السَّلَامُ", german: "und mit euch sei Friede" },
  { arabic: "وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ", german: "und Gottes Barmherzigkeit und Seine Segnungen" },
  { arabic: "أَهْلًا وَسَهْلًا", german: "herzlich willkommen" },
  { arabic: "كَيْفَ حَالُكَ؟", german: "Wie geht es dir?" },
  { arabic: "أَنَا بِخَيْرٍ", german: "Mir geht es gut" },
  { arabic: "وَالْحَمْدُ لِلَّهِ", german: "und Lob sei Gott" },
  { arabic: "مَا رَأْيُكَ؟", german: "Was meinst du?" },
  { arabic: "فِي أَنْ نَذْهَبَ", german: "dass wir gehen" },
  { arabic: "إِلَى السُّوقِ", german: "zum Markt" },
  { arabic: "لِنَشْتَرِيَ", german: "um zu kaufen" },
  { arabic: "بَعْضَ الْحَاجَاتِ", german: "einige Bedürfnisse" },
  { arabic: "لِلْبَيْتِ؟", german: "für das Haus?" },
  { arabic: "فِكْرَةٌ مُمْتَازَةٌ", german: "eine ausgezeichnete Idee" },
  { arabic: "لَكِنْ", german: "aber" },
  { arabic: "الدُّكَّانُ قَرِيبٌ", german: "der Laden ist nah" },
  { arabic: "مِنْ بَيْتِنَا", german: "von unserem Haus" },
  { arabic: "وَسَهْلٌ", german: "und einfach" },
  { arabic: "الذَّهَابُ إِلَيْهِ", german: "dorthin zu gehen" },
  { arabic: "وَلَا يَحْتَاجُ", german: "und braucht nicht" },
  { arabic: "إِلَى وَقْتٍ طَوِيلٍ", german: "viel Zeit" },
  { arabic: "صَحِيحٌ", german: "richtig" },
  { arabic: "وَلَكِنَّ", german: "aber" },
  { arabic: "السُّوقَ", german: "der Markt" },
  { arabic: "كَبِيرٌ", german: "groß ist" },
  { arabic: "وَفِيهِ", german: "und darin gibt es" },
  { arabic: "أَشْيَاءُ", german: "Dinge" },
  { arabic: "أَكْثَرُ", german: "mehr" },
  { arabic: "وَأَرْخَصُ", german: "und billiger" },
  { arabic: "مِنَ الدُّكَّانِ", german: "als im Laden" },
  { arabic: "نَعَمْ", german: "ja" },
  { arabic: "هَذَا صَحِيحٌ", german: "das ist richtig" },
  { arabic: "إِذَنْ", german: "also" },
  { arabic: "تَعَالَ", german: "komm" },
  { arabic: "لِنَذْهَبَ", german: "lass uns gehen" },
  { arabic: "مَعًا", german: "zusammen" },
  { arabic: "وَلَكِنْ", german: "aber" },
  { arabic: "مَا الَّذِي", german: "was" },
  { arabic: "نُرِيدُ", german: "wollen wir" },
  { arabic: "أَنْ نَشْتَرِيَهُ؟", german: "kaufen?" },
  { arabic: "نُرِيدُ", german: "wir wollen" },
  { arabic: "لَحْمًا", german: "Fleisch" },
  { arabic: "وَخُبْزًا", german: "und Brot" },
  { arabic: "وَخُضَارًا", german: "und Gemüse" },
  { arabic: "وَفَوَاكِهَ", german: "und Obst" },
  { arabic: "وَسَمَكًا", german: "und Fisch" },
  { arabic: "وَأَرُزًّا", german: "und Reis" },
  { arabic: "وَشَايًا", german: "und Tee" },
  { arabic: "وَسُكَّرًا", german: "und Zucker" },
  { arabic: "حَسَنًا", german: "gut" },
  { arabic: "هَيَّا", german: "los" },
  { arabic: "بِنَا", german: "mit uns" },
  { arabic: "وَنَعُودُ", german: "und wir kehren zurück" },
  { arabic: "بِسُرْعَةٍ", german: "schnell" },
  
  // Weitere häufige Wörter
  { arabic: "الْوَقْتُ", german: "die Zeit" },
  { arabic: "الْيَوْمُ", german: "der Tag" },
  { arabic: "الْأُسْبُوعُ", german: "die Woche" },
  { arabic: "الشَّهْرُ", german: "der Monat" },
  { arabic: "السَّنَةُ", german: "das Jahr" },
  { arabic: "الْأَمْسِ", german: "gestern" },
  { arabic: "الْغَدُ", german: "morgen" },
  { arabic: "بَعْدَ غَدٍ", german: "übermorgen" },
  { arabic: "أَمْسِ", german: "gestern" },
  { arabic: "الْآنَ", german: "jetzt" },
  { arabic: "بَعْدَ قَلِيلٍ", german: "bald" },
  { arabic: "مِنْ فَضْلِكَ", german: "bitte" },
  { arabic: "شُكْرًا", german: "danke" },
  { arabic: "عَفْوًا", german: "entschuldigung" },
  { arabic: "آسِفٌ", german: "es tut mir leid" },
  { arabic: "مَعْذِرَةً", german: "entschuldigung" },
  { arabic: "نَعَمْ", german: "ja" },
  { arabic: "لَا", german: "nein" },
  { arabic: "رُبَّمَا", german: "vielleicht" },
  { arabic: "بِالطَّبْعِ", german: "natürlich" },
  { arabic: "أَكِيدٌ", german: "sicher" },
  { arabic: "مُمْكِنٌ", german: "möglich" },
  { arabic: "مُسْتَحِيلٌ", german: "unmöglich" }
];

async function importRemainingWords() {
  console.log(`Importing remaining ${remainingWords.length} words...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const word of remainingWords) {
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
      if (successful % 20 === 0) {
        console.log(`Progress: ${successful} words imported...`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Import complete: ${successful} new entries, ${skipped} skipped, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Total vocabulary entries in database: ${totalCount}`);
}

importRemainingWords();