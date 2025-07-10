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

// Alle fehlenden Wörter aus dem Log und der custom-vocab-import.js
const allMissingWords = [
  { arabic: "وَأَجْلِسُ", german: "und ich sitze" },
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "خرجت", german: "ich ging hinaus" },
  { arabic: "والميعاد", german: "und der Termin" },
  { arabic: "خَرَجْتُ", german: "ich bin hinausgegangen" },
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "وأجلِسُ", german: "und ich sitze" },
  { arabic: "بِأدَبٍ", german: "anständig" },
  { arabic: "وسَكِينَةٍ", german: "und ruhig" },
  { arabic: "حَتَّى", german: "bis" },
  { arabic: "انْتَهَى", german: "vorbei ist" },
  { arabic: "الْوَقْتُ", german: "die Zeit" },
  { arabic: "وَضُرِبَ", german: "und geläutet wird" },
  { arabic: "الْجَرَسُ", german: "die Glocke" },
  { arabic: "ورَجَعْتُ", german: "und ich bin zurückgekehrt" },
  { arabic: "إلى الْبَيْتِ", german: "nach Hause" },
  { arabic: "الْمِيْعَادِ", german: "dem Termin" },
  { arabic: "والميعاد", german: "und der Termin" },
  { arabic: "وأمْكُثُ", german: "und ich bleibe" },
  { arabic: "سَاعَاتٍ", german: "Stunden" },
  { arabic: "والدُّرُوسَ", german: "und den Unterricht" },
  { arabic: "الدُّرُوسَ", german: "den Unterricht" },
  { arabic: "بِنشَاطٍ", german: "mit Eifer" },
  { arabic: "ورَغبةٍ", german: "und Begeisterung" },
  
  // Weitere häufige Wörter
  { arabic: "قراءة", german: "Lesen" },
  { arabic: "الراشدة", german: "al-Raschida" },
  { arabic: "أَقْضِي", german: "ich verbringe" },
  { arabic: "يَوْمِي", german: "meinen Tag" },
  { arabic: "أَنَامُ", german: "ich schlafe" },
  { arabic: "مُبَكِّرًا", german: "früh" },
  { arabic: "اللَّيْلِ", german: "der Nacht" },
  { arabic: "الصَّبَاحِ", german: "am Morgen" },
  { arabic: "أَسْتَيْقِظُ", german: "ich erwache" },
  { arabic: "اسْمِ", german: "Namen" },
  { arabic: "اللَّهِ", german: "Gottes" },
  { arabic: "وَذِكْرِهِ", german: "und gedenke Seiner" },
  { arabic: "أَسْتَعِدُّ", german: "ich bereite mich vor" },
  { arabic: "لِلصَّلَاةِ", german: "für das Gebet" },
  { arabic: "وَالِدِي", german: "meinem Vater" },
  { arabic: "قَرِيبٌ", german: "nah" },
  { arabic: "بَيْتِي", german: "meinem Haus" },
  { arabic: "فَأَتَوَضَّأُ", german: "da wasche ich mich" },
  { arabic: "وَأُصَلِّي", german: "und bete" },
  { arabic: "مَعَ الْجَمَاعَةِ", german: "mit der Gemeinde" },
  { arabic: "وَأَرْجِعُ", german: "und kehre zurück" },
  { arabic: "إِلَى الْبَيْتِ", german: "nach Hause" },
  { arabic: "وَأَتْلُو", german: "und rezitiere" },
  { arabic: "شَيْئًا مِن", german: "etwas von" },
  { arabic: "الْقُرْآنِ الْكَرِيمِ", german: "dem edlen Koran" },
  { arabic: "ثُمَّ أَخْرُجُ", german: "dann gehe ich hinaus" },
  { arabic: "وَأَجْرِي", german: "und laufe" },
  { arabic: "ثُمَّ أَرْجِعُ", german: "dann kehre ich zurück" },
  { arabic: "فَأَشْرَبُ اللَّبَنَ", german: "und trinke Milch" },
  
  // Verbformen
  { arabic: "أَذْهَبُ", german: "ich gehe" },
  { arabic: "أَقُومُ", german: "ich stehe auf" },
  { arabic: "أَرْجِعُ", german: "ich kehre zurück" },
  { arabic: "أَجْلِسُ", german: "ich sitze" },
  { arabic: "أَخْرُجُ", german: "ich gehe hinaus" },
  { arabic: "أَمْكُثُ", german: "ich bleibe" },
  { arabic: "أَصِلُ", german: "ich erreiche" },
  { arabic: "أَسْمَعُ", german: "ich höre" },
  
  // Präpositionen und Konjunktionen
  { arabic: "ثُمَّ", german: "dann" },
  { arabic: "بَعْدَ", german: "nach" },
  { arabic: "قَبْلَ", german: "vor" },
  { arabic: "أَثْنَاءَ", german: "während" },
  { arabic: "عِنْدَمَا", german: "als" },
  { arabic: "لَمَّا", german: "als" },
  { arabic: "حِينَ", german: "wenn" },
  { arabic: "بَيْنَمَا", german: "während" },
  
  // Zeitangaben
  { arabic: "الصَّبَاحُ", german: "der Morgen" },
  { arabic: "الظُّهْرُ", german: "der Mittag" },
  { arabic: "الْعَصْرُ", german: "der Nachmittag" },
  { arabic: "الْمَغْرِبُ", german: "der Abend" },
  { arabic: "الْعِشَاءُ", german: "die Nacht" },
  { arabic: "الْفَجْرُ", german: "die Morgendämmerung" },
  
  // Schul- und Bildungswörter
  { arabic: "الْمَدْرَسَةُ", german: "die Schule" },
  { arabic: "الْمُدَرِّسُ", german: "der Lehrer" },
  { arabic: "الْمُدَرِّسَةُ", german: "die Lehrerin" },
  { arabic: "الطَّالِبُ", german: "der Schüler" },
  { arabic: "الطَّالِبَةُ", german: "die Schülerin" },
  { arabic: "الدَّرْسُ", german: "die Lektion" },
  { arabic: "الْوَاجِبُ", german: "die Hausaufgabe" },
  { arabic: "الْامْتِحَانُ", german: "die Prüfung" },
  { arabic: "الْعُطْلَةُ", german: "die Ferien" },
  
  // Aktivitäten
  { arabic: "الْجَرْيُ", german: "das Laufen" },
  { arabic: "الْمَشْيُ", german: "das Gehen" },
  { arabic: "الْقِرَاءَةُ", german: "das Lesen" },
  { arabic: "الْكِتَابَةُ", german: "das Schreiben" },
  { arabic: "الْحِفْظُ", german: "das Auswendiglernen" },
  { arabic: "الْمُذَاكَرَةُ", german: "das Studieren" },
  { arabic: "اللَّعِبُ", german: "das Spielen" },
  { arabic: "الرِّيَاضَةُ", german: "der Sport" }
];

async function importAllMissingWords() {
  console.log(`Importing ${allMissingWords.length} missing words...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const word of allMissingWords) {
    try {
      const normalizedArabic = normalizeArabic(word.arabic);
      
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: {
          arabic: word.arabic,
          arabic_normalized: normalizedArabic,
          german: word.german,
          context: `Häufiges Wort: ${word.german}`
        }
      });
      
      successful++;
      console.log(`✓ ${word.arabic} (${normalizedArabic}) → ${word.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Import complete: ${successful} successful, ${failed} failed`);
}

importAllMissingWords();