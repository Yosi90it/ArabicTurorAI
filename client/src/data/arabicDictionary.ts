export interface WordEntry {
  arabic: string;
  translation: string;
  grammar: string;
}

export const arabicDictionary: { [key: string]: WordEntry } = {
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