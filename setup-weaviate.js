import weaviate from "weaviate-client";

const WEAVIATE_URL = process.env.WEAVIATE_URL;
const WEAVIATE_APIKEY = process.env.WEAVIATE_APIKEY;

console.log("Setting up Weaviate database...");

const client = weaviate.client({
  scheme: "https",
  host: WEAVIATE_URL.replace(/^https?:\/\//, ""),
  apiKey: new weaviate.ApiKey(WEAVIATE_APIKEY),
});

async function setupAndImport() {
  try {
    // Check if class exists
    console.log("Checking existing schema...");
    const schema = await client.schema.getter().do();
    
    const vocabularyClass = schema.classes?.find(c => c.class === "Vocabulary");
    
    if (!vocabularyClass) {
      console.log("Creating Vocabulary class...");
      await client.schema
        .classCreator()
        .withClass({
          class: "Vocabulary",
          description: "Arabic-German vocabulary from learning materials",
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
        })
        .do();
      console.log("✅ Vocabulary class created");
    } else {
      console.log("✅ Vocabulary class already exists");
    }

    // Import vocabulary data
    console.log("Starting vocabulary import...");
    
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
      { arabic: "أحد عشر", german: "elf" },
      { arabic: "اثنا عشر", german: "zwölf" },
      { arabic: "عشرون", german: "zwanzig" },
      { arabic: "ثلاثون", german: "dreißig" },
      { arabic: "مائة", german: "hundert" },
      { arabic: "ألف", german: "tausend" },
      { arabic: "أحمر", german: "rot" },
      { arabic: "أزرق", german: "blau" },
      { arabic: "أخضر", german: "grün" },
      { arabic: "أصفر", german: "gelb" },
      { arabic: "أبيض", german: "weiß" },
      { arabic: "أسود", german: "schwarz" },
      { arabic: "كبير", german: "groß" },
      { arabic: "صغير", german: "klein" },
      { arabic: "طويل", german: "lang/hoch" },
      { arabic: "قصير", german: "kurz" },
      { arabic: "جديد", german: "neu" },
      { arabic: "قديم", german: "alt" },
      { arabic: "جميل", german: "schön" },
      { arabic: "قبيح", german: "hässlich" },
      { arabic: "سعيد", german: "glücklich" },
      { arabic: "حزين", german: "traurig" }
    ];

    let imported = 0;
    let failed = 0;

    for (const vocab of vocabularyData) {
      try {
        await client.data.creator()
          .withClassName("Vocabulary")
          .withProperties(vocab)
          .do();
        imported++;
        console.log(`✓ ${vocab.arabic} → ${vocab.german}`);
      } catch (error) {
        failed++;
        console.error(`✗ Failed: ${vocab.arabic} - ${error.message}`);
      }
    }

    console.log(`\n✅ Import complete: ${imported} successful, ${failed} failed`);
    console.log("🎉 Weaviate database is ready for use!");

  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  }
}

setupAndImport();