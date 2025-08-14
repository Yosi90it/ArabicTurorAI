import { X, Plus, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { isCommonVerb } from "@/data/commonArabicVerbs";
import { useToast } from "@/hooks/use-toast";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConjugationModal } from "./ConjugationModal";

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
  const [showConjugationModal, setShowConjugationModal] = useState(false);
  const { strings } = useLanguage();
  const { updateProgress } = useSimpleGamification();
  const { toast } = useToast();

  const handleShowConjugations = () => {
    setShowConjugationModal(true);
  };

  // Enhanced verb detection using comprehensive patterns and common verb database
  const isLikelyVerb = grammar.includes('verb') || grammar.includes('فعل') || 
    isCommonVerb(word) || 
    (word.length >= 3 && (
      // Common prefixes for conjugated verbs
      word.startsWith('أ') || word.startsWith('ي') || word.startsWith('ت') || 
      word.startsWith('ن') || word.startsWith('س') || word.startsWith('ل') ||
      // Common verb patterns (3-letter roots)
      /^[اأإيتنسل]?[بتثجحخدذرزسشصضطظعغفقكلمنهوي][ابتثجحخدذرزسشصضطظعغفقكلمنهوي][ابتثجحخدذرزسشصضطظعغفقكلمنهوي]/.test(word) ||
      // Common 4-letter verb patterns
      /^[اأإيتنسل]?[بتثجحخدذرزسشصضطظعغفقكلمنهوي][ابتثجحخدذرزسشصضطظعغفقكلمنهوي][ابتثجحخدذرزسشصضطظعغفقكلمنهوي][ابتثجحخدذرزسشصضطظعغفقكلمنهوي]/.test(word) ||
      // Verb with و prefix (and)
      (word.startsWith('و') && word.length > 3) ||
      // Any word ending with verb suffixes
      word.endsWith('وا') || word.endsWith('تم') || word.endsWith('تن') ||
      word.endsWith('ني') || word.endsWith('ها') || word.endsWith('هم') ||
      word.endsWith('هن') || word.endsWith('كم') || word.endsWith('كن')
    ));

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
                {strings.languageCode === 'de' ? 'Aussprache:' : 'Pronunciation:'} {pronunciation}
              </p>
            </div>
          )}

          {examples.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-1">
                {strings.languageCode === 'de' ? 'Beispiele:' : 'Examples:'}
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
              {strings.languageCode === 'de' ? 'Hinzufügen' : 'Add to Cards'}
            </Button>
            
            {isLikelyVerb && (
              <Button
                onClick={handleShowConjugations}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                <Table className="h-3 w-3 mr-1" />
                {strings.languageCode === 'de' ? 'Konjugieren' : 'Conjugate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Conjugation Modal */}
      <ConjugationModal
        verb={word}
        isOpen={showConjugationModal}
        onClose={() => setShowConjugationModal(false)}
      />
    </>
  );
}