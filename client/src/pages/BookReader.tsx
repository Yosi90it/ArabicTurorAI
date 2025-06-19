import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Volume2 } from "lucide-react";
import ClickableText from "@/components/ClickableText";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent } from "@/contexts/ContentContext";

export default function BookReader() {
  const { books } = useContent();
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const { tashkeelEnabled } = useTashkeel();

  // Text with and without tashkeel
  const originalTextWithTashkeel = "كَانَ يَا مَا كَانَ، فِي قَدِيمِ الزَّمَانِ، تَاجِرٌ غَنِيٌّ فِي بَغْدَادَ...";
  const plainTextWithoutTashkeel = "كان يا ما كان، في قديم الزمان، تاجر غني في بغداد...";
  
  const originalTextWithTashkeel2 = "وَكَانَ لَهُ وَلَدَانِ، الأَكْبَرُ اسْمُهُ عَلِي وَالأَصْغَرُ اسْمُهُ أَحْمَدُ...";
  const plainTextWithoutTashkeel2 = "وكان له ولدان، الأكبر اسمه علي والأصغر اسمه أحمد...";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Arabic Book Reader</h2>
        <p className="text-gray-600">Read Arabic stories and literature with translation support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Book Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {books.length === 0 ? (
              <p className="text-center py-4 text-gray-500 text-sm">
                No books available. Upload books in Admin Panel.
              </p>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => setSelectedBook(book)}
                  className={`flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors ${
                    selectedBook?.id === book.id ? "bg-soft-gray" : "hover:bg-soft-gray"
                  }`}
                >
                  <div className="w-10 h-12 bg-primary-purple rounded-lg flex items-center justify-center text-white text-xs">
                    {book.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{book.title}</h3>
                    <p className="text-xs text-gray-500">{book.level}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Reading Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{selectedBook?.title || "No Book Selected"}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {selectedBook ? (
                  <div 
                    className="text-lg leading-relaxed text-right" 
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: selectedBook.content }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No books available. Please upload books in the Admin Panel.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
