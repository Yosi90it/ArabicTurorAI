import { X, Plus, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface VerbConjugation {
  person: string;
  singular: string;
  plural: string;
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
  const [showConjugations, setShowConjugations] = useState(false);
  const [conjugations, setConjugations] = useState<VerbConjugation[]>([]);
  const [loadingConjugations, setLoadingConjugations] = useState(false);

  const handleShowConjugations = async () => {
    if (showConjugations) {
      setShowConjugations(false);
      return;
    }
    
    setLoadingConjugations(true);
    setShowConjugations(true);
    
    try {
      const conjugationData = await generateConjugations(word);
      setConjugations(conjugationData);
    } catch (error) {
      console.error('Failed to load conjugations:', error);
    } finally {
      setLoadingConjugations(false);
    }
  };

  const isVerb = grammar.includes('verb') || grammar.includes('Verb') || 
                translation.includes('er ') || translation.includes('sie ') || 
                translation.includes('ich ') || translation.includes('wir ');
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <Card 
        className="absolute bg-white shadow-xl border-0 rounded-xl overflow-hidden"
        style={{
          left: `${Math.max(10, Math.min(position.x, window.innerWidth - (showConjugations ? 350 : 240)))}px`,
          top: `${Math.max(10, Math.min(position.y + 20, window.innerHeight - (showConjugations ? 400 : 300)))}px`,
          width: showConjugations ? '340px' : '220px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="text-base font-bold text-primary-purple">{word}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-0.5 h-5 w-5"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-xs text-gray-600">
              <strong>Translation:</strong> {translation}
            </p>
            <p className="text-xs text-gray-600">
              <strong>Grammar:</strong> {grammar}
            </p>
            
            {pronunciation && (
              <p className="text-xs text-gray-600">
                <strong>Pronunciation:</strong> {pronunciation}
              </p>
            )}
            
            {examples && examples.length > 0 && (
              <div className="text-xs text-gray-600">
                <strong>Examples:</strong>
                <ul className="mt-1 space-y-0.5">
                  {examples.slice(0, 2).map((example, index) => (
                    <li key={index} className="text-xs">• {example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 mt-3">
            <Button 
              onClick={() => onAddToFlashcards(word, translation, grammar)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
              size="sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add to Flashcards
            </Button>
            
            {isVerb && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleShowConjugations}
                className="text-xs"
                disabled={loadingConjugations}
              >
                <Book className="h-3 w-3 mr-1" />
                {showConjugations ? 'Hide' : 'Conjugate'}
              </Button>
            )}
          </div>
          
          {showConjugations && (
            <div className="mt-3 border-t pt-3">
              <h4 className="text-xs font-semibold mb-2">Konjugationen:</h4>
              {loadingConjugations ? (
                <div className="text-xs text-gray-500">Lade Konjugationen...</div>
              ) : conjugations.length > 0 ? (
                <div className="space-y-1">
                  {conjugations.map((conj, index) => (
                    <div key={index} className="text-xs">
                      <span className="font-medium">{conj.person}:</span>
                      <div className="ml-2">
                        <div>Singular: {conj.singular}</div>
                        <div>Plural: {conj.plural}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Keine Konjugationen verfügbar</div>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Arrow pointing to clicked word */}
        <div 
          className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
          style={{
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
      </Card>
    </div>
  );
}