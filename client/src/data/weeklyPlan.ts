export interface DailyTask {
  time: string;
  activity: string;
  duration: string;
  description: string;
  vowelFocus?: string;
}

export interface VowelCombination {
  letter: string;
  vowel: string;
  pronunciation: string;
  word: string;
  wordTranslation: string;
  mnemonic: string;
}

export interface WeeklyPlan {
  day: number;
  title: string;
  focus: string;
  tasks: DailyTask[];
  letters: string[];
}

export const vowelCombinations: VowelCombination[] = [
  // Fatha combinations
  { letter: "بَ", vowel: "fatha", pronunciation: "ba", word: "بَاب", wordTranslation: "door", mnemonic: "A boat (ب) with a sail (fatha) floating to the door" },
  { letter: "تَ", vowel: "fatha", pronunciation: "ta", word: "تَمْر", wordTranslation: "dates", mnemonic: "Two dots like dates with fatha sweetness above" },
  { letter: "جَ", vowel: "fatha", pronunciation: "ja", word: "جَمَل", wordTranslation: "camel", mnemonic: "A hook catching a camel with fatha line" },
  
  // Kasra combinations  
  { letter: "بِ", vowel: "kasra", pronunciation: "bi", word: "بِنْت", wordTranslation: "girl", mnemonic: "Boat with kasra line below like water reflection" },
  { letter: "تِ", vowel: "kasra", pronunciation: "ti", word: "تِين", wordTranslation: "figs", mnemonic: "Two dots with kasra underneath like fig roots" },
  { letter: "جِ", vowel: "kasra", pronunciation: "ji", word: "جِسْر", wordTranslation: "bridge", mnemonic: "Hook hanging down with kasra like bridge support" },
  
  // Damma combinations
  { letter: "بُ", vowel: "damma", pronunciation: "bu", word: "بُرْج", wordTranslation: "tower", mnemonic: "Boat with damma curl above like a tower crown" },
  { letter: "تُ", vowel: "damma", pronunciation: "tu", word: "تُفَّاح", wordTranslation: "apple", mnemonic: "Two dots with damma curl like apple stem" },
  { letter: "جُ", vowel: "damma", pronunciation: "ju", word: "جُبْن", wordTranslation: "cheese", mnemonic: "Hook with damma curl holding round cheese" }
];

