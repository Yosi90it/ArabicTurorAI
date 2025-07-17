#!/usr/bin/env python3
"""
PDF to EPUB Converter with OCR Support
Converts PDF pages 30-180 to an interactive EPUB book with Arabic text support
"""

import os
import sys
import logging
from pathlib import Path
import tempfile
import zipfile
from typing import List, Tuple, Optional

# PDF and Image Processing
from pdf2image import convert_from_path
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import numpy as np

# OCR
import pytesseract

# EPUB Creation
from ebooklib import epub
from bs4 import BeautifulSoup

# Arabic Text Processing
import arabic_reshaper
from bidi.algorithm import get_display

# Web Framework
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFToEpubConverter:
    def __init__(self, start_page: int = 30, end_page: int = 180):
        self.start_page = start_page
        self.end_page = end_page
        self.temp_dir = tempfile.mkdtemp()
        
        # OCR configuration for Arabic
        self.ocr_config = r'--oem 3 --psm 6 -l ara+eng'
        
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """Enhance image quality for better OCR results"""
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Convert to grayscale
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive threshold
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Morphological operations to clean up
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        # Convert back to PIL Image
        return Image.fromarray(cleaned)
    
    def extract_text_from_image(self, image: Image.Image) -> str:
        """Extract text from image using Tesseract OCR"""
        try:
            # Preprocess image
            processed_image = self.preprocess_image(image)
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, config=self.ocr_config)
            
            # Clean and reshape Arabic text
            if text.strip():
                # Remove extra whitespace
                text = ' '.join(text.split())
                
                # Reshape Arabic text for proper display
                reshaped_text = arabic_reshaper.reshape(text)
                bidi_text = get_display(reshaped_text)
                
                return bidi_text
            
            return ""
            
        except Exception as e:
            logger.error(f"OCR Error: {e}")
            return ""
    
    def pdf_to_images(self, pdf_path: str) -> List[Image.Image]:
        """Convert PDF pages to images"""
        try:
            logger.info(f"Converting PDF pages {self.start_page}-{self.end_page}")
            
            # Convert specified pages to images
            images = convert_from_path(
                pdf_path,
                first_page=self.start_page,
                last_page=self.end_page,
                dpi=300,  # High DPI for better OCR
                fmt='PNG'
            )
            
            logger.info(f"Successfully converted {len(images)} pages")
            return images
            
        except Exception as e:
            logger.error(f"PDF conversion error: {e}")
            return []
    
    def create_epub_chapter(self, page_num: int, text_content: str, image_data: bytes) -> epub.EpubHtml:
        """Create an EPUB chapter with interlinear text and image"""
        chapter_id = f"chapter_{page_num:03d}"
        chapter_title = f"Seite {page_num}"
        
        # Process text for interlinear display
        interlinear_html = self.create_interlinear_html(text_content)
        
        # Create HTML content with interlinear support
        html_content = f"""
        <!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" lang="ar">
        <head>
            <title>{chapter_title}</title>
            <link rel="stylesheet" type="text/css" href="styles.css"/>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body>
            <div class="chapter">
                <h2 class="chapter-title">{chapter_title}</h2>
                
                <div class="page-container">
                    <div class="image-container">
                        <img src="images/page_{page_num:03d}.png" alt="Seite {page_num}" class="page-image"/>
                    </div>
                    
                    <div class="text-container">
                        <!-- Original Arabic text (hidden, used for audio) -->
                        <div class="arabic-text" dir="rtl" style="display: none;">
                            {text_content.replace(chr(10), '<br>')}
                        </div>
                        
                        <!-- Interlinear text container -->
                        <div class="interlinear-container">
                            <div class="interlinear-toggle">
                                <span>Deutsche Übersetzung:</span>
                                <div class="toggle-switch active" onclick="toggleInterlinear()"></div>
                                <span>An</span>
                            </div>
                            
                            <div class="interlinear-text-container">
                                {interlinear_html}
                            </div>
                        </div>
                        
                        <div class="interaction-controls">
                            <button class="btn btn-audio" onclick="playAudio()">🔊 Audio abspielen</button>
                            <button class="btn btn-translate" onclick="toggleInterlinear()">🔄 Interlinear umschalten</button>
                            <button class="btn btn-tashkeel" onclick="toggleTashkeel()">📝 Tashkeel umschalten</button>
                            <button class="btn btn-vocab" onclick="addToFlashcards()">📚 Ausgewählte Wörter hinzufügen</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <script type="text/javascript" src="script.js"></script>
        </body>
        </html>
        """
        
        # Create chapter
        chapter = epub.EpubHtml(
            title=chapter_title,
            file_name=f"{chapter_id}.xhtml",
            lang="ar"
        )
        chapter.content = html_content
        
        return chapter
    
    def create_interlinear_html(self, text_content: str) -> str:
        """Create HTML for interlinear word-by-word display"""
        if not text_content.strip():
            return "<p>Kein Text erkannt</p>"
        
        # Split into words (handle Arabic word boundaries)
        import re
        words = re.findall(r'\S+', text_content)
        
        interlinear_html = ""
        
        for i, word in enumerate(words):
            # Clean word (remove punctuation for processing)
            clean_word = re.sub(r'[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]', '', word)
            
            if clean_word:
                interlinear_html += f'''
                <div class="interlinear-word clickable-word" data-word="{clean_word}" data-index="{i}">
                    <span class="arabic-word">{word}</span>
                    <span class="german-translation">...</span>
                </div>
                '''
            else:
                # Handle punctuation or non-Arabic characters
                interlinear_html += f'''
                <div class="interlinear-word">
                    <span class="arabic-word">{word}</span>
                    <span class="german-translation"></span>
                </div>
                '''
        
        return interlinear_html
    
    def create_epub_book(self, pdf_path: str, output_path: str) -> bool:
        """Create EPUB book from PDF"""
        try:
            # Convert PDF to images
            images = self.pdf_to_images(pdf_path)
            if not images:
                logger.error("No images extracted from PDF")
                return False
            
            # Create new EPUB book
            book = epub.EpubBook()
            
            # Set metadata
            book.set_identifier('arabic-learning-book-001')
            book.set_title('Arabisches Lernbuch')
            book.set_language('ar')
            book.add_author('ArabicAI Learning Platform')
            
            # Add CSS styles
            with open('pdf_converter/styles.css', 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            nav_css = epub.EpubItem(
                uid="nav_css",
                file_name="styles.css",
                media_type="text/css",
                content=css_content
            )
            book.add_item(nav_css)
            
            # Add JavaScript
            with open('pdf_converter/script.js', 'r', encoding='utf-8') as f:
                js_content = f.read()
            
            script_js = epub.EpubItem(
                uid="script_js",
                file_name="script.js",
                media_type="application/javascript",
                content=js_content
            )
            book.add_item(script_js)
            
            chapters = []
            
            # Process each page
            for i, image in enumerate(images):
                page_num = self.start_page + i
                logger.info(f"Processing page {page_num}")
                
                # Extract text using OCR
                text_content = self.extract_text_from_image(image)
                
                # Save image to bytes
                from io import BytesIO
                img_buffer = BytesIO()
                image.save(img_buffer, format='PNG')
                image_data = img_buffer.getvalue()
                
                # Add image to EPUB
                img_item = epub.EpubItem(
                    uid=f"image_{page_num:03d}",
                    file_name=f"images/page_{page_num:03d}.png",
                    media_type="image/png",
                    content=image_data
                )
                book.add_item(img_item)
                
                # Create chapter
                chapter = self.create_epub_chapter(page_num, text_content, image_data)
                book.add_item(chapter)
                chapters.append(chapter)
            
            # Create table of contents
            book.toc = [(epub.Link(f"chapter_{self.start_page + i:03d}.xhtml", f"Seite {self.start_page + i}", f"chapter_{self.start_page + i:03d}"), chapters[i]) for i in range(len(chapters))]
            
            # Add navigation files
            book.add_item(epub.EpubNcx())
            book.add_item(epub.EpubNav())
            
            # Create spine
            book.spine = ['nav'] + chapters
            
            # Write EPUB file
            epub.write_epub(output_path, book, {})
            
            logger.info(f"EPUB created successfully: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"EPUB creation error: {e}")
            return False

# Flask Web API
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'pdf'}

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/convert', methods=['POST'])
def convert_pdf():
    """API endpoint to convert PDF to EPUB"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'Keine PDF-Datei hochgeladen'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Keine Datei ausgewählt'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Nur PDF-Dateien sind erlaubt'}), 400
        
        # Get parameters
        start_page = int(request.form.get('start_page', 30))
        end_page = int(request.form.get('end_page', 180))
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        pdf_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(pdf_path)
        
        # Create output filename
        epub_filename = f"{Path(filename).stem}_pages_{start_page}-{end_page}.epub"
        epub_path = os.path.join(OUTPUT_FOLDER, epub_filename)
        
        # Convert PDF to EPUB
        converter = PDFToEpubConverter(start_page, end_page)
        success = converter.create_epub_book(pdf_path, epub_path)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'PDF erfolgreich zu EPUB konvertiert',
                'download_url': f'/download/{epub_filename}',
                'pages_processed': end_page - start_page + 1
            })
        else:
            return jsonify({'error': 'Konvertierung fehlgeschlagen'}), 500
            
    except Exception as e:
        logger.error(f"Conversion error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """Download converted EPUB file"""
    try:
        file_path = os.path.join(OUTPUT_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'Datei nicht gefunden'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/status')
def status():
    """API status endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'PDF to EPUB Converter',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    logger.info("Starting PDF to EPUB Converter Service")
    app.run(host='0.0.0.0', port=5001, debug=True)