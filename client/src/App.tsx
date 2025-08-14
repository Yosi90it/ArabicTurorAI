import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { TashkeelProvider } from "@/contexts/TashkeelContext";
import { WordByWordProvider } from "@/contexts/WordByWordContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TrialProvider } from "@/contexts/TrialContext";
import { SimpleGamificationProvider } from "@/contexts/SimpleGamificationContext";
import Layout from "@/components/Layout";
import AiChat from "@/pages/AiChat";
import Flashcards from "@/pages/Flashcards";
import BookReader from "@/pages/BookReader";

import VideoTrainer from "@/pages/VideoTrainer";
import AlphabetTrainer from "@/pages/AlphabetTrainer";
import DailyChallenge from "@/pages/DailyChallenge";
import SimpleGoalTracker from "@/components/SimpleGoalTracker";
import WeeklyPlan from "@/pages/WeeklyPlan";

import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
import LandingPage from "@/pages/LandingPage";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Learn from "@/pages/Learn";
import SelectLanguage from "@/pages/SelectLanguage";
import TrialExpiredBanner from "@/components/TrialExpiredBanner";
import GlobalHeader from "@/components/GlobalHeader";
import NotFound from "@/pages/not-found";

function ProtectedAdminRoute() {
  const { isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  
  if (!isAdmin) {
    setLocation('/admin-login');
    return null;
  }
  
  return <AdminPanel />;
}

function ProtectedLearningRoute() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Check if language is selected
  const hasLanguage = localStorage.getItem('language');
  if (!hasLanguage) {
    setLocation('/select-language');
    return null;
  }

  return <Learn />;
}

function Router() {
  return (
    <Switch>
      {/* Landing page without layout */}
      <Route path="/" component={LandingPage} />
      
      {/* Auth pages without layout */}
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/select-language" component={SelectLanguage} />
      <Route path="/admin-login">
        <div className="min-h-screen">
          <AdminLogin />
        </div>
      </Route>
      
      {/* Protected learning routes with layout */}
      <Route path="/learn">
        <Layout>
          <ProtectedLearningRoute />
        </Layout>
      </Route>
      
      {/* All other routes with layout */}
      <Route path="*">
        <Layout>
          <Switch>
            <Route path="/ai-chat" component={AiChat} />
            <Route path="/flashcards" component={Flashcards} />
            <Route path="/book-reader" component={BookReader} />

            <Route path="/video-trainer" component={VideoTrainer} />
            <Route path="/alphabet-trainer" component={AlphabetTrainer} />
            <Route path="/daily-challenge" component={DailyChallenge} />
            <Route path="/weekly-plan" component={WeeklyPlan} />
            <Route path="/gamification" component={SimpleGoalTracker} />
            <Route path="/admin-panel" component={ProtectedAdminRoute} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TrialProvider>
          <AuthProvider>
            <SimpleGamificationProvider>
              <ContentProvider>
                <FlashcardProvider>
                  <TashkeelProvider>
                    <WordByWordProvider>
                      <TooltipProvider>
                      <GlobalHeader />
                      <Toaster />
                      <Router />
                      </TooltipProvider>
                    </WordByWordProvider>
                  </TashkeelProvider>
                </FlashcardProvider>
              </ContentProvider>
            </SimpleGamificationProvider>
          </AuthProvider>
        </TrialProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
