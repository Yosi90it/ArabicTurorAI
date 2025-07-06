import React, { createContext, useContext, useState, ReactNode } from "react";

interface WordByWordContextType {
  wordByWordEnabled: boolean;
  setWordByWordEnabled: (enabled: boolean) => void;
}

const WordByWordContext = createContext<WordByWordContextType | undefined>(undefined);

export function WordByWordProvider({ children }: { children: ReactNode }) {
  const [wordByWordEnabled, setWordByWordEnabled] = useState(false);

  return (
    <WordByWordContext.Provider value={{ wordByWordEnabled, setWordByWordEnabled }}>
      {children}
    </WordByWordContext.Provider>
  );
}

export function useWordByWord() {
  const context = useContext(WordByWordContext);
  if (context === undefined) {
    throw new Error("useWordByWord must be used within a WordByWordProvider");
  }
  return context;
}