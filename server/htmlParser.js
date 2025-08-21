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
      
      // Alle Wörter sammeln - sequenziell durch den Content gehen
      const allWords = [];
      
      // H1 Titel extrahieren
      const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
      const mainTitle = h1Match ? h1Match[1].trim() : 'الْجُزْءُ الثَّانِي';
      
      // Sequenziell durch den HTML-Content parsen
      const elements = [];
      
      // Alle H2 und P Elemente mit ihren Positionen sammeln
      const h2Regex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
      let h2Match;
      while ((h2Match = h2Regex.exec(htmlContent)) !== null) {
        elements.push({
          type: 'h2',
          index: h2Match.index,
          arabicNumber: h2Match[1],
          title: h2Match[2].trim()
        });
      }
      
      const pRegex = /<p[^>]*>(.*?)<\/p>/gs; // Global und dotAll flags hinzufügen
      let pMatch;
      while ((pMatch = pRegex.exec(htmlContent)) !== null) {
        const words = extractWordsFromHTML(pMatch[1].trim());
        if (words.length > 0) {
          elements.push({
            type: 'p',
            index: pMatch.index,
            words: words
          });
        }
      }
      
      // Nach Index sortieren für korrekte Reihenfolge
      elements.sort((a, b) => a.index - b.index);
      
      // Elemente in korrekter Reihenfolge zu allWords hinzufügen
      for (const element of elements) {
        if (element.type === 'h2') {
          allWords.push(`##(${element.arabicNumber}) ${element.title}##`);
        } else if (element.type === 'p') {
          allWords.push(...element.words);
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
        
        // Alle Wörter für Seite 1 sammeln - sequenziell durch den Content gehen
        const page1Words = [];
        
        // Sequenziell durch den HTML-Content parsen
        const elements = [];
        
        // Alle H2 und P Elemente mit ihren Positionen sammeln
        const h2Regex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
        let h2Match;
        while ((h2Match = h2Regex.exec(page1Content)) !== null) {
          elements.push({
            type: 'h2',
            index: h2Match.index,
            arabicNumber: h2Match[1],
            title: h2Match[2].trim()
          });
        }
        
        const pRegex = /<p[^>]*>(.*?)<\/p>/gs; // Global und dotAll flags hinzufügen
        let pMatch;
        console.log('Searching for <p> elements in page1Content, length:', page1Content.length);
        while ((pMatch = pRegex.exec(page1Content)) !== null) {
          console.log('Found <p> element at index:', pMatch.index);
          const words = extractWordsFromHTML(pMatch[1].trim());
          console.log('Extracted words count:', words.length);
          if (words.length > 0) {
            elements.push({
              type: 'p',
              index: pMatch.index,
              words: words
            });
          }
        }
        console.log('Total elements found for page 1:', elements.length);
        
        // Nach Index sortieren für korrekte Reihenfolge
        elements.sort((a, b) => a.index - b.index);
        
        // Elemente in korrekter Reihenfolge zu page1Words hinzufügen
        for (const element of elements) {
          if (element.type === 'h2') {
            page1Words.push(`##(${element.arabicNumber}) ${element.title}##`);
          } else if (element.type === 'p') {
            page1Words.push(...element.words);
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
        
        // Alle Wörter in diesem Seitenbereich sammeln - sequenziell durch den Content gehen
        const pageWords = [];
        
        // Sequenziell durch den HTML-Content parsen
        const elements = [];
        
        // Alle H2 und P Elemente mit ihren Positionen sammeln
        const h2Regex = /<h2[^>]*>\s*\(([١٢٣٤٥٦٧٨٩])\)\s*([^<]+?)<\/h2>/g;
        let h2PageMatch;
        while ((h2PageMatch = h2Regex.exec(pageContent)) !== null) {
          elements.push({
            type: 'h2',
            index: h2PageMatch.index,
            arabicNumber: h2PageMatch[1],
            title: h2PageMatch[2].trim()
          });
        }
        
        const pRegex = /<p[^>]*>(.*?)<\/p>/gs; // Global und dotAll flags hinzufügen
        let pMatch;
        while ((pMatch = pRegex.exec(pageContent)) !== null) {
          const words = extractWordsFromHTML(pMatch[1].trim());
          if (words.length > 0) {
            elements.push({
              type: 'p',
              index: pMatch.index,
              words: words
            });
          }
        }
        
        // Nach Index sortieren für korrekte Reihenfolge
        elements.sort((a, b) => a.index - b.index);
        
        // Elemente in korrekter Reihenfolge zu pageWords hinzufügen
        for (const element of elements) {
          if (element.type === 'h2') {
            pageWords.push(`##(${element.arabicNumber}) ${element.title}##`);
          } else if (element.type === 'p') {
            pageWords.push(...element.words);
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