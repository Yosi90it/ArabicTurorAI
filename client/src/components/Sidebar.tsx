import { Link, useLocation } from "wouter";
import { Brain, GraduationCap, BookOpen, Play, Type } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useTashkeel } from "@/contexts/TashkeelContext";

const navigationItems = [
  {
    icon: Brain,
    label: "AI Chat",
    route: "/ai-chat",
    emoji: "🧠"
  },
  {
    icon: GraduationCap,
    label: "Flashcards",
    route: "/flashcards",
    emoji: "🎓"
  },
  {
    icon: BookOpen,
    label: "Book Reader",
    route: "/book-reader",
    emoji: "📘"
  },
  {
    icon: Play,
    label: "Video Trainer",
    route: "/video-trainer",
    emoji: "▶️"
  },
  {
    icon: Type,
    label: "Alphabet Trainer",
    route: "/alphabet-trainer",
    emoji: "🔤"
  },
  {
    icon: Type,
    label: "Subscription",
    route: "/subscription",
    emoji: "🔒"
  },
  {
    icon: Type,
    label: "7-Day Plan",
    route: "/weekly-plan",
    emoji: "📅"
  },
  {
    icon: Type,
    label: "Admin",
    route: "/admin-panel",
    emoji: "🔧"
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { tashkeelEnabled, setTashkeelEnabled } = useTashkeel();

  const isActive = (route: string) => {
    if (route === "/ai-chat" && location === "/") return true;
    return location === route;
  };

  return (
    <aside className="w-64 bg-primary-purple text-white shadow-lg flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-bold">ArabicAI</h1>
        <p className="text-hover-lavender text-sm mt-1">Learn Arabic with AI</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link key={item.route} href={item.route}>
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 ${
                isActive(item.route)
                  ? "bg-active-purple shadow-lg"
                  : "hover:bg-white/20 hover:shadow-md"
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          </Link>
        ))}
      </nav>

      {/* Tashkeel Toggle */}
      <div className="p-4 border-t border-white/20">
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Tashkeel</span>
              <p className="text-xs text-hover-lavender">Arabic diacritics</p>
            </div>
            <Switch 
              checked={tashkeelEnabled}
              onCheckedChange={setTashkeelEnabled}
            />
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4 border-t border-white/20">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-xs text-hover-lavender">25%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="progress-gradient h-2 rounded-full transition-all duration-300" 
              style={{ width: "25%" }}
            ></div>
          </div>
          <p className="text-xs text-hover-lavender">Beginner – Level A1</p>
        </div>
      </div>
    </aside>
  );
}
