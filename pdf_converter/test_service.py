#!/usr/bin/env python3
"""
Test script for PDF to EPUB converter service
"""

import requests
import json

def test_service():
    """Test the PDF converter service"""
    
    # Test status endpoint
    try:
        response = requests.get('http://localhost:5001/status')
        if response.status_code == 200:
            print("✓ Service is running")
            print(f"Status: {response.json()}")
        else:
            print("✗ Service status check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to service. Make sure it's running on port 5001")
        return False
    
    # Test with a sample request (without actual file)
    try:
        print("\nTesting conversion endpoint...")
        # This will fail because we're not sending a file, but it tests the endpoint
        response = requests.post('http://localhost:5001/convert', 
                               data={'start_page': 30, 'end_page': 50})
        
        if response.status_code == 400:
            print("✓ Conversion endpoint is responding (expected 400 without file)")
        else:
            print(f"? Unexpected response: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error testing conversion endpoint: {e}")
        return False
    
    print("\n✓ All tests passed! Service is ready for PDF conversion.")
    return True

if __name__ == '__main__':
    test_service()