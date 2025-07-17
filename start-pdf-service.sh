#!/bin/bash
# Start PDF to EPUB Converter Service

echo "Starting PDF to EPUB Converter Service..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Navigate to pdf_converter directory
cd pdf_converter

# Install Python dependencies if needed
if [ ! -f ".installed" ]; then
    echo "Installing Python dependencies..."
    python3 -m pip install -r requirements_pdf.txt
    touch .installed
fi

# Start the Flask service
echo "Starting Flask service on port 5001..."
python3 main.py &

# Store process ID
echo $! > pdf_service.pid

echo "PDF Converter Service started successfully!"
echo "Service URL: http://localhost:5001"
echo "Status endpoint: http://localhost:5001/status"
echo ""
echo "To stop the service, run: kill \$(cat pdf_converter/pdf_service.pid)"