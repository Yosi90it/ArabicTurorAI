import { useSimpleGamification } from '@/contexts/SimpleGamificationContext';
import { useToast } from '@/hooks/use-toast';

// Custom hook for integrating gamification into existing components
export function useGamificationActions() {
  const { updateProgress } = useSimpleGamification();
  const { toast } = useToast();

  const onWordAdded = () => {
    updateProgress('word');
    toast({
      title: "🌟 Neues Wort gelernt!",
      description: "+5 Punkte für deine Sammlung!"
    });
  };

  const onBookCompleted = () => {
    updateProgress('book');
    toast({
      title: "📚 Buch abgeschlossen!",
      description: "+100 Punkte! Fantastische Leistung!"
    });
  };

  const onVideoCompleted = () => {
    updateProgress('video');
    toast({
      title: "🎥 Video beendet!",
      description: "+75 Punkte für das Videotraining!"
    });
  };

  const onChatMessage = () => {
    updateProgress('chat');
    toast({
      title: "💬 Chat-Nachricht",
      description: "+10 Punkte für die Konversation!"
    });
  };

  return {
    onWordAdded,
    onBookCompleted,
    onVideoCompleted,
    onChatMessage
  };
}