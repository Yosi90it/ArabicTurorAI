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