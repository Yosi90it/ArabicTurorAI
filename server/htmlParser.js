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
    
    const pages = [];
    
    // Nach div-Elementen mit data-page Attribut suchen
    const pageRegex = /<div[^>]*data-page\s*=\s*["'](\d+)["'][^>]*>(.*?)(?=<div[^>]*data-page|$)/gs;
    const pageMatches = Array.from(htmlContent.matchAll(pageRegex));
    
    console.log(`Found ${pageMatches.length} data-page sections in Qasas al-Anbiya Teil 2`);
    
    // Prüfen ob es content vor dem ersten data-page gibt (implizite Seite 1)
    let hasImplicitPage1 = false;
    if (pageMatches.length > 0) {
      const firstDataPageIndex = pageMatches[0].index;
      const contentBeforeFirstDataPage = htmlContent.substring(0, firstDataPageIndex);
      // Prüfen ob es H2-Überschriften oder <p> Inhalte vor dem ersten data-page gibt
      if (contentBeforeFirstDataPage.match(/<h2[^>]*>/) || contentBeforeFirstDataPage.match(/<p[^>]*>/)) {
        hasImplicitPage1 = true;
        console.log('Found content before first data-page, treating as implicit page 1');
      }
    }
    
    // Wenn keine data-page Attribute gefunden wurden, fallback zu vorherigem Verhalten (eine Seite)
    if (pageMatches.length === 0) {
      console.log('No data-page attributes found, treating all content as one page');
      
      // Alle Wörter sammeln, inklusive H2-Überschriften als Strukturelemente
      const allWords = [];
      
      // H1 Titel extrahieren
      const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const mainTitle = h1Match ? h1Match[1].trim() : 'الْجُزْءُ الثَّانِي';
      
      // H2-Überschriften und deren Inhalte sammeln
      const sectionRegex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
      const sectionMatches = Array.from(htmlContent.matchAll(sectionRegex));
      
      for (let i = 0; i < sectionMatches.length; i++) {
        const arabicNumber = sectionMatches[i][1];
        const title = sectionMatches[i][2].trim();
        allWords.push(`##(${arabicNumber}) ${title}##`);
        
        // Den Text zwischen aktueller und nächster Überschrift extrahieren
        const currentIndex = sectionMatches[i].index;
        const nextIndex = i + 1 < sectionMatches.length ? sectionMatches[i + 1].index : htmlContent.length;
        const sectionContent = htmlContent.substring(currentIndex, nextIndex);
        
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
      
      if (allWords.length > 0) {
        pages.push({
          number: 1,
          title: mainTitle,
          paragraphs: [{
            words: allWords,
            fullText: allWords.join(' ').replace(/##([^#]+)##/g, '\n\n$1\n\n')
          }]
        });
      }
    } else {
      // Implizite Seite 1 verarbeiten (Inhalt vor erstem data-page)
      if (hasImplicitPage1) {
        const firstDataPageIndex = pageMatches[0].index;
        const page1Content = htmlContent.substring(0, firstDataPageIndex);
        
        console.log('Processing implicit page 1 content');
        
        // H1 Titel für Seite 1 extrahieren
        const h1Match = page1Content.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const page1Title = h1Match ? h1Match[1].trim() : 'الْجُزْءُ الثَّانِي';
        
        // Alle Wörter für Seite 1 sammeln
        const page1Words = [];
        
        // H2-Überschriften als Strukturelemente hinzufügen
        const sectionRegex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
        let sectionMatch;
        while ((sectionMatch = sectionRegex.exec(page1Content)) !== null) {
          const arabicNumber = sectionMatch[1];
          const title = sectionMatch[2].trim();
          page1Words.push(`##(${arabicNumber}) ${title}##`);
        }
        
        // Alle <p> Elemente sammeln
        const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
        let paragraphMatch;
        while ((paragraphMatch = paragraphRegex.exec(page1Content)) !== null) {
          const paragraphHTML = paragraphMatch[1].trim();
          if (paragraphHTML) {
            const words = extractWordsFromHTML(paragraphHTML);
            if (words.length > 0) {
              page1Words.push(...words);
            }
          }
        }
        
        if (page1Words.length > 0) {
          pages.push({
            number: 1,
            title: page1Title,
            paragraphs: [{
              words: page1Words,
              fullText: page1Words.join(' ').replace(/##([^#]+)##/g, '\n\n$1\n\n')
            }]
          });
          
          console.log(`Created implicit page 1: "${page1Title}" with ${page1Words.length} elements`);
        }
      }
      
      // data-page Attribute gefunden - jede als separate Seite behandeln
      for (let i = 0; i < pageMatches.length; i++) {
        const pageNumber = parseInt(pageMatches[i][1]);
        const pageContent = pageMatches[i][2];
        
        console.log(`Processing data-page="${pageNumber}"`);
        
        // Titel aus der ersten H2-Überschrift extrahieren oder Standard verwenden
        const h2Match = pageContent.match(/<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/);
        const pageTitle = h2Match ? h2Match[2].trim() : `الصفحة ${pageNumber}`;
        
        // Alle Wörter in diesem Seitenbereich sammeln, inklusive H2-Überschriften
        const pageWords = [];
        
        // H2-Überschriften als Strukturelemente hinzufügen
        const sectionRegex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
        let sectionMatch;
        while ((sectionMatch = sectionRegex.exec(pageContent)) !== null) {
          const arabicNumber = sectionMatch[1];
          const title = sectionMatch[2].trim();
          pageWords.push(`##(${arabicNumber}) ${title}##`);
        }
        
        // Alle <p> Elemente sammeln
        const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
        let paragraphMatch;
        while ((paragraphMatch = paragraphRegex.exec(pageContent)) !== null) {
          const paragraphHTML = paragraphMatch[1].trim();
          if (paragraphHTML) {
            const words = extractWordsFromHTML(paragraphHTML);
            if (words.length > 0) {
              pageWords.push(...words);
            }
          }
        }
        
        if (pageWords.length > 0) {
          pages.push({
            number: pageNumber,
            title: pageTitle,
            paragraphs: [{
              words: pageWords,
              fullText: pageWords.join(' ').replace(/##([^#]+)##/g, '\n\n$1\n\n')
            }]
          });
          
          console.log(`Created page ${pageNumber}: "${pageTitle}" with ${pageWords.length} elements`);
        }
      }
    }
    
    console.log(`Total pages created: ${pages.length}`);
    return pages.sort((a, b) => a.number - b.number); // Nach Seitenzahl sortieren
    
  } catch (error) {
    console.error('Fehler beim Parsen der Qasas al-Anbiya Teil 2 HTML-Datei:', error);
    return [];
  }
}

module.exports = {
  parseQiratuRashidaHTML,
  parseQasasAlAnbiyaPart2HTML
};