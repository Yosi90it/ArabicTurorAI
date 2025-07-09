const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Setting up Weaviate with direct REST API...");

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

async function setupSchema() {
  try {
    console.log("Checking if Vocabulary class exists...");
    
    // Check existing schema
    const schema = await weaviateRequest('/v1/schema');
    const vocabularyClass = schema.classes?.find(c => c.class === 'Vocabulary');
    
    if (vocabularyClass) {
      console.log("✅ Vocabulary class already exists");
      return true;
    }
    
    console.log("Creating Vocabulary class...");
    
    // Create the class
    const classDefinition = {
      class: "Vocabulary",
      description: "Arabic-German vocabulary for language learning",
      properties: [
        {
          name: "arabic",
          dataType: ["text"],
          description: "Arabic word or phrase"
        },
        {
          name: "german",
          dataType: ["text"], 
          description: "German translation"
        }
      ]
    };
    
    await weaviateRequest('/v1/schema', 'POST', classDefinition);
    console.log("✅ Vocabulary class created successfully");
    return true;
    
  } catch (error) {
    console.error("Schema setup failed:", error.message);
    return false;
  }
}

async function importVocabulary() {
  const vocabularyData = [
    { arabic: "السلام", german: "der Frieden" },
    { arabic: "عليكم", german: "auf euch" },
    { arabic: "مرحبا", german: "willkommen" },
    { arabic: "شكرا", german: "danke" },
    { arabic: "الله", german: "Allah/Gott" },
    { arabic: "محمد", german: "Mohammed" },
    { arabic: "القرآن", german: "der Koran" },
    { arabic: "الصلاة", german: "das Gebet" },
    { arabic: "المسجد", german: "die Moschee" },
    { arabic: "الحمد", german: "das Lob" },
    { arabic: "لله", german: "für Allah" },
    { arabic: "رب", german: "Herr" },
    { arabic: "العالمين", german: "der Welten" },
    { arabic: "الرحمن", german: "der Barmherzige" },
    { arabic: "الرحيم", german: "der Gnädige" },
    { arabic: "ملك", german: "König" },
    { arabic: "يوم", german: "Tag" },
    { arabic: "الدين", german: "die Religion" },
    { arabic: "إياك", german: "dir allein" },
    { arabic: "نعبد", german: "wir dienen" },
    { arabic: "نستعين", german: "wir bitten um Hilfe" },
    { arabic: "اهدنا", german: "führe uns" },
    { arabic: "الصراط", german: "der Weg" },
    { arabic: "المستقيم", german: "der gerade" },
    { arabic: "صراط", german: "Weg" },
    { arabic: "الذين", german: "diejenigen" },
    { arabic: "أنعمت", german: "du begnadet hast" },
    { arabic: "عليهم", german: "über sie" },
    { arabic: "غير", german: "nicht" },
    { arabic: "المغضوب", german: "die Erzürnten" },
    { arabic: "الضالين", german: "die Irrenden" },
    { arabic: "آمين", german: "Amen" },
    { arabic: "بسم", german: "im Namen" },
    { arabic: "كتاب", german: "Buch" },
    { arabic: "قرأ", german: "lesen" },
    { arabic: "كتب", german: "schreiben" },
    { arabic: "درس", german: "Lektion" },
    { arabic: "طالب", german: "Student" },
    { arabic: "معلم", german: "Lehrer" },
    { arabic: "مدرسة", german: "Schule" },
    { arabic: "جامعة", german: "Universität" },
    { arabic: "بيت", german: "Haus" },
    { arabic: "باب", german: "Tür" },
    { arabic: "نافذة", german: "Fenster" },
    { arabic: "طاولة", german: "Tisch" },
    { arabic: "كرسي", german: "Stuhl" },
    { arabic: "سرير", german: "Bett" },
    { arabic: "مطبخ", german: "Küche" },
    { arabic: "حمام", german: "Badezimmer" },
    { arabic: "ماء", german: "Wasser" },
    { arabic: "طعام", german: "Essen" },
    { arabic: "خبز", german: "Brot" },
    { arabic: "لحم", german: "Fleisch" },
    { arabic: "سمك", german: "Fisch" },
    { arabic: "فاكهة", german: "Obst" },
    { arabic: "خضار", german: "Gemüse" },
    { arabic: "حليب", german: "Milch" },
    { arabic: "شاي", german: "Tee" },
    { arabic: "قهوة", german: "Kaffee" },
    { arabic: "عصير", german: "Saft" },
    { arabic: "رجل", german: "Mann" },
    { arabic: "امرأة", german: "Frau" },
    { arabic: "ولد", german: "Junge" },
    { arabic: "بنت", german: "Mädchen" },
    { arabic: "أب", german: "Vater" },
    { arabic: "أم", german: "Mutter" },
    { arabic: "أخ", german: "Bruder" },
    { arabic: "أخت", german: "Schwester" },
    { arabic: "ابن", german: "Sohn" },
    { arabic: "ابنة", german: "Tochter" },
    { arabic: "جد", german: "Großvater" },
    { arabic: "جدة", german: "Großmutter" },
    { arabic: "عم", german: "Onkel (väterlicherseits)" },
    { arabic: "عمة", german: "Tante (väterlicherseits)" },
    { arabic: "خال", german: "Onkel (mütterlicherseits)" },
    { arabic: "خالة", german: "Tante (mütterlicherseits)" },
    { arabic: "صديق", german: "Freund" },
    { arabic: "جار", german: "Nachbar" },
    { arabic: "واحد", german: "eins" },
    { arabic: "اثنان", german: "zwei" },
    { arabic: "ثلاثة", german: "drei" },
    { arabic: "أربعة", german: "vier" },
    { arabic: "خمسة", german: "fünf" },
    { arabic: "ستة", german: "sechs" },
    { arabic: "سبعة", german: "sieben" },
    { arabic: "ثمانية", german: "acht" },
    { arabic: "تسعة", german: "neun" },
    { arabic: "عشرة", german: "zehn" },
    { arabic: "صباح", german: "Morgen" },
    { arabic: "مساء", german: "Abend" },
    { arabic: "ليل", german: "Nacht" },
    { arabic: "نهار", german: "Tag (Tageslicht)" },
    { arabic: "شمس", german: "Sonne" },
    { arabic: "قمر", german: "Mond" },
    { arabic: "نجم", german: "Stern" },
    { arabic: "سماء", german: "Himmel" },
    { arabic: "أرض", german: "Erde" },
    { arabic: "بحر", german: "Meer" },
    { arabic: "نهر", german: "Fluss" },
    { arabic: "جبل", german: "Berg" },
    { arabic: "شجر", german: "Baum" },
    { arabic: "ورد", german: "Rose" },
    { arabic: "حديقة", german: "Garten" },
    { arabic: "حيوان", german: "Tier" },
    { arabic: "قط", german: "Katze" },
    { arabic: "كلب", german: "Hund" },
    { arabic: "حصان", german: "Pferd" },
    { arabic: "طير", german: "Vogel" }
  ];

  console.log(`Starting import of ${vocabularyData.length} vocabulary entries...`);
  
  let successful = 0;
  let failed = 0;
  
  for (const vocab of vocabularyData) {
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
  
  console.log(`\n✅ Import complete: ${successful} successful, ${failed} failed`);
  return successful > 0;
}

async function main() {
  try {
    const schemaReady = await setupSchema();
    if (!schemaReady) {
      console.error("❌ Schema setup failed, cannot proceed with import");
      process.exit(1);
    }
    
    const importSuccess = await importVocabulary();
    if (!importSuccess) {
      console.error("❌ Vocabulary import failed");
      process.exit(1);
    }
    
    console.log("🎉 Weaviate database is ready for translations!");
    
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

main();