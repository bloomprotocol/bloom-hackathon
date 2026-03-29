#!/bin/bash

# Resize existing preview images to Twitter OG size (1200x630)
# Usage: ./scripts/resize-og-images.sh

echo "Resizing preview cards to 1200x630 for Twitter OG..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not installed"
    echo "Install with: brew install imagemagick"
    exit 1
fi

# Create og directory if it doesn't exist
mkdir -p public/og

personalities=("visionary" "explorer" "cultivator" "optimizer" "innovator")

for personality in "${personalities[@]}"; do
    # Look for source image (you'll need to specify where your preview cards are)
    # Assuming they're in a temp location or you can drag them into public/temp/

    echo "Processing: $personality"

    # If you have the source images, resize them:
    # convert "path/to/$personality.png" -resize 1200x630! "public/og/$personality.png"

    echo "  → Save your $personality preview card to: public/og/$personality.png"
done

echo ""
echo "✅ Done! Now drag your preview cards into public/og/ and rename them:"
echo "   - visionary.png (purple)"
echo "   - explorer.png (green)"
echo "   - cultivator.png (cyan)"
echo "   - optimizer.png (orange)"
echo "   - innovator.png (blue)"
