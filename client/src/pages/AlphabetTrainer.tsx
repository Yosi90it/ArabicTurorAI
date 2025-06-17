import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ArabicLetter {
  arabic: string;
  name: string;
  pronunciation: string;
}

const arabicLetters: ArabicLetter[] = [
  { arabic: "ا", name: "Alif", pronunciation: "/a/" },
  { arabic: "ب", name: "Ba", pronunciation: "/b/" },
  { arabic: "ت", name: "Ta", pronunciation: "/t/" },
  { arabic: "ث", name: "Tha", pronunciation: "/θ/" }
];

export default function AlphabetTrainer() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Arabic Alphabet Trainer</h2>
        <p className="text-gray-600">Master the 28 letters of the Arabic alphabet</p>
      </div>

      {/* Alphabet Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {arabicLetters.map((letter, index) => (
          <Card key={index} className="text-center hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">{letter.arabic}</div>
              <div className="text-sm font-medium">{letter.name}</div>
              <div className="text-xs text-gray-500">{letter.pronunciation}</div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="text-center bg-soft-gray">
          <CardContent className="p-4">
            <div className="text-xl text-gray-400 mb-2">+24</div>
            <div className="text-xs text-gray-500">More letters</div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl mb-3">✍️</div>
            <CardTitle className="text-base mb-2">Writing Practice</CardTitle>
            <p className="text-sm text-gray-600 mb-4">Trace and practice writing Arabic letters</p>
            <Button className="w-full bg-primary-purple text-white rounded-2xl hover:bg-active-purple transition-colors">
              Start Writing
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl mb-3">🎧</div>
            <CardTitle className="text-base mb-2">Audio Recognition</CardTitle>
            <p className="text-sm text-gray-600 mb-4">Listen and identify Arabic letter sounds</p>
            <Button className="w-full bg-primary-purple text-white rounded-2xl hover:bg-active-purple transition-colors">
              Start Listening
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
