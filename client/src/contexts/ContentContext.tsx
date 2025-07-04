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
      
      <h2>كيْفَ اقضي يَوْمِي</h2>
      <p><span class="clickable-word" data-word="أنام" data-translation="I sleep" data-grammar="verb">أنامُ</span> <span class="clickable-word" data-word="مُبَكِّرًا" data-translation="early" data-grammar="adverb">مُبَكِّرًا</span> في <span class="clickable-word" data-word="اللَّيْل" data-translation="the night" data-grammar="noun">اللَّيْلِ</span> وأقومُ <span class="clickable-word" data-word="مُبَكِّرًا" data-translation="early" data-grammar="adverb">مُبَكِّرًا</span> فِي <span class="clickable-word" data-word="الصَّبَاح" data-translation="the morning" data-grammar="noun">الصَّبَاحِ</span>، <span class="clickable-word" data-word="أسْتَيْقِظُ" data-translation="I wake up" data-grammar="verb">أسْتَيْقِظُ</span> عَلَى <span class="clickable-word" data-word="اسْمِ" data-translation="name" data-grammar="noun">اسْمِ</span> <span class="clickable-word" data-word="الله" data-translation="Allah" data-grammar="noun">اللهِ</span> وذِكْرِه.</p>
      
      <p><span class="clickable-word" data-word="أسْتَعِدُّ" data-translation="I prepare" data-grammar="verb">أسْتَعِدُّ</span> لِ<span class="clickable-word" data-word="الصَّلاة" data-translation="prayer" data-grammar="noun">الصَّلاةِ</span> ثُمَّ <span class="clickable-word" data-word="أذْهَب" data-translation="I go" data-grammar="verb">أذْهَبُ</span> مَعَ <span class="clickable-word" data-word="وَالِدِي" data-translation="my father" data-grammar="noun">وَالِدِي</span> إلى <span class="clickable-word" data-word="الْمَسْجِد" data-translation="the mosque" data-grammar="noun">الْمَسْجِدِ</span>، والْمَسْجِدُ <span class="clickable-word" data-word="قَرِيْب" data-translation="close/near" data-grammar="adjective">قَرِيْبٌ</span> مِن <span class="clickable-word" data-word="بَيْتِي" data-translation="my house" data-grammar="noun">بَيْتِيْ</span>.</p>
      
      <p>فَ<span class="clickable-word" data-word="أَتَوَضَّأ" data-translation="I perform ablution" data-grammar="verb">أَتَوَضَّأُ</span> وأُصَلِّيْ مَعَ <span class="clickable-word" data-word="الْجَماعَة" data-translation="the congregation" data-grammar="noun">الْجَماعَةِ</span>، وأرْجِعُ إِلى <span class="clickable-word" data-word="البَيْت" data-translation="the house" data-grammar="noun">البَيْتِ</span> وأتْلُو <span class="clickable-word" data-word="شَيْئًا" data-translation="something" data-grammar="noun">شَيْئًا</span> مِن <span class="clickable-word" data-word="الْقُرْآن" data-translation="the Quran" data-grammar="noun">الْقُرْآنِ</span> <span class="clickable-word" data-word="الْكَرِيم" data-translation="the Noble" data-grammar="adjective">الْكَرِيمِ</span>.</p>
      
      <h2>لمَّا بَلَغْتُ السَّابِعَةَ مِنْ عُمُرِيْ</h2>
      <p><span class="clickable-word" data-word="لَمَّا" data-translation="when" data-grammar="conjunction">لَمَّا</span> <span class="clickable-word" data-word="بَلَغْت" data-translation="I reached" data-grammar="verb">بَلَغْتُ</span> <span class="clickable-word" data-word="السَّابِعَة" data-translation="the seventh" data-grammar="ordinal">السَّابِعَةَ</span> مِنْ <span class="clickable-word" data-word="عُمُرِي" data-translation="my age" data-grammar="noun">عُمْرِيْ</span> <span class="clickable-word" data-word="أَمَرَنِي" data-translation="he commanded me" data-grammar="verb">أَمَرَنِيْ</span> <span class="clickable-word" data-word="أَبِي" data-translation="my father" data-grammar="noun">أَبِيْ</span> بِ<span class="clickable-word" data-word="الصَّلَاة" data-translation="prayer" data-grammar="noun">الصَّلَاةِ</span>.</p>
      
      <p>وَكُنْتُ <span class="clickable-word" data-word="تَعَلَّمْت" data-translation="I had learned" data-grammar="verb">تَعَلَّمْتُ</span> <span class="clickable-word" data-word="كَثِيرًا" data-translation="much/many" data-grammar="adverb">كَثِيرًا</span> مِنْ <span class="clickable-word" data-word="الْأَدْعِيَة" data-translation="supplications" data-grammar="noun">الْأَدْعِيَةِ</span> وَ<span class="clickable-word" data-word="حَفِظْت" data-translation="I memorized" data-grammar="verb">حَفِظْتُ</span> <span class="clickable-word" data-word="سُوَرًا" data-translation="chapters" data-grammar="noun">سُوَرًا</span> مِنْ <span class="clickable-word" data-word="الْقُرْآن" data-translation="the Quran" data-grammar="noun">الْقُرْآنِ</span> <span class="clickable-word" data-word="الْكَرِيم" data-translation="the Noble" data-grammar="adjective">الْكَرِيمِ</span> مِنْ <span class="clickable-word" data-word="أُمِّي" data-translation="my mother" data-grammar="noun">أُمِّيْ</span>.</p>
      
      <h2>النَّمْلَة</h2>
      <div class="poetry">
        <p><span class="clickable-word" data-word="لَسْت" data-translation="I am not" data-grammar="verb">لَسْتُ</span> <span class="clickable-word" data-word="أَرْضَى" data-translation="I am satisfied" data-grammar="verb">أَرْضَى</span> بِ<span class="clickable-word" data-word="الْكَسَل" data-translation="laziness" data-grammar="noun">الْكَسَلْ</span></p>
        <p><span class="clickable-word" data-word="طَال" data-translation="lengthened" data-grammar="verb">طَالَ</span> <span class="clickable-word" data-word="سَعْيِي" data-translation="my effort" data-grammar="noun">سَعْيِيْ</span> بِ<span class="clickable-word" data-word="الْأَمَل" data-translation="hope" data-grammar="noun">الْأَمَلْ</span></p>
        <p><span class="clickable-word" data-word="لَا" data-translation="no" data-grammar="negative">لَا</span> <span class="clickable-word" data-word="أُبَالِي" data-translation="I care" data-grammar="verb">أُبَالِيْ</span> بِ<span class="clickable-word" data-word="التَّعَب" data-translation="fatigue" data-grammar="noun">التَّعَبْ</span></p>
        <p><span class="clickable-word" data-word="غَايَتِي" data-translation="my goal" data-grammar="noun">غَايَتِيْ</span> <span class="clickable-word" data-word="نَيْل" data-translation="attaining" data-grammar="noun">نَيْلُ</span> <span class="clickable-word" data-word="الطَّلَب" data-translation="the request" data-grammar="noun">الطَّلَبْ</span></p>
      </div>`,
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