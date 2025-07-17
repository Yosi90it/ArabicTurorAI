# PDF to EPUB Converter Dockerfile
FROM python:3.11-slim

# Install system dependencies for Poppler and Tesseract
RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-ara \
    tesseract-ocr-eng \
    tesseract-ocr-deu \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python packages
COPY requirements_pdf.txt .
RUN pip install --no-cache-dir -r requirements_pdf.txt

# Copy application files
COPY . .

# Set environment variables for Tesseract
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata/

# Expose port
EXPOSE 5001

# Run the application
CMD ["python", "main.py"]