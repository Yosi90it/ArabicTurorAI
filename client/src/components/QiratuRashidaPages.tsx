import React, { useState } from 'react';
import ClickableText from '@/components/ClickableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Updated based on the new HTML structure from qiraatu al rashida.html
export const QiratuRashidaPages: React.FC = () => {
  const { strings } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);

  // Create context-aware word data
  const createWordWithContext = (words: string[], index: number) => {
    const word = words[index];
    const prevWords = words.slice(Math.max(0, index - 2), index);
    const nextWords = words.slice(index + 1, Math.min(words.length, index + 3));
    const context = [...prevWords, word, ...nextWords].join(' ');
    return { word, context };
  };

  // Page 1: "كَيْفَ أَقْضِي يَوْمِي" - Complete text from HTML
  const page1Words = [
    'أَنَامُ', 'مُبَكِّرًا', 'فِي', 'اللَّيْلِ', 'وَأَقُومُ', 'مُبَكِّرًا', 'فِي', 'الصَّبَاحِ،', 'أَسْتَيْقِظُ', 'عَلَى', 'اسْمِ', 'اللَّهِ', 'وَذِكْرِهِ،', 'أَسْتَعِدُّ', 'لِلصَّلَاةِ', 'ثُمَّ', 'أَذْهَبُ', 'مَعَ', 'وَالِدِي', 'إِلَى', 'الْمَسْجِدِ،', 'وَالْمَسْجِدُ', 'قَرِيبٌ', 'مِنْ', 'بَيْتِي،', 'فَأَتَوَضَّأُ', 'وَأُصَلِّي', 'مَعَ', 'الْجَمَاعَةِ،', 'وَأَرْجِعُ', 'إِلَى', 'الْبَيْتِ', 'وَأَتْلُو', 'شَيْئًا', 'مِنَ', 'الْقُرْآنِ', 'الْكَرِيمِ،', 'ثُمَّ', 'أَخْرُجُ', 'إِلَى', 'الْبُسْتَانِ', 'وَأَجْرِي،', 'ثُمَّ', 'أَرْجِعُ', 'إِلَى', 'الْبَيْتِ', 'فَأَشْرَبُ', 'اللَّبَنَ', 'وَأَسْتَعِدُّ', 'لِلذَّهَابِ', 'إِلَى', 'الْمَدْرَسَةِ،', 'وَأُفْطِرُ', 'إِذَا', 'كَانَتْ', 'أَيَّامُ', 'الصَّيْفِ،', 'وَأَتَغَدَّى', 'إِذَا', 'كَانَتْ', 'أَيَّامُ', 'الشِّتَاءِ،', 'وَأَصِلُ', 'إِلَى', 'الْمَدْرَسَةِ', 'فِي', 'الْمِيعَادِ،', 'وَأَمْكُثُ', 'فِي', 'الْمَدْرَسَةِ', 'سِتَّ', 'سَاعَاتٍ،', 'وَأَسْمَعُ', 'الدُّرُوسَ', 'بِنَشَاطٍ', 'وَرَغْبَةٍ،', 'وَأَجْلِسُ', 'بِأَدَبٍ', 'وَسَكِينَةٍ،', 'حَتَّى', 'إِذَا', 'انْتَهَى', 'الْوَقْتُ', 'وَضُرِبَ', 'الْجَرَسُ', 'خَرَجْتُ', 'مِنَ', 'الْمَدْرَسَةِ', 'وَرَجَعْتُ', 'إِلَى', 'الْبَيْتِ.'
  ];

  const page1Paragraph2 = [
    'وَلَا', 'أَقْرَأُ', 'بَعْدَ', 'صَلَاةِ', 'الْعَصْرِ', 'إِلَى', 'الْمَغْرِبِ،', 'وَفِي', 'بَعْضِ', 'الْأَيَّامِ', 'أَمْكُثُ', 'فِي', 'الْبَيْتِ،', 'وَفِي', 'بَعْضِ', 'الْأَيَّامِ', 'أَذْهَبُ', 'إِلَى', 'السُّوقِ', 'وَأَشْتَرِي', 'حَوَائِجَ', 'الْبَيْتِ،', 'وَفِي', 'بَعْضِ', 'الْأَيَّامِ', 'أَخْرُجُ', 'مَعَ', 'أَبِي', 'أَوْ', 'أَخِي', 'إِلَى', 'بَعْضِ', 'الْأَقَارِبِ،', 'أَوْ', 'أَلْعَبُ', 'مَعَ', 'إِخْوَتِي', 'وَأَصْدِقَائِي.', 'وَأَتَعَشَّى', 'مَعَ', 'وَالِدِي', 'وَإِخْوَتِي', 'وَأَحْفَظُ', 'دُرُوسِي،', 'وَأُطَالِعُ', 'لِلْغَدِ،', 'وَأَسْتَعِدُّ', 'لِلدَّرْسِ،', 'وَأَكْتُبُ', 'مَا', 'بِأَمَرَ', 'بِهِ', 'الْمُعَلِّمُ،', 'وَأُصَلِّي', 'الْعِشَاءَ،', 'وَأَقْرَأُ', 'قَلِيلًا،', 'ثُمَّ', 'أَنَامُ', 'عَلَى', 'اسْمِ', 'اللَّهِ', 'وَذِكْرِهِ.', 'تِلْكَ', 'عَادَتِي', 'كُلَّ', 'يَوْمٍ', 'لَا', 'أُخَالِفُهَا،', 'وَأَقُومُ', 'مُبَكِّرًا', 'يَوْمَ', 'الْعُطْلَةِ', 'أَيْضًا،', 'وَأُصَلِّي', 'مَعَ', 'الْجَمَاعَةِ،', 'وَأَتْلُو', 'الْقُرْآنَ،', 'وَأَقْضِي', 'الْيَوْمَ', 'فِي', 'مُطَالَعَةِ', 'كِتَابٍ،', 'وَمُحَادَثَةٍ', 'مَعَ', 'أَبِي', 'وَأُمِّي', 'وَإِخْوَتِي،', 'وَفِي', 'زِيَارَةِ', 'قَرِيبٍ', 'أَوْ', 'عِيَادَةِ', 'مَرِيضٍ،', 'وَأَمْكُثُ', 'أَحْيَانًا', 'فِي', 'الْبَيْتِ،', 'وَأَخْرُجُ', 'أَحْيَانًا', 'إِلَى', 'الْخَارِج.'
  ];

  // Page 2: "لَمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ"
  const page2Words = [
    'لَمَّا', 'بَلَغْتُ', 'السَّابِعَةَ', 'مِنْ', 'عُمْرِيْ', 'أَمَرَنِيْ', 'أَبِيْ', 'بِالصَّلَاةِ،', 'وَكُنْتُ', 'تَعَلَّمْتُ', 'كَثِيرًا', 'مِنْ', 'الْأَدْعِيَةِ', 'وَحَفِظْتُ', 'سُوَرًا', 'مِنْ', 'الْقُرْآنِ', 'الْكَرِيمِ', 'مِنْ', 'أُمِّي،', 'وَكَانَتْ', 'أُمِّي', 'تَتَكَلَّمُ', 'مَعِي', 'كُلَّ', 'لَيْلَةٍ', 'عِنْدَ', 'النَّوْمِ', 'فَتَقُصُّ', 'عَلَيَّ', 'قِصَصَ', 'الْأَشْيَاءِ،', 'وَكُنْتُ', 'أَسْمَعُ', 'هَذِهِ', 'الْقِصَصَ', 'بِنَشَاطٍ', 'وَرَغْبَةٍ،', 'وَبَدَأْتُ', 'أَذْهَبُ', 'مَعَ', 'أَبِي', 'إِلَى', 'الْمَسْجِدِ،', 'وَأَقُومُ', 'فِي', 'صَفِّ', 'الْأَطْفَالِ', 'خَلْفَ', 'صَفِّ', 'الرِّجَالِ،', 'وَلَمَّا', 'بَلَغْتُ', 'الْعَاشِرَةَ', 'مِنْ', 'عُمُرِي', 'قَالَ', 'لِي', 'مَرَّةً:', 'قَدْ', 'أَكْمَلْتَ', 'الآنَ', 'مِنْ', 'عُمُرِكَ', 'سَبْعَ', 'سِنِينَ،', 'وَالآنَ', 'أَنْتَ', 'ابْنُ', 'عَشْرِ', 'سِنِينَ،', 'فَإِذَا', 'تَرَكْتَ', 'صَلَاةَ', 'ضُحَاكَ،', 'لِأَنَّ', 'النَّبِيَّ', 'ﷺ', 'قَالَ:', 'مُرُوا', 'أَوْلَادَكُمْ', 'بِالصَّلَاةِ', 'وَهُمْ', 'أَبْنَاءُ', 'سَبْعِ', 'سِنِينَ،', 'وَاضْرِبُوهُمْ', 'عَلَيْهَا', 'وَهُمْ', 'أَبْنَاءُ', 'عَشْرِ', 'سِنِينَ.'
  ];

  const pages = [
    {
      number: 1,
      title: "كَيْفَ أَقْضِي يَوْمِي",
      paragraphs: [
        { words: page1Words, maxWordsPerLine: 25 },
        { words: page1Paragraph2, maxWordsPerLine: 25 }
      ]
    },
    {
      number: 2,
      title: "لَمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ",
      paragraphs: [
        { words: page2Words, maxWordsPerLine: 25 }
      ]
    }
  ];

  const currentPageData = pages[currentPage];

  const renderParagraph = (words: string[], maxWordsPerLine: number, pageNum: number, paragraphIndex: number) => {
    const lines = [];
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      const lineWords = words.slice(i, Math.min(i + maxWordsPerLine, words.length));
      lines.push(lineWords);
    }

    return (
      <div className="space-y-3">
        {lines.map((lineWords, lineIndex) => (
          <div key={lineIndex} className="flex flex-wrap gap-1 justify-end">
            {lineWords.map((word, wordIndex) => {
              const absoluteIndex = lineIndex * maxWordsPerLine + wordIndex;
              const { word: cleanWord, context } = createWordWithContext(words, absoluteIndex);
              return (
                <ClickableText
                  key={`p${pageNum}-par${paragraphIndex}-line${lineIndex}-${absoluteIndex}`}
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

  const renderPage = (pageData: typeof pages[0]) => {
    return (
      <div className="space-y-6 leading-relaxed text-lg">
        {pageData.paragraphs.map((paragraph, paragraphIndex) => (
          <div key={paragraphIndex}>
            {renderParagraph(paragraph.words, paragraph.maxWordsPerLine, pageData.number, paragraphIndex)}
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
        
        <h2 className="text-2xl font-bold text-center border-b pb-2 max-w-md">
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