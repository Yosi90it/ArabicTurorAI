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

export default function OriginalFirstPage() {
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

  const arabicText = `أَنَامُ مُبَكِّراً فِي اللَّيْلِ وَأَقُومُ مُبَكِّراً فِي الصَّبَاحِ ، أَسْتَيْقِظُ عَلَى اسْمِ اللهِ وَذِكْرِهِ ، أَسْتَعِدُّ لِلصَّلاَةِ ثُمَّ أُصَلِّي مَعَ وَالِدِي إِلَى الْمَسْجِدِ ، وَالْمَسْجِدُ قَرِيبٌ مِنْ بَيْتِي ، فَأَتَوَضَّأُ وَأُصَلِّي مَعَ الْجَمَاعَةِ ، وَأَرْجِعُ إِلَى الْبَيْتِ وَأَتَنَاوَلُ شَيْئاً مِنَ الْقُرْآنِ الْكَرِيمِ ، ثُمَّ أَخْرُجُ إِلَى الْبُسْتَانِ وَأَجْرِي ، ثُمَّ أَرْجِعُ إِلَى الْبَيْتِ فَأَشْرَبُ اللَّبَنَ وَأَسْتَعِدُّ لِلذَّهَابِ إِلَى الْمَدْرَسَةِ ، وَأُفْطِرُ إِذَا كَانَتْ أَيَّامُ الضَّعْفِ ، وَأَتَغَدَّى إِذَا كَانَتْ أَيَّامُ الشِّتَاءِ ، وَأَصِلُ إِلَى الْمَدْرَسَةِ فِي الْمِيعَادِ.

وَأَمْكُثُ فِي الْمَدْرَسَةِ سِتَّ سَاعَاتٍ ، وَأَسْمَعُ الدُّرُوسَ بِنَشَاطٍ`;

  const germanTranslation = `Wie ich meinen Tag verbringe

Ich schlafe früh in der Nacht und stehe früh am Morgen auf. Ich wache mit dem Namen Allahs und Seinem Gedenken auf. Ich bereite mich auf das Gebet vor, dann bete ich mit meinem Vater zur Moschee. Die Moschee ist nah bei unserem Haus, also mache ich die Waschung und bete mit der Gemeinschaft. Dann kehre ich nach Hause zurück und lese etwas aus dem edlen Quran. Dann gehe ich in den Garten und laufe, dann kehre ich nach Hause zurück, trinke Milch und bereite mich vor, zur Schule zu gehen. Ich frühstücke, wenn es schwache Tage sind, und ich esse zu Mittag, wenn es Wintertage sind, und ich komme pünktlich in der Schule an.

Ich bleibe sechs Stunden in der Schule und höre aktiv den Unterrichtsstunden zu.`;

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg">
        <CardContent className="p-0">
          {/* Header Controls */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {strings.language === 'de' ? 'Seite 1 - Original Layout' : 'Page 1 - Original Layout'}
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

          {/* Original Page Layout */}
          <div className="relative min-h-[800px] bg-white p-8" style={{ fontFamily: 'serif' }}>
            {/* Header URL - Small red text at top */}
            <div className="text-red-600 text-xs mb-8 text-left">
              www.abullhasanalinadwi.org
            </div>

            {/* Bismillah */}
            <div className="text-center mb-8">
              <div className="text-2xl font-arabic leading-relaxed">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
              </div>
            </div>

            {/* Page Number */}
            <div className="text-center mb-8">
              <span className="text-lg">(١)</span>
            </div>

            {/* Main Title */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-arabic font-bold leading-relaxed">
                {showArabicText && (
                  <div onClick={handleWordClick}>
                    <ClickableText 
                      text={tashkeelEnabled ? "كَيْفَ أَقْضِي يَوْمِي" : "كيف أقضي يومي"}
                      className="text-3xl font-arabic font-bold leading-relaxed text-center"
                    />
                  </div>
                )}
              </h1>
            </div>

            {/* Main Content */}
            <div className="text-center leading-loose text-lg font-arabic space-y-4" dir="rtl" onClick={handleWordClick}>
              {showArabicText ? (
                interlinearEnabled ? (
                  <InterlinearText 
                    text={tashkeelEnabled ? arabicText : arabicText.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                    className="text-lg font-arabic leading-loose text-black text-center"
                  />
                ) : (
                  <ClickableText 
                    text={tashkeelEnabled ? arabicText : arabicText.replace(/[\u064B-\u065F\u0670\u0640]/g, '')}
                    className="text-lg font-arabic leading-loose text-black text-center"
                  />
                )
              ) : (
                <div className="text-center text-gray-700 leading-relaxed" dir="ltr">
                  {germanTranslation}
                </div>
              )}
            </div>

            {/* Footnote */}
            <div className="absolute bottom-12 left-8 text-sm text-gray-600">
              <span>(١) مبكراً: مشرعاً.</span>
            </div>

            {/* Page Number at Bottom */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <span className="text-xl font-bold">٣٠</span>
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