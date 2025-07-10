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

// Direkt aus der custom-vocab-import.js kopierte Vocabulary-Liste
const customVocabulary = [
  // Religiöse Begriffe
  { arabic: "اللَّهِ", german: "Gottes" },
  { arabic: "الرَّحْمَانِ", german: "des Barmherzigen" },
  { arabic: "الرَّحِيمِ", german: "des Gnädigen" },
  { arabic: "رَبِّ", german: "Herr" },
  { arabic: "الْعَالَمِينَ", german: "der Welten" },
  { arabic: "مَالِكِ", german: "Besitzer" },
  { arabic: "يَوْمِ", german: "des Tages" },
  { arabic: "الدِّينِ", german: "des Gerichts" },
  { arabic: "إِيَّاكَ", german: "Dir allein" },
  { arabic: "نَعْبُدُ", german: "dienen wir" },
  { arabic: "وَإِيَّاكَ", german: "und Dich allein" },
  { arabic: "نَسْتَعِينُ", german: "bitten wir um Hilfe" },
  { arabic: "اهْدِنَا", german: "führe uns" },
  { arabic: "الصِّرَاطَ", german: "den Weg" },
  { arabic: "الْمُسْتَقِيمَ", german: "den geraden" },
  { arabic: "صِرَاطَ", german: "den Weg" },
  { arabic: "الَّذِينَ", german: "derer" },
  { arabic: "أَنْعَمْتَ", german: "Du Gnade erwiesen hast" },
  { arabic: "عَلَيْهِمْ", german: "ihnen" },
  { arabic: "غَيْرِ", german: "nicht" },
  { arabic: "الْمَغْضُوبِ", german: "derer, denen Du zürnst" },
  { arabic: "وَلَا", german: "und nicht" },
  { arabic: "الضَّالِّينَ", german: "der Irrenden" },
  
  // Zahlen
  { arabic: "وَاحِدٌ", german: "eins" },
  { arabic: "اثْنَانِ", german: "zwei" },
  { arabic: "ثَلَاثَةٌ", german: "drei" },
  { arabic: "أَرْبَعَةٌ", german: "vier" },
  { arabic: "خَمْسَةٌ", german: "fünf" },
  { arabic: "سِتَّةٌ", german: "sechs" },
  { arabic: "سَبْعَةٌ", german: "sieben" },
  { arabic: "ثَمَانِيَةٌ", german: "acht" },
  { arabic: "تِسْعَةٌ", german: "neun" },
  { arabic: "عَشَرَةٌ", german: "zehn" },
  { arabic: "أَحَدَ عَشَرَ", german: "elf" },
  { arabic: "اثْنَا عَشَرَ", german: "zwölf" },
  { arabic: "ثَلَاثَةَ عَشَرَ", german: "dreizehn" },
  { arabic: "أَرْبَعَةَ عَشَرَ", german: "vierzehn" },
  { arabic: "خَمْسَةَ عَشَرَ", german: "fünfzehn" },
  { arabic: "سِتَّةَ عَشَرَ", german: "sechzehn" },
  { arabic: "سَبْعَةَ عَشَرَ", german: "siebzehn" },
  { arabic: "ثَمَانِيَةَ عَشَرَ", german: "achtzehn" },
  { arabic: "تِسْعَةَ عَشَرَ", german: "neunzehn" },
  { arabic: "عِشْرُونَ", german: "zwanzig" },
  { arabic: "ثَلَاثُونَ", german: "dreißig" },
  { arabic: "أَرْبَعُونَ", german: "vierzig" },
  { arabic: "خَمْسُونَ", german: "fünfzig" },
  { arabic: "سِتُّونَ", german: "sechzig" },
  { arabic: "سَبْعُونَ", german: "siebzig" },
  { arabic: "ثَمَانُونَ", german: "achtzig" },
  { arabic: "تِسْعُونَ", german: "neunzig" },
  { arabic: "مِائَةٌ", german: "hundert" },
  { arabic: "أَلْفٌ", german: "tausend" },
  
  // Familie
  { arabic: "أَبٌ", german: "Vater" },
  { arabic: "أُمٌّ", german: "Mutter" },
  { arabic: "ابْنٌ", german: "Sohn" },
  { arabic: "بِنْتٌ", german: "Tochter" },
  { arabic: "أَخٌ", german: "Bruder" },
  { arabic: "أُخْتٌ", german: "Schwester" },
  { arabic: "جَدٌّ", german: "Großvater" },
  { arabic: "جَدَّةٌ", german: "Großmutter" },
  { arabic: "عَمٌّ", german: "Onkel (väterlich)" },
  { arabic: "عَمَّةٌ", german: "Tante (väterlich)" },
  { arabic: "خَالٌ", german: "Onkel (mütterlich)" },
  { arabic: "خَالَةٌ", german: "Tante (mütterlich)" },
  { arabic: "زَوْجٌ", german: "Ehemann" },
  { arabic: "زَوْجَةٌ", german: "Ehefrau" },
  { arabic: "أُسْرَةٌ", german: "Familie" },
  { arabic: "عَائِلَةٌ", german: "Familie" },
  { arabic: "قَرِيبٌ", german: "Verwandter" },
  { arabic: "صَدِيقٌ", german: "Freund" },
  { arabic: "جَارٌ", german: "Nachbar" },
  
  // Allgemeine Wörter
  { arabic: "بَيْتٌ", german: "Haus" },
  { arabic: "مَدْرَسَةٌ", german: "Schule" },
  { arabic: "مَسْجِدٌ", german: "Moschee" },
  { arabic: "كِتَابٌ", german: "Buch" },
  { arabic: "قَلَمٌ", german: "Stift" },
  { arabic: "وَرَقَةٌ", german: "Blatt Papier" },
  { arabic: "مِكْتَبٌ", german: "Schreibtisch" },
  { arabic: "كُرْسِيٌّ", german: "Stuhl" },
  { arabic: "بَابٌ", german: "Tür" },
  { arabic: "نَافِذَةٌ", german: "Fenster" },
  { arabic: "غُرْفَةٌ", german: "Zimmer" },
  { arabic: "مَطْبَخٌ", german: "Küche" },
  { arabic: "حَمَّامٌ", german: "Badezimmer" },
  { arabic: "سَرِيرٌ", german: "Bett" },
  { arabic: "خِزَانَةٌ", german: "Schrank" },
  
  // Essen und Trinken
  { arabic: "خُبْزٌ", german: "Brot" },
  { arabic: "لَبَنٌ", german: "Milch" },
  { arabic: "مَاءٌ", german: "Wasser" },
  { arabic: "عَصِيرٌ", german: "Saft" },
  { arabic: "شَايٌ", german: "Tee" },
  { arabic: "قَهْوَةٌ", german: "Kaffee" },
  { arabic: "لَحْمٌ", german: "Fleisch" },
  { arabic: "سَمَكٌ", german: "Fisch" },
  { arabic: "دَجَاجٌ", german: "Huhn" },
  { arabic: "أَرُزٌّ", german: "Reis" },
  { arabic: "خُضَارٌ", german: "Gemüse" },
  { arabic: "فَوَاكِهُ", german: "Früchte" },
  { arabic: "تُفَّاحٌ", german: "Apfel" },
  { arabic: "مَوْزٌ", german: "Banane" },
  { arabic: "بُرْتُقَالٌ", german: "Orange" },
  { arabic: "عِنَبٌ", german: "Trauben" },
  { arabic: "طَمَاطِمُ", german: "Tomaten" },
  { arabic: "خِيَارٌ", german: "Gurke" },
  { arabic: "جَزَرٌ", german: "Karotten" },
  { arabic: "بَصَلٌ", german: "Zwiebeln" },
  { arabic: "ثُومٌ", german: "Knoblauch" },
  { arabic: "سُكَّرٌ", german: "Zucker" },
  { arabic: "مِلْحٌ", german: "Salz" },
  { arabic: "زَيْتٌ", german: "Öl" },
  
  // Kleidung
  { arabic: "ثَوْبٌ", german: "Kleid" },
  { arabic: "قَمِيصٌ", german: "Hemd" },
  { arabic: "بَنْطَلُونٌ", german: "Hose" },
  { arabic: "حِذَاءٌ", german: "Schuh" },
  { arabic: "جَوْرَبٌ", german: "Socke" },
  { arabic: "قُبَّعَةٌ", german: "Mütze" },
  { arabic: "مِعْطَفٌ", german: "Mantel" },
  { arabic: "نَظَّارَةٌ", german: "Brille" },
  { arabic: "سَاعَةٌ", german: "Uhr" },
  { arabic: "خَاتَمٌ", german: "Ring" },
  
  // Farben
  { arabic: "أَحْمَرُ", german: "rot" },
  { arabic: "أَزْرَقُ", german: "blau" },
  { arabic: "أَخْضَرُ", german: "grün" },
  { arabic: "أَصْفَرُ", german: "gelb" },
  { arabic: "أَسْوَدُ", german: "schwarz" },
  { arabic: "أَبْيَضُ", german: "weiß" },
  { arabic: "بُنِّيٌّ", german: "braun" },
  { arabic: "بَنَفْسَجِيٌّ", german: "lila" },
  { arabic: "وَرْدِيٌّ", german: "rosa" },
  { arabic: "رَمَادِيٌّ", german: "grau" },
  { arabic: "بُرْتُقَالِيٌّ", german: "orange" },
  
  // Körperteile
  { arabic: "رَأْسٌ", german: "Kopf" },
  { arabic: "وَجْهٌ", german: "Gesicht" },
  { arabic: "عَيْنٌ", german: "Auge" },
  { arabic: "أُذُنٌ", german: "Ohr" },
  { arabic: "أَنْفٌ", german: "Nase" },
  { arabic: "فَمٌ", german: "Mund" },
  { arabic: "أَسْنَانٌ", german: "Zähne" },
  { arabic: "لِسَانٌ", german: "Zunge" },
  { arabic: "رَقَبَةٌ", german: "Hals" },
  { arabic: "كَتِفٌ", german: "Schulter" },
  { arabic: "يَدٌ", german: "Hand" },
  { arabic: "ذِرَاعٌ", german: "Arm" },
  { arabic: "أُصْبُعٌ", german: "Finger" },
  { arabic: "صَدْرٌ", german: "Brust" },
  { arabic: "ظَهْرٌ", german: "Rücken" },
  { arabic: "بَطْنٌ", german: "Bauch" },
  { arabic: "رِجْلٌ", german: "Bein" },
  { arabic: "قَدَمٌ", german: "Fuß" },
  { arabic: "رُكْبَةٌ", german: "Knie" },
  
  // Verben (Präsens)
  { arabic: "يَقْرَأُ", german: "er liest" },
  { arabic: "يَكْتُبُ", german: "er schreibt" },
  { arabic: "يَأْكُلُ", german: "er isst" },
  { arabic: "يَشْرَبُ", german: "er trinkt" },
  { arabic: "يَنَامُ", german: "er schläft" },
  { arabic: "يَقُومُ", german: "er steht auf" },
  { arabic: "يَجْلِسُ", german: "er sitzt" },
  { arabic: "يَذْهَبُ", german: "er geht" },
  { arabic: "يَأْتِي", german: "er kommt" },
  { arabic: "يَرْجِعُ", german: "er kehrt zurück" },
  { arabic: "يَلْعَبُ", german: "er spielt" },
  { arabic: "يَدْرُسُ", german: "er studiert" },
  { arabic: "يَعْمَلُ", german: "er arbeitet" },
  { arabic: "يَفْهَمُ", german: "er versteht" },
  { arabic: "يَتَكَلَّمُ", german: "er spricht" },
  { arabic: "يَسْمَعُ", german: "er hört" },
  { arabic: "يَرَى", german: "er sieht" },
  { arabic: "يَفْتَحُ", german: "er öffnet" },
  { arabic: "يُغْلِقُ", german: "er schließt" },
  { arabic: "يَشْتَرِي", german: "er kauft" },
  { arabic: "يَبِيعُ", german: "er verkauft" },
  { arabic: "يُحِبُّ", german: "er liebt" },
  { arabic: "يَكْرَهُ", german: "er hasst" },
  { arabic: "يَخَافُ", german: "er fürchtet" },
  { arabic: "يَفْرَحُ", german: "er freut sich" },
  
  // Alltag und Zeit
  { arabic: "صَبَاحٌ", german: "Morgen" },
  { arabic: "ظُهْرٌ", german: "Mittag" },
  { arabic: "عَصْرٌ", german: "Nachmittag" },
  { arabic: "مَسَاءٌ", german: "Abend" },
  { arabic: "لَيْلٌ", german: "Nacht" },
  { arabic: "يَوْمٌ", german: "Tag" },
  { arabic: "أُسْبُوعٌ", german: "Woche" },
  { arabic: "شَهْرٌ", german: "Monat" },
  { arabic: "سَنَةٌ", german: "Jahr" },
  { arabic: "سَاعَةٌ", german: "Stunde" },
  { arabic: "دَقِيقَةٌ", german: "Minute" },
  { arabic: "ثَانِيَةٌ", german: "Sekunde" },
  { arabic: "الْيَوْمَ", german: "heute" },
  { arabic: "أَمْسِ", german: "gestern" },
  { arabic: "غَدًا", german: "morgen" },
  { arabic: "بَعْدَ غَدٍ", german: "übermorgen" },
  { arabic: "الْآنَ", german: "jetzt" },
  { arabic: "بَعْدَ قَلِيلٍ", german: "bald" },
  { arabic: "مُنْذُ قَلِيلٍ", german: "vor kurzem" },
  
  // Wochentage
  { arabic: "السَّبْتُ", german: "Samstag" },
  { arabic: "الْأَحَدُ", german: "Sonntag" },
  { arabic: "الْاثْنَيْنِ", german: "Montag" },
  { arabic: "الثَّلَاثَاءُ", german: "Dienstag" },
  { arabic: "الْأَرْبِعَاءُ", german: "Mittwoch" },
  { arabic: "الْخَمِيسُ", german: "Donnerstag" },
  { arabic: "الْجُمُعَةُ", german: "Freitag" },
  
  // Monate
  { arabic: "يَنَايِرُ", german: "Januar" },
  { arabic: "فِبْرَايِرُ", german: "Februar" },
  { arabic: "مَارِسُ", german: "März" },
  { arabic: "أَبْرِيلُ", german: "April" },
  { arabic: "مَايُو", german: "Mai" },
  { arabic: "يُونْيُو", german: "Juni" },
  { arabic: "يُولْيُو", german: "Juli" },
  { arabic: "أَغُسْطُسُ", german: "August" },
  { arabic: "سِبْتَمْبَرُ", german: "September" },
  { arabic: "أُكْتُوبَرُ", german: "Oktober" },
  { arabic: "نُوفَمْبَرُ", german: "November" },
  { arabic: "دِيسَمْبَرُ", german: "Dezember" },
  
  // Wetter und Natur
  { arabic: "طَقْسٌ", german: "Wetter" },
  { arabic: "شَمْسٌ", german: "Sonne" },
  { arabic: "قَمَرٌ", german: "Mond" },
  { arabic: "نُجُومٌ", german: "Sterne" },
  { arabic: "سَمَاءٌ", german: "Himmel" },
  { arabic: "أَرْضٌ", german: "Erde" },
  { arabic: "جَبَلٌ", german: "Berg" },
  { arabic: "بَحْرٌ", german: "Meer" },
  { arabic: "نَهْرٌ", german: "Fluss" },
  { arabic: "شَجَرَةٌ", german: "Baum" },
  { arabic: "وَرْدَةٌ", german: "Rose" },
  { arabic: "زَهْرَةٌ", german: "Blume" },
  { arabic: "عُشْبٌ", german: "Gras" },
  { arabic: "حَدِيقَةٌ", german: "Garten" },
  { arabic: "مَطَرٌ", german: "Regen" },
  { arabic: "ثَلْجٌ", german: "Schnee" },
  { arabic: "رِيحٌ", german: "Wind" },
  { arabic: "غَيْمٌ", german: "Wolke" },
  { arabic: "بَرْقٌ", german: "Blitz" },
  { arabic: "رَعْدٌ", german: "Donner" },
  
  // Adjektive
  { arabic: "كَبِيرٌ", german: "groß" },
  { arabic: "صَغِيرٌ", german: "klein" },
  { arabic: "طَوِيلٌ", german: "lang/groß" },
  { arabic: "قَصِيرٌ", german: "kurz/klein" },
  { arabic: "عَرِيضٌ", german: "breit" },
  { arabic: "ضَيِّقٌ", german: "eng" },
  { arabic: "سَمِيكٌ", german: "dick" },
  { arabic: "رَقِيقٌ", german: "dünn" },
  { arabic: "ثَقِيلٌ", german: "schwer" },
  { arabic: "خَفِيفٌ", german: "leicht" },
  { arabic: "سَرِيعٌ", german: "schnell" },
  { arabic: "بَطِيءٌ", german: "langsam" },
  { arabic: "قَوِيٌّ", german: "stark" },
  { arabic: "ضَعِيفٌ", german: "schwach" },
  { arabic: "ذَكِيٌّ", german: "klug" },
  { arabic: "غَبِيٌّ", german: "dumm" },
  { arabic: "جَمِيلٌ", german: "schön" },
  { arabic: "قَبِيحٌ", german: "hässlich" },
  { arabic: "جَدِيدٌ", german: "neu" },
  { arabic: "قَدِيمٌ", german: "alt" },
  { arabic: "نَظِيفٌ", german: "sauber" },
  { arabic: "قَذِرٌ", german: "schmutzig" },
  { arabic: "حَارٌّ", german: "heiß" },
  { arabic: "بَارِدٌ", german: "kalt" },
  { arabic: "دَافِئٌ", german: "warm" },
  { arabic: "بَارِدٌ", german: "kühl" },
  { arabic: "جَافٌّ", german: "trocken" },
  { arabic: "رَطْبٌ", german: "feucht" },
  { arabic: "حُلْوٌ", german: "süß" },
  { arabic: "مُرٌّ", german: "bitter" },
  { arabic: "مَالِحٌ", german: "salzig" },
  { arabic: "حَامِضٌ", german: "sauer" },
  
  // Präpositionen und Adverbien
  { arabic: "فِي", german: "in" },
  { arabic: "عَلَى", german: "auf" },
  { arabic: "تَحْتَ", german: "unter" },
  { arabic: "فَوْقَ", german: "über" },
  { arabic: "بَجَانِبِ", german: "neben" },
  { arabic: "أَمَامَ", german: "vor" },
  { arabic: "خَلْفَ", german: "hinter" },
  { arabic: "بَيْنَ", german: "zwischen" },
  { arabic: "مَعَ", german: "mit" },
  { arabic: "بِدُونِ", german: "ohne" },
  { arabic: "قَبْلَ", german: "vor" },
  { arabic: "بَعْدَ", german: "nach" },
  { arabic: "أَثْنَاءَ", german: "während" },
  { arabic: "مِنْ", german: "von/aus" },
  { arabic: "إِلَى", german: "zu/nach" },
  { arabic: "عَنْ", german: "über/von" },
  { arabic: "ضِدَّ", german: "gegen" },
  { arabic: "لِـ", german: "für" },
  { arabic: "بِـ", german: "mit/durch" },
  { arabic: "كَـ", german: "wie/als" },
  
  // Fragwörter
  { arabic: "مَا", german: "was" },
  { arabic: "مَاذَا", german: "was" },
  { arabic: "مَنْ", german: "wer" },
  { arabic: "أَيْنَ", german: "wo" },
  { arabic: "مَتَى", german: "wann" },
  { arabic: "كَيْفَ", german: "wie" },
  { arabic: "لِمَاذَا", german: "warum" },
  { arabic: "كَمْ", german: "wie viele" },
  { arabic: "أَيُّ", german: "welcher" },
  { arabic: "أَيْنَ", german: "wohin" },
  { arabic: "مِنْ أَيْنَ", german: "woher" },
  
  // Häufige Ausdrücke
  { arabic: "أَهْلًا وَسَهْلًا", german: "herzlich willkommen" },
  { arabic: "صَبَاحُ الْخَيْرِ", german: "guten Morgen" },
  { arabic: "صَبَاحُ النُّورِ", german: "guten Morgen (Antwort)" },
  { arabic: "مَسَاءُ الْخَيْرِ", german: "guten Abend" },
  { arabic: "مَسَاءُ النُّورِ", german: "guten Abend (Antwort)" },
  { arabic: "تَصْبَحُ عَلَى خَيْرٍ", german: "gute Nacht" },
  { arabic: "وَأَنْتَ بِخَيْرٍ", german: "dir auch" },
  { arabic: "كَيْفَ حَالُكَ؟", german: "wie geht es dir?" },
  { arabic: "بِخَيْرٍ", german: "gut" },
  { arabic: "الْحَمْدُ لِلَّهِ", german: "Gott sei Dank" },
  { arabic: "شُكْرًا", german: "danke" },
  { arabic: "عَفْوًا", german: "bitte/entschuldigung" },
  { arabic: "آسِفٌ", german: "es tut mir leid" },
  { arabic: "مَعْذِرَةً", german: "entschuldigung" },
  { arabic: "مِنْ فَضْلِكَ", german: "bitte" },
  { arabic: "نَعَمْ", german: "ja" },
  { arabic: "لَا", german: "nein" },
  { arabic: "رُبَّمَا", german: "vielleicht" },
  { arabic: "بِالطَّبْعِ", german: "natürlich" },
  { arabic: "أَكِيدٌ", german: "sicher" },
  { arabic: "مُمْكِنٌ", german: "möglich" },
  { arabic: "مُسْتَحِيلٌ", german: "unmöglich" },
  { arabic: "صَحِيحٌ", german: "richtig" },
  { arabic: "خَطَأٌ", german: "falsch" },
  { arabic: "حَسَنًا", german: "gut/okay" },
  { arabic: "مُمْتَازٌ", german: "ausgezeichnet" },
  { arabic: "رَائِعٌ", german: "wunderbar" },
  { arabic: "جَيِّدٌ", german: "gut" },
  { arabic: "سَيِّئٌ", german: "schlecht" },
  
  // Geschichtenvokabular - komplett aus der ursprünglichen Liste
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
  { arabic: "وَذِكْرِهِ", german: "und gedenke Ihn" },
  { arabic: "أَسْتَعِدُّ", german: "ich bereite mich vor" },
  { arabic: "لِلصَّلَاةِ", german: "für das Gebet" },
  { arabic: "ثُمَّ", german: "dann" },
  { arabic: "أَذْهَبُ", german: "ich gehe" },
  { arabic: "وَالِدِي", german: "meinem Vater" },
  { arabic: "الْمَسْجِدِ", german: "der Moschee" },
  { arabic: "قَرِيبٌ", german: "nah" },
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
  { arabic: "وأفطرُ", german: "und ich frühstücke" }
];

async function importCompleteOriginal() {
  console.log(`Importing complete original vocabulary: ${customVocabulary.length} entries...`);
  
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
          context: `Umfassendes Vokabular: ${vocab.german}`
        }
      });
      
      successful++;
      if (successful % 50 === 0) {
        console.log(`Progress: ${successful} entries imported...`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed: ${vocab.arabic} - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Complete import finished: ${successful} new, ${skipped} skipped, ${failed} failed`);
  
  // Final count
  const countResult = await weaviateRequest('/v1/graphql', 'POST', {
    query: '{ Aggregate { Vocabulary { meta { count } } } }'
  });
  
  const totalCount = countResult.data?.Aggregate?.Vocabulary?.[0]?.meta?.count || 0;
  console.log(`📊 Final total vocabulary entries: ${totalCount}`);
}

importCompleteOriginal();