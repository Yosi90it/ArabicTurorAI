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
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set());
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const { strings, currentLanguage } = useLanguage();

  const filteredSegments = listeningVideoData.segments.filter(segment => 
    filterDifficulty === 'all' || segment.difficulty === filterDifficulty
  );

  const currentSegment = filteredSegments[currentSegmentIndex];
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
    for (let i = filteredSegments.length - 1; i >= 0; i--) {
      const segmentTime = timeToSeconds(filteredSegments[i].timestamp);
      if (currentTime >= segmentTime) {
        return i;
      }
    }
    return 0;
  };

  // YouTube embed URL with autoplay and controls
  const getYouTubeEmbedUrl = () => {
    const videoId = listeningVideoData.youtubeUrl.split('v=')[1];
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=1&rel=0&modestbranding=1`;
  };

  // Text-to-Speech function
  const playAudio = (text: string, rate: number = playbackRate) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = rate;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
    }
  };

  const pauseAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  };

  const nextSegment = () => {
    if (currentSegmentIndex < filteredSegments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
      setShowTranslation(false);
      
      // Mark current segment as completed
      const newCompleted = new Set(completedSegments);
      newCompleted.add(currentSegmentIndex);
      setCompletedSegments(newCompleted);
      
      updateProgress('listening');
    }
  };

  const prevSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
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
      updateProgress('quiz');
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
    if (currentLanguage === 'de') {
      return currentSegment.german || currentSegment.arabic;
    } else {
      return currentSegment.english || currentSegment.arabic;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner': return currentLanguage === 'de' ? 'Anfänger' : 'Beginner';
      case 'intermediate': return currentLanguage === 'de' ? 'Mittelstufe' : 'Intermediate';
      case 'advanced': return currentLanguage === 'de' ? 'Fortgeschritten' : 'Advanced';
      default: return difficulty;
    }
  };

  if (!currentSegment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-gray-500">
              {currentLanguage === 'de' 
                ? 'Keine Segmente für diese Schwierigkeitsstufe verfügbar.' 
                : 'No segments available for this difficulty level.'}
            </p>
            <Button 
              onClick={() => setFilterDifficulty('all')} 
              className="mt-4"
            >
              {currentLanguage === 'de' ? 'Alle anzeigen' : 'Show All'}
            </Button>
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
          {currentLanguage === 'de' ? 'Video-Hörverständnis-Training' : 'Video Listening Comprehension Training'}
        </h1>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold" dir="rtl">
            {listeningVideoData.title}
          </h2>
          <p className="text-gray-600">
            {currentLanguage === 'de' 
              ? listeningVideoData.descriptionGerman 
              : listeningVideoData.descriptionEnglish}
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {currentLanguage === 'de' ? 'Lern-Einstellungen' : 'Learning Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <span className="text-sm font-medium">
                {currentLanguage === 'de' ? 'Schwierigkeit:' : 'Difficulty:'}
              </span>
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                <Button
                  key={diff}
                  variant={filterDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterDifficulty(diff);
                    setCurrentSegmentIndex(0);
                  }}
                >
                  {diff === 'all' 
                    ? (currentLanguage === 'de' ? 'Alle' : 'All')
                    : getDifficultyLabel(diff)}
                </Button>
              ))}
            </div>

            {/* Playback Speed */}
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">
                {currentLanguage === 'de' ? 'Geschwindigkeit:' : 'Speed:'}
              </span>
              {[0.75, 1.0, 1.25].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlaybackRate(rate)}
                >
                  {rate}x
                </Button>
              ))}
            </div>

            <Button onClick={startQuiz} className="gap-2 ml-auto">
              <Target className="w-4 h-4" />
              {currentLanguage === 'de' ? 'Quiz starten' : 'Start Quiz'}
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
                    {currentLanguage === 'de' ? 'Video-Player' : 'Video Player'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="gap-2"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    {isFullscreen 
                      ? (currentLanguage === 'de' ? 'Verkleinern' : 'Minimize')
                      : (currentLanguage === 'de' ? 'Vollbild' : 'Fullscreen')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    ref={videoRef}
                    src={getYouTubeEmbedUrl()}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Arabic Listening Video"
                  />
                </div>
                
                {/* Video Controls */}
                <div className="mt-4 flex justify-center gap-4">
                  <Button 
                    onClick={() => window.open(listeningVideoData.youtubeUrl, '_blank')}
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {currentLanguage === 'de' ? 'YouTube öffnen' : 'Open in YouTube'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Transcript */}
            <Card className={isFullscreen ? 'hidden' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {currentLanguage === 'de' ? 'Interaktives Transkript' : 'Interactive Transcript'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(currentSegmentIndex + 1) / filteredSegments.length * 100} 
                    className="flex-1" 
                  />
                  <Badge className={getDifficultyColor(currentSegment.difficulty)}>
                    {getDifficultyLabel(currentSegment.difficulty)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {filteredSegments.map((segment, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        index === currentSegmentIndex
                          ? 'bg-blue-100 border-blue-500 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                      }`}
                      onClick={() => setCurrentSegmentIndex(index)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {segment.timestamp}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(segment.difficulty)}`}>
                          {getDifficultyLabel(segment.difficulty)}
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
                            {currentLanguage === 'de' ? segment.german : segment.english}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(segment.arabic);
                          }}
                          className="gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          {currentLanguage === 'de' ? 'Anhören' : 'Listen'}
                        </Button>
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
                      ? (currentLanguage === 'de' ? 'Übersetzungen ausblenden' : 'Hide Translations')
                      : (currentLanguage === 'de' ? 'Übersetzungen anzeigen' : 'Show Translations')}
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
                  <Badge className={getDifficultyColor(currentSegment.difficulty)}>
                    {getDifficultyLabel(currentSegment.difficulty)}
                  </Badge>
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
                  <Button 
                    onClick={() => playAudio(currentSegment.arabic)}
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    {currentLanguage === 'de' ? 'Segment anhören' : 'Listen to Segment'}
                  </Button>
                </div>

                {/* Translation Display */}
                {showTranslation && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg text-gray-700">
                      {getTranslation()}
                    </p>
                  </div>
                )}

                {/* Audio Controls */}
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => playAudio(currentSegment.arabic, 0.75)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    {currentLanguage === 'de' ? 'Langsam' : 'Slow'}
                  </Button>
                  
                  <Button 
                    onClick={() => playAudio(currentSegment.arabic)}
                    className="gap-2"
                    size="lg"
                  >
                    <Play className="w-5 h-5" />
                    {currentLanguage === 'de' ? 'Anhören' : 'Listen'}
                  </Button>
                  
                  <Button 
                    onClick={() => playAudio(currentSegment.arabic, 1.25)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    {currentLanguage === 'de' ? 'Schnell' : 'Fast'}
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button 
                    onClick={prevSegment} 
                    variant="outline" 
                    className="gap-2"
                    disabled={currentSegmentIndex === 0}
                  >
                    <SkipBack className="w-4 h-4" />
                    {currentLanguage === 'de' ? 'Vorheriges Segment' : 'Previous Segment'}
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {currentLanguage === 'de' 
                      ? `Segment ${currentSegmentIndex + 1} von ${filteredSegments.length}`
                      : `Segment ${currentSegmentIndex + 1} of ${filteredSegments.length}`}
                  </div>
                  
                  <Button 
                    onClick={nextSegment} 
                    variant="outline" 
                    className="gap-2"
                    disabled={currentSegmentIndex === filteredSegments.length - 1}
                  >
                    {currentLanguage === 'de' ? 'Nächstes Segment' : 'Next Segment'}
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Quiz Mode */}
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5" />
                {currentLanguage === 'de' ? 'Hörverständnis-Quiz' : 'Listening Comprehension Quiz'}
              </CardTitle>
              <Progress 
                value={(currentQuestionIndex + 1) / videoQuestions.length * 100} 
                className="w-full" 
              />
              <p className="text-sm text-gray-600">
                {currentLanguage === 'de' 
                  ? `Frage ${currentQuestionIndex + 1} von ${videoQuestions.length} | Punkte: ${quizScore}`
                  : `Question ${currentQuestionIndex + 1} of ${videoQuestions.length} | Score: ${quizScore}`}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div className="space-y-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-4">
                    {currentQuestion.timestamp}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-4" dir="rtl">
                    {currentQuestion.question}
                  </h3>
                  <p className="text-gray-600">
                    {currentLanguage === 'de' 
                      ? currentQuestion.questionGerman 
                      : currentQuestion.questionEnglish}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={showAnswer}
                      className={`w-full p-4 text-right border rounded-lg transition-colors ${
                        selectedAnswer === index
                          ? showAnswer
                            ? index === currentQuestion.correctAnswer
                              ? 'bg-green-100 border-green-500 text-green-800'
                              : 'bg-red-100 border-red-500 text-red-800'
                            : 'bg-blue-100 border-blue-500'
                          : showAnswer && index === currentQuestion.correctAnswer
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                      }`}
                      dir="rtl"
                    >
                      <div className="text-lg font-arabic mb-2">
                        {option}
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentLanguage === 'de' 
                          ? currentQuestion.optionsGerman[index]
                          : currentQuestion.optionsEnglish[index]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Controls */}
              <div className="flex justify-center gap-4">
                {!showAnswer ? (
                  <Button 
                    onClick={checkAnswer}
                    disabled={selectedAnswer === null}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {currentLanguage === 'de' ? 'Antwort prüfen' : 'Check Answer'}
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="gap-2">
                    {currentQuestionIndex < videoQuestions.length - 1 
                      ? (currentLanguage === 'de' ? 'Nächste Frage' : 'Next Question')
                      : (currentLanguage === 'de' ? 'Quiz beenden' : 'Finish Quiz')}
                    <SkipForward className="w-4 h-4" />
                  </Button>
                )}
                
                <Button 
                  onClick={() => setShowQuiz(false)}
                  variant="outline"
                  className="gap-2"
                >
                  <SkipBack className="w-4 h-4" />
                  {currentLanguage === 'de' ? 'Zurück zum Training' : 'Back to Training'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}