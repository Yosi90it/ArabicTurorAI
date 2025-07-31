const fs = require('fs');
const path = require('path');

// Parst die HTML-Datei und extrahiert alle Seiten mit Titeln und Wörtern
function parseQiratuRashidaHTML() {
  try {
    const htmlPath = path.join(__dirname, '..', 'books', 'qiraatu al rashida.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const pages = [];
    
    // Regulärer Ausdruck für Seiten (div class="page")
    const pageRegex = /<div class="page"[^>]*>(.*?)<\/div>/gs;
    let pageMatch;
    let pageNumber = 1;
    
    while ((pageMatch = pageRegex.exec(htmlContent)) !== null) {
      const pageContent = pageMatch[1];
      
      // Titel extrahieren (h2 Element)
      const titleRegex = /<h2[^>]*>(.*?)<\/h2>/s;
      const titleMatch = pageContent.match(titleRegex);
      
      let title = `الصفحة ${pageNumber}`;
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
      
      while ((paragraphMatch = paragraphRegex.exec(pageContent)) !== null) {
        const paragraphContent = paragraphMatch[1];
        const words = extractWordsFromHTML(paragraphContent);
        
        if (words.length > 0) {
          paragraphs.push({
            words: words,
            maxWordsPerLine: getOptimalWordsPerLine(words.length)
          });
        }
      }
      
      if (paragraphs.length > 0) {
        pages.push({
          number: pageNumber,
          title: title,
          paragraphs: paragraphs
        });
      }
      
      pageNumber++;
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