import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Volume2, RotateCcw } from "lucide-react";

interface ArabicLetter {
  char: string;
  name: string;
  pronunciation: string;
  audioUrl?: string;
}

const letters: ArabicLetter[] = [
  { char: "ا", name: "Alif", pronunciation: "/a/" },
  { char: "ب", name: "Ba", pronunciation: "/b/" },
  { char: "ت", name: "Ta", pronunciation: "/t/" },
  { char: "ث", name: "Tha", pronunciation: "/θ/" },
  { char: "ج", name: "Jeem", pronunciation: "/d͡ʒ/" },
  { char: "ح", name: "Haa", pronunciation: "/ħ/" },
  { char: "خ", name: "Khaa", pronunciation: "/x/" },
  { char: "د", name: "Dal", pronunciation: "/d/" },
  { char: "ذ", name: "Thal", pronunciation: "/ð/" },
  { char: "ر", name: "Ra", pronunciation: "/r/" },
  { char: "ز", name: "Zay", pronunciation: "/z/" },
  { char: "س", name: "Seen", pronunciation: "/s/" },
  { char: "ش", name: "Sheen", pronunciation: "/ʃ/" },
  { char: "ص", name: "Sad", pronunciation: "/sˤ/" },
  { char: "ض", name: "Dad", pronunciation: "/dˤ/" },
  { char: "ط", name: "Taa", pronunciation: "/tˤ/" },
  { char: "ظ", name: "Zaa", pronunciation: "/ðˤ/" },
  { char: "ع", name: "Ain", pronunciation: "/ʕ/" },
  { char: "غ", name: "Ghain", pronunciation: "/ɣ/" },
  { char: "ف", name: "Fa", pronunciation: "/f/" },
  { char: "ق", name: "Qaf", pronunciation: "/q/" },
  { char: "ك", name: "Kaf", pronunciation: "/k/" },
  { char: "ل", name: "Lam", pronunciation: "/l/" },
  { char: "م", name: "Meem", pronunciation: "/m/" },
  { char: "ن", name: "Noon", pronunciation: "/n/" },
  { char: "ه", name: "Ha", pronunciation: "/h/" },
  { char: "و", name: "Waw", pronunciation: "/w/" },
  { char: "ي", name: "Ya", pronunciation: "/j/" }
];

export default function AlphabetTrainer() {
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuizLetter, setCurrentQuizLetter] = useState<ArabicLetter | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);

  const playLetterSound = (letter: ArabicLetter) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(letter.char);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.7;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const startQuiz = () => {
    setIsQuizMode(true);
    setQuizScore(0);
    setQuizAttempts(0);
    generateQuizQuestion();
  };

  const generateQuizQuestion = () => {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    setCurrentQuizLetter(randomLetter);
    setTimeout(() => playLetterSound(randomLetter), 500);
  };

  const handleQuizAnswer = (selectedLetter: ArabicLetter) => {
    setQuizAttempts(prev => prev + 1);
    if (selectedLetter.char === currentQuizLetter?.char) {
      setQuizScore(prev => prev + 1);
    }
    
    if (quizAttempts < 4) {
      setTimeout(generateQuizQuestion, 1000);
    } else {
      setTimeout(() => setIsQuizMode(false), 2000);
    }
  };

  const exitQuiz = () => {
    setIsQuizMode(false);
    setCurrentQuizLetter(null);
  };

  if (isQuizMode) {
    return (
      <div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Letter Recognition Quiz</h2>
          <p className="text-gray-600">Listen and select the correct letter</p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="text-sm font-medium">Score: {quizScore}/{quizAttempts}</span>
            <span className="text-sm text-gray-500">Question {quizAttempts + 1}/5</span>
          </div>
        </div>

        {currentQuizLetter && (
          <Card className="max-w-md mx-auto mb-6">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🎧</div>
              <p className="text-lg font-medium mb-4">Which letter did you hear?</p>
              <Button 
                onClick={() => playLetterSound(currentQuizLetter)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {letters.slice(0, 12).map((letter, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleQuizAnswer(letter)}
            >
              <CardContent className="p-4">
                <div className="text-4xl mb-2">{letter.char}</div>
                <div className="text-sm font-medium">{letter.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={exitQuiz}
            variant="outline" 
            className="rounded-2xl"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Arabic Alphabet Trainer</h2>
        <p className="text-gray-600">Master the 28 letters of the Arabic alphabet with audio pronunciation</p>
      </div>

      {/* Alphabet Grid with Audio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {letters.map((letter, index) => (
          <Card key={index} className="bg-white shadow rounded-2xl p-6 m-2 hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-6xl mb-2 text-center">{letter.char}</div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{letter.name}</div>
                    <div className="text-xs text-gray-500">{letter.pronunciation}</div>
                  </div>
                </div>
                <Button
                  onClick={() => playLetterSound(letter)}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 ml-3"
                  size="sm"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Practice Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <Button 
              onClick={startQuiz}
              className="w-full bg-primary-purple text-white rounded-2xl hover:bg-active-purple transition-colors"
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl mb-3">🔊</div>
            <CardTitle className="text-base mb-2">Pronunciation Practice</CardTitle>
            <p className="text-sm text-gray-600 mb-4">Listen to native pronunciation of each letter</p>
            <Button className="w-full bg-primary-purple text-white rounded-2xl hover:bg-active-purple transition-colors">
              Practice All
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
