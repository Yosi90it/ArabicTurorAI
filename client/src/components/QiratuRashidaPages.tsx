import React, { useState } from 'react';
import ClickableText from '@/components/ClickableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Convert HTML structure to React component based on qiraatu al rashida.html
export const QiratuRashidaPages: React.FC = () => {
  const { strings } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);

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

  const pages = [
    {
      number: 30,
      title: "الصفحة ٣٠",
      words: page30Words,
      paragraphs: [
        { start: 0, end: 21 },
        { start: 21, end: 37 },
        { start: 37, end: 69 },
        { start: 69, end: page30Words.length }
      ]
    },
    {
      number: 31,
      title: "الصفحة ٣١", 
      words: page31Words,
      paragraphs: [
        { start: 0, end: 22 },
        { start: 22, end: 38 },
        { start: 38, end: page31Words.length }
      ]
    },
    {
      number: 32,
      title: "الصفحة ٣٢",
      words: page32Words,
      paragraphs: [
        { start: 0, end: 20 },
        { start: 20, end: 44 },
        { start: 44, end: 70 },
        { start: 70, end: page32Words.length }
      ]
    }
  ];

  const currentPageData = pages[currentPage];

  const renderPage = (pageData: typeof pages[0]) => {
    return (
      <div className="space-y-4 leading-relaxed text-lg">
        {pageData.paragraphs.map((paragraph, paragraphIndex) => (
          <div key={paragraphIndex} className="flex flex-wrap gap-1 justify-end">
            {pageData.words.slice(paragraph.start, paragraph.end).map((word, index) => {
              const actualIndex = paragraph.start + index;
              const { word: cleanWord, context } = createWordWithContext(pageData.words, actualIndex);
              return (
                <ClickableText
                  key={`p${pageData.number}-${paragraphIndex}-${actualIndex}`}
                  text={cleanWord}
                  context={context}
                  className="cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors"
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="font-arabic text-right" dir="rtl">
      {/* Page Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4" />
          السابق
        </Button>
        
        <h2 className="text-2xl font-bold text-center border-b pb-2">
          {currentPageData.title}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2"
        >
          التالي
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Page Content */}
      <div className="min-h-[400px]">
        {renderPage(currentPageData)}
      </div>

      {/* Page Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentPage ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};