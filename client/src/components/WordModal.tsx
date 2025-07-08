import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <Card 
        className="absolute bg-white shadow-xl border-0 rounded-xl overflow-hidden"
        style={{
          left: `${Math.max(10, Math.min(position.x, window.innerWidth - 240))}px`,
          top: `${Math.max(10, Math.min(position.y + 20, window.innerHeight - 300))}px`,
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
          
          <Button 
            onClick={() => onAddToFlashcards(word, translation, grammar)}
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
            size="sm"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add to Flashcards
          </Button>
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