import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { TashkeelProvider } from "@/contexts/TashkeelContext";
import Layout from "@/components/Layout";
import AiChat from "@/pages/AiChat";
import Flashcards from "@/pages/Flashcards";
import BookReader from "@/pages/BookReader";
import VideoTrainer from "@/pages/VideoTrainer";
import AlphabetTrainer from "@/pages/AlphabetTrainer";
import Subscription from "@/pages/Subscription";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={AiChat} />
        <Route path="/ai-chat" component={AiChat} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/book-reader" component={BookReader} />
        <Route path="/video-trainer" component={VideoTrainer} />
        <Route path="/alphabet-trainer" component={AlphabetTrainer} />
        <Route path="/subscription" component={Subscription} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FlashcardProvider>
        <TashkeelProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </TashkeelProvider>
      </FlashcardProvider>
    </QueryClientProvider>
  );
}

export default App;
