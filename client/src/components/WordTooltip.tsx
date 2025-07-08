import React, { useState, useEffect } from 'react';
import { analyzeArabicWord, type WordAnalysis } from '@/lib/openai';
import { Loader2, Volume2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { useToast } from '@/hooks/use-toast';

interface WordTooltipProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  isVisible: boolean;
}

export default function WordTooltip({ word, position, onClose, isVisible }: WordTooltipProps) {
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addFlashcard } = useFlashcards();
  const { toast } = useToast();

  useEffect(() => {
    if (isVisible && word) {
      analyzeWord();
    }
  }, [isVisible, word]);

  const analyzeWord = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeArabicWord(word);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing word:', err);
      setError('Failed to analyze word');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if ('speechSynthesis' in window && analysis) {
      const utterance = new SpeechSynthesisUtterance(analysis.word);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleAddToFlashcards = () => {
    if (analysis) {
      addFlashcard(analysis.word, analysis.translation, analysis.grammar);
      toast({
        title: "Added to Flashcards",
        description: `"${analysis.word}" has been added to your flashcards.`
      });
      onClose();
    }
  };

  if (!isVisible) return null;

  const tooltipStyle = {
    left: Math.max(10, Math.min(position.x - 150, window.innerWidth - 320)),
    top: position.y - 120,
    zIndex: 1000,
  };

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 animate-in fade-in-0 zoom-in-95 duration-200"
      style={tooltipStyle}
      onMouseEnter={() => {}} // Keep tooltip open when hovering over it
      onMouseLeave={onClose}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-600">Analyzing...</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm text-center py-2">
          {error}
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-3">
          {/* Arabic Word */}
          <div className="text-right">
            <div className="text-2xl font-arabic text-gray-900" dir="rtl">
              {analysis.word}
            </div>
          </div>

          {/* Translation */}
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {analysis.translation}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {analysis.grammar}
            </div>
          </div>

          {/* Pronunciation */}
          {analysis.pronunciation && (
            <div className="text-sm text-gray-600">
              <strong>Pronunciation:</strong> {analysis.pronunciation}
            </div>
          )}

          {/* Examples */}
          {analysis.examples && analysis.examples.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-700">Examples:</div>
              <div className="space-y-1">
                {analysis.examples.slice(0, 2).map((example, index) => (
                  <div key={index} className="text-xs text-gray-600 italic">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              className="flex items-center gap-1"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-xs">Listen</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToFlashcards}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Add to Flashcards</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}