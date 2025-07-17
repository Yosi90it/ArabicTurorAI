import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileUp, BookOpen, Languages, Volume2, FileText, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PdfConverterSimple() {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState(30);
  const [endPage, setEndPage] = useState(180);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const texts = {
    en: {
      title: 'PDF to Interactive EPUB Converter',
      description: 'Convert PDF pages to interactive Arabic learning books with word-by-word translations',
      uploadLabel: 'Select PDF File',
      uploadPlaceholder: 'Choose your Arabic PDF document...',
      startPageLabel: 'Start Page',
      endPageLabel: 'End Page',
      convertBtn: 'Convert to EPUB',
      comingSoon: 'Coming Soon',
      features: [
        'OCR text recognition for Arabic',
        'Interlinear German translations',
        'Clickable words with definitions',
        'Audio playback support',
        'Add words to flashcards',
        'Mobile-optimized reading'
      ],
      currentlyAvailable: 'Currently Available',
      availableFeatures: [
        'BookReader with interlinear translation',
        'VideoTrainer with clickable words',
        'AI Chat for Arabic learning',
        'Flashcards with custom vocabulary',
        '7-Day learning plan',
        'Alphabet trainer with audio'
      ],
      useExisting: 'Use Existing Features',
      setupRequired: 'PDF Converter Setup Required'
    },
    de: {
      title: 'PDF zu interaktivem EPUB Konverter',
      description: 'Konvertiere PDF-Seiten zu interaktiven arabischen Lernbüchern mit Wort-für-Wort Übersetzungen',
      uploadLabel: 'PDF-Datei auswählen',
      uploadPlaceholder: 'Wählen Sie Ihr arabisches PDF-Dokument...',
      startPageLabel: 'Startseite',
      endPageLabel: 'Endseite',
      convertBtn: 'Zu EPUB konvertieren',
      comingSoon: 'Bald verfügbar',
      features: [
        'OCR-Texterkennung für Arabisch',
        'Interlineare deutsche Übersetzungen',
        'Klickbare Wörter mit Definitionen',
        'Audio-Wiedergabe-Unterstützung',
        'Wörter zu Flashcards hinzufügen',
        'Mobile-optimiertes Lesen'
      ],
      currentlyAvailable: 'Aktuell verfügbar',
      availableFeatures: [
        'BookReader mit interlinearer Übersetzung',
        'VideoTrainer mit klickbaren Wörtern',
        'AI Chat für Arabisch-Lernen',
        'Flashcards mit eigenem Vokabular',
        '7-Tage Lernplan',
        'Alphabet-Trainer mit Audio'
      ],
      useExisting: 'Vorhandene Features nutzen',
      setupRequired: 'PDF-Konverter Setup erforderlich'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Error',
        description: 'Please select a PDF file',
        variant: 'destructive'
      });
    }
  };

  const handleConvert = () => {
    toast({
      title: t.comingSoon,
      description: 'PDF Converter wird in einer zukünftigen Version verfügbar sein. Nutzen Sie vorerst den BookReader für interlineare Übersetzungen.',
      variant: 'default'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">
          {t.title}
        </h1>
        <p className="text-gray-600 text-lg">
          {t.description}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Conversion Form - Coming Soon */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              {t.setupRequired}
            </CardTitle>
            <CardDescription className="text-orange-600">
              {language === 'de' 
                ? 'Diese Funktion erfordert zusätzliche Python-Abhängigkeiten und OCR-Software.'
                : 'This feature requires additional Python dependencies and OCR software.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload - Disabled */}
            <div className="space-y-2 opacity-50">
              <Label htmlFor="pdf-file">{t.uploadLabel}</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
              >
                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {file ? file.name : t.uploadPlaceholder}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="pdf-file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled
                />
              </div>
            </div>

            {/* Page Range - Disabled */}
            <div className="grid grid-cols-2 gap-4 opacity-50">
              <div className="space-y-2">
                <Label htmlFor="start-page">{t.startPageLabel}</Label>
                <Input
                  id="start-page"
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value) || 30)}
                  min="1"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-page">{t.endPageLabel}</Label>
                <Input
                  id="end-page"
                  type="number"
                  value={endPage}
                  onChange={(e) => setEndPage(parseInt(e.target.value) || 180)}
                  min="1"
                  disabled
                />
              </div>
            </div>

            {/* Convert Button - Coming Soon */}
            <Button 
              onClick={handleConvert}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {t.comingSoon} - {t.convertBtn}
            </Button>

            {/* Coming Soon Features */}
            <div className="p-4 bg-orange-100 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">
                {t.comingSoon}
              </h4>
              <ul className="space-y-1 text-sm text-orange-700">
                {t.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Current Features */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <BookOpen className="h-5 w-5" />
              {t.currentlyAvailable}
            </CardTitle>
            <CardDescription className="text-green-600">
              {language === 'de' 
                ? 'Nutzen Sie diese Features für interaktives Arabisch-Lernen'
                : 'Use these features for interactive Arabic learning'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {t.availableFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index === 0 && <BookOpen className="h-3 w-3 text-green-600" />}
                    {index === 1 && <Volume2 className="h-3 w-3 text-green-600" />}
                    {index === 2 && <Languages className="h-3 w-3 text-green-600" />}
                    {index === 3 && <FileText className="h-3 w-3 text-green-600" />}
                    {index === 4 && <BookOpen className="h-3 w-3 text-green-600" />}
                    {index === 5 && <Volume2 className="h-3 w-3 text-green-600" />}
                  </div>
                  <span className="text-sm text-green-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3">
              <Button 
                onClick={() => window.location.href = '/book-reader'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                BookReader nutzen
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/video-trainer'}
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                VideoTrainer nutzen
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">
                {language === 'de' ? 'Interlineare Übersetzung' : 'Interlinear Translation'}
              </h4>
              <p className="text-sm text-blue-700">
                {language === 'de' 
                  ? 'Alle aktuellen Module unterstützen bereits Wort-für-Wort deutsche Übersetzungen mit klickbaren Wörtern und Flashcard-Integration.'
                  : 'All current modules already support word-by-word German translations with clickable words and flashcard integration.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}