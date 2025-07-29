import React from 'react';
import ClickableText from '@/components/ClickableText';
import { useLanguage } from '@/contexts/LanguageContext';

// Convert HTML structure to React component based on qiraatu al rashida.html
export const QiratuRashidaPages: React.FC = () => {
  const { strings } = useLanguage();

  // Create context-aware word data from the HTML structure
  const createWordWithContext = (words: string[], index: number) => {
    const word = words[index];
    const prevWords = words.slice(Math.max(0, index - 2), index);
    const nextWords = words.slice(index + 1, Math.min(words.length, index + 3));
    const context = [...prevWords, word, ...nextWords].join(' ');
    return { word, context };
  };

  // Page 30 text as array for context processing
  const page30Words = [
    'أَنَامُ', 'مُبَكِّرًا', 'فِي', 'اللَّيْلِ،', 'وَأَقُومُ', 'مُبَكِّرًا', 'فِي', 'الصَّبَاحِ،', 'أَسْتَيْقِظُ', 'عَلَى', 'اسْمِ', 'اللَّهِ', 'وَذِكْرِهِ،', 'أَسْتَعِدُّ', 'لِلصَّلَاةِ،', 'ثُمَّ', 'أَذْهَبُ', 'مَعَ', 'وَالِدِي', 'إِلَى', 'الْمَسْجِدِ،',
    'وَالْمَسْجِدُ', 'قَرِيبٌ', 'مِنْ', 'بَيْتِي،', 'فَأَتَوَضَّأُ', 'وَأُصَلِّي', 'مَعَ', 'الْجَمَاعَةِ،', 'وَأَرْجِعُ', 'إِلَى', 'الْبَيْتِ،', 'وَأَتْلُو', 'شَيْئًا', 'مِنَ', 'الْقُرْآنِ', 'الْكَرِيمِ،',
    'ثُمَّ', 'أَخْرُجُ', 'إِلَى', 'الْبُسْتَانِ', 'وَأَجْرِي،', 'ثُمَّ', 'أَرْجِعُ', 'إِلَى', 'الْبَيْتِ', 'فَأَشْرَبُ', 'اللَّبَنَ،', 'وَأَسْتَعِدُّ', 'لِلذَّهَابِ', 'إِلَى', 'الْمَدْرَسَةِ،', 'وَأُفْطِرُ', 'إِذَا', 'كَانَتْ', 'أَيَّامُ', 'الصَّيْفِ،', 'وَأَتَغَدَّى', 'إِذَا', 'كَانَتْ', 'أَيَّامُ', 'الشِّتَاءِ،', 'وَأَصِلُ', 'إِلَى', 'الْمَدْرَسَةِ', 'فِي', 'الْمِيعَادِ،',
    'وَأَمْكُثُ', 'فِي', 'الْمَدْرَسَةِ', 'سِتَّ', 'سَاعَاتٍ،', 'وَأَسْمَعُ', 'الدُّرُوسَ', 'بِنَشَاطٍ', 'وَرَغْبَةٍ،', 'وَأَجْلِسُ', 'بِأَدَبٍ', 'وَسَكِينَةٍ،', 'حَتَّى', 'إِذَا', 'اِنْتَهَى', 'الْوَقْتُ', 'وَضَرَبَ', 'الْجَرَسُ', 'خَرَجْتُ', 'مِنَ', 'الْمَدْرَسَةِ', 'وَرَجَعْتُ', 'إِلَى', 'الْبَيْتِ.'
  ];

  const page31Words = [
    'وَلَا', 'أَقْرَأُ', 'بَعْدَ', 'صَلَاةِ', 'الْعَصْرِ', 'إِلَى', 'الْمَغْرِبِ،', 'وَفِي', 'بَعْضِ', 'الْأَيَّامِ', 'أَمْكُثُ', 'فِي', 'الْبَيْتِ،', 'وَفِي', 'بَعْضِ', 'الْأَيَّامِ', 'أَذْهَبُ', 'إِلَى', 'السُّوقِ', 'وَأَشْتَرِي', 'حَوَائِجَ', 'الْبَيْتِ،',
    'وَفِي', 'بَعْضِ', 'الْأَيَّامِ', 'أَخْرُجُ', 'مَعَ', 'أَبِي', 'أَوْ', 'أَخِي', 'إِلَى', 'بَعْضِ', 'الْأَقَارِبِ،', 'أَوْ', 'أَلْعَبُ', 'مَعَ', 'إِخْوَتِي', 'وَأَصْدِقَائِي.',
    'وَأَجْلِسُ', 'مَعَ', 'وَالِدِي', 'وَإِخْوَتِي،', 'وَأَحْفَظُ', 'دُرُوسِي،', 'وَأُطَالِعُ', 'لِلْغَدِ،', 'وَأَسْتَعِدُّ', 'لِلدَّرْسِ،', 'وَأُؤَكِّدُ', 'مَا', 'يَأْمُرُ', 'بِهِ', 'الْمُعَلِّمُ،', 'وَأُصَلِّي', 'الْعِشَاءَ،', 'وَأَقْرَأُ', 'قَلِيلًا،', 'ثُمَّ', 'أَنَامُ', 'عَلَى', 'اسْمِ', 'اللَّهِ', 'وَذِكْرِهِ.'
  ];

  const page32Words = [
    'لَمَّا', 'بَلَغْتُ', 'السَّابِعَةَ', 'مِنْ', 'عُمُرِي', 'أَمَرَنِي', 'أَبِي', 'بِالصَّلَاةِ،', 'وَكُنْتُ', 'تَعَلَّمْتُ', 'كَثِيرًا', 'مِنَ', 'الْأَدْعِيَةِ،', 'وَحَفِظْتُ', 'سُوَرًا', 'مِنَ', 'الْقُرْآنِ', 'الْكَرِيمِ', 'مِنْ', 'أُمِّي،',
    'وَكَانَتْ', 'أُمِّي', 'تَتَكَلَّمُ', 'مَعِي', 'كُلَّ', 'لَيْلَةٍ', 'عِنْدَ', 'النَّوْمِ', 'فَتَقُصُّ', 'عَلَيَّ', 'قِصَصَ', 'الْأَشْيَاءِ،', 'وَكُنْتُ', 'أَسْمَعُ', 'هَذِهِ', 'الْقِصَصَ', 'بِنَشَاطٍ', 'وَرَغْبَةٍ،', 'وَبَدَأْتُ', 'أَذْهَبُ', 'مَعَ', 'أَبِي', 'إِلَى', 'الْمَسْجِدِ،',
    'وَأَقُومُ', 'فِي', 'صَفِّ', 'الْأَطْفَالِ', 'خَلْفَ', 'صَفِّ', 'الرِّجَالِ،', 'وَلَمَّا', 'بَلَغْتُ', 'الْعَاشِرَةَ', 'مِنْ', 'عُمُرِي', 'قَالَ', 'لِي', 'مَرَّةً:', 'قَدْ', 'أَكْمَلْتَ', 'الآنَ', 'مِنْ', 'عُمُرِكَ', 'سَبْعَ', 'سِنِينَ،', 'وَالآنَ', 'أَنْتَ', 'ابْنُ', 'عَشْرِ', 'سِنِينَ،',
    'فَإِذَا', 'تَرَكْتَ', 'صَلَاةَ', 'ضُحَاكَ،', 'لِأَنَّ', 'النَّبِيَّ', 'ﷺ', 'قَالَ:', 'مُرُوا', 'أَوْلَادَكُمْ', 'بِالصَّلَاةِ', 'وَهُمْ', 'أَبْنَاءُ', 'سَبْعِ', 'سِنِينَ،', 'وَاضْرِبُوهُمْ', 'عَلَيْهَا', 'وَهُمْ', 'أَبْنَاءُ', 'عَشْرِ', 'سِنِينَ.'
  ];

  return (
    <div className="space-y-8 font-arabic text-right" dir="rtl">
      {/* Page 30 */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6 border-b pb-2">
          الصفحة ٣٠
        </h2>
        <div className="space-y-4 leading-relaxed text-lg">
          <div className="flex flex-wrap gap-1 justify-end">
            {page30Words.slice(0, 21).map((word, index) => {
              const { word: cleanWord, context } = createWordWithContext(page30Words, index);
              return (
                <ClickableText
                  key={`p30-1-${index}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page30Words.slice(21, 37).map((word, index) => {
              const actualIndex = index + 21;
              const { word: cleanWord, context } = createWordWithContext(page30Words, actualIndex);
              return (
                <ClickableText
                  key={`p30-2-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page30Words.slice(37, 69).map((word, index) => {
              const actualIndex = index + 37;
              const { word: cleanWord, context } = createWordWithContext(page30Words, actualIndex);
              return (
                <ClickableText
                  key={`p30-3-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page30Words.slice(69).map((word, index) => {
              const actualIndex = index + 69;
              const { word: cleanWord, context } = createWordWithContext(page30Words, actualIndex);
              return (
                <ClickableText
                  key={`p30-4-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Page 31 */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6 border-b pb-2">
          الصفحة ٣١
        </h2>
        <div className="space-y-4 leading-relaxed text-lg">
          <div className="flex flex-wrap gap-1 justify-end">
            {page31Words.slice(0, 22).map((word, index) => {
              const { word: cleanWord, context } = createWordWithContext(page31Words, index);
              return (
                <ClickableText
                  key={`p31-1-${index}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page31Words.slice(22, 38).map((word, index) => {
              const actualIndex = index + 22;
              const { word: cleanWord, context } = createWordWithContext(page31Words, actualIndex);
              return (
                <ClickableText
                  key={`p31-2-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page31Words.slice(38).map((word, index) => {
              const actualIndex = index + 38;
              const { word: cleanWord, context } = createWordWithContext(page31Words, actualIndex);
              return (
                <ClickableText
                  key={`p31-3-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Page 32 */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6 border-b pb-2">
          الصفحة ٣٢
        </h2>
        <div className="space-y-4 leading-relaxed text-lg">
          <div className="flex flex-wrap gap-1 justify-end">
            {page32Words.slice(0, 20).map((word, index) => {
              const { word: cleanWord, context } = createWordWithContext(page32Words, index);
              return (
                <ClickableText
                  key={`p32-1-${index}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page32Words.slice(20, 44).map((word, index) => {
              const actualIndex = index + 20;
              const { word: cleanWord, context } = createWordWithContext(page32Words, actualIndex);
              return (
                <ClickableText
                  key={`p32-2-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page32Words.slice(44, 70).map((word, index) => {
              const actualIndex = index + 44;
              const { word: cleanWord, context } = createWordWithContext(page32Words, actualIndex);
              return (
                <ClickableText
                  key={`p32-3-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {page32Words.slice(70).map((word, index) => {
              const actualIndex = index + 70;
              const { word: cleanWord, context } = createWordWithContext(page32Words, actualIndex);
              return (
                <ClickableText
                  key={`p32-4-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};