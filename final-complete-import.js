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

// Die verbleibenden Wörter aus der custom-vocab-import.js (ab Zeile 550 bis Ende)
const finalBatch = [
  { arabic: "وَأَصِلُ", german: "und ich erreiche" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "الْمِيعَادِ", german: "dem vereinbarten Termin" },
  { arabic: "وَأَمْكُثُ", german: "und ich bleibe" },
  { arabic: "فِي", german: "in" },
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "سِتَّ", german: "sechs" },
  { arabic: "سَاعَاتٍ", german: "Stunden" },
  { arabic: "وَأَسْمَعُ", german: "und ich höre" },
  { arabic: "الدُّرُوسَ", german: "den Unterricht" },
  { arabic: "بِنَشَاطٍ", german: "mit Eifer" },
  { arabic: "وَرَغْبَةٍ", german: "und Begeisterung" },
  { arabic: "وَأَجْلِسُ", german: "und ich sitze" },
  { arabic: "بِأَدَبٍ", german: "höflich" },
  { arabic: "وَسَكِينَةٍ", german: "und in Ruhe" },
  { arabic: "حَتَّى", german: "bis" },
  { arabic: "إِذَا", german: "wenn" },
  { arabic: "انْتَهَى", german: "es endet" },
  { arabic: "الْوَقْتُ", german: "die Zeit" },
  { arabic: "وَضُرِبَ", german: "und (es) wird geschlagen" },
  { arabic: "الْجَرَسُ", german: "die Glocke" },
  { arabic: "خَرَجْتُ", german: "ich ging hinaus" },
  { arabic: "مِنْ", german: "aus" },
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "وَرَجَعْتُ", german: "und ich kehrte zurück" },
  { arabic: "إِلَى", german: "nach" },
  { arabic: "الْبَيْتِ", german: "Hause" },
  { arabic: "وَلَا", german: "und nicht" },
  { arabic: "أَقْرَأُ", german: "ich lese" },
  { arabic: "بَعْدَ", german: "nach" },
  { arabic: "صَلَاةِ", german: "dem Gebet" },
  { arabic: "الْعَصْرِ", german: "des Nachmittags" },
  { arabic: "إِلَى", german: "bis" },
  { arabic: "الْمَغْرِبِ", german: "zum Sonnenuntergang" },
  { arabic: "وَفِي", german: "und an" },
  { arabic: "بَعْضِ", german: "einigen" },
  { arabic: "الأَيَّامِ", german: "Tagen" },
  { arabic: "أَمْكُثُ", german: "ich bleibe" },
  { arabic: "فِي", german: "im" },
  { arabic: "الْبَيْتِ", german: "Haus" },
  { arabic: "وَأَذْهَبُ", german: "und ich gehe" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "السُّوقِ", german: "Markt" },
  { arabic: "وَأَشْتَرِي", german: "und kaufe" },
  { arabic: "حَوَائِجَ", german: "Bedürfnisse" },
  { arabic: "الْبَيْتِ", german: "des Hauses" },
  { arabic: "وَفِي", german: "und an" },
  { arabic: "بَعْضِ", german: "einigen" },
  { arabic: "الأَيَّامِ", german: "Tagen" },
  { arabic: "أَخْرُجُ", german: "ich gehe hinaus" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "أَبِي", german: "meinem Vater" },
  { arabic: "أَوْ", german: "oder" },
  { arabic: "أَخِي", german: "meinem Bruder" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "بَعْضِ", german: "einigen" },
  { arabic: "الأَقَارِبِ", german: "Verwandten" },
  { arabic: "أَوْ", german: "oder" },
  { arabic: "أَلْعَبُ", german: "ich spiele" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "إِخْوَتِي", german: "meinen Geschwistern" },
  { arabic: "وَأَصْدِقَائِي", german: "und meinen Freunden" },
  { arabic: "وَأَتَعَشَّى", german: "und ich esse Abendbrot" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "وَالِدِي", german: "meinem Vater" },
  { arabic: "وَإِخْوَتِي", german: "und meinen Geschwistern" },
  { arabic: "وَأَحْفَظُ", german: "und ich lerne" },
  { arabic: "دُرُوسِي", german: "meine Lektionen" },
  { arabic: "وَأُطَالِعُ", german: "und ich bereite vor" },
  { arabic: "لِلْغَدِ", german: "für morgen" },
  { arabic: "وَأَسْتَعِدُّ", german: "und ich bereite mich vor" },
  { arabic: "لِلدَّرْسِ", german: "für den Unterricht" },
  { arabic: "وَأَكْتُبُ", german: "und ich schreibe" },
  { arabic: "مَا", german: "was" },
  { arabic: "بِأَمْرِ", german: "befiehlt" },
  { arabic: "بِهِ", german: "er" },
  { arabic: "الْمُعَلِّمُ", german: "der Lehrer" },
  { arabic: "وَأُصَلِّي", german: "und ich bete" },
  { arabic: "الْعِشَاءَ", german: "das Nachtgebet" },
  { arabic: "وَأَقْرَأُ", german: "und ich lese" },
  { arabic: "قَلِيلًا", german: "ein wenig" },
  { arabic: "ثُمَّ", german: "dann" },
  { arabic: "أَنَامُ", german: "ich schlafe" },
  { arabic: "عَلَيَّ", german: "auf" },
  { arabic: "اسْمِ", german: "den Namen" },
  { arabic: "اللَّهِ", german: "Gottes" },
  { arabic: "وَذِكْرِهِ", german: "und gedenke Ihm" },
  { arabic: "تِلْكَ", german: "das ist" },
  { arabic: "عَادَتِي", german: "meine Gewohnheit" },
  { arabic: "كُلَّ", german: "jeden" },
  { arabic: "يَوْمٍ", german: "Tag" },
  { arabic: "لَا", german: "nicht" },
  { arabic: "أُخَالِفُهَا", german: "verstoße gegen sie" },
  { arabic: "وَأَقُومُ", german: "und ich stehe auf" },
  { arabic: "يَوْمَ", german: "am Tag" },
  { arabic: "الْعُطْلَةِ", german: "der Ferien" },
  { arabic: "أَيْضًا", german: "auch" },
  { arabic: "وَأَتْلُو", german: "und ich rezitiere" },
  { arabic: "الْقُرْآنَ", german: "den Koran" },
  { arabic: "وَأَقْضِي", german: "und ich verbringe" },
  { arabic: "الْيَوْمَ", german: "den Tag" },
  { arabic: "فِي", german: "mit" },
  { arabic: "مُطَالَعَةِ", german: "dem Lesen" },
  { arabic: "كِتَابٍ", german: "eines Buches" },
  { arabic: "وَمُحَادَثَةٍ", german: "und der Unterhaltung" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "أَبِي", german: "meinem Vater" },
  { arabic: "وَأُمِّي", german: "und meiner Mutter" },
  { arabic: "وَإِخْوَتِي", german: "und meinen Geschwistern" },
  { arabic: "وَفِي", german: "und bei" },
  { arabic: "زِيَارَةِ", german: "dem Besuch" },
  { arabic: "قَرِيبٍ", german: "eines Verwandten" },
  { arabic: "أَوْ", german: "oder" },
  { arabic: "عِيَادَةِ", german: "dem Krankenbesuch" },
  { arabic: "مَرِيضٍ", german: "eines Kranken" },
  { arabic: "وَأَمْكُثُ", german: "und ich bleibe" },
  { arabic: "أَحْيَانًا", german: "manchmal" },
  { arabic: "فِي", german: "im" },
  { arabic: "الْبَيْتِ", german: "Hause" },
  { arabic: "وَأَخْرُجُ", german: "und ich gehe hinaus" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "الْخَارِجِ", german: "draußen" },
  { arabic: "لَمَّا", german: "als" },
  { arabic: "بَلَغْتُ", german: "ich erreichte" },
  { arabic: "السَّابِعَةَ", german: "den siebten (Jahr)" },
  { arabic: "مِنْ", german: "von" },
  { arabic: "عُمُرِي", german: "meinem Alter" },
  { arabic: "أَمَرَنِي", german: "befahl mir" },
  { arabic: "أَبِي", german: "mein Vater" },
  { arabic: "بِالصَّلَاةِ", german: "zum Gebet" },
  { arabic: "وَحَفِظْتُ", german: "und ich habe auswendig gelernt" },
  { arabic: "سُوَرًا", german: "Suren" },
  { arabic: "مِنْ", german: "aus" },
  { arabic: "الْقُرْآنِ", german: "dem Koran" },
  { arabic: "أُمِّي", german: "meiner Mutter" },
  { arabic: "وَكَانَتْ", german: "und sie war" },
  { arabic: "تَتَكَلَّمُ", german: "erzählt" },
  { arabic: "قِصَصَ", german: "Geschichten" },
  { arabic: "الْأَنْبِيَاءِ", german: "der Propheten" },
  { arabic: "وَبَدَأْتُ", german: "und ich begann" },
  { arabic: "أَذْهَبُ", german: "zu gehen" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "مَسْجِدِ", german: "Moschee" },
  { arabic: "وَأَقُومُ", german: "und ich stelle mich" },
  { arabic: "فِي", german: "in" },
  { arabic: "صَفِّ", german: "Reihe" },
  { arabic: "الْأَطْفَالِ", german: "der Kinder" },
  { arabic: "خَلْفَ", german: "hinter" },
  { arabic: "الرِّجَالِ", german: "der Männer" },
  { arabic: "وَلَمَّا", german: "und als" },
  { arabic: "بَلَغْتُ", german: "ich erreichte" },
  { arabic: "الْعَاشِرَةَ", german: "die zehnte" },
  { arabic: "قَالَ", german: "sagte" },
  { arabic: "لِي", german: "zu mir" },
  { arabic: "مُرُّوا", german: "Gebt den Befehl" },
  { arabic: "أَوْلَادَكُمْ", german: "euren Kindern" },
  { arabic: "وَهُمْ", german: "und sie sind" },
  { arabic: "أَبْنَاءُ", german: "Kinder" },
  { arabic: "سَبْعِ", german: "sieben" },
  { arabic: "سِنِينَ", german: "Jahre" },
  { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
  { arabic: "عَلَيْهَا", german: "dazu" },
  { arabic: "عَشْرِ", german: "zehn" },
  { arabic: "وَفَرِّقُوا", german: "und trennt" },
  { arabic: "بَيْنَهُمْ", german: "zwischen ihnen" },
  { arabic: "فِي الْمَضَاجِعِ", german: "in den Betten" },
  
  // Dialog zwischen Muhammad und Omar
  { arabic: "مُحَمَّدٌ", german: "Mohammed" },
  { arabic: "عُمَرُ", german: "Omar" },
  { arabic: "تَفَضَّلْ", german: "bitte schön" },
  { arabic: "اجْلِسْ", german: "setz dich" },
  { arabic: "شُكْرًا لَكَ", german: "danke dir" },
  { arabic: "مَا رَأْيُكَ", german: "was meinst du" },
  { arabic: "أَنْ نَذْهَبَ", german: "dass wir gehen" },
  { arabic: "لِنَشْتَرِيَ", german: "um zu kaufen" },
  { arabic: "بَعْضَ", german: "einige" },
  { arabic: "الْحَاجَاتِ", german: "Bedürfnisse" },
  { arabic: "لِلْبَيْتِ", german: "für das Haus" },
  { arabic: "فِكْرَةٌ", german: "eine Idee" },
  { arabic: "مُمْتَازَةٌ", german: "ausgezeichnet" },
  { arabic: "لَكِنَّ", german: "aber" },
  { arabic: "الدُّكَّانَ", german: "der Laden" },
  { arabic: "قَرِيبٌ", german: "nah" },
  { arabic: "مِنْ بَيْتِنَا", german: "von unserem Haus" },
  { arabic: "وَسَهْلٌ", german: "und einfach" },
  { arabic: "الذَّهَابُ", german: "das Gehen" },
  { arabic: "إِلَيْهِ", german: "zu ihm" },
  { arabic: "وَلَا يَحْتَاجُ", german: "und braucht nicht" },
  { arabic: "وَقْتٍ طَوِيلٍ", german: "viel Zeit" },
  { arabic: "صَحِيحٌ", german: "richtig" },
  { arabic: "وَلَكِنَّ", german: "aber" },
  { arabic: "السُّوقَ", german: "der Markt" },
  { arabic: "كَبِيرٌ", german: "groß" },
  { arabic: "وَفِيهِ", german: "und darin" },
  { arabic: "أَشْيَاءُ", german: "Sachen" },
  { arabic: "أَكْثَرُ", german: "mehr" },
  { arabic: "وَأَرْخَصُ", german: "und billiger" },
  { arabic: "مِنَ الدُّكَّانِ", german: "als der Laden" },
  { arabic: "هَذَا صَحِيحٌ", german: "das ist richtig" },
  { arabic: "إِذَنْ", german: "also" },
  { arabic: "تَعَالَ", german: "komm" },
  { arabic: "لِنَذْهَبَ", german: "lass uns gehen" },
  { arabic: "مَعًا", german: "zusammen" },
  { arabic: "وَلَكِنْ", german: "aber" },
  { arabic: "مَا الَّذِي", german: "was" },
  { arabic: "نُرِيدُ", german: "wollen wir" },
  { arabic: "أَنْ نَشْتَرِيَهُ", german: "kaufen" },
  { arabic: "لَحْمًا", german: "Fleisch" },
  { arabic: "وَخُبْزًا", german: "und Brot" },
  { arabic: "وَخُضَارًا", german: "und Gemüse" },
  { arabic: "وَفَوَاكِهَ", german: "und Obst" },
  { arabic: "وَسَمَكًا", german: "und Fisch" },
  { arabic: "وَأَرُزًّا", german: "und Reis" },
  { arabic: "وَشَايًا", german: "und Tee" },
  { arabic: "وَسُكَّرًا", german: "und Zucker" },
  { arabic: "حَسَنًا", german: "gut" },
  { arabic: "هَيَّا بِنَا", german: "los geht's" },
  { arabic: "وَنَعُودُ", german: "und wir kehren zurück" },
  { arabic: "بِسُرْعَةٍ", german: "schnell" }
];

async function importFinalBatch() {
  console.log(`Importing final batch of ${finalBatch.length} vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const word of finalBatch) {
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
          context: `Finaler Batch: ${word.german}`
        }
      });
      
      successful++;
      if (successful % 20 === 0) {
        console.log(`Progress: ${successful} words added...`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Final import complete: ${successful} new entries, ${skipped} skipped, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Final total vocabulary entries in database: ${totalCount}`);
  console.log(`🎯 Target was 634 entries from custom-vocab-import.js`);
}

importFinalBatch();