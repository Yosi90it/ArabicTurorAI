import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'de';

interface LanguageContextType {
  lang: Language;
  strings: Record<string, string>;
  setLanguage: (lang: Language) => void;
}

const translations = {
  en: {
    // Landing Page
    heroTitle: "Master Arabic with Artificial Intelligence",
    heroSubtitle: "Transform your Arabic learning journey with personalized AI tutoring, interactive content, and cultural immersion designed for modern learners.",
    startFree: "Start Learning Free",
    watchDemo: "Watch Demo",
    
    // Auth
    signup: "Sign Up",
    login: "Log In", 
    logout: "Logout",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    welcomeBack: "Welcome Back",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    startTrial: "Start your free trial",
    
    // Language Selection
    selectLanguage: "Select Your Language",
    english: "English",
    deutsch: "Deutsch",
    chooseLanguage: "Choose your preferred language for the interface",
    
    // Learning
    welcomeBackUser: "Welcome back",
    startLearning: "Start Learning",
    continueJourney: "Continue your Arabic learning journey",
    trialActive: "Free trial active!",
    trialExpired: "Free trial expired!",
    hoursRemaining: "hours remaining",
    
    // Navigation
    aiChat: "AI Chat",
    flashcards: "Flashcards", 
    bookReader: "Book Reader",
    videoTrainer: "Video Trainer",
    alphabetTrainer: "Alphabet Trainer",
    weeklyPlan: "7-Day Plan",
    subscription: "Subscription",
    admin: "Admin",
    
    // Features
    aiPoweredLearning: "AI-Powered Learning",
    interactiveReading: "Interactive Reading",
    videoTraining: "Video Training",
    smartFlashcards: "Smart Flashcards",
    culturalContext: "Cultural Context",
    progressTracking: "Progress Tracking",
    
    // Navigation
    features: "Features",
    testimonials: "Testimonials",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    
    // BookReader
    myLibrary: "My Library",
    selectBook: "Please select a book from your library to start reading",
    noBooksAvailable: "No books available. Upload books in Admin Panel.",
    page: "Page",
    of: "of",
    wordByWordTranslation: "Word by Word Translation",
    tashkeelDiacritics: "Tashkeel (Diacritics)",
    addedToFlashcards: "Added to Flashcards",
    wordAdded: "was added to your flashcards",
    
    // Common UI
    loading: "Loading...",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    
    // InterlinearText
    loadingTranslations: "Loading translations...",
    translationsLoaded: "translations loaded",
    
    // Sidebar
    learnArabicWithAI: "Learn Arabic with AI",
    level: "Level",
    points: "Points",
    weeklyGoal: "Weekly Goal",
    toLevel: "to Level",
    
    // GlobalHeader
    loggedOut: "Logged Out",
    loggedOutSuccessfully: "You have been successfully logged out.",
    error: "Error",
    logoutError: "An error occurred during logout.",
    out: "Out",
    
    // ClickableText & WordModal
    translationNotFound: "Translation not found",
    failedToTranslate: "Failed to find word translation",
    addedToFlashcardCollection: "has been added to your flashcard collection.",
    
    // SelectLanguage
    changeLanguageAnytime: "You can change your language preference anytime in the settings."
  },
  de: {
    // Landing Page
    heroTitle: "Arabisch lernen mit künstlicher Intelligenz",
    heroSubtitle: "Transformieren Sie Ihre Arabisch-Lernreise mit personalisiertem KI-Tutoring, interaktiven Inhalten und kultureller Immersion für moderne Lernende.",
    startFree: "Kostenlos lernen",
    watchDemo: "Demo ansehen",
    
    // Auth
    signup: "Registrieren",
    login: "Anmelden",
    logout: "Abmelden", 
    email: "E-Mail-Adresse",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    fullName: "Vollständiger Name",
    welcomeBack: "Willkommen zurück",
    createAccount: "Konto erstellen",
    alreadyHaveAccount: "Haben Sie bereits ein Konto?",
    noAccount: "Haben Sie noch kein Konto?",
    startTrial: "Starten Sie Ihre kostenlose Testversion",
    
    // Language Selection
    selectLanguage: "Wählen Sie Ihre Sprache",
    english: "Englisch",
    deutsch: "Deutsch",
    chooseLanguage: "Wählen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche",
    
    // Learning
    welcomeBackUser: "Willkommen zurück",
    startLearning: "Lernen beginnen",
    continueJourney: "Setzen Sie Ihre Arabisch-Lernreise fort",
    trialActive: "Kostenlose Testversion aktiv!",
    trialExpired: "Kostenlose Testversion abgelaufen!",
    hoursRemaining: "Stunden verbleibend",
    
    // Navigation
    aiChat: "KI-Chat",
    flashcards: "Karteikarten",
    bookReader: "Buchleser", 
    videoTrainer: "Video-Trainer",
    alphabetTrainer: "Alphabet-Trainer",
    weeklyPlan: "7-Tage-Plan",
    subscription: "Abonnement",
    admin: "Admin",
    
    // Features
    aiPoweredLearning: "KI-gestütztes Lernen",
    interactiveReading: "Interaktives Lesen",
    videoTraining: "Video-Training",
    smartFlashcards: "Intelligente Karteikarten",
    culturalContext: "Kultureller Kontext", 
    progressTracking: "Fortschrittsverfolgung",
    
    // Navigation
    features: "Funktionen",
    testimonials: "Bewertungen", 
    pricing: "Preise",
    about: "Über uns",
    contact: "Kontakt",
    
    // BookReader
    myLibrary: "Meine Bibliothek",
    selectBook: "Bitte wählen Sie ein Buch aus Ihrer Bibliothek zum Lesen aus",
    noBooksAvailable: "Keine Bücher verfügbar. Bücher im Admin-Panel hochladen.",
    page: "Seite",
    of: "von",
    wordByWordTranslation: "Wort-für-Wort-Übersetzung",
    tashkeelDiacritics: "Tashkeel (Diakritika)",
    addedToFlashcards: "Zu Karteikarten hinzugefügt",
    wordAdded: "wurde zu Ihren Karteikarten hinzugefügt",
    
    // Common UI
    loading: "Laden...",
    close: "Schließen",
    save: "Speichern", 
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    add: "Hinzufügen",
    
    // InterlinearText
    loadingTranslations: "Übersetzungen werden geladen...",
    translationsLoaded: "Übersetzungen geladen",
    
    // Sidebar
    learnArabicWithAI: "Arabisch lernen mit KI",
    level: "Level",
    points: "Punkte",
    weeklyGoal: "Wöchentliches Ziel",
    toLevel: "bis Level",
    
    // GlobalHeader
    loggedOut: "Abgemeldet",
    loggedOutSuccessfully: "Sie wurden erfolgreich abgemeldet.",
    error: "Fehler",
    logoutError: "Beim Abmelden ist ein Fehler aufgetreten.",
    out: "Aus",
    
    // ClickableText & WordModal
    translationNotFound: "Übersetzung nicht gefunden",
    failedToTranslate: "Wortübersetzung konnte nicht gefunden werden",
    addedToFlashcardCollection: "wurde zu Ihrer Karteikarten-Sammlung hinzugefügt.",
    
    // SelectLanguage
    changeLanguageAnytime: "Sie können Ihre Spracheinstellung jederzeit in den Einstellungen ändern."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'de')) {
      setLang(savedLang);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      strings: translations[lang],
      setLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}