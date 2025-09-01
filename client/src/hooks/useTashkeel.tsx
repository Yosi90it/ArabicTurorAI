import { useState, useEffect } from 'react';

export function useTashkeel() {
  const [showTashkeel, setShowTashkeel] = useState(() => {
    const saved = localStorage.getItem('showTashkeel');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('showTashkeel', JSON.stringify(showTashkeel));
  }, [showTashkeel]);

  const toggleTashkeel = () => setShowTashkeel(!showTashkeel);

  const removeTashkeel = (text: string) => {
    if (showTashkeel) return text;
    // Remove Arabic diacritics/tashkeel
    return text.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
  };

  return { showTashkeel, toggleTashkeel, removeTashkeel };
}