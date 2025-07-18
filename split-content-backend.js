// Backend-Script zum Aufteilen von arabischem Content in Seiten
// Verwendung: node split-content-backend.js

const fs = require('fs');

// Konfiguration für Seitengröße
const CONFIG = {
  wordsPerPage: 100,        // Anzahl Wörter pro Seite
  paragraphsPerPage: 3,     // Alternative: Anzahl Absätze pro Seite
  linesPerPage: 15,         // Alternative: Anzahl Zeilen pro Seite
  splitMode: 'words'        // 'words', 'paragraphs', oder 'lines'
};

function splitArabicContent(content, config = CONFIG) {
  console.log(`Aufteilen des Inhalts mit ${config.splitMode}-Modus...`);
  
  switch (config.splitMode) {
    case 'words':
      return splitByWords(content, config.wordsPerPage);
    case 'paragraphs':
      return splitByParagraphs(content, config.paragraphsPerPage);
    case 'lines':
      return splitByLines(content, config.linesPerPage);
    default:
      return splitByWords(content, config.wordsPerPage);
  }
}

function splitByWords(content, wordsPerPage) {
  // HTML-Tags entfernen für Wortzählung
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  
  const pages = [];
  let currentPage = '';
  let wordCount = 0;
  
  // Content mit HTML-Struktur durchgehen
  const lines = content.split('\n');
  
  for (const line of lines) {
    const lineWords = line.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0);
    
    if (wordCount + lineWords.length > wordsPerPage && currentPage.trim()) {
      // Seite abschließen
      pages.push(currentPage.trim());
      currentPage = line + '\n';
      wordCount = lineWords.length;
    } else {
      currentPage += line + '\n';
      wordCount += lineWords.length;
    }
  }
  
  // Letzte Seite hinzufügen
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  return pages;
}

function splitByParagraphs(content, paragraphsPerPage) {
  const paragraphs = content.split(/\n\s*\n/);
  const pages = [];
  
  for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
    const page = paragraphs.slice(i, i + paragraphsPerPage).join('\n\n');
    pages.push(page);
  }
  
  return pages;
}

function splitByLines(content, linesPerPage) {
  const lines = content.split('\n');
  const pages = [];
  
  for (let i = 0; i < lines.length; i += linesPerPage) {
    const page = lines.slice(i, i + linesPerPage).join('\n');
    pages.push(page);
  }
  
  return pages;
}

function generateContentWithPagebreaks(pages) {
  return pages.join('<!-- pagebreak -->\n\n');
}

// Beispiel-Content (ersetzen Sie dies mit Ihrem tatsächlichen Content)
const exampleContent = `<h1>قراءة الراشدة - الجزء الأول والثاني</h1>

<h2>الدرس الأول: كيْفَ أقضي يَوْمِي</h2>

<h3>روتين الصباح</h3>
<p>أنامُ مُبَكِّرًا في اللَّيْلِ وأقومُ مُبَكِّرًا فِي الصَّبَاحِ، أسْتَيْقِظُ عَلَى اسْمِ اللهِ وذِكْرِه، أسْتَعِدُّ لِلصَّلاةِ ثُمَّ أذْهَبُ مَعَ وَالِدِي إلى الْمَسْجِدِ، والْمَسْجِدُ قَرِيْبٌ مِن بَيْتِيْ، فَأَتَوَضَّأُ وأُصَلِّيْ مَعَ الْجَماعَةِ، وأرْجِعُ إِلى البَيْتِ وأتْلُو شَيْئًا مِن الْقُرْآنِ الْكَرِيمِ، ثُمَّ أخْرُجُ إلى البُسْتَانِ وَأجْرِيْ، ثُمَّ أَرْجِعُ إلى الْبَيْتِ فَأَشْرَبُ اللَّبَنَ وأسْتَعِدُّ لِلذَّهابِ إلى المَدْرَسَةِ.</p>

<h3>المدرسة والمساء</h3>
<p>وأفْطِرُ إذَا كانَتْ أيَّامُ الصَّيْفِ، وأتَغَدَّى إذَا كَانَتْ أيَّامُ الشِّتاءِ، وأصِلُ إلى الْمَدْرَسَةِ في الْمِيْعادِ وَأَمْكُثُ فِي الْمَدْرَسَةِ سِتَّ سَاعَاتٍ، وَأَسْمَعُ الدُّرُوْسَ بِنَشَاطٍ وَرَغْبَةٍ، وَأَجْلِسُ بِأَدَبٍ وَسَكِينَةٍ، حَتَّى إِذَا انْتَهَى الْوَقْتُ وَضُرِبَ الْجَرَسُ خَرَجْتُ مِنْ الْمَدْرَسَةِ وَرَجَعْتُ إِلَى الْبَيْتِ.</p>`;

// Hauptfunktion
function main() {
  console.log('=== Arabic Content Splitter ===\n');
  
  // Verschiedene Konfigurationen testen
  const configs = [
    { wordsPerPage: 50, splitMode: 'words', name: 'Kurze Seiten (50 Wörter)' },
    { wordsPerPage: 100, splitMode: 'words', name: 'Mittlere Seiten (100 Wörter)' },
    { wordsPerPage: 200, splitMode: 'words', name: 'Lange Seiten (200 Wörter)' },
    { paragraphsPerPage: 2, splitMode: 'paragraphs', name: 'Nach Absätzen (2 pro Seite)' }
  ];
  
  configs.forEach((config, index) => {
    console.log(`\n${index + 1}. ${config.name}:`);
    console.log('=' .repeat(50));
    
    const pages = splitArabicContent(exampleContent, config);
    console.log(`Anzahl Seiten: ${pages.length}`);
    
    // Erste Seite als Beispiel zeigen
    console.log(`\nBeispiel erste Seite (ersten 100 Zeichen):`);
    console.log(pages[0]?.substring(0, 100) + '...\n');
    
    // Content mit Pagebreaks generieren
    const contentWithPagebreaks = generateContentWithPagebreaks(pages);
    
    // In Datei speichern
    const filename = `output-${config.splitMode}-${config.wordsPerPage || config.paragraphsPerPage}.txt`;
    fs.writeFileSync(filename, contentWithPagebreaks, 'utf8');
    console.log(`✓ Gespeichert in: ${filename}`);
  });
  
  console.log('\n=== Fertig! ===');
  console.log('Sie können jetzt die generierten Dateien verwenden und');
  console.log('den Content in ContentContext.tsx einfügen.');
}

// Script ausführen
if (require.main === module) {
  main();
}

module.exports = {
  splitArabicContent,
  generateContentWithPagebreaks,
  CONFIG
};