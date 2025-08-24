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
  },
  {
    icon: Settings,
    label: "Einstellungen",
    route: "/settings"
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
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg drop-shadow-sm">ع</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ArabLearn</h1>
            <p className="text-amber-700 text-sm font-medium">Arabisch Lernen</p>
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
      <div className="flex-1 relative">
        <nav className="h-full px-3 space-y-2 overflow-y-auto pb-4 custom-scrollbar" style={{scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb #f9fafb'}}>
          {/* Dashboard Link */}
        <Link href="/learn">
          <div
            onClick={onLinkClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              isActive("/learn")
                ? "bg-emerald-100 text-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Trophy size={20} className="drop-shadow-sm text-emerald-600" />
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

          // Definiere Farben für jedes Icon (nur Icons, nicht Text)
          const getIconColor = (route: string) => {
            const iconColors: { [key: string]: string } = {
              "/ai-chat": "text-purple-600",
              "/book-reader": "text-blue-600",
              "/video-trainer": "text-green-600", 
              "/flashcards": "text-indigo-600",
              "/alphabet-trainer": "text-orange-600",
              "/daily-challenge": "text-teal-600",
              "/gamification": "text-yellow-600",
              "/settings": "text-gray-600"
            };
            
            return iconColors[route] || "text-gray-600";
          };

          const getContainerStyle = (route: string, isActive: boolean) => {
            if (isActive) {
              const activeStyles: { [key: string]: string } = {
                "/ai-chat": "bg-purple-100 text-gray-700",
                "/book-reader": "bg-blue-100 text-gray-700",
                "/video-trainer": "bg-green-100 text-gray-700",
                "/flashcards": "bg-indigo-100 text-gray-700",
                "/alphabet-trainer": "bg-orange-100 text-gray-700",
                "/daily-challenge": "bg-teal-100 text-gray-700",
                "/gamification": "bg-yellow-100 text-gray-700",
                "/settings": "bg-gray-100 text-gray-700"
              };
              return activeStyles[route] || "bg-gray-100 text-gray-700";
            }
            return "text-gray-700 hover:bg-gray-100";
          };
          
          return (
            <Link key={item.route} href={item.route}>
              <div
                onClick={onLinkClick}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  getContainerStyle(item.route, isActive(item.route))
                }`}
              >
                <Icon 
                  size={20} 
                  className={`drop-shadow-sm ${getIconColor(item.route)}`}
                />
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
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                isActive("/admin-panel")
                  ? "bg-red-100 text-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={20} className="drop-shadow-sm text-red-600" />
              <span className="font-medium">Admin</span>
            </div>
          </Link>
        )}

        {/* Weekly Plan */}
        <Link href="/weekly-plan">
          <div
            onClick={onLinkClick}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
              isActive("/weekly-plan")
                ? "bg-pink-100 text-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={20} className="drop-shadow-sm text-pink-600" />
            <span className="font-medium">{strings.weeklyPlan}</span>
          </div>
        </Link>
        </nav>
        
        {/* Scroll Indicators */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-10"></div>
        
        {/* Scroll hint dots */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 pointer-events-none z-20">
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-40"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-20"></div>
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col gap-1 pointer-events-none z-20">
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-20"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-40"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
        </div>
      </div>

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
              <span>{stats.totalPoints || 0} {strings.totalPoints}</span>
              <span>{stats.currentStreak || 0} {strings.dayStreak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
