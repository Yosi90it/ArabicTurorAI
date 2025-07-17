#!/usr/bin/env python3
"""
Verarbeitet die PDF "Al-Qir'atur.Rashida (1-2).pdf" von Seite 30-180
und erstellt strukturierte arabische Inhalte für den BookReader.
"""

import PyPDF2
import json
import re
import os

def extract_pdf_pages(pdf_path, start_page=30, end_page=180):
    """Extrahiert Text von spezifischen Seiten der PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            print(f"PDF hat {total_pages} Seiten insgesamt")
            print(f"Extrahiere Seiten {start_page} bis {min(end_page, total_pages)}")
            
            extracted_content = []
            
            for page_num in range(start_page - 1, min(end_page, total_pages)):  # -1 weil 0-indexiert
                try:
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    if text and text.strip():
                        # Bereinige den Text
                        cleaned_text = clean_arabic_text(text)
                        if cleaned_text:
                            extracted_content.append({
                                'page_number': page_num + 1,
                                'content': cleaned_text
                            })
                            print(f"Seite {page_num + 1}: {len(cleaned_text)} Zeichen extrahiert")
                    else:
                        print(f"Seite {page_num + 1}: Leer oder nicht lesbar")
                        
                except Exception as e:
                    print(f"Fehler beim Verarbeiten von Seite {page_num + 1}: {e}")
                    continue
                    
            return extracted_content
            
    except Exception as e:
        print(f"Fehler beim Öffnen der PDF: {e}")
        return []

def clean_arabic_text(text):
    """Bereinigt und formatiert arabischen Text"""
    if not text:
        return ""
    
    # Entferne übermäßige Leerzeichen und Zeilenumbrüche
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    # Entferne Seitenzahlen und andere Störelemente
    text = re.sub(r'\d+\s*$', '', text)  # Seitenzahlen am Ende
    text = re.sub(r'^\d+\s*', '', text)  # Seitenzahlen am Anfang
    
    # Stelle sicher, dass arabischer Text vorhanden ist
    arabic_chars = re.findall(r'[\u0600-\u06FF\u0750-\u077F]', text)
    if len(arabic_chars) < 10:  # Mindestens 10 arabische Zeichen
        return ""
    
    return text.strip()

def create_book_content(extracted_pages):
    """Erstellt den BookReader-kompatiblen Inhalt"""
    if not extracted_pages:
        return ""
    
    content_parts = []
    content_parts.append('<h1>القراءة الراشدة - الجزء الأول والثاني</h1>')
    content_parts.append('<p>محتوى أصلي من PDF الصفحات 30-180</p>')
    
    lesson_count = 0
    current_lesson_content = []
    
    for page_data in extracted_pages:
        page_content = page_data['content']
        page_num = page_data['page_number']
        
        # Sammle Inhalt für Lektionen (alle 3-5 Seiten eine neue Lektion)
        current_lesson_content.append(page_content)
        
        # Erstelle eine neue Lektion alle 4 Seiten oder bei wichtigen Überschriften
        if len(current_lesson_content) >= 4 or has_lesson_marker(page_content):
            lesson_count += 1
            
            # Bestimme Lektionstitel basierend auf Inhalt
            lesson_title = extract_lesson_title(current_lesson_content) or f"الدرس {lesson_count}"
            
            content_parts.append(f'<h2>{lesson_title}</h2>')
            
            # Kombiniere den Lektionsinhalt
            combined_content = ' '.join(current_lesson_content)
            content_parts.append(f'<p>{combined_content}</p><!-- pagebreak -->')
            
            print(f"Lektion {lesson_count} erstellt: {lesson_title}")
            current_lesson_content = []
    
    # Füge verbleibenden Inhalt hinzu
    if current_lesson_content:
        lesson_count += 1
        lesson_title = f"الدرس الأخير"
        content_parts.append(f'<h2>{lesson_title}</h2>')
        combined_content = ' '.join(current_lesson_content)
        content_parts.append(f'<p>{combined_content}</p>')
    
    return '\n      '.join(content_parts)

def has_lesson_marker(text):
    """Prüft ob der Text Anzeichen für eine neue Lektion hat"""
    markers = ['درس', 'الدرس', 'باب', 'فصل', 'قصة']
    return any(marker in text for marker in markers)

def extract_lesson_title(content_list):
    """Extrahiert einen passenden Lektionstitel aus dem Inhalt"""
    combined = ' '.join(content_list)
    
    # Suche nach typischen Titeln
    title_patterns = [
        r'(درس\s+[^.،]+)',
        r'(باب\s+[^.،]+)',
        r'(فصل\s+[^.،]+)',
        r'(قصة\s+[^.،]+)',
        r'(في\s+[^.،]{10,30})',
    ]
    
    for pattern in title_patterns:
        match = re.search(pattern, combined)
        if match:
            return match.group(1).strip()
    
    return None

def main():
    pdf_path = "Al-Qir`atur.Rashida (1-2).pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDF-Datei nicht gefunden: {pdf_path}")
        return
    
    print("Beginne PDF-Verarbeitung von Seite 30-180...")
    extracted_pages = extract_pdf_pages(pdf_path, 30, 180)
    
    if not extracted_pages:
        print("Keine Inhalte extrahiert!")
        return
    
    print(f"\n{len(extracted_pages)} Seiten erfolgreich extrahiert")
    
    # Erstelle BookReader-Inhalt
    book_content = create_book_content(extracted_pages)
    
    # Speichere Ergebnis
    result = {
        'title': 'القراءة الراشدة - الصفحات 30-180',
        'pages_extracted': len(extracted_pages),
        'content': book_content,
        'source_pages': f"30-{extracted_pages[-1]['page_number'] if extracted_pages else 180}"
    }
    
    with open('qiraatu-rashida-pages-30-180.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\nInhalt gespeichert in: qiraatu-rashida-pages-30-180.json")
    print(f"Quelle: Seiten {result['source_pages']}")
    print(f"Inhaltslänge: {len(book_content)} Zeichen")

if __name__ == "__main__":
    main()