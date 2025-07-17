#!/usr/bin/env python3
"""
Setup script for PDF to EPUB converter
Installs required packages and sets up the environment
"""

import subprocess
import sys
import os
from pathlib import Path

def install_python_packages():
    """Install required Python packages"""
    packages = [
        'pdf2image==1.17.0',
        'Pillow==10.1.0',
        'pytesseract==0.3.10',
        'ebooklib==0.18',
        'beautifulsoup4==4.12.2',
        'lxml==4.9.3',
        'arabic-reshaper==3.0.0',
        'python-bidi==0.4.2',
        'opencv-python==4.8.1.78',
        'numpy==1.25.2',
        'flask==3.0.0',
        'flask-cors==4.0.0',
        'werkzeug==3.0.1'
    ]
    
    print("Installing Python packages...")
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✓ Installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package}: {e}")

def install_system_dependencies():
    """Install system dependencies (Linux/Ubuntu)"""
    dependencies = [
        'poppler-utils',
        'tesseract-ocr',
        'tesseract-ocr-ara',
        'tesseract-ocr-eng', 
        'tesseract-ocr-deu',
        'libgl1-mesa-glx',
        'libglib2.0-0'
    ]
    
    print("Installing system dependencies...")
    print("Note: You may need to run this with sudo privileges")
    
    try:
        subprocess.check_call(['sudo', 'apt', 'update'])
        for dep in dependencies:
            subprocess.check_call(['sudo', 'apt', 'install', '-y', dep])
            print(f"✓ Installed {dep}")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install system dependencies: {e}")
        print("Please install manually:")
        print("sudo apt update")
        print(f"sudo apt install -y {' '.join(dependencies)}")

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'output', 'temp']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Created directory: {directory}")

def test_installation():
    """Test if all components are working"""
    print("\nTesting installation...")
    
    # Test Python imports
    try:
        import pdf2image
        import pytesseract
        import ebooklib
        import arabic_reshaper
        print("✓ Python packages imported successfully")
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    
    # Test Tesseract
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Tesseract OCR is working")
        else:
            print("✗ Tesseract OCR test failed")
            return False
    except FileNotFoundError:
        print("✗ Tesseract not found in PATH")
        return False
    
    # Test Poppler
    try:
        result = subprocess.run(['pdftoppm', '-h'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Poppler utilities are working")
        else:
            print("✗ Poppler utilities test failed")
            return False
    except FileNotFoundError:
        print("✗ Poppler utilities not found in PATH")
        return False
    
    return True

def main():
    """Main setup function"""
    print("Setting up PDF to EPUB Converter...")
    print("=" * 50)
    
    # Create directories
    create_directories()
    
    # Install Python packages
    install_python_packages()
    
    # Install system dependencies (Linux only)
    if sys.platform.startswith('linux'):
        install_system_dependencies()
    elif sys.platform == 'darwin':
        print("macOS detected. Please install dependencies manually:")
        print("brew install poppler tesseract tesseract-lang")
    elif sys.platform == 'win32':
        print("Windows detected. Please install dependencies manually:")
        print("- Download and install Poppler for Windows")
        print("- Download and install Tesseract for Windows")
    
    # Test installation
    if test_installation():
        print("\n✓ Setup completed successfully!")
        print("You can now run: python main.py")
    else:
        print("\n✗ Setup completed with errors")
        print("Please check the error messages above")

if __name__ == '__main__':
    main()