import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Eye, EyeOff, ToggleLeft, ToggleRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useToast } from "@/hooks/use-toast";
import ClickableText from "@/components/ClickableText";
import InterlinearText from "@/components/InterlinearText";
import WordModal from "@/components/WordModal";

export default function OriginalPage37() {
  const { strings } = useLanguage();
  const { tashkeelEnabled } = useTashkeel();
  const { toast } = useToast();
  const [showArabicText, setShowArabicText] = useState(true);
  const [interlinearEnabled, setInterlinearEnabled] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    translation: string;
    grammar: string;
    position: { x: number; y: number };
  } | null>(null);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: strings.language === 'de' ? "Nicht unterstützt" : "Not Supported",
        description: strings.language === 'de' ? "Ihr Browser unterstützt kein Text-zu-Sprache" : "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
    }
  };

  // Direct Weaviate translation function
  async function fetchTranslation(arabicWord: string): Promise<string> {
    const res = await fetch('/api/weaviate/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word: arabicWord })
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch translation');
    }
    
    const data = await res.json();
    return data.translation || "–";
  }

  const handleWordClick = async (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('clickable-word')) {
      const word = target.getAttribute('data-word');
      if (word) {
        const cleanedWord = word.replace(/[،؟!.:]/g, ''); // Remove punctuation
        const rect = target.getBoundingClientRect();
        
        // Set initial loading state
        setSelectedWord({
          word: cleanedWord,
          translation: "Lädt…",
          grammar: "noun",
          position: { 
            x: rect.left + rect.width / 2, 
            y: rect.top 
          }
        });
        
        try {
          // Fetch translation from Weaviate
          const translation = await fetchTranslation(cleanedWord);
          
          // Update with actual translation
          setSelectedWord({
            word: cleanedWord,
            translation: translation,
            grammar: "noun",
            position: { 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            }
          });
        } catch (error) {
          console.error('Error fetching translation:', error);
          setSelectedWord({
            word: cleanedWord,
            translation: "–",
            grammar: "noun",
            position: { 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            }
          });
        }
      }
    }
  };

  const handleAddToFlashcards = (word: string, translation: string, grammar: string) => {
    // Add to flashcards logic here
    toast({
      title: strings.language === 'de' ? "Zu Karteikarten hinzugefügt" : "Added to Flashcards",
      description: `"${word}" wurde hinzugefügt`
    });
    setSelectedWord(null);
  };

  // Arabic text extracted from page 37 - Market scene dialog
  const arabicText = `عُمَرُ: هَلْ زُرْتَ سُوقَ هَذَا الْبَلَدِ يَا صَدِيقِي؟

خَالِدٌ: لَا يَا أَخِي ، فَإِنِّي غَرِيبٌ جَدِيدٌ فِي هَذَا الْبَلَدِ لَا أَعْرِفُ الطَّرِيقَ.

عُمَرُ: تَعَالَ مَعِي فَإِنِّي ذَاهِبٌ إِلَى السُّوقِ لِأَشْتَرِي بَعْضَ`;

  const germanTranslation = `Im Markt - Dialog

Umar: Hast du den Markt dieser Stadt besucht, mein Freund?

Khalid: Nein, mein Bruder, denn ich bin ein neuer Fremder in dieser Stadt und kenne den Weg nicht.

Umar: Komm mit mir, denn ich gehe zum Markt, um etwas zu kaufen.`;

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
        <CardContent className="p-0">
          {/* Header Controls */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {strings.language === 'de' ? 'Seite 37 - Original Layout' : 'Page 37 - Original Layout'}
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowArabicText(!showArabicText)}
                variant="outline"
                size="sm"
              >
                {showArabicText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {strings.language === 'de' ? 'Arabisch' : 'Arabic'}
              </Button>
              <div 
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                onClick={() => setInterlinearEnabled(!interlinearEnabled)}
              >
                {interlinearEnabled ? (
                  <ToggleRight className="w-5 h-5 text-purple-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {strings.language === 'de' ? 'Wort-für-Wort' : 'Word-by-Word'}
                </span>
              </div>
              <Button
                onClick={() => playAudio(arabicText)}
                variant="outline"
                size="sm"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Original Page Layout - WITHOUT Bismillah */}
          <div 
            className="relative min-h-[800px] bg-white p-8" 
            style={{ 
              fontFamily: 'serif',
              backgroundImage: 'url(/Al-Qir`atur.Rashida (1-2)-page-037.jpg)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Subtle overlay to make text readable */}
            <div className="absolute inset-0 bg-white/30"></div>
            
            {/* Content overlay */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-gray-200">
                  {/* Header URL - Small red text at top */}
                  <div className="text-red-600 text-xs mb-8 text-left">
                    www.abullhasanalinadwi.org
                  </div>

                  {/* Page Number */}
                  <div className="text-center mb-8">
                    <span className="text-lg">(٣٧)</span>
                  </div>

                  {/* Main Title */}
                  <div className="text-center mb-12">
                    <h1 className="text-4xl font-arabic font-bold leading-relaxed" dir="rtl">
                      {showArabicText && (
                        <div onClick={handleWordClick}>
                          <ClickableText 
                            text={tashkeelEnabled ? "فِي السُّوقِ" : "في السوق"}
                            className="text-4xl font-arabic font-bold leading-relaxed text-center"
                          />
                        </div>
                      )}
                    </h1>
                  </div>

                  {/* Market scene illustration placeholder */}
                  <div className="text-center mb-8">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-gray-500 text-sm">
                        {strings.language === 'de' ? 'Marktszene Illustration' : 'Market Scene Illustration'}
                      </span>
                    </div>
                  </div>

                  {/* Main Content - Dialog format */}
                  <div className="text-right leading-loose text-xl font-arabic space-y-4" dir="rtl" onClick={handleWordClick}>
                    {showArabicText ? (
                      interlinearEnabled ? (
                        <InterlinearText 
                          text={tashkeelEnabled ? arabicText : arabicText.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                          className="text-xl font-arabic leading-loose"
                        />
                      ) : (
                        <div className="space-y-4">
                          {arabicText.split('\n\n').map((paragraph, index) => (
                            <div key={index} className="text-xl font-arabic leading-relaxed">
                              <ClickableText text={tashkeelEnabled ? paragraph : paragraph.replace(/[\u064B-\u065F\u0670\u0640]/g, '')} />
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-left text-lg leading-relaxed text-gray-800">
                        {germanTranslation.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Word Modal */}
      {selectedWord && (
        <WordModal
          word={selectedWord.word}
          translation={selectedWord.translation}
          grammar={selectedWord.grammar}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
          onAddToFlashcards={handleAddToFlashcards}
        />
      )}
    </>
  );
}