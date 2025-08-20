import { createContext, useContext, useState, ReactNode } from 'react';

export interface Book {
  id: number;
  title: string;
  content: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
}

export interface Video {
  id: number;
  title: string;
  url: string;
  videoId: string;
  thumbnail: string;
  transcript?: string;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
}

interface ContentContextType {
  books: Book[];
  videos: Video[];
  currentBook: Book | null;
  currentVideo: Video | null;
  setCurrentBook: (book: Book | null) => void;
  setCurrentVideo: (video: Video | null) => void;
  addBook: (book: Book) => void;
  addVideo: (video: Video) => void;
  updateBook: (book: Book) => void;
  updateVideo: (video: Video) => void;
  deleteBook: (id: number) => void;
  deleteVideo: (id: number) => void;
  fetchTranslation: (word: string) => Promise<string>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([
    {
      id: 1,
      title: "قصص الأنبياء (Qasas Al-Anbiya) - كامل مع الصور الأصلية",
      content: `<h1>قراءة الراشدة - الجزء الأول والثاني</h1>
      
      <h2>الدرس الأول: كيْفَ أقضي يَوْمِي</h2>
      
      <h3>روتين الصباح</h3>
      <p>أنامُ مُبَكِّرًا في اللَّيْلِ وأقومُ مُبَكِّرًا فِي الصَّبَاحِ، أسْتَيْقِظُ عَلَى اسْمِ اللهِ وذِكْرِه، أسْتَعِدُّ لِلصَّلاةِ ثُمَّ أذْهَبُ مَعَ وَالِدِي إلى الْمَسْجِدِ، والْمَسْجِدُ قَرِيْبٌ مِن بَيْتِيْ، فَأَتَوَضَّأُ وأُصَلِّيْ مَعَ الْجَماعَةِ، وأرْجِعُ إِلى البَيْتِ وأتْلُو شَيْئًا مِن الْقُرْآنِ الْكَرِيمِ، ثُمَّ أخْرُجُ إلى البُسْتَانِ وَأجْرِيْ، ثُمَّ أَرْجِعُ إلى الْبَيْتِ فَأَشْرَبُ اللَّبَنَ وأسْتَعِدُّ لِلذَّهابِ إلى المَدْرَسَةِ.</p>
      
      <h3>المدرسة والمساء</h3>
      <p>وأفْطِرُ إذَا كانَتْ أيَّامُ الصَّيْفِ، وأتَغَدَّى إذَا كَانَتْ أيَّامُ الشِّتاءِ، وأصِلُ إلى الْمَدْرَسَةِ في الْمِيْعادِ وَأَمْكُثُ فِي الْمَدْرَسَةِ سِتَّ سَاعَاتٍ، وَأَسْمَعُ الدُّرُوْسَ بِنَشَاطٍ وَرَغْبَةٍ، وَأَجْلِسُ بِأَدَبٍ وَسَكِينَةٍ، حَتَّى إِذَا انْتَهَى الْوَقْتُ وَضُرِبَ الْجَرَسُ خَرَجْتُ مِنْ الْمَدْرَسَةِ وَرَجَعْتُ إِلَى الْبَيْتِ.</p><!-- pagebreak -->

      <h2>الدرس الثاني: لمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ</h2>
      
      <h3>بداية تعلم الصلاة</h3>
      <p>لَمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمْرِيْ أَمَرَنِيْ أَبِيْ بِالصَّلَاةِ، وَكُنْتُ تَعَلَّمْتُ كَثِيرًا مِنْ الْأَدْعِيَةِ وَحَفِظْتُ سُوَرًا مِنْ الْقُرْآنِ الْكَرِيمِ مِنْ أُمِّيْ، وَكَانَتْ أُمِّي تَتَكَلَّمُ مَعِيْ كُلَّ لَيْلَةٍ عِنْدَ الْمَنَامِ فَتَقُصُّ عَلَيَّ قِصَصَ الْأَنْبِيَاءِ، وَكُنْتُ أَسْمَعُ هَذِهِ الْقِصَصَ بِنَشَاطٍ وَرَغْبَةٍ وَبَدَأْتُ أَذْهَبُ مَعَ أَبِي إِلَى الْمَسْجِدِ، وَأَقُوْمُ فِيْ صَفِّ الْأَطْفَالِ خَلْفَ صَفِّ الرِّجَالِ.</p>
      
      <h3>الصلاة في المسجد</h3>
      <p>وَلَمَّا بَلَغْتُ الْعَاشِرَةَ مِنْ عُمْرِيْ قَالَ لِي مَرَّةً: قَدْ أَكْمَلْتَ الْآنَ مِنْ عُمُرِكَ تِسْعَ سِنِيْنَ، وَالآنَ أَنْتَ ابْنُ عَشْرِ سِنِيْنَ فَإِذَا تَرَكْتَ صَلَاةً ضَرَبْتُكَ، لِأَنَّ النَّبِيَّ قَالَ: مُرُّوا أَوْلَادَكُمْ بِالصَّلَاةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ، وَاضْرِبُوهُمْ عَلَيْهَا وَهُمْ أَبْنَاءُ عَشْرٍ وَكانَ لِي أَصْدِقاءُ فِي الْمَدْرَسَةِ.</p><!-- pagebreak -->

      <h2>الدرس الثالث: النَّمْلَةُ (قصيدة)</h2>
      
      <h3>العمل والاجتهاد</h3>
      <div style="text-align: center; font-style: italic; margin: 20px 0;">
        <p>لَسْتُ أَرْضَى بِالْكَسَلْ طَالَ سَعْيِيْ بِالْأَمَلْ لَا أُبَالِيْ بِالتَّعَبْ غَايَتِيْ نَيْلُ الطَّلَبْ بِنِظَامٍ لِلسَّكَنْ أَبْتَنِي الْبَيْتَ الْحَسَنْ لَسْتُ يَوْمًا أَلْعَبُ وَلِقُوْتِيْ أَذْهَبُ أَذْهَبُ فِي كُلِّ صَبَاحٍ إِلَى عَمَلِي بِنَشَاطٍ وَفَرَحٍ أَجْمَعُ الطَّعَامَ لِلشِّتاءِ وَأَبْنِي بَيْتِي بِعِنَايَةٍ وَإِتْقَانٍ أَعْرِفُ أَنَّ الْعَمَلَ بَرَكَةٌ وَالْكَسَلَ مَذَمَّةٌ لِذَلِكَ أَعْمَلُ بِجِدٍّ وَاجْتِهَادٍ أَحْرِصُ عَلَى إِتْقَانِ عَمَلِي وَأَسْعَى لِتَحْقِيقِ أَهْدَافِي بِصَبْرٍ وَمُثَابَرَةٍ.</p>
      </div><!-- pagebreak -->

      <h2>الدرس الرابع: فِي السُّوقِ (حوار)</h2>
      
      <h3>المقدمة والدعوة للخروج</h3>
      <p><strong>عُمَرُ:</strong> هَلْ زُرْتَ سُوْقَ هَذَا الْبَلَدِ يَا صَدِيْقِيْ؟</p>
      <p><strong>خَالِدٌ:</strong> لَا يَا أَخِيْ، فَإِنِّيْ غَرِيْبٌ جَدِيْدٌ فِيْ هَذَا الْبَلَدِ لَا أَعْرِفُ الطَّرِيْقَ.</p>
      <p><strong>عُمَرُ:</strong> تَعَالَ مَعِيْ فَإِنِّيْ ذَاهِبٌ إِلَى السُّوْقِ لِأَشْتَرِيَ بَعْضَ الْحَوَائِجِ وَنَرْجِع قَبْلَ الْمَغْرِبِ إِنْ شَاءَا اللَّهِ فَإِنَّ السُّوْقَ غَيْرُ بَعِيدَةٍ.</p><!-- pagebreak -->
      
      <h3>استكشاف السوق</h3>
      <p><strong>خَالِدٌ:</strong> مَا شَاءَ اللَّهُ هَذِهِ سُّوقٌ كَبِيْرَةٌ وَالدَّكَاكِيْنُ نَظِيْفَةٌ جَمِيْلَةٌ، وَمَا هَذَا الدُّكَّانُ الْجَمِيْلُ إِلَى الْيَمِيْنِ يَا عُمَرُ؟</p>
      <p><strong>عُمَرُ:</strong> هَذَا دُكَّانٌ فَاكْهَانِيٍّ، أَلَا تَرَى إِلَى الْفَوَاكِهِ وَتَرَى النَّاسَ يُسَاوِمُوْنَ الْفَاكِهَانِيَّ فِيْهَا.</p><!-- pagebreak -->

      <h2>الدرس الخامس: مَنْ يَمْنَعُكَ مِنِّيْ (قصة دينية)</h2>
      
      <h3>مقدمة عن الغزوات</h3>
      <p>خَرَجَ رَسُوْلُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فِيْ غَزْوَةٍ! هَلْ تَعْرِفُونَ مَا هِي الْغَزْوَةُ؟</p>
      <p>لَعَلَّكُمْ تَعْلَمُونَ أَنَّ الْمُسْلِمِيْنَ كَانُوا يَخْرُجُوْنَ لِلْجِهَادِ فِيْ سَبِيْلِ اللَّهِ وَكَانُوْا يُقَاتِلُونَ الْمُشْرِكِينَ وَالْكُفَّارَ لِوَجْهِ اللّهِ تَعَالَى، وَلَعَلَّكُمْ تَعْلَمُونَ فَضِيْلَةَ الْجِهَادِ فِيْ سَبِيْلِ اللَّهِ؟</p>
      
      <h3>الاستراحة تحت الشجرة</h3>
      <p>فَخَرَجَ رَسولُ اللهِ صَلَّى اللهُ عليْهِ و سَلَّمَ في غَزْوَةٍ وَرَجَعَ عَنْهَا فِي الظَّهِيْرَةِ وَكَانَتْ أَيَّامُ الصَّيْفِ فَأَرَادَ رَسُوْلُ اللّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَنْ يَسْتَرِيْحَ. وَلَيْسَ فِيْ الْبَرِّيَّةِ مَكَانٌ يَسْتَرِيْحُ فِيْهِ الْإِنْسَانُ إِلَّا الشَّجَرُ.</p>
      
      <p>فَنَزَلَ رَسُوْلُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ تَحْتَ سَمُرَةٍ وَعَلَّقَ بِهَا سَيْفَهُ، وَتَفَرَّقَ النَّاسُ وَنَامُوْا، وَنَامَ رَسُوْلُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ تَحْتَ السَّمُرَةِ. وَجَاءَ رَجُلٌ مِنْ الْمُشْرِكِينَ وَسَيْفُ رَسُوْلِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ مُعَلَّقٌ بِالسَّمُرَةِ وَهُوَ فِيْ غِمْدِهِ.</p>`,
      level: "intermediate",
      icon: "📖"
    },
    {
      id: 2,
      title: "قراءة الراشدة (Qiraatu Al Rashida) - كامل مع الصور الأصلية",
      content: `<h1>قراءة الراشدة - الجزء الأول والثاني</h1>
      
      <h2>الدرس الأول: التحيات</h2>
      <p>أَهْلاً وَسَهْلاً - مَرْحَباً بِكُمْ - السَّلَامُ عَلَيْكُمْ - وَعَلَيْكُمُ السَّلَامُ</p>
      <p>مَا اسْمُكَ؟ - اسْمِي أَحْمَدُ - مِنْ أَيْنَ أَنْتَ؟ - أَنَا مِنَ مِصْرَ</p>
      
      <h2>الدرس الثاني: الأُسْرَةُ</h2>  
      <p>هٰذَا أَبِي - هٰذِهِ أُمِّي - هٰذَا أَخِي - هٰذِهِ أُخْتِي</p>
      <p>أَبِي طَبِيبٌ - أُمِّي مُدَرِّسَةٌ - أَخِي طَالِبٌ - أُخْتِي صَغِيرَةٌ</p>`,
      level: "beginner",
      icon: "📖"
    },
    {
      id: 3,
      title: "العبارات الأساسية (Basic Phrases)",
      content: `<h1>العبارات الأساسية</h1>
      <h2>التحيات</h2>
      <p><strong>السلام عليكم</strong> - Peace be upon you</p>
      <p><strong>وعليكم السلام</strong> - And upon you peace</p>
      <p><strong>أهلاً وسهلاً</strong> - Welcome</p>
      <p><strong>كيف حالك؟</strong> - How are you?</p>
      <p><strong>بخير، الحمد لله</strong> - Fine, praise be to God</p>
      
      <h2>العبارات اليومية</h2>
      <p><strong>شكراً لك</strong> - Thank you</p>
      <p><strong>عفواً</strong> - You're welcome</p>
      <p><strong>عذراً</strong> - Excuse me/Sorry</p>
      <p><strong>من فضلك</strong> - Please</p>
      <p><strong>ما اسمك؟</strong> - What is your name?</p>
      <p><strong>اسمي...</strong> - My name is...</p>`,
      level: "beginner",
      icon: "💬"
    }
  ]);

  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: "Arabic Alphabet Song",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      transcript: "Let's learn the Arabic alphabet! أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي",
      level: "beginner",
      icon: "🎵"
    },
    {
      id: 2,
      title: "Basic Arabic Greetings",
      url: "https://www.youtube.com/watch?v=example2",
      videoId: "example2",
      thumbnail: "https://img.youtube.com/vi/example2/maxresdefault.jpg",
      transcript: "مرحبا - Hello! أهلا وسهلا - Welcome! كيف حالك - How are you?",
      level: "beginner",
      icon: "👋"
    },
    {
      id: 3,
      title: "Counting in Arabic",
      url: "https://www.youtube.com/watch?v=example3",
      videoId: "example3",
      thumbnail: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
      transcript: "Let's count: واحد - one, اثنان - two, ثلاثة - three, أربعة - four, خمسة - five",
      level: "intermediate",
      icon: "🔢"
    }
  ]);

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
  };

  const addVideo = (video: Video) => {
    setVideos(prev => [...prev, video]);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
  };

  const updateVideo = (updatedVideo: Video) => {
    setVideos(prev => prev.map(video => video.id === updatedVideo.id ? updatedVideo : video));
  };

  const deleteBook = (id: number) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    if (currentBook?.id === id) {
      setCurrentBook(null);
    }
  };

  const deleteVideo = (id: number) => {
    setVideos(prev => prev.filter(video => video.id !== id));
    if (currentVideo?.id === id) {
      setCurrentVideo(null);
    }
  };

  const fetchTranslation = async (word: string): Promise<string> => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.translation || 'Übersetzung nicht verfügbar';
      }
      return 'Übersetzung nicht verfügbar';
    } catch (error) {
      console.error('Translation error:', error);
      return 'Übersetzung nicht verfügbar';
    }
  };

  return (
    <ContentContext.Provider 
      value={{
        books,
        videos,
        currentBook,
        currentVideo,
        setCurrentBook,
        setCurrentVideo,
        addBook,
        addVideo,
        updateBook,
        updateVideo,
        deleteBook,
        deleteVideo,
        fetchTranslation
      }}
    >
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