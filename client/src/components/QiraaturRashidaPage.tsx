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
                src={`/${filename}`}
                alt={`Qiraatu al-Rashida Page ${pageNumber}`}
                className="max-w-full h-auto shadow-lg rounded-lg border"
                style={{ 
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease'
                }}
                onError={(e) => {
                  console.error(`Failed to load image: ${filename}`);
                  // Try alternative file path if first fails
                  if (!e.currentTarget.src.includes('attached_assets')) {
                    e.currentTarget.src = `/attached_assets/${filename}`;
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