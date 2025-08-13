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
import { listeningVideoData, type VideoSegment } from "@/data/listeningVideo";
import ClickableText from "@/components/ClickableText";

export default function VideoTrainer() {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<Set<number>>(new Set());
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedSegmentIndex, setHighlightedSegmentIndex] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const videoRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { updateProgress } = useSimpleGamification();
  const { strings, lang } = useLanguage();

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
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.body.appendChild(script);

    // Global callback for YouTube API
    (window as any).onYouTubeIframeAPIReady = () => {
      if (videoRef.current) {
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
            onReady: () => {
              setIsVideoReady(true);
              // Start time tracking
              intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  const currentTime = playerRef.current.getCurrentTime();
                  setVideoCurrentTime(currentTime);
                  
                  // Update highlighted segment based on video time
                  const newSegmentIndex = getCurrentSegmentFromTime(currentTime);
                  if (newSegmentIndex !== highlightedSegmentIndex) {
                    setHighlightedSegmentIndex(newSegmentIndex);
                    setCurrentSegmentIndex(newSegmentIndex);
                    
                    // Auto-scroll to current segment
                    if (transcriptRef.current) {
                      const highlightedElement = transcriptRef.current.querySelector(`[data-segment="${newSegmentIndex}"]`);
                      if (highlightedElement) {
                        highlightedElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }
                  }
                }
              }, 1000);
            },
            onStateChange: (event: any) => {
              // Handle play/pause state changes if needed
            }
          }
        });
      }
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [highlightedSegmentIndex]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {strings.videoTrainer}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {listeningVideoData.description}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {strings.progress}
                </span>
                <Badge variant="secondary">
                  {completedSegments.size}/{segments.length} {strings.segments}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8`}>
            {/* Video Player */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    {strings.videoPlayer}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`relative ${isFullscreen ? 'h-[70vh]' : 'aspect-video'} bg-black`}>
                  <div 
                    ref={videoRef}
                    className="w-full h-full"
                  />
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-300">{strings.loadingVideo}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipBackward}
                      disabled={currentSegmentIndex === 0}
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playPause}
                      disabled={!isVideoReady}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={restartSegment}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipForward}
                      disabled={currentSegmentIndex === segments.length - 1}
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            {!isFullscreen && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {strings.transcript}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={transcriptRef}
                    className="h-[400px] overflow-y-auto pr-2"
                  >
                    <div className="text-right space-y-2">
                      {segments.map((segment, index) => (
                        <span
                          key={index}
                          data-segment={index}
                          className={`inline ${
                            index === highlightedSegmentIndex
                              ? 'bg-blue-200 dark:bg-blue-800 px-1 rounded'
                              : ''
                          }`}
                          onClick={() => jumpToSegment(index)}
                        >
                          <ClickableText 
                            text={segment.arabic}
                            className="text-lg leading-relaxed font-arabic cursor-pointer"
                          />
                          {index < segments.length - 1 && ' '}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Current Segment Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {strings.currentSegment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    {currentSegment?.timestamp}
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {strings.timestamp}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {currentSegmentIndex + 1}/{segments.length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {strings.segmentNumber}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {Math.round(progressPercentage)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {strings.completed}
                  </p>
                </div>
              </div>

              {currentSegment && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-right">
                    <ClickableText 
                      text={currentSegment.arabic}
                      className="text-xl leading-relaxed font-arabic"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}