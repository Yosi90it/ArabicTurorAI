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
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { listeningVideoData, videoQuestions, type VideoSegment } from "@/data/listeningVideo";
import ClickableText from "@/components/ClickableText";

export default function VideoTrainer() {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set());
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedSegmentIndex, setHighlightedSegmentIndex] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const videoRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const { strings, lang } = useLanguage();

  const segments = listeningVideoData.segments;
  const currentSegment = segments[currentSegmentIndex];
  const currentQuestion = videoQuestions[currentQuestionIndex];

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
    const loadYouTubeAPI = () => {
      if ((window as any).YT) {
        initializePlayer();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.onload = () => {
        (window as any).onYouTubeIframeAPIReady = initializePlayer;
      };
      document.body.appendChild(script);
    };

    const initializePlayer = () => {
      if (!videoRef.current) return;
      
      const videoId = listeningVideoData.youtubeUrl.split('v=')[1]?.split('&')[0];
      
      // Create a unique div for the player
      const playerId = 'youtube-player-' + Math.random().toString(36).substr(2, 9);
      videoRef.current.innerHTML = `<div id="${playerId}"></div>`;
      
      playerRef.current = new (window as any).YT.Player(playerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'autoplay': 0,
          'controls': 1,
          'rel': 0,
          'modestbranding': 1,
          'enablejsapi': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };

    const onPlayerReady = (event: any) => {
      setIsVideoReady(true);
      // Start tracking video time
      trackVideoTime();
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === (window as any).YT.PlayerState.PLAYING) {
        trackVideoTime();
      } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    const trackVideoTime = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          setVideoCurrentTime(currentTime);
          
          const newSegmentIndex = getCurrentSegmentFromTime(currentTime);
          if (newSegmentIndex !== highlightedSegmentIndex) {
            setHighlightedSegmentIndex(newSegmentIndex);
            setCurrentSegmentIndex(newSegmentIndex);
          }
        }
      }, 500); // Check every 500ms for smoother updates
    };

    loadYouTubeAPI();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Jump to specific time when segment is clicked
  const jumpToSegment = (segmentIndex: number) => {
    setCurrentSegmentIndex(segmentIndex);
    
    if (playerRef.current && playerRef.current.seekTo) {
      const timestamp = segments[segmentIndex].timestamp;
      const seconds = timeToSeconds(timestamp);
      playerRef.current.seekTo(seconds, true);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const nextSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
      setShowTranslation(false);
      
      // Mark current segment as completed
      const newCompleted = new Set(completedSegments);
      newCompleted.add(currentSegmentIndex);
      setCompletedSegments(newCompleted);
      
      updateProgress('video');
    }
  };

  const prevSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
      setShowTranslation(false);
    }
  };

  const startQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowAnswer(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      updateProgress('video');
      toast({
        title: "Richtig! ✅",
        description: "Gut gemacht!",
      });
    } else {
      toast({
        title: "Leider falsch ❌", 
        description: "Versuchen Sie es nochmal!",
        variant: "destructive"
      });
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < videoQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      // Quiz completed
      toast({
        title: "Quiz abgeschlossen! 🎉",
        description: `Sie haben ${quizScore} von ${videoQuestions.length} Fragen richtig beantwortet!`,
      });
      setShowQuiz(false);
    }
  };

  const getTranslation = () => {
    return lang === 'de' ? currentSegment.german : currentSegment.english;
  };

  if (!currentSegment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-gray-500">
              {lang === 'de' 
                ? 'Keine Segmente verfügbar.' 
                : 'No segments available.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {lang === 'de' ? 'Video-Hörverständnis-Training' : 'Video Listening Comprehension Training'}
        </h1>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold" dir="rtl">
            {listeningVideoData.title}
          </h2>
          <p className="text-gray-600">
            {lang === 'de' 
              ? listeningVideoData.descriptionGerman 
              : listeningVideoData.descriptionEnglish}
          </p>
        </div>
      </div>

      {/* Quiz Button */}
      <Card className="mx-auto max-w-4xl">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Button 
              onClick={startQuiz}
              className="gap-2"
              size="lg"
            >
              <Target className="w-4 h-4" />
              {lang === 'de' ? 'Quiz starten' : 'Start Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!showQuiz ? (
        <>
          {/* Video and Transcript Layout */}
          <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
            {/* Video Player */}
            <Card className={isFullscreen ? 'col-span-full' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    {lang === 'de' ? 'Video-Player' : 'Video Player'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="gap-2"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    {isFullscreen 
                      ? (lang === 'de' ? 'Verkleinern' : 'Minimize')
                      : (lang === 'de' ? 'Vollbild' : 'Fullscreen')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <div
                    ref={videoRef}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    style={{ backgroundColor: '#000' }}
                  />
                </div>
                
                {/* Video Time Display */}
                {isVideoReady && (
                  <div className="mt-2 text-center text-sm text-gray-600">
                    {lang === 'de' ? 'Video-Zeit:' : 'Video Time:'} {formatTime(videoCurrentTime)}
                  </div>
                )}
                
                {/* Video Controls */}
                <div className="mt-4 flex justify-center gap-4">
                  <Button 
                    onClick={() => window.open(listeningVideoData.youtubeUrl, '_blank')}
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {lang === 'de' ? 'YouTube öffnen' : 'Open in YouTube'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Transcript */}
            <Card className={isFullscreen ? 'hidden' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {lang === 'de' ? 'Interaktives Transkript' : 'Interactive Transcript'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(currentSegmentIndex + 1) / segments.length * 100} 
                    className="flex-1" 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {segments.map((segment, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        index === highlightedSegmentIndex
                          ? 'bg-blue-100 border-blue-500 shadow-md ring-2 ring-blue-300'
                          : index === currentSegmentIndex
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                      }`}
                      onClick={() => jumpToSegment(index)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {segment.timestamp}
                        </Badge>
                        {completedSegments.has(index) && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-lg font-arabic leading-relaxed" dir="rtl">
                          <ClickableText text={segment.arabic} />
                        </div>
                        
                        {showTranslation && (
                          <p className="text-sm text-gray-600">
                            {lang === 'de' ? segment.german : segment.english}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Translation Toggle */}
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => setShowTranslation(!showTranslation)}
                    variant="outline"
                    className="gap-2 w-full"
                  >
                    <Languages className="w-4 h-4" />
                    {showTranslation 
                      ? (lang === 'de' ? 'Übersetzungen ausblenden' : 'Hide Translations')
                      : (lang === 'de' ? 'Übersetzungen anzeigen' : 'Show Translations')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Segment Display */}
          {!isFullscreen && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  {currentSegment.timestamp}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Large Arabic Display */}
                <div className="text-center">
                  <div 
                    className="text-2xl md:text-3xl font-arabic leading-relaxed p-6 bg-blue-50 rounded-lg transition-colors"
                    dir="rtl"
                  >
                    <ClickableText text={currentSegment.arabic} />
                  </div>
                </div>

                {/* Translation Display */}
                {showTranslation && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-700">
                      {getTranslation()}
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={prevSegment} 
                    variant="outline" 
                    className="gap-2"
                    disabled={currentSegmentIndex === 0}
                  >
                    <SkipBack className="w-4 h-4" />
                    {lang === 'de' ? 'Vorheriges Segment' : 'Previous Segment'}
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {lang === 'de' 
                      ? `Segment ${currentSegmentIndex + 1} von ${segments.length}`
                      : `Segment ${currentSegmentIndex + 1} of ${segments.length}`}
                  </div>
                  
                  <Button 
                    onClick={nextSegment} 
                    variant="outline" 
                    className="gap-2"
                    disabled={currentSegmentIndex === segments.length - 1}
                  >
                    {lang === 'de' ? 'Nächstes Segment' : 'Next Segment'}
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Quiz Section */
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-center">
              {lang === 'de' ? 'Hörverständnis-Quiz' : 'Listening Comprehension Quiz'}
            </CardTitle>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {lang === 'de' 
                  ? `Frage ${currentQuestionIndex + 1} von ${videoQuestions.length}`
                  : `Question ${currentQuestionIndex + 1} of ${videoQuestions.length}`}
              </Badge>
              <Badge variant="secondary">
                {lang === 'de' ? `Punkte: ${quizScore}` : `Score: ${quizScore}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4" dir="rtl">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? "default" : "outline"}
                    className="w-full text-left justify-start p-4 h-auto"
                    onClick={() => selectAnswer(index)}
                    disabled={showAnswer}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    {lang === 'de' ? option.german : option.english}
                  </Button>
                ))}
              </div>
              
              {selectedAnswer !== null && !showAnswer && (
                <Button onClick={checkAnswer} className="mt-4" size="lg">
                  {lang === 'de' ? 'Antwort prüfen' : 'Check Answer'}
                </Button>
              )}
              
              {showAnswer && (
                <div className="mt-4 space-y-3">
                  <div className={`p-4 rounded-lg ${
                    selectedAnswer === currentQuestion.correctAnswer 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? '✅ Richtig!' : '❌ Falsch!'}
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold mb-2">
                      {lang === 'de' ? 'Richtige Antwort:' : 'Correct Answer:'}
                    </p>
                    <p>
                      {lang === 'de' 
                        ? currentQuestion.options[currentQuestion.correctAnswer].german
                        : currentQuestion.options[currentQuestion.correctAnswer].english}
                    </p>
                  </div>
                  
                  <Button onClick={nextQuestion} size="lg">
                    {currentQuestionIndex < videoQuestions.length - 1 
                      ? (lang === 'de' ? 'Nächste Frage' : 'Next Question')
                      : (lang === 'de' ? 'Quiz beenden' : 'Finish Quiz')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}