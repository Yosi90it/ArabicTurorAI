import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Eye, EyeOff, ZoomIn, ZoomOut, MousePointer } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import ClickableText from "./ClickableText";

interface QiraaturRashidaPageProps {
  pageNumber: number;
  filename: string;
}

interface PageContent {
  pageNumber: number;
  content: string;
}

export default function QiraaturRashidaPage({ pageNumber, filename }: QiraaturRashidaPageProps) {
  const { strings } = useLanguage();
  const { toast } = useToast();
  const [imageScale, setImageScale] = useState(1);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
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

  // Sample content generator for pages without extracted text
  const getSampleContentForPage = (pageNum: number): string => {
    const sampleTexts = [
      "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "الرَّحْمَنِ الرَّحِيمِ",
      "مَالِكِ يَوْمِ الدِّينِ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
      "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
    ];
    
    return sampleTexts[(pageNum - 30) % sampleTexts.length] || "اللَّهُ أَكْبَرُ";
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTextOverlay(!showTextOverlay)}
                className={`${showTextOverlay ? 'bg-purple-100 text-purple-700' : 'text-purple-600'}`}
              >
                <MousePointer className="w-4 h-4 mr-1" />
                {strings.language === 'de' ? 'Text' : 'Text'}
              </Button>
            </div>
          </div>

          {/* Image Content with Text Overlay */}
          <div className={`relative ${showFullscreen ? 'min-h-screen' : 'min-h-[600px]'} bg-white p-8 flex items-center justify-center overflow-auto`}>
            <div className="relative text-center">
              {/* Original Book Image */}
              <img
                src={`/qiraatu-images/${filename}`}
                alt={`Qiraatu al-Rashida Page ${pageNumber}`}
                className="max-w-full h-auto shadow-lg rounded-lg border"
                style={{ 
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease'
                }}
                onLoad={() => {
                  console.log(`Successfully loaded: ${filename}`);
                }}
                onError={(e) => {
                  console.error(`Failed to load image: /${filename}`);
                  console.log(`Current src: ${e.currentTarget.src}`);
                  console.log(`Trying alternative path for page ${pageNumber}`);
                  
                  // Try different path variations
                  const currentSrc = e.currentTarget.src;
                  
                  if (currentSrc.includes('/qiraatu-images/') && !currentSrc.includes('attached_assets')) {
                    // Try attached_assets path
                    console.log('Trying attached_assets path...');
                    e.currentTarget.src = `/attached_assets/${filename}`;
                  } else if (!currentSrc.includes('/qiraatu-images/')) {
                    // Try original root path
                    console.log('Trying root path...');
                    e.currentTarget.src = `/${filename}`;
                  } else {
                    // Show error message instead of broken image
                    console.log('All paths failed, showing error message');
                    e.currentTarget.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-red-500 text-center p-8 border-2 border-dashed border-red-300 rounded-lg bg-red-50';
                    errorDiv.innerHTML = `
                      <div class="text-6xl mb-4">📄</div>
                      <h3 class="text-lg font-semibold mb-2">Seite ${pageNumber} nicht verfügbar</h3>
                      <p class="text-sm text-gray-600">Datei: ${filename}</p>
                      <p class="text-xs text-gray-500 mt-2">Pfad getestet: /qiraatu-images/${filename}</p>
                    `;
                    if (e.currentTarget.parentNode && !e.currentTarget.parentNode.querySelector('.text-red-500')) {
                      e.currentTarget.parentNode.appendChild(errorDiv);
                    }
                  }
                }}
              />
              
              {/* Clickable Text Overlay */}
              {showTextOverlay && pageContent && (
                <div 
                  className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center rounded-lg"
                  style={{ 
                    transform: `scale(${imageScale})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <div className="max-w-md p-8 text-center">
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">
                      {strings.language === 'de' ? 'Klickbarer arabischer Text' : 'Clickable Arabic Text'}
                    </h3>
                    <div className="text-right leading-loose text-2xl">
                      <ClickableText text={pageContent} />
                    </div>
                    <p className="text-sm text-gray-600 mt-6">
                      {strings.language === 'de' 
                        ? 'Klicken Sie auf arabische Wörter für Übersetzungen' 
                        : 'Click on Arabic words for translations'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Page Info */}
              <div className="mt-4 text-sm text-gray-600">
                <p>{strings.language === 'de' 
                  ? `Originalseite ${pageNumber} aus dem klassischen arabischen Lehrbuch "Qiraatu al-Rashida"`
                  : `Original page ${pageNumber} from the classical Arabic textbook "Qiraatu al-Rashida"`}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {strings.language === 'de' 
                    ? 'Zoom mit den Buttons oben oder Mausrad verwenden'
                    : 'Use zoom buttons above or mouse wheel to zoom'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-600">
            {strings.language === 'de' 
              ? 'Diese Seite zeigt das originale Buchlayout. Für interaktive Übersetzungen nutzen Sie die anderen Buchseiten.'
              : 'This page shows the original book layout. For interactive translations, use the other book pages.'}
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Overlay */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            <Button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 z-10"
              variant="secondary"
            >
              ✕
            </Button>
            <img
              src={`/${filename}`}
              alt={`Qiraatu al-Rashida Page ${pageNumber}`}
              className="max-w-full max-h-full object-contain"
              style={{ 
                transform: `scale(${imageScale})`,
                transformOrigin: 'center'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}