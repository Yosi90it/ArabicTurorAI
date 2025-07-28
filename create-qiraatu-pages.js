import fs from 'fs';
import path from 'path';

// Get all Qiraatu al-Rashida image files
const imageFiles = fs.readdirSync('.')
  .filter(file => file.includes('Al-Qir') && file.includes('page') && file.endsWith('.jpg'))
  .sort((a, b) => {
    const pageA = parseInt(a.match(/page-(\d+)/)[1]);
    const pageB = parseInt(b.match(/page-(\d+)/)[1]);
    return pageA - pageB;
  });

console.log(`Found ${imageFiles.length} Qiraatu al-Rashida pages`);

// Create pages data structure
const pages = imageFiles.map((filename, index) => {
  const pageMatch = filename.match(/page-(\d+)/);
  const pageNumber = pageMatch ? parseInt(pageMatch[1]) : index + 30;
  
  return {
    pageNumber,
    filename,
    title: `صفحة ${pageNumber}`,
    content: `<!-- Original Page ${pageNumber} from Qiraatu al-Rashida -->`,
    isOriginalPage: true
  };
});

// Update the book content to include all pages
const bookData = {
  id: "qiraatu-rashida-complete",
  title: "قراءة الراشدة (Qiraatu Al-Rashida)",
  level: "anfänger",
  icon: "📖",
  pages: pages,
  totalPages: pages.length,
  description: "Complete Qiraatu al-Rashida book with all original pages"
};

// Save the book data
fs.writeFileSync('books/qiraatu-rashida-complete.json', JSON.stringify(bookData, null, 2));

console.log(`Created complete book with ${pages.length} pages`);
console.log('Pages:', pages.map(p => `${p.pageNumber}: ${p.filename}`).slice(0, 5), '...');