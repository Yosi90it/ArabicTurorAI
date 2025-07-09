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
    { arabic: "قراءة",                  german: "Lesen" },
    { arabic: "الْرَاشِدَةِ",           german: "al-Rāschida (Titel)" },
    { arabic: "لَمَّا",                 german: "als (zeitlich)" },
    { arabic: "أنامُ",                 german: "ich schlafe" },
    { arabic: "مُبَكِّرًا",            german: "früh" },
    { arabic: "اللَّيْلِ",              german: "nachts" },
    { arabic: "أَقُومُ",               german: "ich stehe auf" },
    { arabic: "الصَّبَاحِ",            german: "morgens" },
    { arabic: "أسْتَيْقِظُ",            german: "ich erwache" },
    { arabic: "عَلَى",                german: "mit (z.B. dem Namen)" },
    { arabic: "اسْمِ",                 german: "dem Namen" },
    { arabic: "اللَّهِ",                german: "Gottes" },
    { arabic: "وَذِكْرِهِ",            german: "und seinem Gedenken" },
    { arabic: "أَسْتَعِدُّ",            german: "ich bereite mich vor" },
    { arabic: "لِلصَّلَاةِ",           german: "auf das Gebet" },
    { arabic: "ثُمَّ",                 german: "dann" },
    { arabic: "أَذْهَبُ",              german: "ich gehe" },
    { arabic: "مَعَ",                  german: "mit" },
    { arabic: "وَالِدِي",             german: "meinem Vater" },
    { arabic: "إِلَى",                 german: "zu" },
    { arabic: "الْمَسْجِدِ",           german: "der Moschee" },
    { arabic: "فَأَتَوَضَّأُ",          german: "dann wudu machen" },
    { arabic: "وَأُصَلِّي",             german: "und bete" },
    { arabic: "مَعَ الْجَمَاعَةِ",     german: "mit der Gemeinde" },
    { arabic: "أَرْجِعُ",              german: "ich kehre zurück" },
    { arabic: "إِلَى الْبَيْتِ",        german: "nach Hause" },
    { arabic: "وَأَتْلُو",              german: "und rezitiere" },
    { arabic: "شَيْئًا مِنْ",          german: "ein wenig von" },
    { arabic: "الْقُرْآنِ الْكَرِيمِ", german: "dem edlen Koran" },
    { arabic: "ثُمَّ أَخْرُجُ",         german: "dann gehe ich hinaus" },
    { arabic: "إِلَى الْبُسْتَانِ",    german: "in den Garten" },
    { arabic: "وَأَجْرِي",             german: "und renne" },
    { arabic: "فَأَشْرَبُ اللَّبَنَ",   german: "dann trinke ich Milch" },
    { arabic: "وَأَفْطِرُ",             german: "und ich frühstücke" },
    { arabic: "إِذَا",                  german: "wenn" },
    { arabic: "كَانَتْ",               german: "es war" },
    { arabic: "أَيَّامُ الصَّيْفِ",    german: "Tage des Sommers" },
    { arabic: "وَأَتَغَدَّى",           german: "und ich esse zu Mittag" },
    { arabic: "الشِّتَاءِ",             german: "des Winters" },
    { arabic: "أَصِلُ",                german: "ich komme an" },
    { arabic: "إِلَى الْمَدْرَسَةِ",    german: "in der Schule" },
    { arabic: "فِي الْمِيعَادِ",        german: "pünktlich" },
    { arabic: "وَأَمْكُثُ",            german: "und bleibe" },
    { arabic: "سِتَّ سَاعَاتٍ",       german: "sechs Stunden" },
    { arabic: "وَأَسْمَعُ",            german: "und ich höre" },
    { arabic: "الدُّرُوسَ",            german: "den Unterricht" },
    { arabic: "بِنَشَاطٍ",            german: "mit Eifer" },
    { arabic: "وَرَغْبَةٍ",           german: "und Lust" },
    { arabic: "وَأَجْلِسُ",            german: "und ich sitze" },
    { arabic: "بِأَدَبٍ",             german: "höflich" },
    { arabic: "وَسَكِينَةٍ",          german: "ruhig" },
    { arabic: "حَتَّى",               german: "bis" },
    { arabic: "انْتَهَى",             german: "es endet" },
    { arabic: "وَضُرِبَ الْجَرَسُ",    german: "und die Glocke läutet" },
    { arabic: "خَرَجْتُ",             german: "ich verließ" },
    { arabic: "مِنْ الْمَدْرَسَةِ",     german: "die Schule" },
    { arabic: "وَرَجَعْتُ",            german: "und ich kehrte zurück" },
    { arabic: "إِلَى الْبَيْتِ",        german: "nach Hause" },
    { arabic: "وَلَا أَقْرَأُ",         german: "und ich lese nicht" },
    { arabic: "بَعْدَ صَلَاةِ الْعَصْرِ", german: "nach dem Nachmittagsgebet" },
    { arabic: "إِلَى الْمَغْرِبِ",      german: "bis zum Sonnenuntergang" },
    { arabic: "فِي بَعْضِ الأَيَّامِ",  german: "an manchen Tagen" },
    { arabic: "أَمْكُثُ فِي الْبَيْتِ",   german: "bleibe ich zu Hause" },
    { arabic: "وَفِي بَعْضِ الأَيَّامِ", german: "und an anderen Tagen" },
    { arabic: "أَذْهَبُ إِلَى السُّوقِ",  german: "gehe ich auf den Markt" },
    { arabic: "وَأَشْتَرِي حَوَائِجَ",   german: "und kaufe Dinge" },
    { arabic: "وَفِي بَعْضِ الأَيَّامِ", german: "und an manchen Tagen" },
    { arabic: "أَخْرُجُ مَعَ أَبِي",      german: "gehe ich mit meinem Vater" },
    { arabic: "أَوْ أَخِي إِلَى",        german: "oder meinem Bruder zu" },
    { arabic: "بَعْضِ الْأَقَارِبِ",    german: "einigen Verwandten" },
    { arabic: "أَوْ أَلْعَبُ مَعَ",      german: "oder spiele mit" },
    { arabic: "إِخْوَتِي وَأَصْدِقَائِي", german: "meinen Geschwistern und Freunden" },
    { arabic: "وَأَتَعَشَّى",            german: "und ich esse zu Abend" },
    { arabic: "مَعَ وَالِدِي وَإِخْوَتِي", german: "mit meinem Vater und Geschwistern" },
    { arabic: "وَأَحْفَظُ دُرُوسِي",     german: "und lerne meine Lektionen" },
    { arabic: "وَأُطَالِعُ لِلْغَدِ",    german: "und bereite mich auf morgen vor" },
    { arabic: "وَأَكْتُبُ مَا",          german: "und schreibe, was" },
    { arabic: "بِأَمْرِهِ الْمُعَلِّمُ", german: "der Lehrer mir aufträgt" },
    { arabic: "وَأُصَلِّي الْعِشَاءَ",    german: "und bete das Nachtgebet" },
    { arabic: "وَأَقْرَأُ قَلِيلًا",     german: "und lese ein wenig" },
    { arabic: "ثُمَّ أَنَامُ",          german: "dann schlafe ich" },
    { arabic: "عَلَى اسْمِ اللَّهِ",     german: "mit Gottes Namen" },
    { arabic: "وَذِكْرِهِ",             german: "und Gedenken" },
    { arabic: "تِلْكَ عَادَتِي",         german: "das ist meine Gewohnheit" },
    { arabic: "لَا أُخَالِفُهَا",       german: "ich weiche nicht davon ab" },
    { arabic: "وَأَقُومُ مُبَكِّرًا",    german: "und stehe früh auf" },
    { arabic: "يَوْمَ الْعُطْلَةِ",      german: "am Feiertag" },
    { arabic: "وَأُصَلِّي مَعَ",        german: "und bete mit" },
    { arabic: "الْجَمَاعَةِ",            german: "der Gemeinschaft" },
    { arabic: "وَأَتْلُو الْقُرْآنَ",    german: "und rezitiere den Koran" },
    { arabic: "وَأَقْضِي الْيَوْمَ",    german: "und verbringe den Tag" },
    { arabic: "فِي مُطَالَعَةِ",         german: "mit Lesen" },
    { arabic: "كِتَابٍ",                german: "eines Buches" },
    { arabic: "وَمُحَادَثَةٍ",          german: "und Unterhaltungen" },
    { arabic: "مَعَ أَبِي وَأُمِّي",      german: "mit meinem Vater und meiner Mutter" },
    { arabic: "وَإِخْوَتِي",             german: "und Geschwistern" },
    { arabic: "وَفِي زِيَارَةِ",        german: "und beim Besuch" },
    { arabic: "قَرِيبٍ",                german: "eines Verwandten" },
    { arabic: "أَوْ عِيَادَةِ",          german: "oder bei einem Kranken" },
    { arabic: "مَرِيضٍ",                german: "Kranken" },
    { arabic: "وَأَمْكُثُ أَحْيَانًا",   german: "und bleibe manchmal" },
    { arabic: "فِي الْبَيْتِ",          german: "im Haus" },
    { arabic: "وَأَخْرُجُ أَحْيَانًا",   german: "und gehe manchmal" },
    { arabic: "إِلَى الْخَارِجِ",       german: "hinaus" },

    { arabic: "بَلَغْتُ",              german: "ich erreichte" },
    { arabic: "السَّابِعَةَ",           german: "die siebte (Jahr)" },
    { arabic: "مِنْ",                  german: "von" },
    { arabic: "عُمُرِيْ",              german: "meines Alters" },
    { arabic: "النَّمْلَةِ",            german: "die Ameise (Überschrift)" },

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
