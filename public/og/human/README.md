# Human Identity Card OG Images

**Directory:** `/public/og/human/`

## Required Images

Create 5 static PNG files for human (supporter) identity cards used in Twitter/X link previews.

### File Names (New Human Supporter Personalities)

- `pioneer.png` - The Pioneer (Building the decentralized future)
- `curator.png` - The Curator (Curious about everything)
- `nurturer.png` - The Nurturer (Investing in wellbeing)
- `achiever.png` - The Achiever (Always leveling up)
- `trailblazer.png` - The Trailblazer (First to back new tech)

### Specifications

**Dimensions:** 1200 x 630 pixels

**Design Requirements:**

1. **Background:** Lighter colors (white/light gray/pastel tones)
   - Unlike agent cards which use dark backgrounds
   - Should feel clean and inviting
   - Example: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)`

2. **Text Color:** Black or very dark gray (`#121212`, `#1f2937`)
   - High contrast against lighter background
   - Good readability

3. **Layout:** Similar to agent cards but adapted for light theme
   - Personality type title (e.g., "The Visionary")
   - Personality tagline/description
   - Main categories (if applicable)
   - Tier indicator (Seed/Sprout/Bloom badge)
   - Member since date
   - Bloom Protocol branding

4. **Style:** Clean, modern, professional
   - Glass morphism effects with lighter tones
   - Subtle gradients
   - Holographic accents (lighter purple/pink tones)

### Design References

**Agent Cards (dark theme):** See `/public/og/*.png`
- These use dark backgrounds (#0f0c14, dark purples)
- White text
- Deep purple/blue gradients

**Human Cards (light theme):** Should be the inverse
- Light backgrounds (white, soft grays, pastels)
- Black/dark text
- Lighter purple/pink accents

### Current Implementation

The share page (`/share/identity/page.tsx`) is configured to:
1. **Primary:** Use static PNG from `/og/human/{personality}.png`
2. **Fallback:** Use dynamic OG generation from `/api/og/identity/route.tsx`

Twitter/X will use the static PNG for better performance and reliability.

### Tools

You can use:
- Figma + Export to PNG
- ImageMagick for batch generation
- Next.js ImageResponse API (see `/api/og/identity/route.tsx` for dynamic generation code)
- Any design tool that can export 1200x630 PNG

### Example Command (if using ImageMagick)

```bash
# Example: Create a basic placeholder
convert -size 1200x630 \
  gradient:#f8fafc-#e2e8f0 \
  -pointsize 60 -fill '#1f2937' -gravity center \
  -annotate +0-100 "The Visionary" \
  -pointsize 24 -annotate +0+0 "Building the future" \
  -pointsize 16 -fill '#9ca3af' -annotate +0+100 "Bloom Protocol" \
  visionary.png
```

### Next Steps

1. Create the 5 PNG files with proper designs
2. Place them in this directory (`/public/og/human/`)
3. Test by sharing a link: `/share/identity?personality=The%20Visionary`
4. Verify Twitter Card Validator shows correct preview
