import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Download, BookOpen, Languages, Volume2, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversionResult {
  success: boolean;
  message: string;
  download_url?: string;
  pages_processed?: number;
}

export default function PdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState(30);
  const [endPage, setEndPage] = useState(180);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
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
      converting: 'Converting...',
      features: [
        'OCR text recognition for Arabic',
        'Interlinear German translations',
        'Clickable words with definitions',
        'Audio playback support',
        'Add words to flashcards',
        'Mobile-optimized reading'
      ],
      success: 'PDF successfully converted!',
      download: 'Download EPUB',
      error: 'Conversion failed',
      invalidFile: 'Please select a PDF file',
      invalidPages: 'End page must be greater than start page'
    },
    de: {
      title: 'PDF zu interaktivem EPUB Konverter',
      description: 'Konvertiere PDF-Seiten zu interaktiven arabischen Lernbüchern mit Wort-für-Wort Übersetzungen',
      uploadLabel: 'PDF-Datei auswählen',
      uploadPlaceholder: 'Wählen Sie Ihr arabisches PDF-Dokument...',
      startPageLabel: 'Startseite',
      endPageLabel: 'Endseite',
      convertBtn: 'Zu EPUB konvertieren',
      converting: 'Konvertierung läuft...',
      features: [
        'OCR-Texterkennung für Arabisch',
        'Interlineare deutsche Übersetzungen',
        'Klickbare Wörter mit Definitionen',
        'Audio-Wiedergabe-Unterstützung',
        'Wörter zu Flashcards hinzufügen',
        'Mobile-optimiertes Lesen'
      ],
      success: 'PDF erfolgreich konvertiert!',
      download: 'EPUB herunterladen',
      error: 'Konvertierung fehlgeschlagen',
      invalidFile: 'Bitte wählen Sie eine PDF-Datei',
      invalidPages: 'Endseite muss größer als Startseite sein'
    }
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: t.error,
        description: t.invalidFile,
        variant: 'destructive'
      });
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: t.error,
        description: t.invalidFile,
        variant: 'destructive'
      });
      return;
    }

    if (endPage <= startPage) {
      toast({
        title: t.error,
        description: t.invalidPages,
        variant: 'destructive'
      });
      return;
    }

    setIsConverting(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('start_page', startPage.toString());
      formData.append('end_page', endPage.toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      const response = await fetch('/api/pdf-convert', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const result: ConversionResult = await response.json();
        setResult(result);
        
        toast({
          title: t.success,
          description: `${result.pages_processed} ${language === 'de' ? 'Seiten verarbeitet' : 'pages processed'}`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
      setResult({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsConverting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleDownload = async () => {
    if (!result?.download_url) return;

    try {
      const response = await fetch(result.download_url);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arabic-book-pages-${startPage}-${endPage}.epub`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: t.error,
        description: 'Download failed',
        variant: 'destructive'
      });
    }
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
        {/* Conversion Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              {language === 'de' ? 'PDF Konvertierung' : 'PDF Conversion'}
            </CardTitle>
            <CardDescription>
              {language === 'de' 
                ? 'Laden Sie Ihr PDF hoch und konvertieren Sie es zu einem interaktiven EPUB'
                : 'Upload your PDF and convert it to an interactive EPUB'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="pdf-file">{t.uploadLabel}</Label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
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
                />
              </div>
            </div>

            {/* Page Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-page">{t.startPageLabel}</Label>
                <Input
                  id="start-page"
                  type="number"
                  value={startPage}
                  onChange={(e) => setStartPage(parseInt(e.target.value) || 30)}
                  min="1"
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
                />
              </div>
            </div>

            {/* Progress */}
            {isConverting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t.converting}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Convert Button */}
            <Button 
              onClick={handleConvert} 
              disabled={!file || isConverting}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isConverting ? t.converting : t.convertBtn}
            </Button>

            {/* Result */}
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </p>
                {result.success && result.download_url && (
                  <Button 
                    onClick={handleDownload}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t.download}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {language === 'de' ? 'EPUB Features' : 'EPUB Features'}
            </CardTitle>
            <CardDescription>
              {language === 'de' 
                ? 'Was Sie in Ihrem konvertierten EPUB-Buch erhalten'
                : 'What you get in your converted EPUB book'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {t.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index === 0 && <FileText className="h-3 w-3 text-purple-600" />}
                    {index === 1 && <Languages className="h-3 w-3 text-purple-600" />}
                    {index === 2 && <BookOpen className="h-3 w-3 text-purple-600" />}
                    {index === 3 && <Volume2 className="h-3 w-3 text-purple-600" />}
                    {index === 4 && <FileUp className="h-3 w-3 text-purple-600" />}
                    {index === 5 && <FileText className="h-3 w-3 text-purple-600" />}
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                {language === 'de' ? 'Interlineare Übersetzung' : 'Interlinear Translation'}
              </h4>
              <p className="text-sm text-blue-700">
                {language === 'de' 
                  ? 'Jedes arabische Wort wird mit einer deutschen Übersetzung direkt darunter angezeigt, genau wie in Ihrem BookReader.'
                  : 'Each Arabic word is displayed with a German translation directly below it, just like in your BookReader.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}