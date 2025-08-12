// Complete Arabic Alphabet with all forms and pronunciations
export interface ArabicLetter {
  letter: string;
  name: string;
  pronunciation: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  transliteration: string;
  category: 'sun' | 'moon';
}

export interface VowelMark {
  mark: string;
  name: string;
  pronunciation: string;
  description: string;
}

export const arabicAlphabet: ArabicLetter[] = [
  {
    letter: 'ا',
    name: 'Alif',
    pronunciation: 'a / aa',
    isolated: 'ا',
    initial: 'ا',
    medial: 'ـا',
    final: 'ـا',
    transliteration: 'a',
    category: 'moon'
  },
  {
    letter: 'ب',
    name: 'Ba',
    pronunciation: 'b',
    isolated: 'ب',
    initial: 'بـ',
    medial: 'ـبـ',
    final: 'ـب',
    transliteration: 'b',
    category: 'moon'
  },
  {
    letter: 'ت',
    name: 'Ta',
    pronunciation: 't',
    isolated: 'ت',
    initial: 'تـ',
    medial: 'ـتـ',
    final: 'ـت',
    transliteration: 't',
    category: 'sun'
  },
  {
    letter: 'ث',
    name: 'Tha',
    pronunciation: 'th',
    isolated: 'ث',
    initial: 'ثـ',
    medial: 'ـثـ',
    final: 'ـث',
    transliteration: 'th',
    category: 'sun'
  },
  {
    letter: 'ج',
    name: 'Jim',
    pronunciation: 'j',
    isolated: 'ج',
    initial: 'جـ',
    medial: 'ـجـ',
    final: 'ـج',
    transliteration: 'j',
    category: 'moon'
  },
  {
    letter: 'ح',
    name: 'Ha',
    pronunciation: 'h',
    isolated: 'ح',
    initial: 'حـ',
    medial: 'ـحـ',
    final: 'ـح',
    transliteration: 'ḥ',
    category: 'moon'
  },
  {
    letter: 'خ',
    name: 'Kha',
    pronunciation: 'kh',
    isolated: 'خ',
    initial: 'خـ',
    medial: 'ـخـ',
    final: 'ـخ',
    transliteration: 'kh',
    category: 'moon'
  },
  {
    letter: 'د',
    name: 'Dal',
    pronunciation: 'd',
    isolated: 'د',
    initial: 'د',
    medial: 'ـد',
    final: 'ـد',
    transliteration: 'd',
    category: 'sun'
  },
  {
    letter: 'ذ',
    name: 'Dhal',
    pronunciation: 'dh',
    isolated: 'ذ',
    initial: 'ذ',
    medial: 'ـذ',
    final: 'ـذ',
    transliteration: 'dh',
    category: 'sun'
  },
  {
    letter: 'ر',
    name: 'Ra',
    pronunciation: 'r',
    isolated: 'ر',
    initial: 'ر',
    medial: 'ـر',
    final: 'ـر',
    transliteration: 'r',
    category: 'sun'
  },
  {
    letter: 'ز',
    name: 'Zay',
    pronunciation: 'z',
    isolated: 'ز',
    initial: 'ز',
    medial: 'ـز',
    final: 'ـز',
    transliteration: 'z',
    category: 'sun'
  },
  {
    letter: 'س',
    name: 'Sin',
    pronunciation: 's',
    isolated: 'س',
    initial: 'سـ',
    medial: 'ـسـ',
    final: 'ـس',
    transliteration: 's',
    category: 'sun'
  },
  {
    letter: 'ش',
    name: 'Shin',
    pronunciation: 'sh',
    isolated: 'ش',
    initial: 'شـ',
    medial: 'ـشـ',
    final: 'ـش',
    transliteration: 'sh',
    category: 'sun'
  },
  {
    letter: 'ص',
    name: 'Sad',
    pronunciation: 's',
    isolated: 'ص',
    initial: 'صـ',
    medial: 'ـصـ',
    final: 'ـص',
    transliteration: 'ṣ',
    category: 'sun'
  },
  {
    letter: 'ض',
    name: 'Dad',
    pronunciation: 'd',
    isolated: 'ض',
    initial: 'ضـ',
    medial: 'ـضـ',
    final: 'ـض',
    transliteration: 'ḍ',
    category: 'sun'
  },
  {
    letter: 'ط',
    name: 'Ta',
    pronunciation: 't',
    isolated: 'ط',
    initial: 'طـ',
    medial: 'ـطـ',
    final: 'ـط',
    transliteration: 'ṭ',
    category: 'sun'
  },
  {
    letter: 'ظ',
    name: 'Za',
    pronunciation: 'z',
    isolated: 'ظ',
    initial: 'ظـ',
    medial: 'ـظـ',
    final: 'ـظ',
    transliteration: 'ẓ',
    category: 'sun'
  },
  {
    letter: 'ع',
    name: 'Ayn',
    pronunciation: "'",
    isolated: 'ع',
    initial: 'عـ',
    medial: 'ـعـ',
    final: 'ـع',
    transliteration: 'ʿ',
    category: 'moon'
  },
  {
    letter: 'غ',
    name: 'Ghayn',
    pronunciation: 'gh',
    isolated: 'غ',
    initial: 'غـ',
    medial: 'ـغـ',
    final: 'ـغ',
    transliteration: 'gh',
    category: 'moon'
  },
  {
    letter: 'ف',
    name: 'Fa',
    pronunciation: 'f',
    isolated: 'ف',
    initial: 'فـ',
    medial: 'ـفـ',
    final: 'ـف',
    transliteration: 'f',
    category: 'moon'
  },
  {
    letter: 'ق',
    name: 'Qaf',
    pronunciation: 'q',
    isolated: 'ق',
    initial: 'قـ',
    medial: 'ـقـ',
    final: 'ـق',
    transliteration: 'q',
    category: 'moon'
  },
  {
    letter: 'ك',
    name: 'Kaf',
    pronunciation: 'k',
    isolated: 'ك',
    initial: 'كـ',
    medial: 'ـكـ',
    final: 'ـك',
    transliteration: 'k',
    category: 'moon'
  },
  {
    letter: 'ل',
    name: 'Lam',
    pronunciation: 'l',
    isolated: 'ل',
    initial: 'لـ',
    medial: 'ـلـ',
    final: 'ـل',
    transliteration: 'l',
    category: 'sun'
  },
  {
    letter: 'م',
    name: 'Mim',
    pronunciation: 'm',
    isolated: 'م',
    initial: 'مـ',
    medial: 'ـمـ',
    final: 'ـم',
    transliteration: 'm',
    category: 'moon'
  },
  {
    letter: 'ن',
    name: 'Nun',
    pronunciation: 'n',
    isolated: 'ن',
    initial: 'نـ',
    medial: 'ـنـ',
    final: 'ـن',
    transliteration: 'n',
    category: 'sun'
  },
  {
    letter: 'ه',
    name: 'Ha',
    pronunciation: 'h',
    isolated: 'ه',
    initial: 'هـ',
    medial: 'ـهـ',
    final: 'ـه',
    transliteration: 'h',
    category: 'moon'
  },
  {
    letter: 'و',
    name: 'Waw',
    pronunciation: 'w / u',
    isolated: 'و',
    initial: 'و',
    medial: 'ـو',
    final: 'ـو',
    transliteration: 'w',
    category: 'moon'
  },
  {
    letter: 'ي',
    name: 'Ya',
    pronunciation: 'y / i',
    isolated: 'ي',
    initial: 'يـ',
    medial: 'ـيـ',
    final: 'ـي',
    transliteration: 'y',
    category: 'moon'
  }
];

