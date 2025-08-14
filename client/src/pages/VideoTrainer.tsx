import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  Pause,
  Volume2,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Languages,
  Clock,
  Target,
  Maximize,
  Minimize,
  Monitor,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { listeningVideoData, type VideoSegment } from "@/data/listeningVideo";
import ClickableText from "@/components/ClickableText";
import { useTashkeel } from "@/contexts/TashkeelContext";

export default function VideoTrainer() {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set());
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedSegmentIndex, setHighlightedSegmentIndex] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [wordByWordEnabled, setWordByWordEnabled] = useState(false);
  const [sentenceTranslationEnabled, setSentenceTranslationEnabled] = useState(true);
  
  const videoRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const { strings, lang } = useLanguage();
  const { tashkeelEnabled, toggleTashkeel, formatText } = useTashkeel();

  const segments = listeningVideoData.segments;
  const currentSegment = segments[currentSegmentIndex];

  // Convert timestamp to seconds
  const timeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':');
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    return minutes * 60 + seconds;
  };

  // Find current segment based on video time
  const getCurrentSegmentFromTime = (currentTime: number): number => {
    for (let i = segments.length - 1; i >= 0; i--) {
      const segmentTime = timeToSeconds(segments[i].timestamp);
      if (currentTime >= segmentTime) {
        return i;
      }
    }
    return 0;
  };

  // Load YouTube API and setup player
  useEffect(() => {
    // Check if YouTube API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      initializePlayer();
    } else {
      // Load YouTube API if not already loaded
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);
      }

      // Global callback for YouTube API
      (window as any).onYouTubeIframeAPIReady = initializePlayer;
    }

    function initializePlayer() {
      if (videoRef.current && (window as any).YT) {
        console.log('Initializing YouTube player...');
        playerRef.current = new (window as any).YT.Player(videoRef.current, {
          height: '100%',
          width: '100%',
          videoId: listeningVideoData.videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            fs: 1,
            cc_load_policy: 0,
            iv_load_policy: 3,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready!');
              setIsVideoReady(true);
              // Start time tracking
              intervalRef.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                  try {
                    const currentTime = playerRef.current.getCurrentTime();
                    setVideoCurrentTime(currentTime);
                    
                    // Update highlighted segment based on video time
                    const newSegmentIndex = getCurrentSegmentFromTime(currentTime);
                    
                    if (newSegmentIndex !== currentSegmentIndex) {
                      console.log(`Switching to segment ${newSegmentIndex} at time ${currentTime}s`);
                      setCurrentSegmentIndex(newSegmentIndex);
                      setHighlightedSegmentIndex(newSegmentIndex);
                    }
                  } catch (error) {
                    console.log('Error getting current time:', error);
                  }
                }
              }, 500);
            },
            onStateChange: (event: any) => {
              console.log('YouTube player state changed:', event.data);
            },
            onError: (event: any) => {
              console.log('YouTube player error:', event.data);
            }
          }
        });
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update segment highlighting when currentSegmentIndex changes
  useEffect(() => {
    if (transcriptRef.current && currentSegmentIndex >= 0) {
      const highlightedElement = transcriptRef.current.querySelector(`[data-segment="${currentSegmentIndex}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentSegmentIndex]);

  const jumpToSegment = (segmentIndex: number) => {
    if (playerRef.current && playerRef.current.seekTo) {
      const targetTime = timeToSeconds(segments[segmentIndex].timestamp);
      playerRef.current.seekTo(targetTime, true);
      setCurrentSegmentIndex(segmentIndex);
      setHighlightedSegmentIndex(segmentIndex);
    }
  };

  const playPause = () => {
    if (playerRef.current) {
      const state = playerRef.current.getPlayerState();
      if (state === 1) { // Playing
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const skipForward = () => {
    if (currentSegmentIndex < segments.length - 1) {
      jumpToSegment(currentSegmentIndex + 1);
    }
  };

  const skipBackward = () => {
    if (currentSegmentIndex > 0) {
      jumpToSegment(currentSegmentIndex - 1);
    }
  };

  const restartSegment = () => {
    jumpToSegment(currentSegmentIndex);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const markSegmentCompleted = (segmentIndex: number) => {
    const newCompleted = new Set(completedSegments);
    newCompleted.add(segmentIndex);
    setCompletedSegments(newCompleted);
    
    // Update gamification progress
    updateProgress('video', 10);
    
    toast({
      title: strings.segmentCompleted,
      description: `${strings.segment} ${segmentIndex + 1} ${strings.completedLowercase}`,
    });
  };

  const progressPercentage = (completedSegments.size / segments.length) * 100;

  return (
    <div className="min-h-screen bg-white py-8">

      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Player */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black">
                  <div 
                    ref={videoRef}
                    className="w-full h-full"
                  />
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">Video wird geladen...</p>
                      </div>
                    </div>
                  )}
                </div>


              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Transcript</CardTitle>
                  <div className="flex items-center gap-4">
                    {/* Tashkeel Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Tashkeel</span>
                      <button
                        onClick={toggleTashkeel}
                        className="flex items-center"
                        title="Tashkeel anzeigen/ausblenden"
                      >
                        {tashkeelEnabled ? (
                          <ToggleRight className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {/* Sentence Translation Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Satz-Übersetzung</span>
                      <button
                        onClick={() => setSentenceTranslationEnabled(!sentenceTranslationEnabled)}
                        className="flex items-center"
                        title="Satz-für-Satz Übersetzung anzeigen/ausblenden"
                      >
                        {sentenceTranslationEnabled ? (
                          <ToggleRight className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {/* Word-by-Word Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Wort-für-Wort</span>
                      <button
                        onClick={() => setWordByWordEnabled(!wordByWordEnabled)}
                        className="flex items-center"
                        title="Wort-für-Wort Übersetzung anzeigen/ausblenden"
                      >
                        {wordByWordEnabled ? (
                          <ToggleRight className="w-5 h-5 text-orange-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  ref={transcriptRef}
                  className="h-[400px] overflow-y-auto pr-2"
                >
                  <div className="text-right space-y-4">
                    {segments.map((segment, index) => (
                      <div
                        key={index}
                        data-segment={index}
                        ref={index === currentSegmentIndex ? (el) => {
                          if (el && transcriptRef.current) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        } : undefined}
                        className={`p-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 space-y-2`}
                        onClick={() => jumpToSegment(index)}
                      >
                        {/* Arabic text */}
                        {wordByWordEnabled ? (
                          <div className="space-y-3">
                            {/* Word-by-word display with translations */}
                            <div className="text-right space-y-2 dir-rtl">
                              {(() => {
                                const arabicWords = formatText(segment.arabic).split(' ');
                                
                                // Erstelle eine intelligentere Wort-zu-Wort-Zuordnung
                                const getWordTranslations = (arabicWords: string[], germanSentence: string) => {
                                  const translations: { [key: string]: string } = {
                                    // Häufige islamische Ausdrücke
                                    'بِسْمِ': 'Im Namen',
                                    'اللهِ': 'Allahs',
                                    'اللَّهِ': 'Allahs',
                                    'وَالْحَمْدُ': 'und Lob',
                                    'لِلَّهِ': 'Allah',
                                    'وَالصَّلَاةُ': 'und Segen',
                                    'وَالسَّلَامُ': 'und Frieden',
                                    'عَلَى': 'auf',
                                    'رَسُولِ': 'Gesandten',
                                    'وَعَلَى': 'und auf',
                                    'آلِهِ': 'Familie',
                                    'وَأَصْحَابِهِ': 'Gefährten',
                                    'أَجْمَعِينَ': 'alle',
                                    'أَمَّا': 'nun',
                                    'بَعْدُ': 'danach',
                                    'السَّلَامُ': 'Friede',
                                    'عَلَيْكُمْ': 'mit euch',
                                    'وَرَحْمَةُ': 'Barmherzigkeit',
                                    'وَبَرَكَاتُهُ': 'Segen',
                                    'أَهْلًا': 'Willkommen',
                                    'وَسَهْلًا': 'herzlich',
                                    'وَمَرْحَبًا': 'willkommen',
                                    'بِكُمْ': 'euch',
                                    'إِخْوَانِي': 'Brüder',
                                    'وَأَخَوَاتِي': 'Schwestern',
                                    'طُلَّابَ': 'Studenten',
                                    'اللُّغَةِ': 'Sprache',
                                    'الْعَرَبِيَّةِ': 'arabischen',
                                    'وَالْيَوْمَ': 'heute',
                                    'أُرِيدُ': 'möchte',
                                    'أَنْ': 'ich',
                                    'أَتَكَلَّمَ': 'sprechen',
                                    'مَعَكُمْ': 'mit euch',
                                    'فِي': 'über',
                                    'مَوْضُوعٍ': 'Thema',
                                    'مُهِمٍّ': 'wichtiges',
                                    'جِدًّا': 'sehr',
                                    'تَعَلُّمِ': 'Erlernen',
                                    'وَهُوَ': 'das ist',
                                    'الِاسْتِمَاعُ': 'Zuhören',
                                    'وَمَا': 'was',
                                    'أَدْرَاكَ': 'wissen',
                                    'مَا': 'was',
                                    'كَمَا': 'wie',
                                    'فَهِمْتُمْ': 'verstanden',
                                    'مِنَ': 'aus',
                                    'الْكَلِمَةِ': 'Wort',
                                    'نَفْسِهَا': 'selbst',
                                    'هُوَ': 'bedeutet',
                                    'تَسْتَمِعَ': 'zuhört',
                                    'إِلَى': 'der',
                                    'فَالِاسْتِمَاعُ': 'Zuhören',
                                    'مَصْدَرُ': 'Verbalnomen',
                                    'اسْتَمَعَ': 'zuhören',
                                    'يَسْتَمِعُ': 'hört zu',
                                    'اسْتِمَاعًا': 'Zuhören',
                                    'يَعْنِي': 'bedeutet',
                                    'تَسْمَعَ': 'hört',
                                    'وَالِاسْتِمَاعُ': 'Zuhören',
                                    'إِحْدَى': 'eine von',
                                    'الْمَهَارَاتِ': 'Fähigkeiten'
                                  };
                                  
                                  return arabicWords.map(word => {
                                    // Entferne Diakritika für bessere Suche
                                    const cleanWord = word.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
                                    return translations[word] || translations[cleanWord] || '';
                                  });
                                };
                                
                                const wordTranslations = getWordTranslations(arabicWords, segment.german || '');
                                
                                return arabicWords.map((arabicWord, wordIndex) => {
                                  const translation = wordTranslations[wordIndex];
                                  
                                  return (
                                    <div key={wordIndex} className="inline-block mx-1 mb-3 text-center">
                                      <div className="mb-1">
                                        <ClickableText 
                                          text={arabicWord}
                                          className={`text-lg font-arabic transition-all duration-300 ease-in-out ${
                                            index === currentSegmentIndex
                                              ? 'font-bold text-green-600 dark:text-green-400'
                                              : 'font-normal text-gray-700 dark:text-gray-300'
                                          }`}
                                        />
                                      </div>
                                      {translation && (
                                        <div className={`text-xs px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 min-w-[40px] ${
                                          index === currentSegmentIndex
                                            ? 'text-orange-800 dark:text-orange-200 font-medium'
                                            : 'text-orange-700 dark:text-orange-300'
                                        }`}>
                                          {translation}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        ) : (
                          <ClickableText 
                            text={formatText(segment.arabic)}
                            className={`text-lg leading-relaxed font-arabic transition-all duration-300 ease-in-out ${
                              index === currentSegmentIndex
                                ? 'font-bold text-green-600 dark:text-green-400'
                                : 'font-normal text-gray-700 dark:text-gray-300'
                            }`}
                          />
                        )}
                        
                        {/* German translation directly below - only show if sentence translation is enabled */}
                        {sentenceTranslationEnabled && segment.german && (
                          <div className={`text-sm leading-relaxed text-left transition-all duration-300 ease-in-out ${
                            index === currentSegmentIndex
                              ? 'font-medium text-blue-600 dark:text-blue-400'
                              : 'font-normal text-gray-500 dark:text-gray-400'
                          }`}>
                            {segment.german}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
}