export const sevenDayPlan: WeeklyPlan[] = [
  {
    day: 1,
    title: "Fatha Foundation - All Letters with Fatha",
    focus: "Master the 'a' sound (fatha) with all 28 letters",
    letters: ["ا", "ب", "ت", "ث", "ج", "ح", "خ"],
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Fatha Audio Drill",
        duration: "5 min",
        description: "Play during commute: each letter + fatha sound (بَ، تَ، جَ...)",
        vowelFocus: "fatha"
      },
      {
        time: "Free Hands Time",
        activity: "Fatha Writing Practice",
        duration: "10 min",
        description: "Trace letters with fatha on paper or tablet",
        vowelFocus: "fatha"
      },
      {
        time: "Any Break",
        activity: "Fatha Recognition Flash",
        duration: "3 min",
        description: "Quick flash cards: see letter+fatha, say sound",
        vowelFocus: "fatha"
      },
      {
        time: "Flexible Afternoon",
        activity: "Fatha Word Context",
        duration: "7 min",
        description: "Learn 5 simple words with fatha (بَاب، تَمْر...)",
        vowelFocus: "fatha"
      },
      {
        time: "Before Rest",
        activity: "Fatha Review Audio",
        duration: "5 min",
        description: "Passive listening to fatha combinations",
        vowelFocus: "fatha"
      }
    ]
  },
  {
    day: 2,
    title: "Kasra Foundation - All Letters with Kasra",
    focus: "Master the 'i' sound (kasra) with all 28 letters",
    letters: ["د", "ذ", "ر", "ز", "س", "ش", "ص"],
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Kasra Audio Drill",
        duration: "5 min",
        description: "Focus on kasra sound: بِ، تِ، جِ... (repeat after 1 practice)",
        vowelFocus: "kasra"
      },
      {
        time: "Free Hands Time",
        activity: "Kasra Writing Practice",
        duration: "10 min",
        description: "Trace letters with kasra underneath",
        vowelFocus: "kasra"
      },
      {
        time: "Any Break",
        activity: "Kasra vs Fatha Quiz",
        duration: "5 min",
        description: "Compare yesterday's fatha with today's kasra",
        vowelFocus: "kasra"
      },
      {
        time: "Flexible Afternoon",
        activity: "Kasra Word Building",
        duration: "7 min",
        description: "Learn words with kasra (بِنْت، تِين...)",
        vowelFocus: "kasra"
      },
      {
        time: "Before Rest",
        activity: "Mixed Fatha-Kasra Review",
        duration: "8 min",
        description: "Alternate between fatha and kasra sounds",
        vowelFocus: "kasra"
      }
    ]
  },
  {
    day: 3,
    title: "Damma Foundation - All Letters with Damma",
    focus: "Master the 'u' sound (damma) with all 28 letters",
    letters: ["ض", "ط", "ظ", "ع", "غ", "ف", "ق"],
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Damma Audio Drill",
        duration: "5 min",
        description: "Focus on damma sound: بُ، تُ، جُ... (repeat after 2 drills)",
        vowelFocus: "damma"
      },
      {
        time: "Free Hands Time",
        activity: "Damma Writing Practice",
        duration: "10 min",
        description: "Trace letters with damma curl above",
        vowelFocus: "damma"
      },
      {
        time: "Any Break",
        activity: "Three-Vowel Recognition",
        duration: "8 min",
        description: "Random mix: identify fatha, kasra, or damma",
        vowelFocus: "damma"
      },
      {
        time: "Flexible Afternoon",
        activity: "Damma Word Context",
        duration: "7 min",
        description: "Learn words with damma (بُرْج، تُفَّاح...)",
        vowelFocus: "damma"
      },
      {
        time: "Before Rest",
        activity: "All-Vowel Sequence",
        duration: "10 min",
        description: "Practice بَ بِ بُ sequences for each letter",
        vowelFocus: "damma"
      }
    ]
  },
  {
    day: 4,
    title: "Mixed Vowel Practice - Random Combinations",
    focus: "Flexible vowel recognition and quick switching",
    letters: ["ك", "ل", "م", "ن", "ه", "و", "ي"],
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Random Vowel Audio",
        duration: "8 min",
        description: "Mixed vowel practice: بَ، دِ، كُ، تَ... (repeat after 4 drills)",
        vowelFocus: "mixed"
      },
      {
        time: "Free Hands Time",
        activity: "Vowel Writing Challenge",
        duration: "12 min",
        description: "Write letters with random vowels from dictation"
      },
      {
        time: "Any Break",
        activity: "Speed Vowel Quiz",
        duration: "5 min",
        description: "Fast identification: which vowel do you hear?"
      },
      {
        time: "Flexible Afternoon",
        activity: "CVC Word Building",
        duration: "10 min",
        description: "Form simple words mixing all vowels"
      },
      {
        time: "Before Rest",
        activity: "Vowel Pattern Recognition",
        duration: "10 min",
        description: "Identify vowel patterns in short words"
      }
    ]
  },
  {
    day: 5,
    title: "Speed & Accuracy - Rapid Vowel Recognition",
    focus: "Quick vowel identification and error correction",
    letters: [], // All letters
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Rapid Vowel Drills",
        duration: "10 min",
        description: "Speed practice: hear letter+vowel, respond immediately"
      },
      {
        time: "Free Hands Time",
        activity: "Error Correction Training",
        duration: "12 min",
        description: "Focus on commonly confused vowel pairs"
      },
      {
        time: "Any Break",
        activity: "Vowel Memory Game",
        duration: "8 min",
        description: "Remember sequences: بَ تِ جُ، repeat back"
      },
      {
        time: "Flexible Afternoon",
        activity: "Contextual Reading",
        duration: "15 min",
        description: "Read short phrases identifying each vowel"
      },
      {
        time: "Before Rest",
        activity: "Self-Assessment Quiz",
        duration: "10 min",
        description: "Test your weakest vowel combinations"
      }
    ]
  },
  {
    day: 6,
    title: "Real-World Vowel Application",
    focus: "Vowels in authentic Arabic context",
    letters: [], // All letters
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Name Vowel Analysis",
        duration: "12 min",
        description: "Identify vowels in Arabic names (أَحْمَد، فَاطِمَة...)"
      },
      {
        time: "Free Hands Time",
        activity: "Vowel Calligraphy",
        duration: "15 min",
        description: "Beautiful writing of letters with vowel marks"
      },
      {
        time: "Any Break",
        activity: "Sign Vowel Reading",
        duration: "8 min",
        description: "Spot vowels in Arabic text images"
      },
      {
        time: "Flexible Afternoon",
        activity: "Vowel Teaching Practice",
        duration: "10 min",
        description: "Explain vowel sounds as if teaching a friend"
      },
      {
        time: "Before Rest",
        activity: "Authentic Text Scanning",
        duration: "10 min",
        description: "Find vowel patterns in simple Arabic texts"
      }
    ]
  },
  {
    day: 7,
    title: "Vowel Mastery Assessment",
    focus: "Complete evaluation of letter+vowel combinations",
    letters: [], // All letters
    tasks: [
      {
        time: "Flexible Morning",
        activity: "Complete Vowel Test",
        duration: "20 min",
        description: "Comprehensive test: all letters with all three vowels"
      },
      {
        time: "Free Hands Time",
        activity: "Vowel Speed Challenge",
        duration: "10 min",
        description: "How fast can you identify 84 letter+vowel combinations?"
      },
      {
        time: "Any Break",
        activity: "Vowel Memory Assessment",
        duration: "15 min",
        description: "Write letter+vowel combinations from audio dictation"
      },
      {
        time: "Flexible Afternoon",
        activity: "Real Text Vowel Reading",
        duration: "15 min",
        description: "Read authentic Arabic with full vowel recognition"
      },
      {
        time: "Before Rest",
        activity: "Mastery Celebration",
        duration: "10 min",
        description: "Review progress and celebrate vowel mastery achievement"
      }
    ]
  }
];

