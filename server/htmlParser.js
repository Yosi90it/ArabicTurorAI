const fs = require('fs');
const path = require('path');

// Parst die HTML-Datei und extrahiert alle Seiten mit Titeln und Wörtern
function parseQiratuRashidaHTML() {
  try {
    const htmlPath = path.join(__dirname, '..', 'qiraatu-rashida-original.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const pages = [];
    
    // Verwende einfaches String-Splitting und direktes Parsing
    const pageMarkers = [];
    let index = 0;
    
    // Finde alle <div class="page"> Positionen
    while ((index = htmlContent.indexOf('<div class="page"', index)) !== -1) {
      pageMarkers.push(index);
      index += 17; // Länge von '<div class="page"'
    }
    
    console.log(`Found ${pageMarkers.length} page markers`);
    
    for (let i = 0; i < pageMarkers.length; i++) {
      const startPos = pageMarkers[i];
      const endPos = i < pageMarkers.length - 1 ? pageMarkers[i + 1] : htmlContent.length;
      
      if (endPos <= startPos) continue;
      
      let pageSection = htmlContent.substring(startPos, endPos);
      
      // Entferne den <div class="page"> Tag am Anfang
      pageSection = pageSection.replace(/^<div class="page"[^>]*>/, '');
      
      // Entferne schließende </div> Tags am Ende
      pageSection = pageSection.replace(/<\/div>\s*$/, '').trim();
      
      // Titel extrahieren (h1 oder h2 Element)
      const titleRegex = /<h[12][^>]*>(.*?)<\/h[12]>/s;
      const titleMatch = pageSection.match(titleRegex);
      
      let title = `الصفحة ${i + 1}`;
      if (titleMatch) {
        // Extrahiere Text aus span class="word" Elementen im Titel  
        const titleWords = extractWordsFromHTML(titleMatch[1]);
        if (titleWords.length > 0) {
          title = titleWords.join(' ');
        }
      }
      
      // Alle Paragraphen extrahieren
      const paragraphs = [];
      const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
      let paragraphMatch;
      
      while ((paragraphMatch = paragraphRegex.exec(pageSection)) !== null) {
        const paragraphContent = paragraphMatch[1];
        const words = extractWordsFromHTML(paragraphContent);
        
        if (words.length > 0) {
          paragraphs.push({
            words: words,
            maxWordsPerLine: getOptimalWordsPerLine(words.length)
          });
        }
      }
      
      // Immer eine Seite hinzufügen, auch wenn sie leer ist
      pages.push({
        number: i + 1,
        title: title,
        paragraphs: paragraphs.length > 0 ? paragraphs : [{
          words: ['Leere Seite'],
          maxWordsPerLine: 2
        }]
      });
      
      console.log(`Processed page ${i + 1}: ${title} with ${paragraphs.length} paragraphs`);
    }
    
    return pages;
  } catch (error) {
    console.error('Fehler beim Parsen der HTML-Datei:', error);
    return [];
  }
}

// Extrahiert Wörter aus HTML mit span class="word" Elementen
function extractWordsFromHTML(htmlContent) {
  const words = [];
  const wordRegex = /<span class="word">([^<]*)<\/span>/g;
  let wordMatch;
  
  while ((wordMatch = wordRegex.exec(htmlContent)) !== null) {
    const word = wordMatch[1].trim();
    if (word) {
      words.push(word);
    }
  }
  
  return words;
}

// Bestimmt optimale Wörter pro Zeile basierend auf Textlänge
function getOptimalWordsPerLine(totalWords) {
  if (totalWords < 50) return 15;  // Kurze Texte (Gedichte)
  if (totalWords < 100) return 18; // Dialoge
  return 20; // Längere Texte
}

module.exports = {
  parseQiratuRashidaHTML
};