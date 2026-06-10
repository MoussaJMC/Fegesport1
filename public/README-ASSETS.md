# FEGESPORT — Required visual assets

This folder requires the following PNG/JPG files. They are referenced in
`index.html` and `site.webmanifest` so missing files will return 404
(not break the build, but degrade SEO/UX).

## Open Graph image (social shares)

**File:** `og-image.jpg`
**Size:** 1200 × 630 px (Facebook/LinkedIn standard, Twitter "summary_large_image" compatible)
**Format:** JPG (smaller than PNG for sharing thumbnails)
**Max weight:** 300 KB recommended
**Content:** FEGESPORT logo + Federation Guineenne d'Esport text + background

When this file exists at `/og-image.jpg`, the SEO component will use it
as the default OG image. Falls back to the Supabase logo URL otherwise.

## Favicons (all formats)

**File** | **Size** | **Used by**
---|---|---
`favicon.ico` | 16×16 / 32×32 / 48×48 multi-resolution ICO | Legacy browsers, IE
`favicon-16x16.png` | 16×16 | Standard browsers (small)
`favicon-32x32.png` | 32×32 | Standard browsers (large)
`apple-touch-icon.png` | 180×180 | iOS Safari home screen
`android-chrome-192x192.png` | 192×192 | Android Chrome home screen, PWA
`android-chrome-512x512.png` | 512×512 | PWA splash screen, Android adaptive icon

## How to generate everything from a single source

Use https://realfavicongenerator.net (free, no signup) :

1. Upload the FEGESPORT logo as **high resolution PNG** (1024×1024 recommended)
2. Tool auto-generates ALL favicons + manifest
3. Download the zip
4. Extract to `/public/` directly

Or with command line:

```bash
# Convert one master PNG (1024×1024) into all sizes
# Requires ImageMagick: brew install imagemagick

cd public/

# Favicons
convert master.png -resize 16x16  favicon-16x16.png
convert master.png -resize 32x32  favicon-32x32.png
convert master.png -resize 180x180 apple-touch-icon.png
convert master.png -resize 192x192 android-chrome-192x192.png
convert master.png -resize 512x512 android-chrome-512x512.png

# Multi-res ICO
convert master.png -define icon:auto-resize=64,48,32,16 favicon.ico
```

## OG image template (1200×630)

You can use Figma, Canva, or this CLI command (ImageMagick + a source PNG logo):

```bash
# Federation dark gradient background with centered logo
convert -size 1200x630 \
  gradient:'#0F172A-#1E293B' \
  master-logo.png -resize 400x400 -gravity center -composite \
  -font Arial -pointsize 48 -fill '#F59E0B' \
  -gravity south -annotate +0+80 'FEGESPORT' \
  og-image.jpg
```

## What happens if files are missing?

- Favicons: browser shows default globe icon (no error, no SEO penalty)
- OG image: social platforms use the Supabase fallback URL (still works, just less optimal)
- Manifest: PWA install prompt won't appear (acceptable for now)

**Priority:** generate at least `og-image.jpg` and `favicon-32x32.png` —
these have the highest visibility impact.