export const vowelMarks: VowelMark[] = [
  {
    mark: 'َ',
    name: 'Fatha',
    pronunciation: 'a',
    description: 'Kurzer a-Laut'
  },
  {
    mark: 'ِ',
    name: 'Kasra',
    pronunciation: 'i',
    description: 'Kurzer i-Laut'
  },
  {
    mark: 'ُ',
    name: 'Damma',
    pronunciation: 'u',
    description: 'Kurzer u-Laut'
  }
];

// Long vowel extensions
export const longVowels = [
  {
    symbol: 'ا',
    name: 'Alif',
    sound: 'aa',
    example: 'كِتَابٌ',
    pronunciation: 'kitaab'
  },
  {
    symbol: 'و',
    name: 'Waw',
    sound: 'uu',
    example: 'نُورٌ',
    pronunciation: 'nuur'
  },
  {
    symbol: 'ي',
    name: 'Ya',
    sound: 'ii',
    example: 'كَبِيرٌ',
    pronunciation: 'kabiir'
  }
];

// Practice words for different levels
export const practiceWords = {
  threeLetters: [
    { arabic: 'بَيْت', pronunciation: 'bayt', german: 'Haus', english: 'house' },
    { arabic: 'كِتَاب', pronunciation: 'kitaab', german: 'Buch', english: 'book' },
    { arabic: 'وَلَد', pronunciation: 'walad', german: 'Junge', english: 'boy' },
    { arabic: 'مَاء', pronunciation: 'maa', german: 'Wasser', english: 'water' },
    { arabic: 'يَوْم', pronunciation: 'yawm', german: 'Tag', english: 'day' },
    { arabic: 'شَمْس', pronunciation: 'shams', german: 'Sonne', english: 'sun' },
    { arabic: 'قَمَر', pronunciation: 'qamar', german: 'Mond', english: 'moon' },
    { arabic: 'بَاب', pronunciation: 'baab', german: 'Tür', english: 'door' }
  ],
  fourLetters: [
    { arabic: 'مَدْرَسَة', pronunciation: 'madrasa', german: 'Schule', english: 'school' },
    { arabic: 'مُعَلِّم', pronunciation: 'muʿallim', german: 'Lehrer', english: 'teacher' },
    { arabic: 'طَالِب', pronunciation: 'taalib', german: 'Schüler', english: 'student' },
    { arabic: 'مَكْتَب', pronunciation: 'maktab', german: 'Büro', english: 'office' },
    { arabic: 'مُسْتَشْفَى', pronunciation: 'mustashfa', german: 'Krankenhaus', english: 'hospital' }
  ],
  fiveLetters: [
    { arabic: 'مُسْتَشْفَى', pronunciation: 'mustashfa', german: 'Krankenhaus', english: 'hospital' },
    { arabic: 'جَامِعَة', pronunciation: 'jaami\'a', german: 'Universität', english: 'university' },
    { arabic: 'مَكْتَبَة', pronunciation: 'maktaba', german: 'Bibliothek', english: 'library' },
    { arabic: 'صَيْدَلِيَّة', pronunciation: 'saydaliyya', german: 'Apotheke', english: 'pharmacy' }
  ]
};