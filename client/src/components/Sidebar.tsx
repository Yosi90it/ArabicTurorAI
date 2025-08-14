import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  Video, 
  Languages, 
  Settings,
  Trophy,
  Target,
  FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useTashkeel } from "@/contexts/TashkeelContext";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSimpleGamification } from "@/contexts/SimpleGamificationContext";

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
    icon: Target,
    label: "Daily Challenge",
    route: "/daily-challenge"
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
  const { stats, getCurrentLevelProgress, getNextLevelPoints } = useSimpleGamification();



  const isActive = (route: string) => {
    if (route === "/ai-chat" && location === "/") return true;
    return location === route;
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">ع</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ArabLearn</h1>
            <p className="text-gray-600 text-sm">Arabisch Lernen</p>
          </div>
        </div>
      </div>

      {/* Learning Areas Label */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">LERNBEREICHE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide">
        {/* Dashboard Link */}
        <Link href="/learn">
          <div
            onClick={onLinkClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/learn")
                ? "bg-green-100 text-green-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Trophy size={18} />
            <span className="font-medium">Dashboard</span>
          </div>
        </Link>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          const germanLabel = item.label === "AI Chat" ? "KI Chat" : 
                             item.label === "Book Reader" ? "Bücher" :
                             item.label === "Video Trainer" ? "Videos" :
                             item.label === "Alphabet Trainer" ? "Alphabet" :
                             item.label === "Daily Challenge" ? "Tägliche Herausforderung" :
                             item.label === "Flashcards" ? "Flashcards" :
                             item.label === "Erfolge" ? "Erfolge" : item.label;
          
          return (
            <Link key={item.route} href={item.route}>
              <div
                onClick={onLinkClick}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive(item.route)
                    ? `${
                        item.route === "/ai-chat" ? "bg-purple-100 text-purple-700" :
                        item.route === "/book-reader" ? "bg-blue-100 text-blue-700" :
                        item.route === "/video-trainer" ? "bg-green-100 text-green-700" :
                        item.route === "/flashcards" ? "bg-purple-100 text-purple-700" :
                        item.route === "/alphabet-trainer" ? "bg-orange-100 text-orange-700" :
                        item.route === "/daily-challenge" ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      }`
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{germanLabel}</span>
              </div>
            </Link>
          );
        })}

        {/* Admin Panel - only show for admins */}
        {isAdmin && (
          <Link href="/admin-panel">
            <div
              onClick={onLinkClick}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive("/admin-panel")
                  ? "bg-gray-100 text-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={18} />
              <span className="font-medium">Admin</span>
            </div>
          </Link>
        )}

        {/* Weekly Plan */}
        <Link href="/weekly-plan">
          <div
            onClick={onLinkClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive("/weekly-plan")
                ? "bg-gray-100 text-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={18} />
            <span className="font-medium">{strings.weeklyPlan}</span>
          </div>
        </Link>
      </nav>

      {/* User Status */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">L</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Lernender</p>
              <p className="text-xs text-gray-600">Auf dem Weg zur Meisterschaft</p>
            </div>
          </div>

          {/* Tashkeel Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 text-sm font-medium">
              {strings.showTashkeel}
            </span>
            <Switch
              checked={tashkeelEnabled}
              onCheckedChange={setTashkeelEnabled}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs">{strings.level} {stats.level}</span>
              <span className="text-gray-600 text-xs">
                {getCurrentLevelProgress()}/{getNextLevelPoints()} XP
              </span>
            </div>
            
            <Progress 
              value={(getCurrentLevelProgress() / getNextLevelPoints()) * 100} 
              className="h-2 bg-gray-200"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.points} {strings.totalPoints}</span>
              <span>{stats.streak} {strings.dayStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
