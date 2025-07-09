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
  // Alle fehlenden Wörter aus den Logs:
  const customVocabulary = [
    // Neue Wörter aus den Logs
    { arabic: "وأسمع", german: "und ich höre" },
    { arabic: "عُمَرُ:", german: "Umar:" },
    { arabic: "لَا", german: "nein" },
    { arabic: "الدُّكَّانُ", german: "der Laden" },
    { arabic: "كَبِيْرَةٌ", german: "groß (weiblich)" },
    { arabic: "خَالِدٌ:", german: "Khalid:" },
    { arabic: "سَمُرَةٍ", german: "Samura (Name)" },
    { arabic: "بلغت", german: "ich erreichte" },
    { arabic: "وَاضْرِبُوهُمْ", german: "und schlagt sie" },
    { arabic: "تَعَالَ", german: "komm her" },
    { arabic: "الْجَمِيْلُ", german: "der Schöne" },
    
    // Häufige Wörter die fehlen
    { arabic: "إلى", german: "zu" },
    { arabic: "من", german: "von" },
    { arabic: "في", german: "in" },
    { arabic: "على", german: "auf" },
    { arabic: "هذا", german: "dies" },
    { arabic: "هذه", german: "diese" },
    { arabic: "ذلك", german: "das" },
    { arabic: "تلك", german: "jene" },
    { arabic: "التي", german: "die (weiblich)" },
    { arabic: "الذي", german: "der" },
    { arabic: "كان", german: "er war" },
    { arabic: "كانت", german: "sie war" },
    { arabic: "يكون", german: "er ist" },
    { arabic: "تكون", german: "sie ist" },
    { arabic: "قال", german: "er sagte" },
    { arabic: "قالت", german: "sie sagte" },
    { arabic: "يقول", german: "er sagt" },
    { arabic: "تقول", german: "sie sagt" },
    { arabic: "فعل", german: "er tat" },
    { arabic: "فعلت", german: "sie tat" },
    { arabic: "يفعل", german: "er tut" },
    { arabic: "تفعل", german: "sie tut" },
    
    // Conjunctions and particles
    { arabic: "و", german: "und" },
    { arabic: "أو", german: "oder" },
    { arabic: "لكن", german: "aber" },
    { arabic: "إذا", german: "wenn" },
    { arabic: "حتى", german: "bis" },
    { arabic: "بعد", german: "nach" },
    { arabic: "قبل", german: "vor" },
    { arabic: "أثناء", german: "während" },
    { arabic: "عبر", german: "durch" },
    { arabic: "حول", german: "um" },
    { arabic: "ضد", german: "gegen" },
    { arabic: "بدلا", german: "anstatt" },
    { arabic: "رغم", german: "trotz" },
    { arabic: "لأن", german: "weil" },
    { arabic: "كيف", german: "wie" },
    { arabic: "أين", german: "wo" },
    { arabic: "متى", german: "wann" },
    { arabic: "لماذا", german: "warum" },
    { arabic: "ماذا", german: "was" },
    { arabic: "من", german: "wer" },
    
    // Common adjectives
    { arabic: "جديد", german: "neu" },
    { arabic: "جديدة", german: "neue (weiblich)" },
    { arabic: "قديم", german: "alt" },
    { arabic: "قديمة", german: "alte (weiblich)" },
    { arabic: "صغير", german: "klein" },
    { arabic: "صغيرة", german: "kleine (weiblich)" },
    { arabic: "كبير", german: "groß" },
    { arabic: "كبيرة", german: "große (weiblich)" },
    { arabic: "طويل", german: "lang/groß" },
    { arabic: "طويلة", german: "lange/große (weiblich)" },
    { arabic: "قصير", german: "kurz/klein" },
    { arabic: "قصيرة", german: "kurze/kleine (weiblich)" },
    
    // Book-specific vocabulary
    { arabic: "القصة", german: "die Geschichte" },
    { arabic: "الحكاية", german: "die Erzählung" },
    { arabic: "الكلام", german: "das Sprechen" },
    { arabic: "الكتابة", german: "das Schreiben" },
    { arabic: "القراءة", german: "das Lesen" },
    { arabic: "التعلم", german: "das Lernen" },
    { arabic: "المعرفة", german: "das Wissen" },
    { arabic: "الفهم", german: "das Verstehen" },
    { arabic: "الذكاء", german: "die Intelligenz" },
    { arabic: "الحكمة", german: "die Weisheit" }
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