const fs = require('fs');
const path = require('path');

// Parst die HTML-Datei und extrahiert alle Seiten mit Titeln und Wörtern
function parseQiratuRashidaHTML() {
  try {
    const htmlPath = path.join(__dirname, '..', 'books', 'qiraatu al rashida.html');
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

// Parst die HTML-Datei für Qasas al-Anbiya Teil 2
function parseQasasAlAnbiyaPart2HTML(htmlContent) {
  try {
    console.log('Parsing Qasas al-Anbiya Teil 2 HTML file for pages...');
    
    // Alle Wörter sammeln, inklusive H2-Überschriften als Strukturelemente
    const allWords = [];
    const allParagraphs = [];
    
    // H1 Titel extrahieren für den Seitentitel
    const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const mainTitle = h1Match ? h1Match[1].trim() : 'الْجُزْءُ الثَّانِي';
    
    // Nach h2 Überschriften mit arabischen Nummern suchen
    const sectionRegex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
    const sectionMatches = Array.from(htmlContent.matchAll(sectionRegex));
    
    console.log(`Found ${sectionMatches.length} H2 sections in Qasas al-Anbiya Teil 2`);
    
    // Jeden Abschnitt durchgehen und alle Inhalte sammeln
    for (let i = 0; i < sectionMatches.length; i++) {
      const arabicNumber = sectionMatches[i][1];
      const title = sectionMatches[i][2].trim();
      const fullHeader = `(${arabicNumber}) ${title}`;
      
      // H2-Überschrift als spezielles Strukturelement hinzufügen
      allWords.push(`##${fullHeader}##`);
      
      // Den Text zwischen aktueller und nächster Überschrift extrahieren
      const currentIndex = sectionMatches[i].index;
      const nextIndex = i + 1 < sectionMatches.length ? sectionMatches[i + 1].index : htmlContent.length;
      const sectionContent = htmlContent.substring(currentIndex, nextIndex);
      
      // Alle <p> Elemente in diesem Abschnitt sammeln
      const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
      let paragraphMatch;
      
      while ((paragraphMatch = paragraphRegex.exec(sectionContent)) !== null) {
        const paragraphHTML = paragraphMatch[1].trim();
        if (paragraphHTML) {
          const words = extractWordsFromHTML(paragraphHTML);
          if (words.length > 0) {
            allWords.push(...words);
          }
        }
      }
    }
    
    // Alles als eine große Seite mit eingebetteten Überschriften
    if (allWords.length > 0) {
      allParagraphs.push({
        words: allWords,
        fullText: allWords.join(' ').replace(/##([^#]+)##/g, '\n\n$1\n\n') // Formatierung für Überschriften
      });
      
      const pages = [{
        number: 1,
        title: mainTitle,
        paragraphs: allParagraphs
      }];
      
      console.log(`Combined content into 1 page with ${allWords.length} elements (including headers)`);
      console.log(`Content includes ${sectionMatches.length} section headers`);
      
      return pages;
    }
    
    return [];
  } catch (error) {
    console.error('Fehler beim Parsen der Qasas al-Anbiya Teil 2 HTML-Datei:', error);
    return [];
  }
}

module.exports = {
  parseQiratuRashidaHTML,
  parseQasasAlAnbiyaPart2HTML
};