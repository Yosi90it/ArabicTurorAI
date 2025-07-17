import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  Video, 
  Languages, 
  Calendar,
  Settings,
  Trophy
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useTashkeel } from "@/contexts/TashkeelContext";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGamification } from "@/contexts/GamificationContext";

const navigationItems = [
  {
    icon: Sparkles,
    label: "AI Chat",
    route: "/ai-chat"
  },
  {
    icon: Brain,
    label: "Flashcards",
    route: "/flashcards"
  },
  {
    icon: BookOpen,
    label: "Book Reader",
    route: "/book-reader"
  },
  {
    icon: Video,
    label: "Video Trainer",
    route: "/video-trainer"
  },
  {
    icon: Languages,
    label: "Alphabet Trainer",
    route: "/alphabet-trainer"
  },
  {
    icon: Calendar,
    label: "7-Day Plan",
    route: "/weekly-plan"
  },
  {
    icon: Trophy,
    label: "Erfolge",
    route: "/gamification"
  }
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick = () => {} }: SidebarProps) {
  const [location] = useLocation();
  const { tashkeelEnabled, setTashkeelEnabled } = useTashkeel();
  const { isAdmin, isAuthenticated } = useAuth();
  const { strings } = useLanguage();
  const { stats, getCurrentLevelProgress, getNextLevelPoints } = useGamification();



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
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          </Link>
        ))}
        
        {/* Admin Link - Only show if logged in as admin */}
        {isAdmin && (
          <Link href="/admin-panel">
            <button
              className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all duration-200 ${
                isActive("/admin-panel")
                  ? "bg-active-purple shadow-lg"
                  : "hover:bg-white/20 hover:shadow-md"
              }`}
            >
              <span className="text-xl">🔧</span>
              <span className="font-medium">Admin</span>
            </button>
          </Link>
        )}
      </nav>

      {/* Gamification Widget */}
      {isAuthenticated && (
        <div className="p-4 border-t border-white/20">
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium">Level {stats.level}</span>
                <p className="text-xs text-hover-lavender">{stats.totalPoints} Punkte</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-hover-lavender">🔥 {stats.currentStreak}</span>
              </div>
            </div>
            <Progress 
              value={getCurrentLevelProgress()} 
              className="h-2 bg-white/20"
            />
            <p className="text-xs text-hover-lavender mt-1">
              {getNextLevelPoints() - stats.totalPoints} bis Level {stats.level + 1}
            </p>
          </div>
        </div>
      )}

      {/* Tashkeel Toggle */}
      <div className="p-4 border-t border-white/20">
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-medium">Tashkeel</span>
              <p className="text-xs text-hover-lavender">Arabic diacritics</p>
            </div>
            <Switch 
              checked={tashkeelEnabled}
              onCheckedChange={setTashkeelEnabled}
              className="data-[state=checked]:bg-active-purple"
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
