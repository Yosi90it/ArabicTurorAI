import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import ClickableText from "@/components/ClickableText";
import { useTashkeel } from "@/contexts/TashkeelContext";
import { useContent } from "@/contexts/ContentContext";

export default function VideoTrainer() {
  const { videos } = useContent();
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  const { tashkeelEnabled } = useTashkeel();

  // Video transcript with and without tashkeel
  const transcriptWithTashkeel = "مَرْحَباً بِكُمْ فِي دَرْسِ النُّطْقِ العَرَبِيِّ. سَنَتَعَلَّمُ اليَوْمَ الحُرُوفَ الأَسَاسِيَّةَ";
  const transcriptWithoutTashkeel = "مرحبا بكم في درس النطق العربي. سنتعلم اليوم الحروف الأساسية";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Trainer</h2>
        <p className="text-gray-600">Learn Arabic through interactive video lessons</p>
      </div>

      {/* Video Player */}
      {selectedVideo ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="aspect-video bg-gray-900 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-2xl"
              ></iframe>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-600">Level: {selectedVideo.level}</p>
              </div>
            </div>

            {/* Video transcript */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium mb-2">Video Transcript</h4>
              <div className="text-right" dir="rtl">
                <ClickableText 
                  text={tashkeelEnabled ? transcriptWithTashkeel : transcriptWithoutTashkeel}
                  className="text-lg"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Welcome to the Arabic pronunciation lesson. Today we will learn the basic letters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No videos available. Please add videos in the Admin Panel.</p>
          </CardContent>
        </Card>
      )}

      {/* Video Library */}
      <Card>
        <CardHeader>
          <CardTitle>Video Library ({videos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No videos available. Add YouTube videos in Admin Panel.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`cursor-pointer rounded-xl overflow-hidden transition-all ${
                    selectedVideo?.id === video.id ? "ring-2 ring-purple-500" : "hover:shadow-lg"
                  }`}
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-purple-600 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-medium text-sm mb-1">{video.title}</h3>
                    <p className="text-xs text-gray-500">Level: {video.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
