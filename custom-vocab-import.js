const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Importing custom vocabulary...");

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

async function importCustomVocabulary() {
  // Flat array statt verschachtelter Arrays
  const customVocabulary = [
    { arabic: "وأفطرُ",        german: "und ich frühstücke" },
    { arabic: "إذا",            german: "wenn" },
    { arabic: "كَانَتْ",        german: "es waren" },
    { arabic: "أَيَّامُ",       german: "Tage" },
    { arabic: "الصَّيْفِ",      german: "des Sommers" },
    { arabic: "وأتَغَدَّى",     german: "und ich esse zu Mittag" },
    { arabic: "الشِّتاءِ",      german: "des Winters" },
    { arabic: "وأَصِلُ",        german: "und ich erreiche" },
    { arabic: "إلى",            german: "bis / zu" },
    { arabic: "الْمِيْعَادِ",    german: "dem Beginn / vereinbarten Termin" },
    { arabic: "وأمْكُثُ",       german: "und ich bleibe" },
    { arabic: "سِتَّ",          german: "sechs" },
    { arabic: "سَاعَاتٍ",      german: "Stunden" },
    { arabic: "والدُّرُوسَ",    german: "und den Unterricht" },
    { arabic: "بِنشَاطٍ",      german: "mit Eifer" },
    { arabic: "ورَغبةٍ",       german: "und Begeisterung" },
    { arabic: "وأجلِسُ",        german: "und ich sitze" },
    { arabic: "بِأدَبٍ",        german: "anständig" },
    { arabic: "وسَكِينَةٍ",     german: "und ruhig" },
    { arabic: "حَتَّى",         german: "bis" },
    { arabic: "انْتَهَى",       german: "vorbei ist" },
    { arabic: "الْوَقْتُ",      german: "die Zeit" },
    { arabic: "وَضُرِبَ",       german: "und geläutet wird" },
    { arabic: "الْجَرَسُ",      german: "die Glocke / Klingel" },
    { arabic: "خَرَجْتُ",       german: "ich bin hinausgegangen" },
    { arabic: "مِنْ",           german: "aus" },
    { arabic: "الْمَدْرَسَةِ",   german: "der Schule" },
    { arabic: "ورَجَعْتُ",      german: "und ich bin zurückgekehrt" },
    { arabic: "إلى الْبَيْتِ",   german: "nach Hause" },

    { arabic: "قراءة",          german: "Lesen" },
    { arabic: "الراشدة",        german: "al-Rāschida (Titel/Name)" },
    { arabic: "كيف",            german: "wie" },
    { arabic: "أَقْضِي",        german: "ich verbringe" },
    { arabic: "يَوْمِي",        german: "meinen Tag" },
    { arabic: "أَنَامُ",        german: "ich schlafe" },
    { arabic: "مُبَكِّرًا",     german: "früh" },
    { arabic: "اللَّيْلِ",       german: "in der Nacht" },
    { arabic: "وَأَقُومُ",      german: "und ich stehe auf" },
    { arabic: "الصَّبَاحِ",     german: "am Morgen" },
    { arabic: "أَسْتَيْقِظُ",    german: "ich erwache" },
    { arabic: "عَلَى",         german: "auf" },
    { arabic: "اسْمِ",          german: "Namen" },
    { arabic: "اللَّهِ",         german: "Gottes" },
    { arabic: "وَذِكْرِهِ",     german: "und gedenke Ihn" },
    { arabic: "أَسْتَعِدُّ",    german: "ich bereite mich vor" },
    { arabic: "لِلصَّلَاةِ",    german: "für das Gebet" },
    { arabic: "ثُمَّ",          german: "dann" },
    { arabic: "أَذْهَبُ",       german: "ich gehe" },
    { arabic: "مَعَ",           german: "mit" },
    { arabic: "وَالِدِي",       german: "meinem Vater" },
    { arabic: "إِلَى",          german: "zu" },
    { arabic: "الْمَسْجِدِ",     german: "der Moschee" },
    { arabic: "قَرِيبٌ",        german: "nah" },
    { arabic: "مِن",            german: "von" },
    { arabic: "بَيْتِي",         german: "meinem Haus" },
    { arabic: "فَأَتَوَضَّأُ",   german: "da nehme ich die rituelle Waschung" },
    { arabic: "وَأُصَلِّي",      german: "und bete" },
    { arabic: "مَعَ الْجَمَاعَةِ", german: "gemeinsam mit der Gemeinde" },
    { arabic: "وَأَرْجِعُ",      german: "und dann kehre ich zurück" },
    { arabic: "إِلَى الْبَيْتِ",  german: "nach Hause" },
    { arabic: "وَأَتْلُو",        german: "und rezitiere" },
    { arabic: "شَيْئًا مِن",     german: "ein wenig von" },
    { arabic: "الْقُرْآنِ الْكَرِيمِ", german: "dem edlen Koran" },
    { arabic: "ثُمَّ أَخْرُجُ",   german: "dann verlasse ich (das Haus)" },
    { arabic: "إِلَى الْبُسْتَانِ", german: "den Garten" },
    { arabic: "وَأَجْرِي",       german: "und laufe" },
    { arabic: "ثُمَّ أَرْجِعُ",   german: "dann komme ich zurück" },
    { arabic: "فَأَشْرَبُ اللَّبَنَ", german: "und trinke Milch" },
    { arabic: "وأفطرُ",        german: "und ich frühstücke" },
    { arabic: "إذا",            german: "wenn" },
    { arabic: "كَانَتْ",        german: "es waren" },
    { arabic: "أَيَّامُ",       german: "Tage" },
    { arabic: "الصَّيْفِ",      german: "des Sommers" },
    { arabic: "وأتَغَدَّى",     german: "und ich esse zu Mittag" },
    { arabic: "الشِّتاءِ",      german: "des Winters" },
    { arabic: "وأصِلُ",        german: "und ich erreiche" },
    { arabic: "الْمِيْعَادِ",    german: "den vereinbarten Termin" },
    { arabic: "وأمْكُثُ",       german: "und ich bleibe" },
    { arabic: "سِتَّ",          german: "sechs" },
    { arabic: "سَاعَاتٍ",      german: "Stunden" },
    { arabic: "وَأَسْمَعُ",     german: "und ich höre" },
    { arabic: "الدُّرُوسَ",     german: "den Unterricht" },
    { arabic: "بِنَشَاطٍ",      german: "mit Eifer" },
    { arabic: "وَرَغْبَةٍ",     german: "und Begeisterung" },
    { arabic: "وَأَجْلِسُ",      german: "und ich setze mich" },
    { arabic: "بِأَدَبٍ",       german: "höflich/anständig" },
    { arabic: "وَسَكِينَةٍ",     german: "und ruhig" },
    { arabic: "حَتَّى",         german: "bis" },
    { arabic: "وَضُرِبَ",       german: "und wird geläutet" },
    { arabic: "الْجَرَسُ",      german: "die Glocke" },
    { arabic: "خَرَجْتُ",       german: "ich bin fortgegangen" },
    { arabic: "وَرَجَعْتُ",      german: "und ich bin zurückgekehrt" },

    // neuer Abschnitt „لمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ“
    { arabic: "لَمَّا",         german: "als" },
    { arabic: "بَلَغْتُ",       german: "ich erreichte" },
    { arabic: "السَّابِعَةَ",    german: "die siebte" },
    { arabic: "مِنْ",           german: "von" },
    { arabic: "عُمُرِيْ",        german: "meinem Alter" },
    { arabic: "أَمَرَنِيْ",      german: "befahl mir" },
    { arabic: "بِالصَّلَاةِ",   german: "zum Gebet" },
    { arabic: "وَحَفِظْتُ",     german: "und ich habe auswendig gelernt" },
    { arabic: "سُوَرًا",        german: "Suren" },
    { arabic: "مِنْ",           german: "aus" },
    { arabic: "أُمِّيْ",         german: "meiner Mutter" },
    { arabic: "وَكَانَتْ",      german: "und sie (meine Mutter) war" },
    { arabic: "تَتَكَلَّمُ",     german: "erzählt" },
    { arabic: "قِصَصَ",         german: "Geschichten" },
    { arabic: "الْأَنْبِيَاءِ",  german: "der Propheten" },
    { arabic: "بِنَشَاطٍ",      german: "mit Eifer" },
    { arabic: "وَرَغْبَةٍ",     german: "und Begeisterung" },

    // „وَبَدَأْتُ أَذْهَبُ مَعَ أَبِي ...“
    { arabic: "وَبَدَأْتُ",     german: "und ich begann" },
    { arabic: "أَذْهَبُ",       german: "zu gehen" },
    { arabic: "إِلَى",          german: "zu" },
    { arabic: "مَسْجِدِ",       german: "Moschee" },
    { arabic: "وَأَقُومُ",      german: "und ich stelle mich" },
    { arabic: "فِي",            german: "in" },
    { arabic: "صَفِّ",         german: "Reihe" },
    { arabic: "الْأَطْفَالِ",    german: "der Kinder" },
    { arabic: "خَلْفَ",         german: "hinter" },
    { arabic: "صَفِّ",         german: "Reihe" },
    { arabic: "الرِّجَالِ",     german: "der Männer" },
    { arabic: "وَلَمَّا",       german: "und als" },
    { arabic: "بَلَغْتُ",       german: "ich erreichte" },
    { arabic: "الْعَاشِرَةَ",    german: "die zehnte" },
    { arabic: "مِنْ",           german: "von" },
    { arabic: "عُمُرِيْ",        german: "meinem Alter" },
    { arabic: "قَالَ",         german: "sagte" },
    { arabic: "لِي",           german: "zu mir" },
    { arabic: "مُرُّوا",       german: "Gebt den Befehl" },
    { arabic: "بِالصَّلَاةِ",   german: "zu beten" },
    { arabic: "وَهُمْ",         german: "und sie sind" },
    { arabic: "أَبْنَاءُ",      german: "Kinder" },
    { arabic: "سَبْعِ",        german: "sieben" },
    { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
    { arabic: "عَلَيْهَا",      german: "dazu" },
    { arabic: "وَهُمْ",         german: "während sie" },
    { arabic: "عَشْرٍ",        german: "zehn" },

    // anschließende Nominalstücke
    { arabic: "النَّمْلَةُ",     german: "Die Ameise (Überschrift)" },
    { arabic: "لَسْتُ",         german: "ich bin nicht" },
    { arabic: "أَرْضَى",        german: "zufrieden" },
    { arabic: "بِالْكَسَلْ",     german: "mit Faulheit" },
    { arabic: "طَالَ",         german: "dehnt sich aus" },
    { arabic: "سَعْيِي",        german: "meine Mühe" },
    { arabic: "بِالأَمَلْ",     german: "mit Hoffnung" },
    // … hier folgen entsprechend alle weiteren Stichworte bis zum Ende  

    { arabic: "وَأَسْتَعِدُّ لِلذَّهَابِ", german: "und bereite mich darauf vor zu gehen" },
    { arabic: "إِلَى الْمَدْرَسَةِ",  german: "zur Schule" },

    { arabic: "وأسمع",        german: "und ich höre" },
    { arabic: "عُمَرُ:",       german: "Umar:" },
    { arabic: "لَا",           german: "nein" },
    { arabic: "الدُّكَّانُ",   german: "der Laden" },
    { arabic: "كَبِيْرَةٌ",    german: "groß (weiblich)" },
    { arabic: "خَالِدٌ:",     german: "Khalid:" },
    { arabic: "سَمُرَةٍ",     german: "Samura (Name)" },
    { arabic: "بلغت",        german: "ich erreichte" },
    { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
    // … usw.
  ];

  console.log(`Starting import of ${customVocabulary.length} custom vocabulary entries...`);

  let successful = 0;
  let failed = 0;

  for (const vocab of customVocabulary) {
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

  console.log(`\n✅ Custom import complete: ${successful} successful, ${failed} failed`);
  return successful > 0;
}

// Führe den Import aus
importCustomVocabulary().catch(err => {
  console.error("Custom import failed:", err);
  process.exit(1);
});
