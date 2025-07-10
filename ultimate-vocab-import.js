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

// Alle verbleibenden Wörter aus der custom-vocab-import.js (ab Zeile 550)
const finalWords = [
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "فِي", german: "in" },
  { arabic: "الْمِيعَادِ", german: "dem vereinbarten Termin" },
  { arabic: "وَأَمْكُثُ", german: "und ich bleibe" },
  { arabic: "سِتَّ", german: "sechs" },
  { arabic: "سَاعَاتٍ", german: "Stunden" },
  { arabic: "وَأَسْمَعُ", german: "und ich höre" },
  { arabic: "الدُّرُوسَ", german: "den Unterricht" },
  { arabic: "بِنَشَاطٍ", german: "mit Begeisterung" },
  { arabic: "وَرَغْبَةٍ", german: "und Lust" },
  { arabic: "وَأَجْلِسُ", german: "und ich setze mich" },
  { arabic: "بِأَدَبٍ", german: "höflich" },
  { arabic: "وَسَكِينَةٍ", german: "und ruhig" },
  { arabic: "حَتَّى", german: "bis" },
  { arabic: "انْتَهَى", german: "es endet" },
  { arabic: "الْوَقْتُ", german: "die Zeit" },
  { arabic: "وَضُرِبَ", german: "und es wird geläutet" },
  { arabic: "الْجَرَسُ", german: "die Glocke" },
  { arabic: "خَرَجْتُ", german: "ich verließ" },
  { arabic: "مِنَ", german: "von" },
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "وَرَجَعْتُ", german: "und ich kehrte zurück" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "الْبَيْتِ", german: "dem Haus" },
  
  // Dialog mit Mohammad und Omar
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
  { arabic: "بِسُرْعَةٍ", german: "schnell" },
  
  // Weitere Familiengeschichte
  { arabic: "قَالَ أَبِي", german: "mein Vater sagte" },
  { arabic: "لِي", german: "zu mir" },
  { arabic: "ذَاتَ يَوْمٍ", german: "eines Tages" },
  { arabic: "مُرُّوا", german: "Gebt Befehl" },
  { arabic: "أَوْلَادَكُمْ", german: "euren Kindern" },
  { arabic: "بِالصَّلَاةِ", german: "zum Gebet" },
  { arabic: "وَهُمْ", german: "wenn sie" },
  { arabic: "أَبْنَاءُ", german: "Söhne" },
  { arabic: "سَبْعِ", german: "sieben" },
  { arabic: "سِنِينَ", german: "Jahre" },
  { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
  { arabic: "عَلَيْهَا", german: "deswegen" },
  { arabic: "وَهُمْ", german: "wenn sie" },
  { arabic: "أَبْنَاءُ", german: "Söhne" },
  { arabic: "عَشْرِ", german: "zehn" },
  { arabic: "سِنِينَ", german: "Jahre" },
  { arabic: "وَفَرِّقُوا", german: "und trennt" },
  { arabic: "بَيْنَهُمْ", german: "zwischen ihnen" },
  { arabic: "فِي الْمَضَاجِعِ", german: "in den Betten" },
  
  // Weitere Geschichte und Dialoge
  { arabic: "لَا أُبَالِي", german: "ich kümmere mich nicht" },
  { arabic: "بِالْحَوَائِجِ", german: "um die Bedürfnisse" },
  { arabic: "وَنَرْجِعُ", german: "und wir kehren zurück" },
  { arabic: "فِي السَّاعَةِ", german: "um ... Uhr" },
  { arabic: "الثَّانِيَةَ عَشْرَةَ", german: "zwölf" },
  { arabic: "وَالنِّصْفِ", german: "und halb" },
  { arabic: "لِأَشْتَرِيَ", german: "um zu kaufen" },
  { arabic: "شَيْئًا", german: "etwas" },
  { arabic: "لِلْمَدْرَسَةِ", german: "für die Schule" },
  { arabic: "مَا يَمْنَعُكَ", german: "was hindert dich" },
  { arabic: "مِنِّي", german: "an mir" },
  
  // Geschichten der Propheten
  { arabic: "خَرَجَ", german: "er ging hinaus" },
  { arabic: "رَسُولُ اللَّهِ", german: "der Gesandte Gottes" },
  { arabic: "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ", german: "Friede sei mit ihm" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "غَزْوَةٍ", german: "einem Feldzug" },
  { arabic: "مَرَّةً", german: "einmal" },
  { arabic: "وَفِي", german: "und in" },
  { arabic: "الطَّرِيقِ", german: "dem Weg" },
  { arabic: "مَرَّ", german: "kam er vorbei" },
  { arabic: "بِشَجَرَةٍ", german: "an einem Baum" },
  { arabic: "عَنْهَا", german: "von ihm" },
  { arabic: "فَسَأَلَ", german: "und fragte" },
  { arabic: "أَصْحَابَهُ", german: "seine Gefährten" },
  { arabic: "مَا", german: "was" },
  { arabic: "اسْمُ", german: "Name" },
  { arabic: "هَذِهِ", german: "dieses" },
  { arabic: "الشَّجَرَةِ", german: "Baumes" },
  { arabic: "فَقَالُوا", german: "da sagten sie" },
  { arabic: "لَا نَدْرِي", german: "wir wissen nicht" },
  { arabic: "يَا رَسُولَ اللَّهِ", german: "oh Gesandter Gottes" },
  { arabic: "فَقَالَ", german: "da sagte er" },
  { arabic: "إِنَّ", german: "wahrlich" },
  { arabic: "هَذِهِ", german: "dieser" },
  { arabic: "شَجَرَةُ", german: "Baum" },
  { arabic: "كَذَا", german: "so und so" },
  { arabic: "وَكَذَا", german: "und so und so" },
  
  // Zahlen und Zeit
  { arabic: "الْوَاحِدَةُ", german: "eins" },
  { arabic: "الثَّانِيَةُ", german: "zwei" },
  { arabic: "الثَّالِثَةُ", german: "drei" },
  { arabic: "الرَّابِعَةُ", german: "vier" },
  { arabic: "الْخَامِسَةُ", german: "fünf" },
  { arabic: "السَّادِسَةُ", german: "sechs" },
  { arabic: "السَّابِعَةُ", german: "sieben" },
  { arabic: "الثَّامِنَةُ", german: "acht" },
  { arabic: "التَّاسِعَةُ", german: "neun" },
  { arabic: "الْعَاشِرَةُ", german: "zehn" },
  { arabic: "الْحَادِيَةَ عَشْرَةَ", german: "elf" },
  { arabic: "الثَّانِيَةَ عَشْرَةَ", german: "zwölf" },
  
  // Weitere wichtige Begriffe
  { arabic: "الْإِسْلَامُ", german: "der Islam" },
  { arabic: "الْإِيمَانُ", german: "der Glaube" },
  { arabic: "الْمُسْلِمُ", german: "der Muslim" },
  { arabic: "الْمُؤْمِنُ", german: "der Gläubige" },
  { arabic: "الصَّلَاةُ", german: "das Gebet" },
  { arabic: "الزَّكَاةُ", german: "die Armensteuer" },
  { arabic: "الصَّوْمُ", german: "das Fasten" },
  { arabic: "الْحَجُّ", german: "die Pilgerfahrt" },
  { arabic: "الْجَنَّةُ", german: "das Paradies" },
  { arabic: "النَّارُ", german: "das Feuer" },
  { arabic: "الْحَمْدُ لِلَّهِ", german: "Lob sei Gott" },
  { arabic: "سُبْحَانَ اللَّهِ", german: "Gepriesen sei Gott" },
  { arabic: "اللَّهُ أَكْبَرُ", german: "Gott ist größer" },
  { arabic: "لَا إِلَهَ إِلَّا اللَّهُ", german: "Es gibt keinen Gott außer Allah" },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", german: "Ich bitte Gott um Vergebung" },
  { arabic: "بِسْمِ اللَّهِ", german: "Im Namen Gottes" },
  { arabic: "إِنْ شَاءَ اللَّهُ", german: "So Gott will" },
  { arabic: "مَا شَاءَ اللَّهُ", german: "Was Gott wollte" },
  { arabic: "بَارَكَ اللَّهُ", german: "Gott segne" }
];

async function importUltimateVocab() {
  console.log(`Importing final ${finalWords.length} vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const word of finalWords) {
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
      if (successful % 25 === 0) {
        console.log(`Progress: ${successful} words added...`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Ultimate import complete: ${successful} new entries, ${skipped} skipped, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Total vocabulary entries in database: ${totalCount}`);
}

importUltimateVocab();