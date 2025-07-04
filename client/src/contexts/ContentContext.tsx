import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Book {
  id: number;
  title: string;
  content: string;
  level: string;
  icon: string;
}

export interface Video {
  id: number;
  title: string;
  url: string;
  videoId: string;
  thumbnail: string;
  level: string;
}

interface ContentContextType {
  books: Book[];
  videos: Video[];
  addBook: (book: Book) => void;
  removeBook: (id: number) => void;
  addVideo: (video: Video) => void;
  removeVideo: (id: number) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([
    {
      id: 1,
      title: "Arabic Basics",
      content: `<h1>Arabic Basics</h1>
      <p>Welcome to <span class="clickable-word" data-word="اللغة" data-translation="language" data-grammar="noun">اللغة</span> <span class="clickable-word" data-word="العربية" data-translation="Arabic" data-grammar="adjective">العربية</span>!</p>
      <p>This is your first <span class="clickable-word" data-word="كتاب" data-translation="book" data-grammar="noun">كتاب</span> in Arabic learning.</p>`,
      level: "beginner",
      icon: "📘"
    },
    {
      id: 2,
      title: "Everyday Conversations",
      content: `<h1>Everyday Conversations</h1>
      <p><span class="clickable-word" data-word="السلام" data-translation="peace" data-grammar="noun">السلام</span> <span class="clickable-word" data-word="عليكم" data-translation="upon you" data-grammar="preposition">عليكم</span> - Peace be upon you</p>
      <p>How to greet in Arabic and basic <span class="clickable-word" data-word="محادثة" data-translation="conversation" data-grammar="noun">محادثة</span>.</p>`,
      level: "intermediate",
      icon: "💬"
    },
    {
      id: 3,
      title: "قراءة الراشدة (Qiraatu Al Rashida)",
      content: `<h1>قراءة الراشدة</h1>
      
      <h2>كيْفَ أقضي يَوْمِي</h2>
      <p>أنامُ مُبَكِّرًا في اللَّيْلِ وأقومُ مُبَكِّرًا فِي الصَّبَاحِ، أسْتَيْقِظُ عَلَى اسْمِ اللهِ وذِكْرِه، أسْتَعِدُّ لِلصَّلاةِ ثُمَّ أذْهَبُ مَعَ وَالِدِي إلى الْمَسْجِدِ، والْمَسْجِدُ قَرِيْبٌ مِن بَيْتِيْ، فَأَتَوَضَّأُ وأُصَلِّيْ مَعَ الْجَماعَةِ، وأرْجِعُ إِلى البَيْتِ وأتْلُو شَيْئًا مِن الْقُرْآنِ الْكَرِيمِ، ثُمَّ أخْرُجُ إلى البُسْتَانِ وَأجْرِيْ، ثُمَّ أَرْجِعُ إلى الْبَيْتِ فَأَشْرَبُ اللَّبَنَ وأسْتَعِدُّ لِلذَّهابِ إلى المَدْرَسَةِ.</p>
      
      <p>وأفْطِرُ إذَا كانَتْ أيَّامُ الصَّيْفِ، وأتَغَدَّى إذَا كَانَتْ أيَّامُ الشِّتاءِ، وأصِلُ إلى الْمَدْرَسَةِ في الْمِيْعادِ وَأَمْكُثُ فِي الْمَدْرَسَةِ سِتَّ سَاعَاتٍ، وَأَسْمَعُ الدُّرُوْسَ بِنَشَاطٍ وَرَغْبَةٍ، وَأَجْلِسُ بِأَدَبٍ وَسَكِينَةٍ، حَتَّى إِذَا انْتَهَى الْوَقْتُ وَضُرِبَ الْجَرَسُ خَرَجْتُ مِنْ الْمَدْرَسَةِ وَرَجَعْتُ إِلَى الْبَيْتِ.</p>

      <h2>لمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ</h2>
      <p>لَمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمْرِيْ أَمَرَنِيْ أَبِيْ بِالصَّلَاةِ، وَكُنْتُ تَعَلَّمْتُ كَثِيرًا مِنْ الْأَدْعِيَةِ وَحَفِظْتُ سُوَرًا مِنْ الْقُرْآنِ الْكَرِيمِ مِنْ أُمِّيْ، وَكَانَتْ أُمِّي تَتَكَلَّمُ مَعِيْ كُلَّ لَيْلَةٍ عِنْدَ الْمَنَامِ فَتَقُصُّ عَلَيَّ قِصَصَ الْأَنْبِيَاءِ، وَكُنْتُ أَسْمَعُ هَذِهِ الْقِصَصَ بِنَشَاطٍ وَرَغْبَةٍ.</p>
      
      <p>وَبَدَأْتُ أَذْهَبُ مَعَ أَبِي إِلَى الْمَسْجِدِ، وَأَقُوْمُ فِيْ صَفِّ الْأَطْفَالِ خَلْفَ صَفِّ الرِّجَالِ، وَلَمَّا بَلَغْتُ الْعَاشِرَةَ مِنْ عُمْرِيْ قَالَ لِي مَرَّةً: قَدْ أَكْمَلْتَ الْآنَ مِنْ عُمُرِكَ تِسْعَ سِنِيْنَ، وَالآنَ أَنْتَ ابْنُ عَشْرِ سِنِيْنَ فَإِذَا تَرَكْتَ صَلَاةً ضَرَبْتُكَ، لِأَنَّ النَّبِيَّ قَالَ: مُرُّوا أَوْلَادَكُمْ بِالصَّلَاةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ، وَاضْرِبُوهُمْ عَلَيْهَا وَهُمْ أَبْنَاءُ عَشْرٍ.</p>

      <h2>النَّمْلَة</h2>
      <div style="text-align: center; font-style: italic; margin: 20px 0;">
        <p>لَسْتُ أَرْضَى بِالْكَسَلْ</p>
        <p>طَالَ سَعْيِيْ بِالْأَمَلْ</p>
        <p>لَا أُبَالِيْ بِالتَّعَبْ</p>
        <p>غَايَتِيْ نَيْلُ الطَّلَبْ</p>
        <p>بِنِظَامٍ لِلسَّكَنْ</p>
        <p>أَبْتَنِي الْبَيْتَ الْحَسَنْ</p>
      </div>

      <h2>فِي السُّوقِ</h2>
      <p><strong>عُمَرُ:</strong> هَلْ زُرْتَ سُوْقَ هَذَا الْبَلَدِ يَا صَدِيْقِيْ؟</p>
      <p><strong>خَالِدٌ:</strong> لَا يَا أَخِيْ، فَإِنِّيْ غَرِيْبٌ جَدِيْدٌ فِيْ هَذَا الْبَلَدِ لَا أَعْرِفُ الطَّرِيْقَ.</p>
      <p><strong>عُمَرُ:</strong> تَعَالَ مَعِيْ فَإِنِّيْ ذَاهِبٌ إِلَى السُّوْقِ لِأَشْتَرِيَ بَعْضَ الْحَوَائِجِ وَنَرْجِع قَبْلَ الْمَغْرِبِ إِنْ شَاءَ اللَّهِ فَإِنَّ السُّوْقَ غَيْرُ بَعِيدَةٍ.</p>
      <p><strong>خَالِدٌ:</strong> مَا شَاءَ اللَّهُ هَذِهِ سُّوقٌ كَبِيْرَةٌ وَالدَّكَاكِيْنُ نَظِيْفَةٌ جَمِيْلَةٌ، وَمَا هَذَا الدُّكَّانُ الْجَمِيْلُ إِلَى الْيَمِيْنِ يَا عُمَرُ؟</p>

      <h2>مَنْ يَمْنَعُكَ مِنِّيْ</h2>
      <p>خَرَجَ رَسُوْلُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فِيْ غَزْوَةٍ وَرَجَعَ عَنْهَا فِي الظَّهِيْرَةِ وَكَانَتْ أَيَّامُ الصَّيْفِ فَأَرَادَ رَسُوْلُ اللّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَنْ يَسْتَرِيْحَ. وَلَيْسَ فِيْ الْبَرِّيَّةِ مَكَانٌ يَسْتَرِيْحُ فِيْهِ الْإِنْسَانُ إِلَّا الشَّجَرُ.</p>
      
      <p>فَنَزَلَ رَسُوْلُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ تَحْتَ سَمُرَةٍ وَعَلَّقَ بِهَا سَيْفَهُ، وَتَفَرَّقَ النَّاسُ وَنَامُوْا، وَنَامَ رَسُوْلُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ تَحْتَ السَّمُرَةِ. وَجَاءَ رَجُلٌ مِنْ الْمُشْرِكِينَ وَسَيْفُ رَسُوْلِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ مُعَلَّقٌ بِالسَّمُرَةِ وَهُوَ فِيْ غِمْدِهِ.</p>`,
      level: "intermediate",
      icon: "📖"
    }
  ]);

  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: "Arabic Alphabet Song",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      level: "beginner"
    }
  ]);

  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
  };

  const removeBook = (id: number) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  const addVideo = (video: Video) => {
    setVideos(prev => [...prev, video]);
  };

  const removeVideo = (id: number) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  return (
    <ContentContext.Provider value={{
      books,
      videos,
      addBook,
      removeBook,
      addVideo,
      removeVideo
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}