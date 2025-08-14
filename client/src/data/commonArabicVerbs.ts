// Most common Arabic verbs for enhanced detection
export const commonArabicVerbs = new Set([
  // Basic movement verbs
  'ذهب', 'جاء', 'خرج', 'دخل', 'مشى', 'ركض', 'وقف', 'جلس', 'قام', 'نام',
  
  // Action verbs
  'كتب', 'قرأ', 'أكل', 'شرب', 'فعل', 'عمل', 'أخذ', 'أعطى', 'وضع', 'حمل',
  
  // Communication verbs
  'قال', 'تكلم', 'سمع', 'رأى', 'نظر', 'فهم', 'علم', 'تعلم', 'درس', 'علم',
  
  // Existence verbs
  'كان', 'صار', 'أصبح', 'ظل', 'بقي', 'وجد', 'فقد', 'حدث', 'جرى', 'تم',
  
  // Emotional/mental verbs
  'أحب', 'كره', 'خاف', 'فرح', 'حزن', 'غضب', 'فكر', 'ذكر', 'نسي', 'حلم',
  
  // Work/activity verbs
  'عمل', 'لعب', 'نظف', 'طبخ', 'أكل', 'لبس', 'اشترى', 'باع', 'دفع', 'استقبل',
  
  // Time verbs
  'بدأ', 'انتهى', 'استمر', 'توقف', 'أسرع', 'أبطأ', 'تأخر', 'وصل', 'غادر', 'عاد',
  
  // Modal verbs
  'استطاع', 'أراد', 'احتاج', 'يجب', 'ينبغي', 'يمكن', 'لابد', 'عليه', 'حاول', 'نجح',
  
  // Social verbs
  'التقى', 'زار', 'استضاف', 'ساعد', 'شارك', 'تعاون', 'اتفق', 'اختلف', 'تزوج', 'طلق'
]);

// Common verb roots (3-letter patterns)
export const arabicVerbRoots = new Set([
  'كتب', 'قرأ', 'ذهب', 'جاء', 'أكل', 'شرب', 'نام', 'قام', 'جلس', 'وقف',
  'خرج', 'دخل', 'فعل', 'عمل', 'قال', 'سمع', 'رأى', 'أخذ', 'وضع', 'حمل',
  'كان', 'صار', 'فهم', 'علم', 'حدث', 'تكلم', 'مشى', 'ركض', 'لعب', 'طبخ',
  'لبس', 'نظف', 'بدأ', 'انتهى', 'وصل', 'عاد', 'أحب', 'كره', 'خاف', 'فرح'
]);

// Check if a word contains any of the common verb patterns
export function isCommonVerb(word: string): boolean {
  // Remove tashkeel for comparison
  const cleanWord = word.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  
  // Check direct match
  if (commonArabicVerbs.has(cleanWord)) {
    return true;
  }
  
  // Check if word contains any root
  for (const root of arabicVerbRoots) {
    if (cleanWord.includes(root)) {
      return true;
    }
  }
  
  return false;
}