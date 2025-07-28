import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Eye, ZoomIn, ZoomOut, MousePointer } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import ClickableText from "./ClickableText";

interface QiraaturRashidaPageProps {
  pageNumber: number;
  filename: string;
}

export default function QiraaturRashidaPage({ pageNumber, filename }: QiraaturRashidaPageProps) {
  const { strings } = useLanguage();
  const { toast } = useToast();
  const [imageScale, setImageScale] = useState(1);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [pageContent, setPageContent] = useState<string>("");

  const playAudio = () => {
    // Since we can't read the Arabic text from images, we provide general page audio
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        strings.language === 'de' 
          ? `Seite ${pageNumber} von Qiraatu al-Rashida` 
          : `Page ${pageNumber} of Qiraatu al-Rashida`
      );
      utterance.lang = strings.language === 'de' ? 'de-DE' : 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: strings.language === 'de' ? "Nicht unterstützt" : "Not Supported",
        description: strings.language === 'de' ? "Ihr Browser unterstützt kein Text-zu-Sprache" : "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
    }
  };

  const zoomIn = () => setImageScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setImageScale(prev => Math.max(prev - 0.2, 0.5));

  // Load page content from the processed book data
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        // Load the processed book content
        const response = await fetch('/books/qiraatu-rashida-complete.json');
        const bookData = await response.json();
        
        // Find content for this specific page
        const page = bookData.pages?.find((p: any) => p.pageNumber === pageNumber);
        if (page && page.extractedText) {
          setPageContent(page.extractedText);
        } else {
          // Fallback sample content for missing pages
          setPageContent(getSampleContentForPage(pageNumber));
        }
      } catch (error) {
        console.error('Failed to load page content:', error);
        setPageContent(getSampleContentForPage(pageNumber));
      }
    };
    
    loadPageContent();
  }, [pageNumber]);

  // Use the same authentic text as the first page
  const getSampleContentForPage = (pageNum: number): string => {
    // Use the actual text from the first page
    return `أَنَامُ مُبَكِّراً فِي اللَّيْلِ وَأَقُومُ مُبَكِّراً فِي الصَّبَاحِ ، أَسْتَيْقِظُ عَلَى اسْمِ اللهِ وَذِكْرِهِ ، أَسْتَعِدُّ لِلصَّلاَةِ ثُمَّ أُصَلِّي مَعَ وَالِدِي إِلَى الْمَسْجِدِ ، وَالْمَسْجِدُ قَرِيبٌ مِنْ بَيْتِي ، فَأَتَوَضَّأُ وَأُصَلِّي مَعَ الْجَمَاعَةِ ، وَأَرْجِعُ إِلَى الْبَيْتِ وَأَتَنَاوَلُ شَيْئاً مِنَ الْقُرْآنِ الْكَرِيمِ ، ثُمَّ أَخْرُجُ إِلَى الْبُسْتَانِ وَأَجْرِي ، ثُمَّ أَرْجِعُ إِلَى الْبَيْتِ فَأَشْرَبُ اللَّبَنَ وَأَسْتَعِدُّ لِلذَّهَابِ إِلَى الْمَدْرَسَةِ ، وَأُفْطِرُ إِذَا كَانَتْ أَيَّامُ الضَّعْفِ ، وَأَتَغَدَّى إِذَا كَانَتْ أَيَّامُ الشِّتَاءِ ، وَأَصِلُ إِلَى الْمَدْرَسَةِ فِي الْمِيعَادِ.

وَأَمْكُثُ فِي الْمَدْرَسَةِ سِتَّ سَاعَاتٍ ، وَأَسْمَعُ الدُّرُوسَ بِنَشَاطٍ`;
  };

  return (
    <>
      <Card className="w-full max-w-5xl mx-auto bg-white shadow-lg">
        <CardContent className="p-0">
          {/* Header Controls */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {strings.language === 'de' 
                ? `Seite ${pageNumber} - Qiraatu al-Rashida (Original)` 
                : `Page ${pageNumber} - Qiraatu al-Rashida (Original)`}
            </h2>
            <div className="flex gap-2">
              <Button onClick={zoomOut} variant="outline" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={zoomIn} variant="outline" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => setShowFullscreen(!showFullscreen)} 
                variant="outline" 
                size="sm"
              >
                <Eye className="w-4 h-4" />
                {strings.language === 'de' ? 'Vollbild' : 'Fullscreen'}
              </Button>
              <Button onClick={playAudio} variant="outline" size="sm">
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content Area with Book Design - matching first page style */}
          <div 
            className={`relative ${showFullscreen ? 'min-h-screen' : 'min-h-[800px]'} bg-white p-8`}
            style={{
              backgroundImage: `url(/qiraatu-images/${filename})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              fontFamily: 'serif'
            }}
          >
            {/* Subtle overlay to make text readable */}
            <div className="absolute inset-0 bg-white/30"></div>
            
            {/* Content overlay matching first page design */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="max-w-2xl mx-auto">
                {/* Arabic text area with original book styling */}
                <div 
                  className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-8 border border-gray-200"
                  style={{ 
                    transform: `scale(${imageScale})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  {/* Header URL - Small red text at top like original */}
                  <div className="text-red-600 text-xs mb-6 text-left">
                    www.abullhasanalinadwi.org
                  </div>

                  {/* Bismillah like original */}
                  <div className="text-center mb-6">
                    <div className="text-xl font-arabic leading-relaxed">
                      بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
                    </div>
                  </div>

                  {/* Page Number in Arabic like original */}
                  <div className="text-center mb-6">
                    <span className="text-lg">({pageNumber})</span>
                  </div>
                  
                  {/* Main Title like first page */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-arabic font-bold leading-relaxed" dir="rtl">
                      <ClickableText text="كَيْفَ أَقْضِي يَوْمِي" />
                    </h1>
                  </div>

                  {/* Main Arabic text content */}
                  <div className="text-center leading-loose text-xl font-arabic space-y-4" dir="rtl">
                    <ClickableText text={pageContent} />
                  </div>
                  
                  {/* Footer instruction */}
                  <div className="border-t border-gray-200 pt-4 mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      {strings.language === 'de' 
                        ? 'Klicken Sie auf arabische Wörter für Übersetzungen' 
                        : 'Click on Arabic words for translations'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hidden original image for error handling */}
            <img
              src={`/qiraatu-images/${filename}`}
              alt={`Qiraatu al-Rashida Page ${pageNumber}`}
              className="hidden"
              onError={(e) => {
                console.error(`Failed to load background image: ${filename}`);
                // Fallback to solid background if image fails
                const container = e.currentTarget.closest('div') as HTMLElement;
                if (container) {
                  container.style.backgroundImage = 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)';
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}