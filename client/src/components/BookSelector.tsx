import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, ChevronDown } from "lucide-react";

interface Book {
  id: string;
  title: string;
  level: string;
  icon: string;
  content: string;
}

interface BookSelectorProps {
  books: Book[];
  selectedBook: Book | null;
  onBookSelect: (book: Book) => void;
}

export default function BookSelector({ books, selectedBook, onBookSelect }: BookSelectorProps) {
  const { strings } = useLanguage();

  // Group books by level
  const groupedBooks = books.reduce((acc, book) => {
    const level = book.level || 'andere';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(book);
    return acc;
  }, {} as Record<string, Book[]>);

  const levelOrder = ['anfänger', 'mittelstufe', 'fortgeschritten', 'andere'];
  const levelTranslations = {
    'anfänger': strings.language === 'de' ? 'Anfänger' : 'Beginner',
    'mittelstufe': strings.language === 'de' ? 'Mittelstufe' : 'Intermediate',
    'fortgeschritten': strings.language === 'de' ? 'Fortgeschritten' : 'Advanced',
    'andere': strings.language === 'de' ? 'Andere' : 'Other'
  };

  if (books.length === 0) {
    return (
      <p className="text-center py-4 text-gray-500 text-sm">
        {strings.noBooksAvailable}
      </p>
    );
  }

  return (
    <div className="w-full">
      <Select
        value={selectedBook?.id || ""}
        onValueChange={(bookId) => {
          const book = books.find(b => b.id === bookId);
          if (book) {
            onBookSelect(book);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue 
            placeholder={strings.language === 'de' ? "Buch auswählen..." : "Select a book..."}
          >
            {selectedBook && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-8 bg-purple-600 rounded text-white text-xs flex items-center justify-center">
                  {selectedBook.icon}
                </div>
                <span className="truncate">{selectedBook.title}</span>
                <span className="text-xs text-gray-500 capitalize">({selectedBook.level})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {levelOrder.map(level => {
            const booksInLevel = groupedBooks[level];
            if (!booksInLevel || booksInLevel.length === 0) return null;

            return (
              <div key={level}>
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {levelTranslations[level as keyof typeof levelTranslations] || level}
                </div>
                {booksInLevel.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    <div className="flex items-center gap-2 w-full">
                      <div className="w-6 h-8 bg-purple-600 rounded text-white text-xs flex items-center justify-center">
                        {book.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{book.title}</div>
                        <div className="text-xs text-gray-500 capitalize">{book.level}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}