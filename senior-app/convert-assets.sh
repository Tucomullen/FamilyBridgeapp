#!/bin/bash

# Convert SVG assets to PNG format for Expo
echo "🔄 Converting SVG assets to PNG..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Homebrew not found. Please install ImageMagick manually or use online converters."
        echo "📱 You can use these online tools:"
        echo "   - https://convertio.co/svg-png/"
        echo "   - https://cloudconvert.com/svg-to-png"
        exit 1
    fi
fi

# Convert assets
echo "📱 Converting icon.svg to icon.png (1024x1024)..."
convert assets/icon.svg -resize 1024x1024 assets/icon.png

echo "📱 Converting splash.svg to splash.png (1024x1024)..."
convert assets/splash.svg -resize 1024x1024 assets/splash.png

echo "📱 Converting adaptive-icon.svg to adaptive-icon.png (1024x1024)..."
convert assets/adaptive-icon.svg -resize 1024x1024 assets/adaptive-icon.png

echo "📱 Converting favicon.svg to favicon.png (32x32)..."
convert assets/favicon.svg -resize 32x32 assets/favicon.png

echo "✅ All assets converted successfully!"
echo "🎉 You can now run: npm start"
