import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { TashkeelProvider } from "@/contexts/TashkeelContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import AiChat from "@/pages/AiChat";
import Flashcards from "@/pages/Flashcards";
import BookReader from "@/pages/BookReader";
import VideoTrainer from "@/pages/VideoTrainer";
import AlphabetTrainer from "@/pages/AlphabetTrainer";
import Subscription from "@/pages/Subscription";
import WeeklyPlan from "@/pages/WeeklyPlan";
import AdminPanel from "@/pages/AdminPanel";
import AdminLogin from "@/pages/AdminLogin";
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

function Router() {
  return (
    <Switch>
      <Route path="/admin-login">
        <div className="min-h-screen">
          <AdminLogin />
        </div>
      </Route>
      <Route path="*">
        <Layout>
          <Switch>
            <Route path="/" component={AiChat} />
            <Route path="/ai-chat" component={AiChat} />
            <Route path="/flashcards" component={Flashcards} />
            <Route path="/book-reader" component={BookReader} />
            <Route path="/video-trainer" component={VideoTrainer} />
            <Route path="/alphabet-trainer" component={AlphabetTrainer} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/weekly-plan" component={WeeklyPlan} />
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
      <AuthProvider>
        <ContentProvider>
          <FlashcardProvider>
            <TashkeelProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </TashkeelProvider>
          </FlashcardProvider>
        </ContentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
