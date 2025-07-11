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

const missingWords = [
  { arabic: "الطَّرِيْقَ", german: "der Weg" },
  { arabic: "الطَّرِيقَ", german: "den Weg" },
  { arabic: "طَرِيقٌ", german: "Weg" },
  { arabic: "طَرِيقًا", german: "einen Weg" },
  { arabic: "تَحْتَ", german: "unter" },
  { arabic: "الحرس", german: "die Wache" },
  { arabic: "الْحَرَسُ", german: "die Wächter" },
  { arabic: "حَارِسٌ", german: "Wächter" },
  { arabic: "قَدْ", german: "bereits" },
  { arabic: "قَدْ", german: "schon" },
  { arabic: "رُبَّمَا", german: "vielleicht" },
  { arabic: "لَعَلَّ", german: "vielleicht" },
  { arabic: "عَسَى", german: "hoffentlich" },
  { arabic: "لَوْ", german: "wenn" },
  { arabic: "لَوْلَا", german: "wenn nicht" },
  { arabic: "أَمَّا", german: "was ... betrifft" },
  { arabic: "إِمَّا", german: "entweder" },
  { arabic: "كَأَنَّ", german: "als ob" },
  { arabic: "لَكِنَّ", german: "aber" },
  { arabic: "غَيْرَ", german: "außer" },
  { arabic: "سِوَى", german: "außer" },
  { arabic: "عِنْدَ", german: "bei" },
  { arabic: "لَدَى", german: "bei" },
  { arabic: "مُنْذُ", german: "seit" },
  { arabic: "حَوْلَ", german: "um ... herum" },
  { arabic: "دُونَ", german: "ohne" },
  { arabic: "رَغْمَ", german: "trotz" },
  { arabic: "عَبْرَ", german: "durch" },
  { arabic: "نَحْوَ", german: "in Richtung" },
  { arabic: "صَوْبَ", german: "in Richtung" },
  { arabic: "تُجَاهَ", german: "gegenüber" },
  { arabic: "ضِدَّ", german: "gegen" },
  { arabic: "حَسَبَ", german: "gemäß" },
  { arabic: "وَفْقًا", german: "entsprechend" },
  { arabic: "طِبْقًا", german: "gemäß" },
  { arabic: "بِدَلًا", german: "anstatt" },
  { arabic: "عَوَضًا", german: "stattdessen" },
  { arabic: "خِلَافًا", german: "im Gegensatz zu" },
  { arabic: "عَلَاوَةً", german: "zusätzlich" },
  { arabic: "فَضْلًا", german: "außerdem" },
  { arabic: "إِضَافَةً", german: "zusätzlich" },
  { arabic: "زِيَادَةً", german: "zusätzlich" },
  { arabic: "تَنْفِيذًا", german: "zur Ausführung" },
  { arabic: "تَطْبِيقًا", german: "zur Anwendung" },
  { arabic: "اسْتِكْمَالًا", german: "zur Vervollständigung" },
  { arabic: "تَأْكِيدًا", german: "zur Bestätigung" },
  { arabic: "تَوْضِيحًا", german: "zur Verdeutlichung" },
  { arabic: "تَفْصِيلًا", german: "zur Detaillierung" },
  { arabic: "إِجْمَالًا", german: "zusammenfassend" },
  { arabic: "خُلَاصَةً", german: "zusammenfassend" },
  { arabic: "خِتَامًا", german: "abschließend" },
  { arabic: "أَخِيرًا", german: "schließlich" },
  { arabic: "أَوَّلًا", german: "erstens" },
  { arabic: "ثَانِيًا", german: "zweitens" },
  { arabic: "ثَالِثًا", german: "drittens" },
  { arabic: "رَابِعًا", german: "viertens" },
  { arabic: "خَامِسًا", german: "fünftens" },
  { arabic: "سَادِسًا", german: "sechstens" },
  { arabic: "سَابِعًا", german: "siebtens" },
  { arabic: "ثَامِنًا", german: "achtens" },
  { arabic: "تَاسِعًا", german: "neuntens" },
  { arabic: "عَاشِرًا", german: "zehntens" },
  { arabic: "إِحْدَى عَشْرَةَ", german: "elftens" },
  { arabic: "اثْنَى عَشْرَةَ", german: "zwölftens" },
  
  // Weitere häufige Wörter aus Büchern
  { arabic: "الشَّارِعُ", german: "die Straße" },
  { arabic: "الشَّارِعَ", german: "die Straße" },
  { arabic: "شَارِعٌ", german: "Straße" },
  { arabic: "الطَّرِيقُ", german: "der Weg" },
  { arabic: "طَرِيقٌ", german: "Weg" },
  { arabic: "الْجِسْرُ", german: "die Brücke" },
  { arabic: "جِسْرٌ", german: "Brücke" },
  { arabic: "الْمَيْدَانُ", german: "der Platz" },
  { arabic: "مَيْدَانٌ", german: "Platz" },
  { arabic: "الْحَدِيقَةُ", german: "der Park" },
  { arabic: "حَدِيقَةٌ", german: "Park" },
  { arabic: "الْمُسْتَشْفَى", german: "das Krankenhaus" },
  { arabic: "مُسْتَشْفًى", german: "Krankenhaus" },
  { arabic: "الصَّيْدَلِيَّةُ", german: "die Apotheke" },
  { arabic: "صَيْدَلِيَّةٌ", german: "Apotheke" },
  { arabic: "الْمَخْبَزُ", german: "die Bäckerei" },
  { arabic: "مَخْبَزٌ", german: "Bäckerei" },
  { arabic: "الْمَطْعَمُ", german: "das Restaurant" },
  { arabic: "مَطْعَمٌ", german: "Restaurant" },
  { arabic: "الْمَقْهَى", german: "das Café" },
  { arabic: "مَقْهًى", german: "Café" },
  { arabic: "الْفُنْدُقُ", german: "das Hotel" },
  { arabic: "فُنْدُقٌ", german: "Hotel" },
  { arabic: "الْبَنْكُ", german: "die Bank" },
  { arabic: "بَنْكٌ", german: "Bank" },
  { arabic: "الْمَكْتَبَةُ", german: "die Bibliothek" },
  { arabic: "مَكْتَبَةٌ", german: "Bibliothek" },
  { arabic: "الْجَامِعَةُ", german: "die Universität" },
  { arabic: "جَامِعَةٌ", german: "Universität" }
];

async function addMissingWords() {
  console.log(`Adding ${missingWords.length} missing words to Weaviate...`);
  
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const word of missingWords) {
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
          context: `Ergänzende Wörter: ${word.german}`
        }
      });
      
      successful++;
      console.log(`✓ ${word.arabic} → ${word.german}`);
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

addMissingWords();