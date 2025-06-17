import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import ClickableText from "@/components/ClickableText";

interface VideoCategory {
  title: string;
  description: string;
  icon: string;
}

const videoCategories: VideoCategory[] = [
  { title: "Pronunciation", description: "Master Arabic sounds", icon: "🎯" },
  { title: "Writing System", description: "Learn Arabic script", icon: "📝" },
  { title: "Conversation", description: "Practice dialogues", icon: "🗣️" }
];

export default function VideoTrainer() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Trainer</h2>
        <p className="text-gray-600">Learn Arabic through interactive video lessons</p>
      </div>

      {/* Video Player Mock */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            className="aspect-video bg-gray-900 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=675')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <Button className="w-16 h-16 bg-white/90 hover:bg-white transition-colors shadow-lg rounded-full">
              <Play className="h-6 w-6 text-primary-purple ml-1" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle className="text-base">Arabic Pronunciation Basics</CardTitle>
              <p className="text-sm text-gray-600">Learn the Arabic alphabet sounds</p>
            </div>
            <div className="text-sm text-gray-500">12:34 / 25:67</div>
          </div>
          
          {/* Video Transcript */}
          <div className="bg-soft-gray rounded-xl p-4">
            <h4 className="text-sm font-medium mb-2">Video Transcript:</h4>
            <div className="text-sm leading-relaxed text-right" dir="rtl">
              <ClickableText 
                text="مرحبا بكم في درس النطق العربي. سنتعلم اليوم الحروف الأساسية"
                className=""
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Welcome to the Arabic pronunciation lesson. Today we will learn the basic letters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="aspect-video bg-soft-gray rounded-xl mb-3 flex items-center justify-center">
                <span className="text-2xl">{category.icon}</span>
              </div>
              <CardTitle className="text-base mb-1">{category.title}</CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
