// Arabic text normalization utility
export function normalizeArabic(text) {
  if (!text) return '';
  
  // Remove all diacritics (tashkeel)
  let normalized = text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  
  // Normalize different forms of the same letter
  normalized = normalized
    .replace(/[أإآ]/g, 'ا')  // Different alif forms to regular alif
    .replace(/[ؤ]/g, 'و')   // Hamza on waw to regular waw
    .replace(/[ئ]/g, 'ي')   // Hamza on ya to regular ya
    .replace(/[ة]/g, 'ه')   // Ta marbuta to ha
    .replace(/[ى]/g, 'ي');  // Alif maksura to ya
  
  // Remove extra spaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}