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
                if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                  try {
                    const currentTime = playerRef.current.getCurrentTime();
                    setVideoCurrentTime(currentTime);
                    
                    // Update highlighted segment based on video time
                    const newSegmentIndex = getCurrentSegmentFromTime(currentTime);
                    console.log(`Video time: ${currentTime}s, Segment: ${newSegmentIndex}, Current: ${currentSegmentIndex}`);
                    
                    if (newSegmentIndex !== currentSegmentIndex) {
                      console.log(`Switching to segment ${newSegmentIndex} at time ${currentTime}s`);
                      setCurrentSegmentIndex(newSegmentIndex);
                      setHighlightedSegmentIndex(newSegmentIndex);
                    }
                  } catch (error) {
                    console.log('Error getting current time:', error);
                  }
                }
              }, 500); // Check more frequently for better sync
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
              <CardContent>
                <div 
                  ref={transcriptRef}
                  className="h-[400px] overflow-y-auto pr-2"
                >
                  <div className="text-right space-y-2">
                    {segments.map((segment, index) => (
                      <div
                        key={index}
                        data-segment={index}
                        ref={index === currentSegmentIndex ? (el) => {
                          if (el && transcriptRef.current) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        } : undefined}
                        className={`p-1 rounded transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800`}
                        onClick={() => jumpToSegment(index)}
                      >
                        <ClickableText 
                          text={segment.arabic}
                          className={`leading-relaxed font-arabic transition-all duration-300 ${
                            index === currentSegmentIndex
                              ? 'text-xl font-bold text-blue-600 dark:text-blue-400'
                              : 'text-lg font-normal'
                          }`}
                        />
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