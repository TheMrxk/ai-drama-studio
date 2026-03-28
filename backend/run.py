#!/usr/bin/env python3
"""
AI Drama Studio - Backend Entry Point
"""
import os
import shutil

# Auto-create data directory
if not os.path.exists('data'):
    os.makedirs('data', exist_ok=True)
    print("✅ Created data directory")

# Auto-create .env file from .env.example
if not os.path.exists('.env') and os.path.exists('.env.example'):
    shutil.copy('.env.example', '.env')
    print("✅ Created .env file from .env.example")

from app import create_app

app = create_app()

if __name__ == '__main__':
    print("🎬 Starting AI Drama Studio Backend...")
    app.run(host='0.0.0.0', port=5000, debug=True)
