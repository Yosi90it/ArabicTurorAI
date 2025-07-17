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
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([
    {
      id: 1,
      title: "قراءة الراشدة (Qiraatu Al Rashida)",
      content: `<h1>قراءة الراشدة - الجزء الأول والثاني</h1>
      
      <h2>الدرس الأول: كيْفَ أقضي يَوْمِي</h2>
      
      <h3>روتين الصباح</h3>
      <p>أنامُ مُبَكِّرًا في اللَّيْلِ وأقومُ مُبَكِّرًا فِي الصَّبَاحِ، أسْتَيْقِظُ عَلَى اسْمِ اللهِ وذِكْرِه، أسْتَعِدُّ لِلصَّلاةِ ثُمَّ أذْهَبُ مَعَ وَالِدِي إلى الْمَسْجِدِ، والْمَسْجِدُ قَرِيْبٌ مِن بَيْتِيْ، فَأَتَوَضَّأُ وأُصَلِّيْ مَعَ الْجَماعَةِ، وأرْجِعُ إِلى البَيْتِ وأتْلُو شَيْئًا مِن الْقُرْآنِ الْكَرِيمِ، ثُمَّ أخْرُجُ إلى البُسْتَانِ وَأجْرِيْ، ثُمَّ أَرْجِعُ إلى الْبَيْتِ فَأَشْرَبُ اللَّبَنَ وأسْتَعِدُّ لِلذَّهابِ إلى المَدْرَسَةِ.</p>
      
      <h3>المدرسة والمساء</h3>
      <p>وأفْطِرُ إذَا كانَتْ أيَّامُ الصَّيْفِ، وأتَغَدَّى إذَا كَانَتْ أيَّامُ الشِّتاءِ، وأصِلُ إلى الْمَدْرَسَةِ في الْمِيْعادِ وَأَمْكُثُ فِي الْمَدْرَسَةِ سِتَّ سَاعَاتٍ، وَأَسْمَعُ الدُّرُوْسَ بِنَشَاطٍ وَرَغْبَةٍ، وَأَجْلِسُ بِأَدَبٍ وَسَكِينَةٍ، حَتَّى إِذَا انْتَهَى الْوَقْتُ وَضُرِبَ الْجَرَسُ خَرَجْتُ مِنْ الْمَدْرَسَةِ وَرَجَعْتُ إِلَى الْبَيْتِ.</p><!-- pagebreak -->

      <h2>الدرس الثاني: لمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ</h2>
      
      <h3>بداية تعلم الصلاة</h3>
      <p>لَمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمْرِيْ أَمَرَنِيْ أَبِيْ بِالصَّلَاةِ، وَكُنْتُ تَعَلَّمْتُ كَثِيرًا مِنْ الْأَدْعِيَةِ وَحَفِظْتُ سُوَرًا مِنْ الْقُرْآنِ الْكَرِيمِ مِنْ أُمِّيْ، وَكَانَتْ أُمِّي تَتَكَلَّمُ مَعِيْ كُلَّ لَيْلَةٍ عِنْدَ الْمَنَامِ فَتَقُصُّ عَلَيَّ قِصَصَ الْأَنْبِيَاءِ، وَكُنْتُ أَسْمَعُ هَذِهِ الْقِصَصَ بِنَشَاطٍ وَرَغْبَةٍ.</p>
      
      <h3>الصلاة في المسجد</h3>
      <p>وَبَدَأْتُ أَذْهَبُ مَعَ أَبِي إِلَى الْمَسْجِدِ، وَأَقُوْمُ فِيْ صَفِّ الْأَطْفَالِ خَلْفَ صَفِّ الرِّجَالِ، وَلَمَّا بَلَغْتُ الْعَاشِرَةَ مِنْ عُمْرِيْ قَالَ لِي مَرَّةً: قَدْ أَكْمَلْتَ الْآنَ مِنْ عُمُرِكَ تِسْعَ سِنِيْنَ، وَالآنَ أَنْتَ ابْنُ عَشْرِ سِنِيْنَ فَإِذَا تَرَكْتَ صَلَاةً ضَرَبْتُكَ، لِأَنَّ النَّبِيَّ قَالَ: مُرُّوا أَوْلَادَكُمْ بِالصَّلَاةِ وَهُمْ أَبْنَاءُ سَبْعِ سِنِينَ، وَاضْرِبُوهُمْ عَلَيْهَا وَهُمْ أَبْنَاءُ عَشْرٍ.</p><!-- pagebreak -->

      <h2>الدرس الثالث: النَّمْلَةُ (قصيدة)</h2>
      
      <h3>العمل والاجتهاد</h3>
      <div style="text-align: center; font-style: italic; margin: 20px 0;">
        <p>لَسْتُ أَرْضَى بِالْكَسَلْ</p>
        <p>طَالَ سَعْيِيْ بِالْأَمَلْ</p>
        <p>لَا أُبَالِيْ بِالتَّعَبْ</p>
        <p>غَايَتِيْ نَيْلُ الطَّلَبْ</p>
      </div>
      
      <h3>بناء البيت</h3>
      <div style="text-align: center; font-style: italic; margin: 20px 0;">
        <p>بِنِظَامٍ لِلسَّكَنْ</p>
        <p>أَبْتَنِي الْبَيْتَ الْحَسَنْ</p>
        <p>لَسْتُ يَوْمًا أَلْعَبُ</p>
        <p>وَلِقُوْتِيْ أَذْهَبُ</p>
      </div><!-- pagebreak -->

      <h2>الدرس الرابع: فِي السُّوقِ (حوار)</h2>
      
      <h3>المقدمة والدعوة للخروج</h3>
      <p><strong>عُمَرُ:</strong> هَلْ زُرْتَ سُوْقَ هَذَا الْبَلَدِ يَا صَدِيْقِيْ؟</p>
      <p><strong>خَالِدٌ:</strong> لَا يَا أَخِيْ، فَإِنِّيْ غَرِيْبٌ جَدِيْدٌ فِيْ هَذَا الْبَلَدِ لَا أَعْرِفُ الطَّرِيْقَ.</p>
      <p><strong>عُمَرُ:</strong> تَعَالَ مَعِيْ فَإِنِّيْ ذَاهِبٌ إِلَى السُّوْقِ لِأَشْتَرِيَ بَعْضَ الْحَوَائِجِ وَنَرْجِع قَبْلَ الْمَغْرِبِ إِنْ شَاءَا اللَّهِ فَإِنَّ السُّوْقَ غَيْرُ بَعِيدَةٍ.</p>
      
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
        deleteVideo
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