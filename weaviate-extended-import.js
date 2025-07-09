const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Importing additional vocabulary with word variations...");

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

async function importExtendedVocabulary() {
  // Extended vocabulary with word variations found in the books
  const extendedVocabulary = [
    // Variations from the books
    { arabic: "وأحسن", german: "und ich verbessere" },
    { arabic: "الرِّجَالِ", german: "der Männer" },
    { arabic: "وَالآنَ", german: "und jetzt" },
    { arabic: "شَاءَ", german: "er wollte" },
    { arabic: "أَمَرَنِيْ", german: "er befahl mir" },
    { arabic: "بِالصَّلَاةِ", german: "zum Gebet" },
    { arabic: "تَعَلَّمْتُ", german: "ich lernte" },
    { arabic: "الْأَدْعِيَةِ", german: "die Bittgebete" },
    { arabic: "حَفِظْتُ", german: "ich memorierte" },
    { arabic: "سُوَرًا", german: "Suren" },
    { arabic: "الْكَرِيمِ", german: "der Edle" },
    { arabic: "تَتَكَلَّمُ", german: "sie spricht" },
    { arabic: "الْمَنَامِ", german: "der Schlaf" },
    { arabic: "تَقُصُّ", german: "sie erzählt" },
    { arabic: "قِصَصَ", german: "Geschichten" },
    { arabic: "الْأَنْبِيَاءِ", german: "der Propheten" },
    { arabic: "بَدَأْتُ", german: "ich begann" },
    { arabic: "الْمَسْجِدِ", german: "der Moschee" },
    { arabic: "أَقُوْمُ", german: "ich stehe" },
    { arabic: "صَفِّ", german: "Reihe" },
    { arabic: "الْأَطْفَالِ", german: "der Kinder" },
    { arabic: "خَلْفَ", german: "hinter" },
    { arabic: "بَلَغْتُ", german: "ich erreichte" },
    { arabic: "الْعَاشِرَةَ", german: "das zehnte" },
    { arabic: "عُمْرِيْ", german: "meines Alters" },
    { arabic: "مَرَّةً", german: "einmal" },
    { arabic: "أَكْمَلْتَ", german: "du hast vollendet" },
    { arabic: "عُمُرِكَ", german: "deines Alters" },
    { arabic: "تِسْعَ", german: "neun" },
    { arabic: "سِنِيْنَ", german: "Jahre" },
    { arabic: "ابْنُ", german: "Sohn von" },
    { arabic: "تَرَكْتَ", german: "du verlässt" },
    { arabic: "صَلَاةً", german: "ein Gebet" },
    { arabic: "ضَرَبْتُكَ", german: "ich schlage dich" },
    { arabic: "النَّبِيَّ", german: "der Prophet" },
    { arabic: "مُرُّوا", german: "befehlt" },
    { arabic: "أَوْلَادَكُمْ", german: "eure Kinder" },
    { arabic: "أَبْنَاءُ", german: "Söhne von" },
    { arabic: "سَبْعِ", german: "sieben" },
    { arabic: "اضْرِبُوهُمْ", german: "schlagt sie" },
    { arabic: "عَلَيْهَا", german: "darauf" },
    { arabic: "عَشْرٍ", german: "zehn" },
    
    // Common word variations
    { arabic: "فِي", german: "in" },
    { arabic: "مِن", german: "von" },
    { arabic: "إِلى", german: "zu" },
    { arabic: "عَلَى", german: "auf" },
    { arabic: "مَع", german: "mit" },
    { arabic: "عِنْد", german: "bei" },
    { arabic: "بَعْد", german: "nach" },
    { arabic: "قَبْل", german: "vor" },
    { arabic: "تَحْت", german: "unter" },
    { arabic: "فَوْق", german: "über" },
    { arabic: "أَمَام", german: "vor" },
    { arabic: "وَرَاء", german: "hinter" },
    { arabic: "بَيْن", german: "zwischen" },
    { arabic: "حَوْل", german: "um" },
    { arabic: "ضِد", german: "gegen" },
    
    // Pronouns
    { arabic: "أَنَا", german: "ich" },
    { arabic: "أَنْت", german: "du" },
    { arabic: "أَنْتِ", german: "du (weiblich)" },
    { arabic: "هُوَ", german: "er" },
    { arabic: "هِيَ", german: "sie" },
    { arabic: "نَحْنُ", german: "wir" },
    { arabic: "أَنْتُم", german: "ihr" },
    { arabic: "أَنْتُنَّ", german: "ihr (weiblich)" },
    { arabic: "هُم", german: "sie (männlich)" },
    { arabic: "هُنَّ", german: "sie (weiblich)" },
    
    // Common verbs
    { arabic: "ذَهَبَ", german: "er ging" },
    { arabic: "أَذْهَبُ", german: "ich gehe" },
    { arabic: "يَذْهَبُ", german: "er geht" },
    { arabic: "جَاءَ", german: "er kam" },
    { arabic: "أَجِيءُ", german: "ich komme" },
    { arabic: "يَجِيءُ", german: "er kommt" },
    { arabic: "أَكَلَ", german: "er aß" },
    { arabic: "آكُلُ", german: "ich esse" },
    { arabic: "يَأْكُلُ", german: "er isst" },
    { arabic: "شَرِبَ", german: "er trank" },
    { arabic: "أَشْرَبُ", german: "ich trinke" },
    { arabic: "يَشْرَبُ", german: "er trinkt" },
    { arabic: "نَامَ", german: "er schlief" },
    { arabic: "أَنَامُ", german: "ich schlafe" },
    { arabic: "يَنَامُ", german: "er schläft" },
    { arabic: "قَامَ", german: "er stand auf" },
    { arabic: "أَقُومُ", german: "ich stehe auf" },
    { arabic: "يَقُومُ", german: "er steht auf" },
    
    // Time expressions
    { arabic: "الْيَوْم", german: "heute" },
    { arabic: "أَمْس", german: "gestern" },
    { arabic: "غَدًا", german: "morgen" },
    { arabic: "الآن", german: "jetzt" },
    { arabic: "دَائِمًا", german: "immer" },
    { arabic: "أَحْيَانًا", german: "manchmal" },
    { arabic: "أَبَدًا", german: "niemals" },
    { arabic: "مُبَكِّرًا", german: "früh" },
    { arabic: "مُتَأَخِّرًا", german: "spät" },
    
    // Colors with definite article
    { arabic: "الْأَحْمَر", german: "der rote" },
    { arabic: "الْأَزْرَق", german: "der blaue" },
    { arabic: "الْأَخْضَر", german: "der grüne" },
    { arabic: "الْأَصْفَر", german: "der gelbe" },
    { arabic: "الْأَبْيَض", german: "der weiße" },
    { arabic: "الْأَسْوَد", german: "der schwarze" },
    
    // Numbers with definite article
    { arabic: "الْوَاحِد", german: "der eine" },
    { arabic: "الاِثْنَان", german: "die zwei" },
    { arabic: "الثَّلَاثَة", german: "die drei" },
    { arabic: "الْأَرْبَعَة", german: "die vier" },
    { arabic: "الْخَمْسَة", german: "die fünf" },
    
    // Family with definite article
    { arabic: "الْأَب", german: "der Vater" },
    { arabic: "الْأُم", german: "die Mutter" },
    { arabic: "الْأَخ", german: "der Bruder" },
    { arabic: "الْأُخْت", german: "die Schwester" },
    { arabic: "الابْن", german: "der Sohn" },
    { arabic: "الابْنَة", german: "die Tochter" }
  ];

  console.log(`Starting import of ${extendedVocabulary.length} additional vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const vocab of extendedVocabulary) {
    try {
      await weaviateRequest('/v1/objects', 'POST', {
        class: 'Vocabulary',
        properties: vocab
      });
      
      successful++;
      console.log(`✓ ${vocab.arabic} → ${vocab.german}`);
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${vocab.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Extended import complete: ${successful} successful, ${failed} failed`);
  console.log("🎉 Weaviate database now has comprehensive vocabulary coverage!");
  return successful > 0;
}

importExtendedVocabulary().catch(err => {
  console.error("Extended import failed:", err);
  process.exit(1);
});