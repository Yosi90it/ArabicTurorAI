import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  Volume2, 
  ArrowRight, 
  ArrowLeft, 
  Trophy,
  Target,
  CheckCircle,
  RotateCcw,
  BookOpen,
  Zap,
  Speaker
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { arabicAlphabet, vowelMarks, longVowels, practiceWords, type ArabicLetter, type VowelMark } from "@/data/arabicAlphabet";

type LearningPhase = 'letters' | 'vowels' | 'extensions' | 'words3' | 'words4' | 'words5';
type LetterForm = 'isolated' | 'initial' | 'medial' | 'final';

export default function AlphabetTrainer() {
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('letters');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentForm, setCurrentForm] = useState<LetterForm>('isolated');
  const [currentVowel, setCurrentVowel] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizProgress, setQuizProgress] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<Set<LearningPhase>>(new Set());
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const { strings } = useLanguage();

  const currentLetter = arabicAlphabet[currentIndex];
  const currentVowelMark = vowelMarks[currentVowel];

  const playAudio = (text: string, rate: number = 0.8) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = rate;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPhaseTitle = (phase: LearningPhase) => {
    switch(phase) {
      case 'letters': return 'Buchstaben & Formen';
      case 'vowels': return 'Vokalzeichen';
      case 'extensions': return 'Lange Vokale';
      case 'words3': return '3-Buchstaben Wörter';
      case 'words4': return '4-Buchstaben Wörter';
      case 'words5': return '5+ Buchstaben Wörter';
      default: return 'Lernphase';
    }
  };

  const getCurrentContent = () => {
    switch(currentPhase) {
      case 'letters':
        return {
          arabic: currentLetter[currentForm],
          name: `${currentLetter.name} (${getFormName(currentForm)})`,
          pronunciation: currentLetter.pronunciation,
          description: `Buchstabe ${currentLetter.letter} in ${getFormName(currentForm)} Form`
        };
      case 'vowels':
        return {
          arabic: currentLetter.isolated + currentVowelMark.mark,
          name: `${currentLetter.name} + ${currentVowelMark.name}`,
          pronunciation: `${currentLetter.pronunciation}${currentVowelMark.pronunciation}`,
          description: currentVowelMark.description
        };
      case 'extensions':
        const longVowel = longVowels[currentIndex % longVowels.length];
        return {
          arabic: longVowel.example,
          name: `Lange Vokale: ${longVowel.name}`,
          pronunciation: longVowel.pronunciation,
          description: `Langer ${longVowel.sound}-Laut`
        };
      case 'words3':
        const word3 = practiceWords.threeLetters[currentIndex % practiceWords.threeLetters.length];
        return {
          arabic: word3.arabic,
          name: word3.german,
          pronunciation: word3.pronunciation,
          description: `3-Buchstaben Wort: ${word3.german}`
        };
      case 'words4':
        const word4 = practiceWords.fourLetters[currentIndex % practiceWords.fourLetters.length];
        return {
          arabic: word4.arabic,
          name: word4.german,
          pronunciation: word4.pronunciation,
          description: `4-Buchstaben Wort: ${word4.german}`
        };
      case 'words5':
        const word5 = practiceWords.fiveLetters[currentIndex % practiceWords.fiveLetters.length];
        return {
          arabic: word5.arabic,
          name: word5.german,
          pronunciation: word5.pronunciation,
          description: `5+ Buchstaben Wort: ${word5.german}`
        };
      default:
        return { arabic: '', name: '', pronunciation: '', description: '' };
    }
  };

  const getFormName = (form: LetterForm) => {
    switch(form) {
      case 'isolated': return 'Isoliert';
      case 'initial': return 'Anfang';
      case 'medial': return 'Mitte';
      case 'final': return 'Ende';
    }
  };

  const nextItem = () => {
    if (currentPhase === 'letters') {
      if (currentForm === 'final') {
        setCurrentForm('isolated');
        setCurrentIndex((prev) => (prev + 1) % arabicAlphabet.length);
      } else {
        const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];
        const currentFormIndex = forms.indexOf(currentForm);
        setCurrentForm(forms[currentFormIndex + 1]);
      }
    } else if (currentPhase === 'vowels') {
      if (currentVowel === vowelMarks.length - 1) {
        setCurrentVowel(0);
        setCurrentIndex((prev) => (prev + 1) % arabicAlphabet.length);
      } else {
        setCurrentVowel(prev => prev + 1);
      }
    } else {
      const maxIndex = currentPhase === 'extensions' ? longVowels.length :
                     currentPhase === 'words3' ? practiceWords.threeLetters.length :
                     currentPhase === 'words4' ? practiceWords.fourLetters.length :
                     practiceWords.fiveLetters.length;
      setCurrentIndex((prev) => (prev + 1) % maxIndex);
    }
    setShowAnswer(false);
    setUserAnswer("");
  };

  const prevItem = () => {
    if (currentPhase === 'letters') {
      if (currentForm === 'isolated') {
        setCurrentForm('final');
        setCurrentIndex((prev) => (prev - 1 + arabicAlphabet.length) % arabicAlphabet.length);
      } else {
        const forms: LetterForm[] = ['isolated', 'initial', 'medial', 'final'];
        const currentFormIndex = forms.indexOf(currentForm);
        setCurrentForm(forms[currentFormIndex - 1]);
      }
    } else if (currentPhase === 'vowels') {
      if (currentVowel === 0) {
        setCurrentVowel(vowelMarks.length - 1);
        setCurrentIndex((prev) => (prev - 1 + arabicAlphabet.length) % arabicAlphabet.length);
      } else {
        setCurrentVowel(prev => prev - 1);
      }
    } else {
      const maxIndex = currentPhase === 'extensions' ? longVowels.length :
                     currentPhase === 'words3' ? practiceWords.threeLetters.length :
                     currentPhase === 'words4' ? practiceWords.fourLetters.length :
                     practiceWords.fiveLetters.length;
      setCurrentIndex((prev) => (prev - 1 + maxIndex) % maxIndex);
    }
    setShowAnswer(false);
    setUserAnswer("");
  };

  const markPhaseComplete = () => {
    const newCompleted = new Set(completedPhases);
    newCompleted.add(currentPhase);
    setCompletedPhases(newCompleted);
    updateProgress('reading');
    
    toast({
      title: "Phase abgeschlossen! 🎉",
      description: `Sie haben "${getPhaseTitle(currentPhase)}" erfolgreich abgeschlossen!`,
    });
  };

  const switchPhase = (phase: LearningPhase) => {
    setCurrentPhase(phase);
    setCurrentIndex(0);
    setCurrentForm('isolated');
    setCurrentVowel(0);
    setShowAnswer(false);
    setUserAnswer("");
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setQuizScore(0);
    setQuizProgress(0);
    setCurrentIndex(Math.floor(Math.random() * arabicAlphabet.length));
  };

  const content = getCurrentContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">

      <div className="max-w-6xl mx-auto px-6 space-y-6">

      {/* Phase Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lernphasen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(['letters', 'vowels', 'extensions', 'words3', 'words4', 'words5'] as LearningPhase[]).map((phase) => (
              <Button
                key={phase}
                onClick={() => switchPhase(phase)}
                variant={currentPhase === phase ? "default" : "outline"}
                className={`relative h-20 flex flex-col gap-1 ${completedPhases.has(phase) ? 'bg-green-50 border-green-300' : ''}`}
              >
                {completedPhases.has(phase) && (
                  <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-600" />
                )}
                <span className="text-sm font-medium">{getPhaseTitle(phase)}</span>
                <Badge variant="secondary" className="text-xs">
                  {phase === 'letters' ? `${arabicAlphabet.length}×4` :
                   phase === 'vowels' ? `${arabicAlphabet.length}×3` :
                   phase === 'extensions' ? longVowels.length :
                   phase === 'words3' ? practiceWords.threeLetters.length :
                   phase === 'words4' ? practiceWords.fourLetters.length :
                   practiceWords.fiveLetters.length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {!showQuiz ? (
        <>
          {/* Learning Mode */}
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <span>{getPhaseTitle(currentPhase)}</span>
                <Badge variant="outline">{content.name}</Badge>
              </CardTitle>
              <Progress value={33} className="w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large Display */}
              <div className="text-center space-y-4">
                <div 
                  className="text-9xl font-arabic mb-4 cursor-pointer hover:text-blue-600 transition-colors p-4 bg-gray-50 rounded-xl"
                  onClick={() => playAudio(content.arabic)}
                  dir="rtl"
                >
                  {content.arabic}
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-semibold">{content.name}</h3>
                  <p className="text-xl text-gray-600">/{content.pronunciation}/</p>
                  <p className="text-lg text-gray-500">{content.description}</p>
                </div>
              </div>

              {/* Letter Forms Display (only for letters phase) */}
              {currentPhase === 'letters' && (
                <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                  <h4 className="font-semibold text-center">Alle Formen von {currentLetter.name}:</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {(['isolated', 'initial', 'medial', 'final'] as LetterForm[]).map((form) => (
                      <div 
                        key={form}
                        className={`text-center p-4 rounded-lg cursor-pointer transition-colors ${
                          currentForm === form ? 'bg-blue-200 border-2 border-blue-400' : 'bg-white hover:bg-blue-100'
                        }`}
                        onClick={() => {
                          setCurrentForm(form);
                          playAudio(currentLetter[form]);
                        }}
                      >
                        <div className="text-4xl font-arabic mb-2" dir="rtl">
                          {currentLetter[form]}
                        </div>
                        <div className="text-sm font-medium">{getFormName(form)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vowel Marks Display (only for vowels phase) */}
              {currentPhase === 'vowels' && (
                <div className="bg-purple-50 p-6 rounded-lg space-y-4">
                  <h4 className="font-semibold text-center">Vokalzeichen:</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {vowelMarks.map((vowel, index) => (
                      <div 
                        key={index}
                        className={`text-center p-4 rounded-lg cursor-pointer transition-colors ${
                          currentVowel === index ? 'bg-purple-200 border-2 border-purple-400' : 'bg-white hover:bg-purple-100'
                        }`}
                        onClick={() => {
                          setCurrentVowel(index);
                          playAudio(currentLetter.isolated + vowel.mark);
                        }}
                      >
                        <div className="text-4xl font-arabic mb-2" dir="rtl">
                          {currentLetter.isolated}{vowel.mark}
                        </div>
                        <div className="text-sm font-medium">{vowel.name}</div>
                        <div className="text-xs text-gray-600">/{vowel.pronunciation}/</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Controls */}
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => playAudio(content.arabic, 0.6)}
                  className="gap-2"
                  size="lg"
                  variant="outline"
                >
                  <Volume2 className="w-5 h-5" />
                  Langsam
                </Button>
                <Button 
                  onClick={() => playAudio(content.arabic, 0.8)}
                  className="gap-2"
                  size="lg"
                >
                  <Speaker className="w-5 h-5" />
                  Normal
                </Button>
                <Button 
                  onClick={() => playAudio(content.arabic, 1.0)}
                  className="gap-2"
                  size="lg"
                  variant="outline"
                >
                  <Zap className="w-5 h-5" />
                  Schnell
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button onClick={prevItem} variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </Button>
                
                <div className="flex gap-2">
                  <Button onClick={markPhaseComplete} variant="outline" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Abgeschlossen
                  </Button>
                  <Button onClick={startQuiz} className="gap-2">
                    <Target className="w-4 h-4" />
                    Quiz
                  </Button>
                </div>
                
                <Button onClick={nextItem} variant="outline" className="gap-2">
                  Weiter
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Quiz Mode - simplified for now */}
          <Card className="mx-auto max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Quiz Modus - Phase: {getPhaseTitle(currentPhase)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div 
                  className="text-8xl font-arabic mb-4 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => playAudio(content.arabic)}
                  dir="rtl"
                >
                  {content.arabic}
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  Wie wird das ausgesprochen?
                </p>
                
                <Button 
                  onClick={() => playAudio(content.arabic)}
                  variant="outline"
                  className="gap-2 mb-4"
                >
                  <Volume2 className="w-4 h-4" />
                  Anhören
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  onClick={() => setShowQuiz(false)}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück zum Lernen
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}