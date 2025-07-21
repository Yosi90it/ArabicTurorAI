import React, { useState } from 'react';
import { X, Loader2, Users2, Calendar, Zap, Bookmark, BookmarkCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { useToast } from '@/hooks/use-toast';

interface ConjugationForm {
  tense: string;
  person: string;
  arabic: string;
  german: string;
}

interface ConjugationModalProps {
  verb: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConjugationModal({ verb, isOpen, onClose }: ConjugationModalProps) {
  const [conjugations, setConjugations] = useState<ConjugationForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [savedToFlashcards, setSavedToFlashcards] = useState(false);
  
  const { strings } = useLanguage();
  const { addVerbConjugation } = useFlashcards();
  const { toast } = useToast();

  // Fetch conjugations on modal open
  React.useEffect(() => {
    if (isOpen && verb && conjugations.length === 0) {
      fetchConjugations();
    }
  }, [isOpen, verb]);

  const fetchConjugations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/conjugate-verb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verb }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setConjugations(data.conjugations || []);
      setSource(data.source || 'unknown');
      
      console.log(`Loaded ${data.conjugations?.length || 0} conjugation forms from ${data.source}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conjugations');
      console.error('Conjugation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveToFlashcards = () => {
    if (conjugations.length === 0) return;

    const translation = strings.languageCode === 'de' 
      ? `Vollständige Konjugation (${conjugations.length} Formen)`
      : `Complete conjugation (${conjugations.length} forms)`;

    addVerbConjugation(verb, translation, conjugations);
    setSavedToFlashcards(true);
    
    toast({
      title: strings.addedToFlashcards || "Added to Flashcards!",
      description: strings.languageCode === 'de'
        ? `Vollständige Konjugation von "${verb}" mit ${conjugations.length} Formen gespeichert.`
        : `Complete conjugation of "${verb}" with ${conjugations.length} forms saved.`,
    });
  };

  // Group conjugations by tense
  const groupedConjugations = conjugations.reduce((acc, form) => {
    const tense = form.tense;
    if (!acc[tense]) {
      acc[tense] = [];
    }
    acc[tense].push(form);
    return acc;
  }, {} as Record<string, ConjugationForm[]>);

  const getTenseIcon = (tense: string) => {
    if (tense.includes('Past') || tense.includes('الماضي')) return Calendar;
    if (tense.includes('Present') || tense.includes('المضارع')) return Users2;
    if (tense.includes('Imperative') || tense.includes('الأمر')) return Zap;
    return Users2;
  };

  const getTenseColor = (tense: string) => {
    if (tense.includes('Past') || tense.includes('الماضي')) return 'text-blue-600 dark:text-blue-400';
    if (tense.includes('Present') || tense.includes('المضارع')) return 'text-green-600 dark:text-green-400';
    if (tense.includes('Imperative') || tense.includes('الأمر')) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Users2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {strings.languageCode === 'de' ? 'Verb-Konjugation' : 'Verb Conjugation'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {verb} {source && `(${source === 'cache' ? 'cached' : source})`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!savedToFlashcards && conjugations.length > 0 && (
              <button
                onClick={saveToFlashcards}
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>{strings.languageCode === 'de' ? 'Speichern' : 'Save'}</span>
              </button>
            )}
            {savedToFlashcards && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
                <BookmarkCheck className="w-4 h-4" />
                <span>{strings.languageCode === 'de' ? 'Gespeichert' : 'Saved'}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {strings.languageCode === 'de' ? 'Konjugationen werden geladen...' : 'Loading conjugations...'}
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchConjugations}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                {strings.languageCode === 'de' ? 'Erneut versuchen' : 'Try Again'}
              </button>
            </div>
          )}

          {conjugations.length > 0 && !loading && (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {strings.languageCode === 'de' 
                    ? `Vollständige Konjugation mit ${conjugations.length} Formen (inklusive Dual)`
                    : `Complete conjugation with ${conjugations.length} forms (including dual)`
                  }
                </p>
              </div>

              {Object.entries(groupedConjugations).map(([tense, forms]) => {
                const TenseIcon = getTenseIcon(tense);
                const tenseColor = getTenseColor(tense);
                
                return (
                  <div key={tense} className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <TenseIcon className={`w-5 h-5 ${tenseColor}`} />
                      <h3 className={`text-lg font-semibold ${tenseColor}`}>
                        {tense}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({forms.length} {strings.languageCode === 'de' ? 'Formen' : 'forms'})
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {forms.map((form, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="text-right mb-2">
                            <span className="text-lg font-arabic text-gray-900 dark:text-white">
                              {form.arabic}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {form.person}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {form.german}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}