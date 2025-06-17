import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Search, Volume2 } from "lucide-react";
import ClickableText from "@/components/ClickableText";

interface Book {
  id: number;
  title: string;
  level: string;
  icon: string;
}

const books: Book[] = [
  { id: 1, title: "Arabian Nights", level: "Beginner Level", icon: "📖" },
  { id: 2, title: "Short Stories", level: "Intermediate", icon: "📚" }
];

export default function BookReader() {
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [tashkeelEnabled, setTashkeelEnabled] = useState(true);

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
            {books.map((book) => (
              <div
                key={book.id}
                className={`flex items-center space-x-3 p-2 rounded-xl cursor-pointer transition-colors ${
                  selectedBook.id === book.id ? "bg-soft-gray" : "hover:bg-soft-gray"
                }`}
                onClick={() => setSelectedBook(book)}
              >
                <div className="w-10 h-12 bg-primary-purple rounded-lg flex items-center justify-center text-white text-xs">
                  {book.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.level}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reading Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{selectedBook.title} - Chapter 1</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Tashkeel</span>
                    <Switch 
                      checked={tashkeelEnabled}
                      onCheckedChange={setTashkeelEnabled}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="text-lg leading-relaxed mb-4 text-right" dir="rtl">
                  <ClickableText 
                    text={tashkeelEnabled ? originalTextWithTashkeel : plainTextWithoutTashkeel}
                    className=""
                  />
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Once upon a time, there was a wealthy merchant in Baghdad...
                </p>
                
                <div className="text-lg leading-relaxed mb-4 text-right" dir="rtl">
                  <ClickableText 
                    text={tashkeelEnabled ? originalTextWithTashkeel2 : plainTextWithoutTashkeel2}
                    className=""
                  />
                </div>
                <p className="text-sm text-gray-600">
                  He had two sons, the elder named Ali and the younger named Ahmed...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
