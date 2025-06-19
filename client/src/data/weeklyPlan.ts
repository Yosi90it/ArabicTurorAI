export interface DailyTask {
  time: string;
  activity: string;
  duration: string;
  description: string;
}

export interface WeeklyPlan {
  day: number;
  title: string;
  focus: string;
  tasks: DailyTask[];
  letters: string[];
}

export const sevenDayPlan: WeeklyPlan[] = [
  {
    day: 1,
    title: "Foundation Day - First 7 Letters",
    focus: "Introduction to Arabic script basics",
    letters: ["ا", "ب", "ت", "ث", "ج", "ح", "خ"],
    tasks: [
      {
        time: "Morning (8:00)",
        activity: "Audio Introduction",
        duration: "10 min",
        description: "Listen to each letter 3 times, repeat aloud"
      },
      {
        time: "Morning (8:10)",
        activity: "Visual Recognition",
        duration: "5 min",
        description: "Study letter shapes, trace with finger on screen"
      },
      {
        time: "Midday (12:00)",
        activity: "Writing Practice",
        duration: "10 min",
        description: "Write each letter 5 times on paper"
      },
      {
        time: "Evening (18:00)",
        activity: "Audio Quiz",
        duration: "5 min",
        description: "Listen and identify letters (app quiz mode)"
      },
      {
        time: "Before Sleep (22:00)",
        activity: "Review Audio",
        duration: "5 min",
        description: "Passive listening while relaxing"
      }
    ]
  },
  {
    day: 2,
    title: "Building Momentum - Next 7 Letters",
    focus: "Adding new letters while reviewing day 1",
    letters: ["د", "ذ", "ر", "ز", "س", "ش", "ص"],
    tasks: [
      {
        time: "Morning (8:00)",
        activity: "Review + New Audio",
        duration: "12 min",
        description: "Quick review of day 1 letters (3 min) + new letters (9 min)"
      },
      {
        time: "Morning (8:12)",
        activity: "Mixed Recognition",
        duration: "8 min",
        description: "Identify random letters from both days"
      },
      {
        time: "Lunch Break (12:30)",
        activity: "Writing Both Sets",
        duration: "10 min",
        description: "Write all 14 letters in sequence"
      },
      {
        time: "Afternoon (15:00)",
        activity: "Speed Quiz",
        duration: "5 min",
        description: "Quick identification game with timer"
      },
      {
        time: "Evening (20:00)",
        activity: "Context Introduction",
        duration: "10 min",
        description: "Learn simple words using these letters"
      }
    ]
  },
  {
    day: 3,
    title: "Mid-Week Challenge - Next 7 Letters",
    focus: "Complex shapes and similar letters",
    letters: ["ض", "ط", "ظ", "ع", "غ", "ف", "ق"],
    tasks: [
      {
        time: "Morning (7:30)",
        activity: "Intensive Audio",
        duration: "15 min",
        description: "All 21 letters with emphasis on new ones"
      },
      {
        time: "Morning (7:45)",
        activity: "Similarity Focus",
        duration: "10 min",
        description: "Compare similar shapes (ص vs ض, ط vs ظ)"
      },
      {
        time: "Commute/Break (12:00)",
        activity: "Mobile Quiz",
        duration: "10 min",
        description: "Use app during travel time"
      },
      {
        time: "Afternoon (16:00)",
        activity: "Memory Palace",
        duration: "15 min",
        description: "Create visual mnemonics for difficult letters"
      },
      {
        time: "Evening (19:30)",
        activity: "Comprehensive Test",
        duration: "10 min",
        description: "Test all 21 letters learned so far"
      }
    ]
  },
  {
    day: 4,
    title: "Final Letters - Complete Alphabet",
    focus: "Last 7 letters and alphabet completion",
    letters: ["ك", "ل", "م", "ن", "ه", "و", "ي"],
    tasks: [
      {
        time: "Morning (8:00)",
        activity: "Complete Alphabet Audio",
        duration: "20 min",
        description: "Listen to all 28 letters in order, repeat sequence"
      },
      {
        time: "Morning (8:20)",
        activity: "Alphabetical Writing",
        duration: "15 min",
        description: "Write complete alphabet from memory"
      },
      {
        time: "Midday (13:00)",
        activity: "Random Testing",
        duration: "10 min",
        description: "Randomized letter identification challenge"
      },
      {
        time: "Afternoon (17:00)",
        activity: "Word Building",
        duration: "15 min",
        description: "Form simple 2-3 letter words"
      },
      {
        time: "Evening (21:00)",
        activity: "Full Alphabet Review",
        duration: "10 min",
        description: "Audio review of complete alphabet"
      }
    ]
  },
  {
    day: 5,
    title: "Mastery Reinforcement",
    focus: "Speed and accuracy improvement",
    letters: [], // All letters
    tasks: [
      {
        time: "Morning (8:00)",
        activity: "Speed Drills",
        duration: "15 min",
        description: "Rapid-fire letter identification under time pressure"
      },
      {
        time: "Morning (8:15)",
        activity: "Dictation Practice",
        duration: "10 min",
        description: "Write letters from audio dictation"
      },
      {
        time: "Break Time (11:00)",
        activity: "Mobile Flashcards",
        duration: "10 min",
        description: "Spaced repetition with digital flashcards"
      },
      {
        time: "Lunch (12:30)",
        activity: "Context Reading",
        duration: "15 min",
        description: "Read simple Arabic words and identify letters"
      },
      {
        time: "Evening (19:00)",
        activity: "Weakness Analysis",
        duration: "20 min",
        description: "Focus on letters with lowest accuracy scores"
      }
    ]
  },
  {
    day: 6,
    title: "Real-World Application",
    focus: "Letters in context and practical usage",
    letters: [], // All letters
    tasks: [
      {
        time: "Morning (8:00)",
        activity: "Name Recognition",
        duration: "15 min",
        description: "Practice with Arabic names and places"
      },
      {
        time: "Morning (8:15)",
        activity: "Calligraphy Basics",
        duration: "20 min",
        description: "Beautiful writing practice for each letter"
      },
      {
        time: "Midday (12:00)",
        activity: "Sign Reading",
        duration: "10 min",
        description: "Identify letters in Arabic text images"
      },
      {
        time: "Afternoon (15:30)",
        activity: "Game Mode",
        duration: "15 min",
        description: "Competitive letter games and challenges"
      },
      {
        time: "Evening (20:00)",
        activity: "Teaching Practice",
        duration: "15 min",
        description: "Explain each letter aloud as if teaching someone"
      }
    ]
  },
  {
    day: 7,
    title: "Mastery Assessment",
    focus: "Final evaluation and confidence building",
    letters: [], // All letters
    tasks: [
      {
        time: "Morning (8:00)",
        activity: "Comprehensive Test",
        duration: "30 min",
        description: "Complete alphabet assessment - audio and visual"
      },
      {
        time: "Morning (8:30)",
        activity: "Speed Challenge",
        duration: "10 min",
        description: "How fast can you identify all 28 letters?"
      },
      {
        time: "Midday (12:00)",
        activity: "Memory Test",
        duration: "15 min",
        description: "Write alphabet from memory without reference"
      },
      {
        time: "Afternoon (16:00)",
        activity: "Practical Application",
        duration: "20 min",
        description: "Read short Arabic text and identify every letter"
      },
      {
        time: "Evening (19:00)",
        activity: "Celebration Review",
        duration: "15 min",
        description: "Final review and progress celebration"
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