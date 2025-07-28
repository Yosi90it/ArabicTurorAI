import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Eye, EyeOff, ZoomIn, ZoomOut } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface QiraaturRashidaPageProps {
  pageNumber: number;
  filename: string;
}

export default function QiraaturRashidaPage({ pageNumber, filename }: QiraaturRashidaPageProps) {
  const { strings } = useLanguage();
  const { toast } = useToast();
  const [imageScale, setImageScale] = useState(1);
  const [showFullscreen, setShowFullscreen] = useState(false);

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

          {/* Image Content */}
          <div className={`relative ${showFullscreen ? 'min-h-screen' : 'min-h-[600px]'} bg-white p-8 flex items-center justify-center overflow-auto`}>
            <div className="text-center">
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