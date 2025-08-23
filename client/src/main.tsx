import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Service Worker für Push-Benachrichtigungen registrieren
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registriert:', registration);
      })
      .catch((error) => {
        console.log('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
