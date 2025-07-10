import { normalizeArabic } from './normalize-arabic.js';

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Importing ALL custom vocabulary with normalization...");

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

// Complete vocabulary from custom-vocab-import.js
const customVocabulary = [
  { arabic: "وأفطرُ", german: "und ich frühstücke" },
  { arabic: "إذا", german: "wenn" },
  { arabic: "كَانَتْ", german: "es waren" },
  { arabic: "أَيَّامُ", german: "Tage" },
  { arabic: "الصَّيْفِ", german: "des Sommers" },
  { arabic: "وأتَغَدَّى", german: "und ich esse zu Mittag" },
  { arabic: "الشِّتاءِ", german: "des Winters" },
  { arabic: "لَمَّا", german: "als (zeitlich)" },
  { arabic: "بَلَغْتُ", german: "ich erreichte" },
  { arabic: "السَّابِعَةَ", german: "die siebte" },
  { arabic: "مِنْ", german: "von" },
  { arabic: "عُمُرِي", german: "meinem Alter" },
  { arabic: "أَمَرَنِي", german: "befahl mir" },
  { arabic: "أَبِي", german: "mein Vater" },
  { arabic: "بِالصَّلَاةِ", german: "das Gebet" },
  { arabic: "وَكُنْتُ", german: "und ich war" },
  { arabic: "تَعَلَّمْتُ", german: "ich lernte" },
  { arabic: "كَثِيرًا", german: "viel" },
  { arabic: "مِنْ", german: "von" },
  { arabic: "الْأَدْعِيَةِ", german: "den Bittgebeten" },
  { arabic: "وَحَفِظْتُ", german: "und ich memorierte" },
  { arabic: "سُوَرًا", german: "Sure(n)" },
  { arabic: "الْقُرْآنِ", german: "des Korans" },
  { arabic: "الْكَرِيمِ", german: "des Edlen" },
  { arabic: "مِنْ", german: "von" },
  { arabic: "أُمِّي", german: "meiner Mutter" },
  { arabic: "وَكَانَتْ", german: "und sie war" },
  { arabic: "تَتَكَلَّمُ", german: "sie erzählte" },
  { arabic: "مَعِي", german: "mir" },
  { arabic: "كُلَّ", german: "jede" },
  { arabic: "لَيْلَةٍ", german: "Nacht" },
  { arabic: "عِنْدَ", german: "beim" },
  { arabic: "الْمَنَامِ", german: "Schlafen" },
  { arabic: "فَتَقُصُّ", german: "und sie berichtete" },
  { arabic: "عَلَيَّ", german: "mir" },
  { arabic: "قِصَصَ", german: "Geschichten" },
  { arabic: "الْأَنْبِيَاءِ", german: "der Propheten" },
  { arabic: "وَكُنتُ", german: "und ich war" },
  { arabic: "أَسْمَعُ", german: "ich hörte" },
  { arabic: "هَذِهِ", german: "diese" },
  { arabic: "الْقِصَصَ", german: "Geschichten" },
  { arabic: "بِنَشَاطٍ", german: "mit Elan" },
  { arabic: "وَرَغْبَةٍ", german: "und Interesse" },
  { arabic: "وَبَدَأْتُ", german: "und ich begann" },
  { arabic: "أَذْهَبُ", german: "ich zu gehen" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "أَبِي", german: "meinem Vater" },
  { arabic: "إِلَى", german: "zur" },
  { arabic: "الْمَسْجِدِ", german: "Moschee" },
  { arabic: "وَأَقُومُ", german: "und ich stellte mich" },
  { arabic: "فِي", german: "in" },
  { arabic: "صَفِّ", german: "Reihe" },
  { arabic: "الْأَطْفَالِ", german: "der Kinder" },
  { arabic: "خَلْفَ", german: "hinter" },
  { arabic: "صَفِّ", german: "Reihe" },
  { arabic: "الرِّجَالِ", german: "der Männer" },
  { arabic: "وَلَمَّا", german: "und als" },
  { arabic: "بَلَغْتُ", german: "ich vollendete" },
  { arabic: "الْعَاشِرَةَ", german: "den zehnten (Jahr)" },
  { arabic: "مِنْ", german: "meines" },
  { arabic: "عُمْرِي", german: "Alters" },
  { arabic: "قَالَ", german: "er sagte" },
  { arabic: "لِي", german: "zu mir" },
  { arabic: "مَرَّةً", german: "einmal" },
  { arabic: "قَدْ", german: "bereits" },
  { arabic: "أَكْمَلْتَ", german: "du hast vollendet" },
  { arabic: "الْآنَ", german: "jetzt" },
  { arabic: "مِنْ", german: "deines" },
  { arabic: "عُمُرِكَ", german: "Alters" },
  { arabic: "تِسْعَ", german: "neun" },
  { arabic: "سِنِينَ", german: "Jahre" },
  { arabic: "وَالْآنَ", german: "und jetzt" },
  { arabic: "أَنْتَ", german: "du bist" },
  { arabic: "ابْنُ", german: "Sohn" },
  { arabic: "عَشْرِ", german: "zehn" },
  { arabic: "سِنِينَ", german: "Jahre" },
  { arabic: "فَإِذَا", german: "wenn dann" },
  { arabic: "تَرَكْتَ", german: "du versäumst" },
  { arabic: "صَلَاةً", german: "Gebet" },
  { arabic: "ضَرَبْتُكَ", german: "werde ich dich schlagen" },
  { arabic: "لِأَنَّ", german: "weil" },
  { arabic: "النَّبِيَّ", german: "der Prophet" },
  { arabic: "قَالَ", german: "sagte" },
  { arabic: "مُرُّوا", german: "befiehlt" },
  { arabic: "أَوْلَادَكُمْ", german: "euren Kindern" },
  { arabic: "بِالصَّلَاةِ", german: "mit dem Gebet" },
  { arabic: "وَهُمْ", german: "während sie" },
  { arabic: "أَبْنَاءُ", german: "Kinder" },
  { arabic: "سَبْعِ", german: "sieben" },
  { arabic: "سِنِينَ", german: "Jahre" },
  { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
  { arabic: "عَلَيْهَا", german: "darauf" },
  { arabic: "وَهُمْ", german: "während sie" },
  { arabic: "أَبْنَاءُ", german: "Kinder" },
  { arabic: "عَشْرٍ", german: "zehn" },
  { arabic: "وَقَصَّ", german: "und er erzählte" },
  { arabic: "عَلَيَّ", german: "mir" },
  { arabic: "قِصَصَ", german: "Geschichten" },
  { arabic: "الْأَطْفَالِ", german: "der Kinder" },
  { arabic: "الَّذِينَ", german: "die" },
  { arabic: "حَافَظُوا", german: "gepflegt haben" },
  { arabic: "عَلَى", german: "auf" },
  { arabic: "الصَّلَاةِ", german: "Gebet" },
  { arabic: "فِي", german: "im" },
  { arabic: "الصِّغَرِ", german: "Kindesalter" },
  { arabic: "وَكَانَ", german: "und es war" },
  { arabic: "لَهُمْ", german: "für sie" },
  { arabic: "شَأْنٌ", german: "Stellung" },
  { arabic: "فِي", german: "im" },
  { arabic: "الْكِبَرِ", german: "Erwachsenenalter" },
  { arabic: "قُلْتُ", german: "ich sagte" },
  { arabic: "يَا", german: "O" },
  { arabic: "أَبِي", german: "Vater" },
  { arabic: "إِنَّكَ", german: "du wirklich" },
  { arabic: "لَا", german: "musst nicht" },
  { arabic: "تَحْتَاجُ", german: "du brauchst" },
  { arabic: "أَنْ", german: "zu" },
  { arabic: "تَضْرِبَنِي", german: "mich schlagen" },
  { arabic: "وَسَأُحَافِظُ", german: "und ich werde bewahren" },
  { arabic: "عَلَى", german: "auf" },
  { arabic: "الصَّلَوَاتِ", german: "die Gebete" },
  { arabic: "وَكَذَلِكَ", german: "und so" },
  { arabic: "فَعَلْتُ", german: "tat ich es" },
  { arabic: "فَقَدْ", german: "denn" },
  { arabic: "كُنْتُ", german: "ich war" },
  { arabic: "أُصَلِّي", german: "ich bete" },
  { arabic: "أَيْنَمَا", german: "wo auch immer" },
  { arabic: "كُنْتُ", german: "ich war" },
  { arabic: "إِذَا", german: "wenn" },
  { arabic: "ذَهَبْتُ", german: "ich ging" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "السُّوقِ", german: "Markt" },
  { arabic: "أَوْ", german: "oder" },
  { arabic: "كُنْتُ", german: "ich war" },
  { arabic: "فِي", german: "in" },
  { arabic: "شُغْلٍ", german: "Arbeit" },
  { arabic: "وَأَدْرَكَتْنِي", german: "und es erreichte mich" },
  { arabic: "الصَّلَاةُ", german: "das Gebet" },
  { arabic: "فِي", german: "in" },
  { arabic: "مَكَانٍ", german: "einem Ort" },
  { arabic: "صَلَّيْتُ", german: "ich betete" },
  { arabic: "لِأَنِّي", german: "weil ich" },
  { arabic: "أَرَى", german: "sehe" },
  { arabic: "النَّاسَ", german: "die Menschen" },
  { arabic: "لَا", german: "nicht" },
  { arabic: "يَخْجَلُونَ", german: "scheuen" },
  { arabic: "مِنْ", german: "vor" },
  { arabic: "الْأَكْلِ", german: "dem Essen" },
  { arabic: "إِذَا", german: "wenn" },
  { arabic: "جَاعُوا", german: "sie hungrig sind" },
  { arabic: "وَاللَّعِبِ", german: "und dem Spielen" },
  { arabic: "إِذَا", german: "wenn" },
  { arabic: "أَرَادُوا", german: "sie wollten" },
  { arabic: "فَلِمَاذَا", german: "warum dann" },
  { arabic: "أَخْجَلُ", german: "soll ich mich schämen" },
  { arabic: "مِنْ", german: "vor" },
  { arabic: "الصَّلَاةِ", german: "dem Gebet" },
  { arabic: "وَإِنَّ", german: "und gewiss" },
  { arabic: "الصَّلَاةَ", german: "das Gebet" },
  { arabic: "لَفَرِيْضَةٌ", german: "ist eine Pflicht" },
  { arabic: "وَإِنَّ", german: "und gewiss" },
  { arabic: "الصَّلَاةَ", german: "das Gebet" },
  { arabic: "لَشَرَفٌ", german: "ist eine Ehre" },
  { arabic: "لِلْمُسْلِمِ", german: "für den Muslim" },
  { arabic: "وَخَرَجْتُ", german: "und ich ging heraus" },
  { arabic: "مَرَّةً", german: "einmal" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "مُبَارَاةٍ", german: "einem Spiel" },
  { arabic: "وَكَانَ", german: "und es war" },
  { arabic: "الزِّحَامُ", german: "das Gedränge" },
  { arabic: "شَدِيدًا", german: "stark" },
  { arabic: "وَأَدْرَكَتْنِي", german: "und es erwischte mich" },
  { arabic: "الصَّلَاةُ", german: "das Gebet" },
  { arabic: "الْعَصْرِ", german: "des Nachmittags" },
  { arabic: "وَكُنْتُ", german: "und ich war" },
  { arabic: "عَلَى", german: "im Zustand" },
  { arabic: "وُضُوْءٍ", german: "der rituellen Waschung" },
  { arabic: "فَقُمْتُ", german: "so stand ich auf" },
  { arabic: "أُصَلِّي", german: "und ich betete" },
  { arabic: "وَجَعَلَ", german: "und es ließ" },
  { arabic: "النَّاسُ", german: "die Leute" },
  { arabic: "يَنْظُرُونَ", german: "schauen" },
  { arabic: "إِلَيَّ", german: "zu mir" },
  { arabic: "وَيَتَعَجَّبُونَ", german: "und erstaunen" },
  { arabic: "وَأَكْمَلْتُ", german: "und ich vollendete" },
  { arabic: "صَلَاتِي", german: "mein Gebet" },
  { arabic: "بِسَكِينَةٍ", german: "in Ruhe" },
  { arabic: "وَاعْتِدَالٍ", german: "und Mitte" },
  { arabic: "وَرَجَعْتُ", german: "und ich kehrte zurück" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "الْمُبَارَاةِ", german: "dem Spiel" },
  { arabic: "وأَصِلُ", german: "und ich erreiche" },
  { arabic: "إلى", german: "bis / zu" },
  { arabic: "الْمِيْعَادِ", german: "dem Beginn / vereinbarten Termin" },
  { arabic: "وأمْكُثُ", german: "und ich bleibe" },
  { arabic: "سِتَّ", german: "sechs" },
  { arabic: "سَاعَاتٍ", german: "Stunden" },
  { arabic: "والدُّرُوسَ", german: "und den Unterricht" },
  { arabic: "بِنشَاطٍ", german: "mit Eifer" },
  { arabic: "ورَغبةٍ", german: "und Begeisterung" },
  { arabic: "وأجلِسُ", german: "und ich sitze" },
  { arabic: "بِأدَبٍ", german: "anständig" },
  { arabic: "وسَكِينَةٍ", german: "und ruhig" },
  { arabic: "حَتَّى", german: "bis" },
  { arabic: "انْتَهَى", german: "vorbei ist" },
  { arabic: "الْوَقْتُ", german: "die Zeit" },
  { arabic: "وَضُرِبَ", german: "und geläutet wird" },
  { arabic: "الْجَرَسُ", german: "die Glocke / Klingel" },
  { arabic: "خَرَجْتُ", german: "ich bin hinausgegangen" },
  { arabic: "مِنْ", german: "aus" },
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "ورَجَعْتُ", german: "und ich bin zurückgekehrt" },
  { arabic: "إلى الْبَيْتِ", german: "nach Hause" },
  { arabic: "قراءة", german: "Lesen" },
  { arabic: "الراشدة", german: "al-Rāschida (Titel/Name)" },
  { arabic: "كيف", german: "wie" },
  { arabic: "أَقْضِي", german: "ich verbringe" },
  { arabic: "يَوْمِي", german: "meinen Tag" },
  { arabic: "أَنَامُ", german: "ich schlafe" },
  { arabic: "مُبَكِّرًا", german: "früh" },
  { arabic: "اللَّيْلِ", german: "in der Nacht" },
  { arabic: "وَأَقُومُ", german: "und ich stehe auf" },
  { arabic: "الصَّبَاحِ", german: "am Morgen" },
  { arabic: "أَسْتَيْقِظُ", german: "ich erwache" },
  { arabic: "عَلَى", german: "auf" },
  { arabic: "اسْمِ", german: "Namen" },
  { arabic: "اللَّهِ", german: "Gottes" },
  { arabic: "وَذِكْرِهِ", german: "und gedenke Ihn" },
  { arabic: "أَسْتَعِدُّ", german: "ich bereite mich vor" },
  { arabic: "لِلصَّلَاةِ", german: "für das Gebet" },
  { arabic: "ثُمَّ", german: "dann" },
  { arabic: "أَذْهَبُ", german: "ich gehe" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "وَالِدِي", german: "meinem Vater" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "الْمَسْجِدِ", german: "der Moschee" },
  { arabic: "قَرِيبٌ", german: "nah" },
  { arabic: "مِن", german: "von" },
  { arabic: "بَيْتِي", german: "meinem Haus" },
  { arabic: "فَأَتَوَضَّأُ", german: "da nehme ich die rituelle Waschung" },
  { arabic: "وَأُصَلِّي", german: "und bete" },
  { arabic: "مَعَ الْجَمَاعَةِ", german: "gemeinsam mit der Gemeinde" },
  { arabic: "وَأَرْجِعُ", german: "und dann kehre ich zurück" },
  { arabic: "إِلَى الْبَيْتِ", german: "nach Hause" },
  { arabic: "وَأَتْلُو", german: "und rezitiere" },
  { arabic: "شَيْئًا مِن", german: "ein wenig von" },
  { arabic: "الْقُرْآنِ الْكَرِيمِ", german: "dem edlen Koran" },
  { arabic: "ثُمَّ أَخْرُجُ", german: "dann verlasse ich (das Haus)" },
  { arabic: "إِلَى الْبُسْتَانِ", german: "den Garten" },
  { arabic: "وَأَجْرِي", german: "und laufe" },
  { arabic: "ثُمَّ أَرْجِعُ", german: "dann komme ich zurück" },
  { arabic: "فَأَشْرَبُ اللَّبَنَ", german: "und trinke Milch" },
  { arabic: "البُسْتَانِ", german: "der Garten" },
  { arabic: "السَّابِعَةَ", german: "die siebte" },
  { arabic: "الشتاء", german: "der Winter" },
  { arabic: "ورغبة", german: "und Wunsch" },
  { arabic: "تَعَالَ", german: "komm" },
  { arabic: "خَالِدٌ", german: "Khalid" }
];

async function importAllCustomVocabulary() {
  console.log(`Importing ${customVocabulary.length} custom vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const vocab of customVocabulary) {
    try {
      const normalizedArabic = normalizeArabic(vocab.arabic);
      
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
          arabic: vocab.arabic,
          arabic_normalized: normalizedArabic,
          german: vocab.german,
          context: `Buchvokabular: ${vocab.german}`
        }
      });
      
      successful++;
      console.log(`✓ ${vocab.arabic} (${normalizedArabic}) → ${vocab.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${vocab.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Import complete: ${successful} new entries, ${skipped} skipped, ${failed} failed`);
}

importAllCustomVocabulary();