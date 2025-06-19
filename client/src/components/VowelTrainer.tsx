import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Volume2, CheckCircle, X } from "lucide-react";

interface VowelCombination {
  letter: string;
  vowel: string;
  pronunciation: string;
  word: string;
  wordTranslation: string;
  mnemonic: string;
}

interface VowelTrainerProps {
  vowelFocus: string;
  letters: string[];
}

const vowelData: { [key: string]: any } = {
  fatha: {
    mark: "َ",
    sound: "a",
    color: "text-red-500",
    examples: [
      { letter: "بَ", word: "بَاب", translation: "door", mnemonic: "Boat with sail floating to door" },
      { letter: "تَ", word: "تَمْر", translation: "dates", mnemonic: "Two dots like sweet dates above" },
      { letter: "جَ", word: "جَمَل", translation: "camel", mnemonic: "Hook catching a camel" }
    ]
  },
  kasra: {
    mark: "ِ",
    sound: "i", 
    color: "text-blue-500",
    examples: [
      { letter: "بِ", word: "بِنْت", translation: "girl", mnemonic: "Boat with water reflection below" },
      { letter: "تِ", word: "تِين", translation: "figs", mnemonic: "Two dots with roots underneath" },
      { letter: "جِ", word: "جِسْر", translation: "bridge", mnemonic: "Hook hanging like bridge support" }
    ]
  },
  damma: {
    mark: "ُ",
    sound: "u",
    color: "text-green-500", 
    examples: [
      { letter: "بُ", word: "بُرْج", translation: "tower", mnemonic: "Boat with tower crown above" },
      { letter: "تُ", word: "تُفَّاح", translation: "apple", mnemonic: "Two dots with apple stem curl" },
      { letter: "جُ", word: "جُبْن", translation: "cheese", mnemonic: "Hook holding round cheese" }
    ]
  }
};

export default function VowelTrainer({ vowelFocus, letters }: VowelTrainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null);

  const getCurrentVowelData = () => {
    if (vowelFocus === "mixed") {
      const vowels = ["fatha", "kasra", "damma"];
      return vowelData[vowels[currentIndex % vowels.length]];
    }
    return vowelData[vowelFocus] || vowelData.fatha;
  };

  const playVowelSound = (letter: string, vowel: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(letter + vowelData[vowel].mark);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.6;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVowelGuess = (guessedVowel: string) => {
    setSelectedVowel(guessedVowel);
    setShowAnswer(true);
    
    const currentVowel = getCurrentVowelData();
    const isCorrect = Object.keys(vowelData).find(v => vowelData[v] === currentVowel) === guessedVowel;
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextQuestion = () => {
    setCurrentIndex(prev => prev + 1);
    setShowAnswer(false);
    setSelectedVowel(null);
  };

  const currentVowel = getCurrentVowelData();
  const currentLetter = letters[currentIndex % letters.length] || "ب";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress and Score */}
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-sm">
          {vowelFocus === "mixed" ? "Mixed Vowels" : `${vowelFocus.charAt(0).toUpperCase() + vowelFocus.slice(1)} Focus`}
        </Badge>
        <div className="text-sm text-gray-600">
          Score: {score.correct}/{score.total}
        </div>
      </div>

      {/* Main Practice Card */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-lg">Vowel Recognition Practice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Letter Display */}
          <div className="space-y-4">
            <div className="text-8xl font-bold">
              {currentLetter}
              <span className={currentVowel.color}>{currentVowel.mark}</span>
            </div>
            
            <Button
              onClick={() => playVowelSound(currentLetter, Object.keys(vowelData).find(v => vowelData[v] === currentVowel) || "fatha")}
              className="bg-primary-purple hover:bg-active-purple text-white rounded-full px-6"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              Listen
            </Button>
          </div>

          {/* Vowel Options */}
          {!showAnswer && (
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(vowelData).map(([vowelName, data]) => (
                <Button
                  key={vowelName}
                  onClick={() => handleVowelGuess(vowelName)}
                  variant="outline"
                  className="h-16 text-2xl hover:shadow-lg transition-all"
                >
                  <span className={data.color}>{data.mark}</span>
                  <span className="ml-2 text-sm">/{data.sound}/</span>
                </Button>
              ))}
            </div>
          )}

          {/* Answer Feedback */}
          {showAnswer && (
            <div className="space-y-4">
              <div className={`flex items-center justify-center space-x-2 text-lg ${
                selectedVowel === Object.keys(vowelData).find(v => vowelData[v] === currentVowel) 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {selectedVowel === Object.keys(vowelData).find(v => vowelData[v] === currentVowel) ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
                <span>
                  {selectedVowel === Object.keys(vowelData).find(v => vowelData[v] === currentVowel) 
                    ? "Correct!" 
                    : `Incorrect. This was ${Object.keys(vowelData).find(v => vowelData[v] === currentVowel)}`}
                </span>
              </div>

              <Button onClick={nextQuestion} className="bg-primary-purple hover:bg-active-purple text-white rounded-2xl">
                Next Question
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vowel Reference Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(vowelData).map(([vowelName, data]) => (
          <Card key={vowelName} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className={`text-4xl ${data.color}`}>{data.mark}</div>
                <div className="text-sm font-medium capitalize">{vowelName}</div>
                <div className="text-xs text-gray-600">Sound: /{data.sound}/</div>
                
                {data.examples.slice(0, 1).map((example: any, index: number) => (
                  <div key={index} className="mt-3 p-2 bg-soft-gray rounded-xl">
                    <div className="text-lg">{example.letter}</div>
                    <div className="text-xs text-gray-600">{example.word} - {example.translation}</div>
                    <div className="text-xs text-primary-purple mt-1">{example.mnemonic}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}