import { X, Plus, RotateCcw, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useToast } from "@/hooks/use-toast";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface VerbConjugation {
  tense: string;
  person: string;
  arabic: string;
  german: string;
}

interface WordModalProps {
  word: string;
  translation: string;
  grammar: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAddToFlashcards: (word: string, translation: string, grammar: string) => void;
  examples?: string[];
  pronunciation?: string;
  isAnalyzing?: boolean;
}

// Generate Arabic verb conjugations
async function generateConjugations(verb: string): Promise<VerbConjugation[]> {
  try {
    const response = await fetch('/api/openai/conjugate-verb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verb }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get conjugations');
    }
    
    const data = await response.json();
    return data.conjugations || [];
  } catch (error) {
    console.error('Conjugation error:', error);
    return [];
  }
}

export default function WordModal({ 
  word, 
  translation, 
  grammar, 
  position, 
  onClose, 
  onAddToFlashcards,
  examples = [],
  pronunciation,
  isAnalyzing = false
}: WordModalProps) {
  const [loadingConjugations, setLoadingConjugations] = useState(false);
  const [conjugations, setConjugations] = useState<VerbConjugation[]>([]);
  const [showConjugations, setShowConjugations] = useState(false);
  const { addVerbConjugation } = useFlashcards();
  const { strings } = useLanguage();

  const handleShowConjugations = async () => {
    setLoadingConjugations(true);
    
    try {
      const conjugationData = await generateConjugations(word);
      setConjugations(conjugationData);
      setShowConjugations(true);
    } catch (error) {
      console.error('Error getting conjugations:', error);
    } finally {
      setLoadingConjugations(false);
    }
  };

  const handleSaveConjugations = () => {
    if (conjugations.length > 0) {
      addVerbConjugation(word, translation, conjugations);
    }
  };

  // Check if word is likely a verb (simple heuristic)
  const isLikelyVerb = grammar.includes('verb') || grammar.includes('فعل') || 
    word.length >= 3 && (
      word.startsWith('أ') || word.startsWith('ي') || word.startsWith('ت') || 
      word.startsWith('ن') || word.includes('كتب') || word.includes('ذهب')
    );

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      <Card 
        className="fixed z-50 w-96 max-w-md bg-white border-2 border-purple-200 shadow-xl"
        style={{
          left: Math.min(position.x, window.innerWidth - 400),
          top: Math.min(position.y, window.innerHeight - 400),
        }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-700 mb-1" dir="rtl">
                {word}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {translation}
              </p>
              <p className="text-xs text-gray-500">
                {grammar}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {pronunciation && (
            <div className="mb-3 p-2 bg-blue-50 rounded">
              <p className="text-xs text-blue-700">
                {strings.language === 'de' ? 'Aussprache:' : 'Pronunciation:'} {pronunciation}
              </p>
            </div>
          )}

          {examples.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-1">
                {strings.language === 'de' ? 'Beispiele:' : 'Examples:'}
              </h4>
              {examples.map((example, index) => (
                <p key={index} className="text-xs text-gray-600 mb-1" dir="rtl">
                  {example}
                </p>
              ))}
            </div>
          )}

          {showConjugations && conjugations.length > 0 && (
            <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-purple-700">
                  {strings.language === 'de' ? 'Konjugationen:' : 'Conjugations:'}
                </h4>
                <Button
                  onClick={handleSaveConjugations}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
                >
                  <Book className="h-3 w-3 mr-1" />
                  {strings.language === 'de' ? 'Speichern' : 'Save'}
                </Button>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-1">
                {conjugations.map((conj, index) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                    <div className="flex-1">
                      <div className="font-medium text-purple-600 text-sm" dir="rtl">{conj.person}</div>
                      <div className="text-gray-500 text-xs">{conj.tense}</div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-bold text-base text-gray-800" dir="rtl">{conj.arabic}</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-gray-700 font-medium">{conj.german}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-center text-gray-500">
                {conjugations.length} {strings.language === 'de' ? 'Formen gefunden' : 'forms found'}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onAddToFlashcards(word, translation, grammar)}
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isAnalyzing}
            >
              <Plus className="h-3 w-3 mr-1" />
              {strings.language === 'de' ? 'Hinzufügen' : 'Add to Cards'}
            </Button>
            
            {isLikelyVerb && (
              <Button
                onClick={handleShowConjugations}
                size="sm"
                variant="outline"
                disabled={loadingConjugations}
                className="flex-1"
              >
                {loadingConjugations ? (
                  <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Book className="h-3 w-3 mr-1" />
                )}
                {strings.language === 'de' ? 'Konjugieren' : 'Conjugate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}