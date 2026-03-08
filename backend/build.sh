#!/usr/bin/env bash
# Build script for Render deployment
# Installs system dependencies (Tesseract OCR) and Python packages

set -o errexit  # Exit on error

# Install Tesseract OCR
apt-get update && apt-get install -y --no-install-recommends tesseract-ocr

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
