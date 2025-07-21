import { X, Plus, RotateCcw, Book, Table } from "lucide-react";
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

// Separate Conjugation Modal Component
function ConjugationModal({ 
  word, 
  conjugations, 
  isOpen, 
  onClose, 
  onSave 
}: {
  word: string;
  conjugations: VerbConjugation[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { strings } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-[60]"
        onClick={onClose}
      />
      
      <Card className="fixed z-[70] w-[500px] max-w-[90vw] bg-white border-2 border-purple-200 shadow-2xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-purple-700">{strings.language === 'de' ? 'Verb-Konjugationen' : 'Verb Conjugations'}</h3>
              <p className="text-sm text-gray-600" dir="rtl">{word}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Book className="h-4 w-4 mr-1" />
                {strings.language === 'de' ? 'Speichern' : 'Save'}
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="outline"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <div className="grid gap-2">
              {conjugations.map((conj, index) => (
                <div key={index} className="flex justify-between items-center text-sm bg-purple-50 p-3 rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-purple-600" dir="rtl">{conj.person}</div>
                    <div className="text-gray-500 text-xs">{conj.tense}</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="font-bold text-lg text-gray-800" dir="rtl">{conj.arabic}</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-gray-700 font-medium">{conj.german}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            {conjugations.length} {strings.language === 'de' ? 'Konjugationsformen' : 'conjugation forms'}
          </div>
        </CardContent>
      </Card>
    </>
  );
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
  const [showConjugationModal, setShowConjugationModal] = useState(false);
  const { addVerbConjugation, addFlashcard } = useFlashcards();
  const { strings } = useLanguage();
  const { awardPoints } = useSimpleGamification();
  const { toast } = useToast();

  const handleShowConjugations = async () => {
    setLoadingConjugations(true);
    
    try {
      const conjugationData = await generateConjugations(word);
      setConjugations(conjugationData);
      setShowConjugationModal(true);
    } catch (error) {
      console.error('Error getting conjugations:', error);
    } finally {
      setLoadingConjugations(false);
    }
  };

  const handleSaveConjugations = () => {
    if (conjugations.length > 0) {
      // Add verb to both normal flashcards AND verb conjugations
      addFlashcard(word, translation, grammar, "User Added");
      addVerbConjugation(word, translation, conjugations);
      
      toast({
        title: strings.language === 'de' ? "Verb gespeichert!" : "Verb saved!",
        description: strings.language === 'de' 
          ? "Das Verb wurde sowohl zu den normalen Wörtern als auch zu den Konjugationen hinzugefügt." 
          : "The verb has been added to both regular words and conjugations.",
      });
      
      setShowConjugationModal(false);
      onClose();
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
          top: Math.max(20, Math.min(position.y - 100, window.innerHeight - 500)),
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
                  <Table className="h-3 w-3 mr-1" />
                )}
                {strings.language === 'de' ? 'Konjugieren' : 'Conjugate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Separate Conjugation Modal */}
      <ConjugationModal
        word={word}
        conjugations={conjugations}
        isOpen={showConjugationModal}
        onClose={() => setShowConjugationModal(false)}
        onSave={handleSaveConjugations}
      />
    </>
  );
}