export const mnemonics = {
  "ا": {
    name: "Alif",
    mnemonic: "Like a tall cactus standing straight",
    visual: "Imagine a desert cactus reaching for the sky",
    context: "**أ**حمد (Ahmad) - common Arabic name"
  },
  "ب": {
    name: "Ba",
    mnemonic: "A boat with one dot underneath",
    visual: "Picture a small boat floating on water",
    context: "**ب**يت (bayt) - house"
  },
  "ت": {
    name: "Ta",
    mnemonic: "A boat with two dots like eyes above",
    visual: "The boat from Ba got two eyes to see",
    context: "**ت**فاح (tuffah) - apple"
  },
  "ث": {
    name: "Tha",
    mnemonic: "Three dots like three stars",
    visual: "Three bright stars twinkling above the boat",
    context: "**ث**لج (thalj) - snow"
  },
  "ج": {
    name: "Jeem",
    mnemonic: "A hook with a dot, like a fishing hook",
    visual: "A curved fishing hook catching a fish",
    context: "**ج**مل (jamal) - camel"
  },
  "ح": {
    name: "Haa",
    mnemonic: "An open smile without teeth",
    visual: "A happy face smiling wide",
    context: "**ح**ليب (haleeb) - milk"
  },
  "خ": {
    name: "Khaa",
    mnemonic: "The smile got a dimple (dot above)",
    visual: "The same smile but with a beauty mark",
    context: "**خ**بز (khubz) - bread"
  },
  "د": {
    name: "Dal",
    mnemonic: "A semicircle like a dome",
    visual: "The dome of a beautiful mosque",
    context: "**د**جاج (dajaj) - chicken"
  },
  "ذ": {
    name: "Thal",
    mnemonic: "The dome with a dot on top",
    visual: "The mosque dome with a golden ornament",
    context: "**ذ**هب (thahab) - gold"
  },
  "ر": {
    name: "Ra",
    mnemonic: "A small curl like a snail",
    visual: "A tiny snail making its way",
    context: "**ر**أس (ra's) - head"
  },
  "ز": {
    name: "Zay",
    mnemonic: "The snail with a dot above",
    visual: "The snail carrying a small pebble",
    context: "**ز**يت (zayt) - oil"
  },
  "س": {
    name: "Seen",
    mnemonic: "Three teeth in a smile",
    visual: "A grin showing three front teeth",
    context: "**س**مك (samak) - fish"
  },
  "ش": {
    name: "Sheen",
    mnemonic: "Three teeth with three dots above",
    visual: "The teeth got decorated with jewels",
    context: "**ش**مس (shams) - sun"
  },
  "ص": {
    name: "Sad",
    mnemonic: "A large tooth with a loop",
    visual: "A big molar tooth with a root",
    context: "**ص**باح (sabah) - morning"
  },
  "ض": {
    name: "Dad",
    mnemonic: "The big tooth with a dot above",
    visual: "The molar got a gold filling",
    context: "**ض**وء (daw') - light"
  },
  "ط": {
    name: "Taa",
    mnemonic: "A frying pan with a handle",
    visual: "Cooking breakfast in a round pan",
    context: "**ط**عام (ta'am) - food"
  },
  "ظ": {
    name: "Zaa",
    mnemonic: "The frying pan with a dot (spice)",
    visual: "Adding spices to the cooking pan",
    context: "**ظ**هر (zuhr) - noon"
  },
  "ع": {
    name: "Ain",
    mnemonic: "An eye looking sideways",
    visual: "A vigilant eye watching carefully",
    context: "**ع**ين (ayn) - eye"
  },
  "غ": {
    name: "Ghain",
    mnemonic: "The eye with a dot (tear)",
    visual: "The eye shed a single tear",
    context: "**غ**زال (ghazal) - gazelle"
  },
  "ف": {
    name: "Fa",
    mnemonic: "A circle with a dot like a face",
    visual: "A simple smiley face drawing",
    context: "**ف**يل (feel) - elephant"
  },
  "ق": {
    name: "Qaf",
    mnemonic: "The face with two dots (two eyes)",
    visual: "A face with two clear eyes",
    context: "**ق**لم (qalam) - pen"
  },
  "ك": {
    name: "Kaf",
    mnemonic: "A person sitting and stretching",
    visual: "Someone doing yoga poses",
    context: "**ك**تاب (kitab) - book"
  },
  "ل": {
    name: "Lam",
    mnemonic: "A tall lighthouse",
    visual: "A beacon guiding ships safely",
    context: "**ل**حم (lahm) - meat"
  },
  "م": {
    name: "Meem",
    mnemonic: "A small circle like the moon",
    visual: "A perfect full moon in the sky",
    context: "**م**اء (ma') - water"
  },
  "ن": {
    name: "Noon",
    mnemonic: "A bowl with a dot (food inside)",
    visual: "A soup bowl with a meatball",
    context: "**ن**ار (nar) - fire"
  },
  "ه": {
    name: "Ha",
    mnemonic: "A house with a chimney",
    visual: "A cozy home with smoke rising",
    context: "**ه**واء (hawa') - air"
  },
  "و": {
    name: "Waw",
    mnemonic: "A rope or a lasso",
    visual: "A cowboy's lasso ready to throw",
    context: "**و**رد (ward) - flower"
  },
  "ي": {
    name: "Ya",
    mnemonic: "Two dots under a line (like feet)",
    visual: "Someone's feet as they walk",
    context: "**ي**د (yad) - hand"
  }
};