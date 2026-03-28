#!/usr/bin/env python3
"""
AI Drama Studio - Backend Entry Point
"""
import os
import shutil

# Get absolute path to data directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Auto-create data directory (absolute path)
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"✅ Created data directory: {DATA_DIR}")

# Auto-create .env file from .env.example
if not os.path.exists('.env') and os.path.exists('.env.example'):
    shutil.copy('.env.example', '.env')
    print("✅ Created .env file from .env.example")

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("🎬 Starting AI Drama Studio Backend...")
    app.run(host='0.0.0.0', port=5000, debug=True)
