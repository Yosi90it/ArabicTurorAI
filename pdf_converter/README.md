# PDF to EPUB Converter mit Interlinear-Übersetzung

Ein vollständiges System zur Konvertierung von PDF-Dokumenten (Seiten 30-180) in interaktive EPUB-Bücher mit arabischer OCR-Erkennung und interlinearer Übersetzungsfunktion.

## Features

### ✨ Hauptfunktionen
- **PDF zu EPUB Konvertierung**: Automatische Umwandlung von PDF-Seiten in EPUB-Format
- **OCR-Texterkennung**: Hochwertige arabische Texterkennung mit Tesseract
- **Interlineare Übersetzung**: Wort-für-Wort deutsche Übersetzungen unter arabischem Text
- **Audio-Unterstützung**: Text-zu-Sprache für arabischen Inhalt
- **Flashcard-Integration**: Direktes Hinzufügen von Wörtern zu Flashcards
- **Responsive Design**: Optimiert für Desktop und Mobile

### 🔧 Technische Features
- **Bildvorverarbeitung**: Verbesserte OCR-Qualität durch OpenCV
- **Arabische Textformattierung**: Korrekte RTL-Darstellung mit arabic-reshaper
- **Tashkeel-Toggle**: Ein-/Ausblenden arabischer Diakritika
- **Web-API**: Flask-basierte REST-API für Integration
- **Docker-Support**: Containerisierte Bereitstellung

## Installation

### 1. Automatische Installation (empfohlen)
```bash
cd pdf_converter
python setup_converter.py
```

### 2. Manuelle Installation

#### System-Abhängigkeiten (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-ara \
    tesseract-ocr-eng \
    tesseract-ocr-deu \
    libgl1-mesa-glx \
    libglib2.0-0
```

#### Python-Pakete
```bash
pip install -r requirements_pdf.txt
```

### 3. Docker Installation
```bash
cd pdf_converter
docker build -t pdf-epub-converter .
docker run -p 5001:5001 -v $(pwd)/uploads:/app/uploads -v $(pwd)/output:/app/output pdf-epub-converter
```

## Verwendung

### Als Web-Service
1. **Server starten:**
   ```bash
   python main.py
   ```
   
2. **PDF konvertieren:**
   ```bash
   curl -X POST \
     -F "file=@your_document.pdf" \
     -F "start_page=30" \
     -F "end_page=180" \
     http://localhost:5001/convert
   ```

3. **EPUB herunterladen:**
   ```bash
   curl -O http://localhost:5001/download/your_document_pages_30-180.epub
   ```

### Als Python-Skript
```python
from main import PDFToEpubConverter

converter = PDFToEpubConverter(start_page=30, end_page=180)
success = converter.create_epub_book('input.pdf', 'output.epub')
```

## API-Endpunkte

### POST /convert
Konvertiert PDF zu EPUB

**Parameter:**
- `file`: PDF-Datei (multipart/form-data)
- `start_page`: Startseite (Standard: 30)
- `end_page`: Endseite (Standard: 180)

**Antwort:**
```json
{
  "success": true,
  "message": "PDF erfolgreich zu EPUB konvertiert",
  "download_url": "/download/document_pages_30-180.epub",
  "pages_processed": 151
}
```

### GET /download/<filename>
Lädt konvertierte EPUB-Datei herunter

### GET /status
Gibt Service-Status zurück

## EPUB-Features

### Interlineare Übersetzung
- **Wort-für-Wort Übersetzung**: Deutsche Übersetzungen unter arabischen Wörtern
- **Klickbare Wörter**: Detaillierte Wortinformationen per Klick
- **Toggle-Funktion**: Ein-/Ausblenden der Übersetzungen

### Interaktive Elemente
- **Audio-Wiedergabe**: Text-zu-Sprache für arabischen Inhalt
- **Tashkeel-Toggle**: Diakritika ein-/ausblenden
- **Flashcard-Export**: Ausgewählte Wörter zu Flashcards hinzufügen
- **Responsive Layout**: Optimiert für alle Bildschirmgrößen

### Navigation
- **Kapitelerstellung**: Jede Seite wird zu einem EPUB-Kapitel
- **Inhaltsverzeichnis**: Automatische TOC-Generierung
- **Bildintegration**: Originale PDF-Seiten als Referenz

## Konfiguration

### OCR-Einstellungen
```python
# In main.py anpassen
self.ocr_config = r'--oem 3 --psm 6 -l ara+eng'
```

### Bildvorverarbeitung
```python
# Gaussian Blur anpassen für bessere OCR
blurred = cv2.GaussianBlur(gray, (5, 5), 0)
```

### Seitenbereich
```python
# Standard: Seiten 30-180
converter = PDFToEpubConverter(start_page=30, end_page=180)
```

## Integration mit ArabicAI

### Weaviate-Anbindung
Das System kann mit Ihrer bestehenden Weaviate-Datenbank verbunden werden:

```javascript
// In script.js
const WEAVIATE_CONFIG = {
  baseUrl: 'https://ihre-weaviate-instanz.weaviate.network',
  apiKey: 'ihr-weaviate-api-key',
  className: 'Vocabulary'
};
```

### Flashcard-Export
Exportierte Wörter können direkt in Ihre Flashcard-Komponente importiert werden:

```javascript
// Automatische Integration mit FlashcardContext
addSingleWordToFlashcards(arabicWord, translation);
```

## Anpassung

### CSS-Styling
Bearbeiten Sie `styles.css` für:
- Farbschema anpassen
- Schriftarten ändern
- Layout-Anpassungen
- Dark Mode Support

### JavaScript-Funktionalität
Erweitern Sie `script.js` für:
- Neue Interaktionsfeatures
- API-Anbindungen
- Zusätzliche Übersetzungsdienste

### Python-Backend
Modifizieren Sie `main.py` für:
- Andere OCR-Sprachen
- Zusätzliche Bildverarbeitung
- Alternative EPUB-Formate

## Fehlerbehebung

### Häufige Probleme

**1. OCR erkennt keinen Text:**
```bash
# Tesseract-Sprachen prüfen
tesseract --list-langs

# Arabische Sprachdateien installieren
sudo apt install tesseract-ocr-ara
```

**2. PDF-Konvertierung schlägt fehl:**
```bash
# Poppler-Installation prüfen
pdftoppm -h

# Unter Ubuntu installieren
sudo apt install poppler-utils
```

**3. Speicher-Probleme bei großen PDFs:**
```python
# DPI reduzieren in main.py
images = convert_from_path(pdf_path, dpi=200)  # Statt 300
```

**4. Docker-Container startet nicht:**
```bash
# Logs überprüfen
docker logs pdf-epub-converter

# Container neu erstellen
docker build --no-cache -t pdf-epub-converter .
```

## Performance-Optimierung

### Für große Dokumente
- DPI auf 200-250 reduzieren
- Batch-Verarbeitung implementieren
- Parallel processing verwenden

### Für bessere OCR-Qualität
- Bildvorverarbeitung anpassen
- Verschiedene PSM-Modi testen
- Mehrere OCR-Engines kombinieren

## Lizenz

Dieses Projekt ist für die ArabicAI Learning Platform entwickelt und integriert sich nahtlos in das bestehende System.

## Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Logs in `main.py`
2. Testen Sie die Installation mit `setup_converter.py`
3. Prüfen Sie die API-Endpunkte mit `/status`