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
        className="absolute bg-white shadow-xl border-0 rounded-2xl overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)',
          minWidth: '200px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="text-lg font-bold text-primary-purple">{word}</div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-purple-700 mb-1">Translation</h4>
              <p className="text-gray-700">{translation}</p>
            </div>
            
            {pronunciation && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-1">Pronunciation</h4>
                <p className="text-gray-600 text-sm font-mono">{pronunciation}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-purple-700 mb-1">Grammar</h4>
              <p className="text-gray-600 text-sm">{grammar}</p>
            </div>

            {examples && examples.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 mb-1">Examples</h4>
                <div className="space-y-1">
                  {examples.slice(0, 2).map((example, index) => (
                    <p key={index} className="text-gray-600 text-sm italic">"{example}"</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => onAddToFlashcards(word, translation, grammar)}
            className="w-full mt-3 bg-primary-purple hover:bg-active-purple text-white rounded-xl text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
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