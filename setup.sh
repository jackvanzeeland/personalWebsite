#!/bin/bash

# Exit immediately if a command fails
set -e

echo "🔧 Creating virtual environment..."
python3 -m venv venv

echo "📦 Activating virtual environment..."
source venv/bin/activate

echo "⬇️ Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo "✅ Setup complete! Virtual environment is ready."
echo "👉 To activate it later, run: source venv/bin/activate"

python3 app.py
