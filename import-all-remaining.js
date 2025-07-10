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

// Fehlende Wörter aus den aktuellen Logs und der gesamten custom-vocab-import.js
const allRemainingWords = [
  // Aus den aktuellen Logs
  { arabic: "وَبَدَأْتُ", german: "und ich begann" },
  { arabic: "وَالآنَ", german: "und jetzt" },
  { arabic: "الْعَاشِرَةَ", german: "die zehnte" },
  
  // Weitere aus custom-vocab-import.js die noch fehlen
  { arabic: "الْمَدْرَسَةِ", german: "der Schule" },
  { arabic: "وَأَصِلُ", german: "und ich erreiche" },
  { arabic: "إِلَى", german: "zu" },
  { arabic: "فِي", german: "in" },
  { arabic: "الْمِيعَادِ", german: "dem vereinbarten Termin" },
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
  { arabic: "وَرَجَعْتُ", german: "und ich kehrte zurück" },
  { arabic: "الْبَيْتِ", german: "dem Haus" },
  
  // Familiengeschichte komplett
  { arabic: "لَمَّا", german: "als" },
  { arabic: "بَلَغْتُ", german: "ich erreichte" },
  { arabic: "السَّابِعَةَ", german: "die siebte" },
  { arabic: "عُمُرِيْ", german: "meinem Alter" },
  { arabic: "أَمَرَنِيْ", german: "befahl mir" },
  { arabic: "أَبِي", german: "mein Vater" },
  { arabic: "بِالصَّلَاةِ", german: "zum Gebet" },
  { arabic: "وَحَفِظْتُ", german: "und ich habe auswendig gelernt" },
  { arabic: "سُوَرًا", german: "Suren" },
  { arabic: "مِنْ", german: "aus" },
  { arabic: "الْقُرْآنِ", german: "dem Koran" },
  { arabic: "أُمِّيْ", german: "meiner Mutter" },
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
  
  // Die Ameise Geschichte
  { arabic: "النَّمْلَةُ", german: "Die Ameise" },
  { arabic: "لَسْتُ", german: "ich bin nicht" },
  { arabic: "أَرْضَى", german: "zufrieden" },
  { arabic: "بِالْكَسَلْ", german: "mit Faulheit" },
  { arabic: "طَالَ", german: "dehnt sich aus" },
  { arabic: "سَعْيِي", german: "meine Mühe" },
  { arabic: "بِالأَمَلْ", german: "mit Hoffnung" },
  
  // Dialog Fortsetzung
  { arabic: "إِخْوَتِي وَأَصْدِقَائِي", german: "meinen Geschwistern und Freunden" },
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
  { arabic: "وَأَتَمَنَّى", german: "und ich wünsche mir" },
  { arabic: "أَنْ أَعِيشَ", german: "zu leben" },
  { arabic: "حَيَاةً", german: "ein Leben" },
  { arabic: "سَعِيدَةً", german: "glücklich" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "أُسْرَتِي", german: "meiner Familie" },
  { arabic: "وَأَصْدِقَائِي", german: "und meinen Freunden" },
  { arabic: "دَائِمًا", german: "immer" },
  
  // Weitere tägliche Aktivitäten
  { arabic: "وَأَتَعَشَّى", german: "und ich esse zu Abend" },
  { arabic: "مَعَ وَالِدِي وَإِخْوَتِي", german: "mit meinem Vater und Geschwistern" },
  { arabic: "وَأَحْفَظُ دُرُوسِي", german: "und lerne meine Lektionen" },
  { arabic: "وَأُطَالِعُ لِلْغَدِ", german: "und bereite mich auf morgen vor" },
  { arabic: "وَأَكْتُبُ مَا", german: "und schreibe, was" },
  { arabic: "بِأَمْرِهِ الْمُعَلِّمُ", german: "der Lehrer mir aufträgt" },
  { arabic: "وَأُصَلِّي الْعِشَاءَ", german: "und bete das Nachtgebet" },
  { arabic: "وَأَقْرَأُ قَلِيلًا", german: "und lese ein wenig" },
  { arabic: "ثُمَّ أَنَامُ", german: "dann schlafe ich" },
  { arabic: "عَلَى اسْمِ اللَّهِ", german: "mit Gottes Namen" },
  { arabic: "وَذِكْرِهِ", german: "und Gedenken" },
  { arabic: "تِلْكَ عَادَتِي", german: "das ist meine Gewohnheit" },
  { arabic: "لَا أُخَالِفُهَا", german: "ich weiche nicht davon ab" },
  { arabic: "وَأَقُومُ مُبَكِّرًا", german: "und stehe früh auf" },
  { arabic: "يَوْمَ الْعُطْلَةِ", german: "am Feiertag" },
  { arabic: "وَأُصَلِّي مَعَ", german: "und bete mit" },
  { arabic: "الْجَمَاعَةِ", german: "der Gemeinschaft" },
  { arabic: "وَأَتْلُو الْقُرْآنَ", german: "und rezitiere den Koran" },
  { arabic: "وَأَقْضِي الْيَوْمَ", german: "und verbringe den Tag" },
  { arabic: "فِي مُطَالَعَةِ", german: "mit Lesen" },
  { arabic: "كِتَابٍ", german: "eines Buches" },
  { arabic: "وَمُحَادَثَةٍ", german: "und Unterhaltungen" },
  { arabic: "مَعَ أَبِي وَأُمِّي", german: "mit meinem Vater und meiner Mutter" },
  { arabic: "وَإِخْوَتِي", german: "und Geschwistern" },
  { arabic: "وَفِي زِيَارَةِ", german: "und beim Besuch" },
  { arabic: "قَرِيبٍ", german: "eines Verwandten" },
  { arabic: "أَوْ عِيَادَةِ", german: "oder bei einem Kranken" },
  { arabic: "مَرِيضٍ", german: "Kranken" },
  { arabic: "وَأَمْكُثُ أَحْيَانًا", german: "und bleibe manchmal" },
  { arabic: "وَأَخْرُجُ أَحْيَانًا", german: "und gehe manchmal" },
  { arabic: "إِلَى الْخَارِجِ", german: "hinaus" },
  
  // Weitere wichtige Zeitausdrücke und Verben
  { arabic: "الآنَ", german: "jetzt" },
  { arabic: "وَالآنَ", german: "und jetzt" },
  { arabic: "فِي الْآنِ", german: "gerade jetzt" },
  { arabic: "مُنْذُ", german: "seit" },
  { arabic: "حَالِيًّا", german: "zurzeit" },
  { arabic: "أَحْيَانًا", german: "manchmal" },
  { arabic: "دَائِمًا", german: "immer" },
  { arabic: "أَبَدًا", german: "niemals" },
  { arabic: "عَادَةً", german: "normalerweise" },
  { arabic: "غَالِبًا", german: "meistens" },
  { arabic: "نَادِرًا", german: "selten" },
  { arabic: "أَوَّلًا", german: "zuerst" },
  { arabic: "أَخِيرًا", german: "schließlich" },
  { arabic: "بَعْدَئِذٍ", german: "danach" },
  { arabic: "فِي النِّهَايَةِ", german: "am Ende" },
  { arabic: "فِي الْبِدَايَةِ", german: "am Anfang" }
];

async function importAllRemaining() {
  console.log(`Importing ${allRemainingWords.length} remaining words...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const word of allRemainingWords) {
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
      if (successful % 30 === 0) {
        console.log(`Progress: ${successful} words imported...`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${word.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Import complete: ${successful} new, ${skipped} skipped, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Total vocabulary entries: ${totalCount}`);
}

importAllRemaining();