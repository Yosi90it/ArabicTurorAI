import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  Volume2,
  BookOpen,
  Sparkles,
  GitBranch,
  Upload,
  Camera,
  Loader2,
  X,
  Plus,
  Download,
  Play,
  Pause
} from "lucide-react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";

interface FlashcardData {
  id: number;
  arabic: string;
  translation: string;
  category: string;
  grammar?: string;
  sentence?: string;
}

export default function FlashcardsNew() {
  const { userFlashcards } = useFlashcards();
  const { strings } = useLanguage();
  const { tashkeelEnabled, formatText } = useTashkeel();
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'stories' | 'verbs' | 'handwriting'>('learn');
  
  // Story generator states
  const [selectedWords, setSelectedWords] = useState<FlashcardData[]>([]);
  const [storyDifficulty, setStoryDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  
  // Verb conjugation states
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [showConjugation, setShowConjugation] = useState(false);
  
  // Handwriting states  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Static flashcard data for demo
  const staticFlashcards: FlashcardData[] = [
    { 
      id: 1, 
      arabic: "عَنْ", 
      translation: "von, über, wegen", 
      category: "Präpositionen",
      sentence: "أتحدث **عَنْ** اللغة العربية."
    },
    { 
      id: 2, 
      arabic: "بيت", 
      translation: "Haus", 
      category: "Familie & Zuhause",
      sentence: "أنا أسكن في **بيت** كبير مع عائلتي."
    },
    { 
      id: 3, 
      arabic: "طعام", 
      translation: "Essen", 
      category: "Essen & Trinken",
      sentence: "أحب **الطعام** العربي كثيراً."
    },
    { 
      id: 4, 
      arabic: "سيارة", 
      translation: "Auto", 
      category: "Transport",
      sentence: "سأشتري **سيارة** جديدة الشهر القادم."
    }
  ];

  // Combine user and static flashcards
  const allFlashcards = [...userFlashcards, ...staticFlashcards];
  const currentCard = allFlashcards[currentCardIndex];

  const nextCard = () => {
    if (currentCardIndex < allFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
    setShowAnswer(false);
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(allFlashcards.length - 1);
    }
    setShowAnswer(false);
  };

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleCorrect = () => {
    updateProgress('flashcard', 10);
    toast({
      title: "Richtig!",
      description: "Gut gemacht! Weiter zur nächsten Karte.",
    });
    nextCard();
  };

  const handleIncorrect = () => {
    toast({
      title: "Nochmal üben",
      description: "Kein Problem, übe diese Karte nochmal.",
    });
    // Keep the same card for practice
    setShowAnswer(false);
  };

  const speakArabic = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Story generation handlers
  const toggleWordSelection = (word: FlashcardData) => {
    setSelectedWords(prev => 
      prev.find(w => w.id === word.id)
        ? prev.filter(w => w.id !== word.id)
        : [...prev, word]
    );
  };

  const generateStory = async () => {
    if (selectedWords.length === 0) {
      toast({
        title: "Keine Wörter ausgewählt",
        description: "Bitte wählen Sie mindestens ein Wort für die Geschichte aus.",
      });
      return;
    }

    setIsGeneratingStory(true);
    try {
      // Simuliere API-Aufruf für Geschichte
      await new Promise(resolve => setTimeout(resolve, 2000));
      const words = selectedWords.map(w => w.arabic).join(', ');
      const story = `هذه قصة جميلة تحتوي على الكلمات: ${words}. القصة تحكي عن مغامرة رائعة في مدينة قديمة حيث التقى الأصدقاء وسافروا معًا عبر الصحراء. كان الطقس جميلًا والرحلة مليئة بالمفاجآت السعيدة.`;
      setGeneratedStory(story);
      
      // Generate audio URL for the story
      generateAudioForStory(story);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Geschichte konnte nicht generiert werden.",
      });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Generate audio using Web Speech API
  const generateAudioForStory = async (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.7;
        utterance.pitch = 1.0;
        
        // Create audio blob using MediaRecorder (simulated)
        // In a real implementation, you would record the speech synthesis
        // For now, we'll create a simple audio URL placeholder
        setAudioUrl(`data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvWIcBDGH0fPTgjMGHm7A7+OZURE=`);
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
    }
  };

  // Play/Pause audio
  const toggleAudioPlayback = () => {
    if (!generatedStory) return;
    
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(generatedStory);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };



  // Download story as audio file (using Web Speech API with MediaRecorder)
  const downloadStoryAsAudio = async () => {
    if (!generatedStory) return;

    try {
      toast({
        title: "Audio wird generiert...",
        description: "Bitte warten Sie, während die Audiodatei erstellt wird.",
      });

      // Create audio using Web Speech API and MediaRecorder
      if ('speechSynthesis' in window && 'MediaRecorder' in window) {
        // Create audio context for recording
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();
        
        // Create speech synthesis
        const utterance = new SpeechSynthesisUtterance(generatedStory);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.7;
        utterance.pitch = 1.0;
        
        // Record the speech
        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `arabische-geschichte-${Date.now()}.wav`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Download erfolgreich",
            description: "Die Audiodatei wurde heruntergeladen.",
          });
        };
        
        // Start recording and speaking
        mediaRecorder.start();
        
        utterance.onend = () => {
          setTimeout(() => {
            mediaRecorder.stop();
          }, 500); // Small delay to ensure audio is captured
        };
        
        utterance.onerror = () => {
          mediaRecorder.stop();
          throw new Error('Speech synthesis failed');
        };
        
        speechSynthesis.speak(utterance);
        
      } else {
        // Fallback: Download as text with instructions
        const content = `Arabische Geschichte (Audio-Version)
        
${generatedStory}

Hinweise:
- Diese Datei enthält den Text der Geschichte
- Für echte Audiowiedergabe verwenden Sie den "Anhören" Button in der App
- Browser-Kompatibilität: Speech Synthesis oder MediaRecorder nicht verfügbar

Geschrieben am: ${new Date().toLocaleDateString('de-DE')}`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `arabische-geschichte-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Textdatei heruntergeladen",
          description: "Audio-Aufnahme nicht unterstützt. Textversion wurde gespeichert.",
        });
      }
      
    } catch (error) {
      console.error('Audio download failed:', error);
      toast({
        title: "Fehler",
        description: "Audio-Download fehlgeschlagen. Versuchen Sie es erneut.",
      });
    }
  };

  // Handwriting upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeHandwriting = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    try {
      // Simuliere OCR/KI-Analyse
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAnalysisResult("Erkannter Text: 'أنا أحب اللغة العربية'\n\nKorrekturen:\n✓ Korrekte Schreibweise!\n✓ Gute Buchstabenverbindungen\n⚠ Achten Sie auf gleichmäßige Linienführung");
    } catch (error) {
      toast({
        title: "Fehler", 
        description: "Handschrift konnte nicht analysiert werden.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Verb conjugation data
  const verbCards = allFlashcards.filter(card => card.grammar?.includes('Verb') || card.category.includes('Verb'));
  const currentVerb = verbCards[currentVerbIndex];

  const conjugationTable = {
    'كتب': {
      present: { 
        'أنا': 'أكتب', 'أنت': 'تكتب', 'أنتِ': 'تكتبين',
        'هو': 'يكتب', 'هي': 'تكتب', 'نحن': 'نكتب'
      },
      past: {
        'أنا': 'كتبت', 'أنت': 'كتبت', 'أنتِ': 'كتبت', 
        'هو': 'كتب', 'هي': 'كتبت', 'نحن': 'كتبنا'
      }
    }
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Keine Flashcards verfügbar</h2>
          <p className="text-gray-600">Füge Wörter zu deinen Flashcards hinzu, um zu beginnen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'learn'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen size={18} />
              Lernen
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'stories'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles size={18} />
              Geschichten
            </button>
            <button
              onClick={() => setActiveTab('verbs')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'verbs'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GitBranch size={18} />
              Verben
            </button>
            <button
              onClick={() => setActiveTab('handwriting')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === 'handwriting'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload size={18} />
              Handschrift
            </button>
          </div>
        </div>

        {activeTab === 'learn' && (
          <>
            {/* Main Flashcard */}
            <div className="mb-8">
              <Card 
                className="w-full h-96 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                onClick={handleFlipCard}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-8 relative">
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 right-4 bg-white/80 text-gray-700"
                  >
                    {currentCard.category}
                  </Badge>



                  {/* Main Content */}
                  <div className="text-center space-y-6">
                    {!showAnswer ? (
                      <>
                        {/* Arabic Word */}
                        <div className="space-y-4">
                          <h2 className="text-6xl font-bold text-gray-900 font-arabic">
                            {formatText(currentCard.arabic)}
                          </h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakArabic(currentCard.arabic);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Volume2 size={20} />
                          </Button>
                        </div>
                        
                        {/* Hint */}
                        <p className="text-lg text-gray-500 font-medium">
                          Klicke zum Umdrehen
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Translation */}
                        <div className="space-y-4">
                          <h2 className="text-4xl font-bold text-gray-900">
                            {currentCard.translation}
                          </h2>
                          
                          {/* Example Sentence */}
                          {currentCard.sentence && (
                            <div className="mt-6 p-4 bg-white/60 rounded-lg">
                              <p className="text-lg text-gray-700 font-arabic text-right">
                                {formatText(currentCard.sentence.replace(/\*\*/g, ''))}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              {/* Previous Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={previousCard}
                className="w-16 h-16 rounded-lg border-2"
              >
                <ChevronLeft size={24} />
              </Button>

              {/* Progress */}
              <div className="flex-1 mx-8">
                <div className="text-center mb-2">
                  <span className="text-sm text-gray-600">
                    Karte {currentCardIndex + 1} von {allFlashcards.length}
                  </span>
                </div>
                <Progress 
                  value={((currentCardIndex + 1) / allFlashcards.length) * 100} 
                  className="h-3 bg-gray-200"
                />
              </div>

              {/* Next Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={nextCard}
                className="w-16 h-16 rounded-lg border-2"
              >
                <ChevronRight size={24} />
              </Button>
            </div>

            {/* Answer Buttons */}
            {showAnswer && (
              <div className="flex gap-4">
                <Button
                  onClick={handleIncorrect}
                  className="flex-1 h-14 text-lg font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl"
                >
                  <RotateCcw size={20} className="mr-2" />
                  Nochmal üben
                </Button>
                
                <Button
                  onClick={handleCorrect}
                  className="flex-1 h-14 text-lg font-medium bg-green-500 hover:bg-green-600 text-white rounded-xl"
                >
                  <Check size={20} className="mr-2" />
                  Gewusst
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-6">
            {/* Word Selection */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Wörter für die Geschichte auswählen</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {allFlashcards.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedWords.some(w => w.id === word.id)}
                        onCheckedChange={() => toggleWordSelection(word)}
                      />
                      <div className="flex-1">
                        <div className="font-arabic text-lg">{formatText(word.arabic)}</div>
                        <div className="text-sm text-gray-600">{word.translation}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium mb-1">Schwierigkeit</label>
                    <select 
                      value={storyDifficulty} 
                      onChange={(e) => setStoryDifficulty(e.target.value as any)}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="beginner">Anfänger</option>
                      <option value="intermediate">Fortgeschritten</option>
                      <option value="advanced">Experte</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={generateStory}
                    disabled={isGeneratingStory || selectedWords.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingStory ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generiere...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Geschichte generieren
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Story */}
            {generatedStory && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Generierte Geschichte</h3>
                    {isPlaying && (
                      <div className="flex items-center text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <span className="ml-2 text-sm font-medium">Wiedergabe läuft...</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-6 rounded-lg border-l-4 ${isPlaying ? 'bg-blue-50 border-blue-400' : 'bg-amber-50 border-amber-400'} transition-colors duration-300`}>
                    <p className="font-arabic text-lg text-right leading-relaxed mb-6">
                      {formatText(generatedStory)}
                    </p>
                    
                    {/* Audio Controls */}
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAudioPlayback}
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                      >
                        {isPlaying ? (
                          <>
                            <Pause size={16} className="mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play size={16} className="mr-2" />
                            Anhören
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadStoryAsAudio}
                        className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                      >
                        <Download size={16} className="mr-2" />
                        Audio herunterladen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'verbs' && (
          <div className="space-y-6">
            {verbCards.length > 0 ? (
              <>
                {/* Verb Flashcard */}
                <Card 
                  className="w-full h-96 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50"
                  onClick={() => setShowConjugation(!showConjugation)}
                >
                  <CardContent className="h-full flex flex-col items-center justify-center p-8">
                    <Badge variant="secondary" className="absolute top-4 right-4 bg-white/80 text-gray-700">
                      Verb
                    </Badge>

                    <div className="text-center space-y-6">
                      {!showConjugation ? (
                        <>
                          <h2 className="text-6xl font-bold text-gray-900 font-arabic">
                            {formatText(currentVerb?.arabic || 'كتب')}
                          </h2>
                          <p className="text-lg text-gray-500 font-medium">
                            Klicke für Konjugationstabelle
                          </p>
                        </>
                      ) : (
                        <div className="w-full max-w-2xl">
                          <h3 className="text-2xl font-bold mb-6">Konjugationstabelle</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-bold text-lg mb-3">Präsens</h4>
                              <div className="space-y-2">
                                {Object.entries(conjugationTable['كتب']?.present || {}).map(([pronoun, form]) => (
                                  <div key={pronoun} className="flex justify-between text-sm">
                                    <span className="font-arabic">{pronoun}</span>
                                    <span className="font-arabic">{form}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg mb-3">Präteritum</h4>
                              <div className="space-y-2">
                                {Object.entries(conjugationTable['كتب']?.past || {}).map(([pronoun, form]) => (
                                  <div key={pronoun} className="flex justify-between text-sm">
                                    <span className="font-arabic">{pronoun}</span>
                                    <span className="font-arabic">{form}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Verb Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentVerbIndex(Math.max(0, currentVerbIndex - 1))}
                    disabled={currentVerbIndex === 0}
                    className="w-16 h-16 rounded-lg"
                  >
                    <ChevronLeft size={24} />
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Verb {currentVerbIndex + 1} von {verbCards.length}
                    </span>
                  </div>

                  <Button
                    variant="outline" 
                    size="lg"
                    onClick={() => setCurrentVerbIndex(Math.min(verbCards.length - 1, currentVerbIndex + 1))}
                    disabled={currentVerbIndex === verbCards.length - 1}
                    className="w-16 h-16 rounded-lg"
                  >
                    <ChevronRight size={24} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <GitBranch size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Keine Verben verfügbar</h2>
                <p className="text-gray-600">Fügen Sie Verben zu Ihren Flashcards hinzu.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'handwriting' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Handschrift hochladen</h3>
                <p className="text-gray-600 mb-6">
                  Schreiben Sie arabischen Text auf Papier und laden Sie ein Foto hoch. Die KI wird Ihre Handschrift analysieren und Feedback geben.
                </p>
                
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Upload size={20} className="mr-2" />
                      Foto hochladen
                    </Button>
                    
                    <Button
                      onClick={() => {
                        // Kamera-Funktionalität könnte hier implementiert werden
                        toast({ 
                          title: "Kamera", 
                          description: "Kamera-Feature kommt bald!" 
                        });
                      }}
                      variant="outline"
                    >
                      <Camera size={20} className="mr-2" />
                      Foto aufnehmen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Image */}
            {uploadedImage && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Hochgeladenes Bild</h3>
                  <div className="relative mb-4">
                    <img
                      src={uploadedImage}
                      alt="Hochgeladene Handschrift"
                      className="w-full max-h-96 object-contain border rounded-lg"
                    />
                    <Button
                      onClick={() => {
                        setUploadedImage(null);
                        setAnalysisResult('');
                      }}
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={analyzeHandwriting}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analysiere Handschrift...
                      </>
                    ) : (
                      'Handschrift analysieren'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Analyse-Ergebnis</h3>
                  <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400">
                    <pre className="whitespace-pre-wrap text-sm">{analysisResult}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}