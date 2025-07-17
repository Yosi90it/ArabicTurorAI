import { X, Plus, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useToast } from "@/hooks/use-toast";

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
  const [loadingConjugations, setLoadingConjugations] = useState(false);

  const handleShowConjugations = async () => {
    setLoadingConjugations(true);
    
    try {
      const conjugationData = await generateConjugations(word);
      
      // Erstelle neues Fenster für Konjugationen
      const newWindow = window.open('', '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
      
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Konjugationen: ${word}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background: #f9f9f9;
                direction: rtl;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                padding: 20px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .arabic-word { 
                font-size: 32px; 
                font-weight: bold; 
                color: #6B46C1;
                margin-bottom: 10px;
              }
              .translation { 
                font-size: 18px; 
                color: #666;
                margin-bottom: 5px;
              }
              .grammar { 
                font-size: 14px; 
                color: #888;
              }
              .conjugations { 
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .conjugation-row { 
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
              }
              .person { 
                font-weight: bold; 
                color: #333;
                width: 100px;
              }
              .forms { 
                flex: 1;
                text-align: left;
              }
              .form { 
                margin-bottom: 5px;
                font-size: 16px;
              }
              .singular { 
                color: #2563EB;
                font-size: 18px;
              }
              .plural { 
                color: #059669;
                font-size: 18px;
              }
              .close-btn {
                position: fixed;
                top: 10px;
                right: 10px;
                background: #EF4444;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 16px;
              }
              .close-btn:hover {
                background: #DC2626;
              }
            </style>
          </head>
          <body>
            <button class="close-btn" onclick="window.close()">×</button>
            <div class="header">
              <div class="arabic-word">${word}</div>
              <div class="translation">Übersetzung: ${translation}</div>
              <div class="grammar">Grammatik: ${grammar}</div>
            </div>
            
            <div class="conjugations">
              <h2 style="text-align: center; margin-bottom: 20px; color: #333;">Verbkonjugationen</h2>
              ${conjugationData.map(conj => `
                <div class="conjugation-row">
                  <div class="person">${conj.person}</div>
                  <div class="forms">
                    <div class="form">
                      <strong>Singular:</strong> <span class="singular">${conj.singular}</span>
                    </div>
                    <div class="form">
                      <strong>Plural:</strong> <span class="plural">${conj.plural}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666;">
              <p>Schließen Sie dieses Fenster, um zur Hauptanwendung zurückzukehren.</p>
            </div>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (error) {
      console.error('Failed to load conjugations:', error);
      alert('Fehler beim Laden der Konjugationen. Bitte versuchen Sie es erneut.');
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
          left: `${Math.max(10, Math.min(position.x - 110, window.innerWidth - 240))}px`,
          top: `${Math.max(10, Math.min(position.y - 50, window.innerHeight - 300))}px`,
          width: '220px'
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
                {loadingConjugations ? 'Laden...' : 'Conjugate'}
              </Button>
            )}
          </div>
        </CardContent>
        
        {/* Arrow pointing to clicked word */}
        <div 
          className="absolute w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-white"
          style={{
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
      </Card>
    </div>
  );
}