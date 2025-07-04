export interface WordEntry {
  arabic: string;
  translation: string;
  grammar: string;
}

export const arabicDictionary: { [key: string]: WordEntry } = {
  // From Qiraatu Al Rashida book
  "أنام": { arabic: "أنام", translation: "I sleep", grammar: "verb (1st person singular present)" },
  "مبكرا": { arabic: "مبكرا", translation: "early", grammar: "adverb" },
  "الليل": { arabic: "الليل", translation: "the night", grammar: "noun (definite)" },
  "أقوم": { arabic: "أقوم", translation: "I get up", grammar: "verb (1st person singular present)" },
  "الصباح": { arabic: "الصباح", translation: "the morning", grammar: "noun (definite)" },
  "أستيقظ": { arabic: "أستيقظ", translation: "I wake up", grammar: "verb (1st person singular present)" },
  "اسم": { arabic: "اسم", translation: "name", grammar: "noun" },
  "الله": { arabic: "الله", translation: "Allah/God", grammar: "proper noun" },
  "ذكر": { arabic: "ذكر", translation: "remembrance", grammar: "noun" },
  "أستعد": { arabic: "أستعد", translation: "I prepare", grammar: "verb (1st person singular present)" },
  "الصلاة": { arabic: "الصلاة", translation: "prayer", grammar: "noun (definite)" },
  "أذهب": { arabic: "أذهب", translation: "I go", grammar: "verb (1st person singular present)" },
  "والدي": { arabic: "والدي", translation: "my father", grammar: "noun (possessive)" },
  "المسجد": { arabic: "المسجد", translation: "the mosque", grammar: "noun (definite)" },
  "قريب": { arabic: "قريب", translation: "close/near", grammar: "adjective" },
  "بيتي": { arabic: "بيتي", translation: "my house", grammar: "noun (possessive)" },
  "أتوضأ": { arabic: "أتوضأ", translation: "I perform ablution", grammar: "verb (1st person singular present)" },
  "أصلي": { arabic: "أصلي", translation: "I pray", grammar: "verb (1st person singular present)" },
  "الجماعة": { arabic: "الجماعة", translation: "the congregation", grammar: "noun (definite)" },
  "أرجع": { arabic: "أرجع", translation: "I return", grammar: "verb (1st person singular present)" },
  "البيت": { arabic: "البيت", translation: "the house", grammar: "noun (definite)" },
  "أتلو": { arabic: "أتلو", translation: "I recite", grammar: "verb (1st person singular present)" },
  "شيئا": { arabic: "شيئا", translation: "something", grammar: "noun (indefinite accusative)" },
  "القرآن": { arabic: "القرآن", translation: "the Quran", grammar: "proper noun (definite)" },
  "الكريم": { arabic: "الكريم", translation: "the Noble", grammar: "adjective (definite)" },
  "أخرج": { arabic: "أخرج", translation: "I go out", grammar: "verb (1st person singular present)" },
  "البستان": { arabic: "البستان", translation: "the garden", grammar: "noun (definite)" },
  "أجري": { arabic: "أجري", translation: "I run", grammar: "verb (1st person singular present)" },
  "أشرب": { arabic: "أشرب", translation: "I drink", grammar: "verb (1st person singular present)" },
  "اللبن": { arabic: "اللبن", translation: "milk", grammar: "noun (definite)" },
  "الذهاب": { arabic: "الذهاب", translation: "going", grammar: "verbal noun (definite)" },
  "المدرسة": { arabic: "المدرسة", translation: "the school", grammar: "noun (definite)" },
  "بلغت": { arabic: "بلغت", translation: "I reached", grammar: "verb (1st person singular past)" },
  "السابعة": { arabic: "السابعة", translation: "the seventh", grammar: "ordinal number (definite)" },
  "عمري": { arabic: "عمري", translation: "my age", grammar: "noun (possessive)" },
  "أمرني": { arabic: "أمرني", translation: "he commanded me", grammar: "verb (3rd person singular past + pronoun)" },
  "أبي": { arabic: "أبي", translation: "my father", grammar: "noun (possessive)" },
  "تعلمت": { arabic: "تعلمت", translation: "I learned", grammar: "verb (1st person singular past)" },
  "كثيرا": { arabic: "كثيرا", translation: "much/many", grammar: "adverb" },
  "الأدعية": { arabic: "الأدعية", translation: "supplications", grammar: "noun (definite plural)" },
  "حفظت": { arabic: "حفظت", translation: "I memorized", grammar: "verb (1st person singular past)" },
  "سورا": { arabic: "سورا", translation: "chapters", grammar: "noun (indefinite accusative)" },
  "أمي": { arabic: "أمي", translation: "my mother", grammar: "noun (possessive)" },
  "لست": { arabic: "لست", translation: "I am not", grammar: "negative verb (1st person singular)" },
  "أرضى": { arabic: "أرضى", translation: "I am satisfied", grammar: "verb (1st person singular present)" },
  "الكسل": { arabic: "الكسل", translation: "laziness", grammar: "noun (definite)" },
  "طال": { arabic: "طال", translation: "it became long", grammar: "verb (3rd person singular past)" },
  "سعيي": { arabic: "سعيي", translation: "my effort", grammar: "noun (possessive)" },
  "الأمل": { arabic: "الأمل", translation: "hope", grammar: "noun (definite)" },
  "أبالي": { arabic: "أبالي", translation: "I care", grammar: "verb (1st person singular present)" },
  "التعب": { arabic: "التعب", translation: "fatigue", grammar: "noun (definite)" },
  "غايتي": { arabic: "غايتي", translation: "my goal", grammar: "noun (possessive)" },
  "نيل": { arabic: "نيل", translation: "attaining", grammar: "verbal noun" },
  "الطلب": { arabic: "الطلب", translation: "the request", grammar: "noun (definite)" },
  "كان": {
    arabic: "كان",
    translation: "was/were",
    grammar: "Verb, 3rd person masc. singular, past"
  },
  "يا": {
    arabic: "يا",
    translation: "oh/O",
    grammar: "Vocative particle"
  },
  "ما": {
    arabic: "ما",
    translation: "what/that which",
    grammar: "Interrogative/relative pronoun"
  },
  "في": {
    arabic: "في",
    translation: "in/at",
    grammar: "Preposition"
  },
  "قديم": {
    arabic: "قديم",
    translation: "old/ancient",
    grammar: "Adjective, masculine singular"
  },
  "الزمان": {
    arabic: "الزمان",
    translation: "time",
    grammar: "Noun, masculine singular, definite"
  },
  "تاجر": {
    arabic: "تاجر",
    translation: "merchant/trader",
    grammar: "Noun, masculine singular"
  },
  "غني": {
    arabic: "غني",
    translation: "rich/wealthy",
    grammar: "Adjective, masculine singular"
  },
  "بغداد": {
    arabic: "بغداد",
    translation: "Baghdad",
    grammar: "Proper noun, place name"
  },
  "وكان": {
    arabic: "وكان",
    translation: "and he had",
    grammar: "Conjunction + verb, 3rd person masc. singular, past"
  },
  "له": {
    arabic: "له",
    translation: "for him/he has",
    grammar: "Preposition + pronoun, 3rd person masc. singular"
  },
  "ولدان": {
    arabic: "ولدان",
    translation: "two sons",
    grammar: "Noun, masculine dual"
  },
  "الأكبر": {
    arabic: "الأكبر",
    translation: "the elder/older",
    grammar: "Adjective, masculine singular, definite, comparative"
  },
  "اسمه": {
    arabic: "اسمه",
    translation: "his name",
    grammar: "Noun + possessive pronoun, 3rd person masc. singular"
  },
  "علي": {
    arabic: "علي",
    translation: "Ali",
    grammar: "Proper noun, masculine name"
  },
  "والأصغر": {
    arabic: "والأصغر",
    translation: "and the younger",
    grammar: "Conjunction + adjective, masculine singular, definite, comparative"
  },
  "أحمد": {
    arabic: "أحمد",
    translation: "Ahmed",
    grammar: "Proper noun, masculine name"
  },
  "مرحبا": {
    arabic: "مرحبا",
    translation: "hello/welcome",
    grammar: "Interjection/greeting"
  },
  "كيف": {
    arabic: "كيف",
    translation: "how",
    grammar: "Interrogative adverb"
  },
  "حالك": {
    arabic: "حالك",
    translation: "your condition/state",
    grammar: "Noun + possessive pronoun, 2nd person"
  },
  "أنا": {
    arabic: "أنا",
    translation: "I",
    grammar: "Personal pronoun, 1st person singular"
  },
  "بخير": {
    arabic: "بخير",
    translation: "fine/well",
    grammar: "Preposition + noun, expressing state"
  },
  "شكرا": {
    arabic: "شكرا",
    translation: "thank you",
    grammar: "Expression of gratitude"
  },
  "ممتاز": {
    arabic: "ممتاز",
    translation: "excellent/great",
    grammar: "Adjective, masculine singular"
  },
  "هل": {
    arabic: "هل",
    translation: "do/does (question particle)",
    grammar: "Interrogative particle"
  },
  "تريد": {
    arabic: "تريد",
    translation: "you want",
    grammar: "Verb, 2nd person masculine singular, present"
  },
  "أن": {
    arabic: "أن",
    translation: "that/to",
    grammar: "Subordinating conjunction"
  },
  "نتحدث": {
    arabic: "نتحدث",
    translation: "we talk/speak",
    grammar: "Verb, 1st person plural, present"
  },
  "عن": {
    arabic: "عن",
    translation: "about/concerning",
    grammar: "Preposition"
  },
  "الطعام": {
    arabic: "الطعام",
    translation: "food",
    grammar: "Noun, masculine singular, definite"
  },
  "بيت": {
    arabic: "بيت",
    translation: "house",
    grammar: "Noun, masculine singular"
  },
  "طعام": {
    arabic: "طعام",
    translation: "food",
    grammar: "Noun, masculine singular"
  },
  "سيارة": {
    arabic: "سيارة",
    translation: "car",
    grammar: "Noun, feminine singular"
  }
};

export function getWordInfo(word: string): WordEntry | null {
  // Remove diacritics for lookup
  const cleanWord = word.replace(/[\u064B-\u0652]/g, '');
  return arabicDictionary[cleanWord] || null;
}