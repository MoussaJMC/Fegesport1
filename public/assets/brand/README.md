# public/assets/brand — Brand assets (Wave 2.6)

This directory hosts the **public, institutional** brand assets of FEGESPORT.

## Files

| File | Source | Resolution | Usage |
|------|--------|------------|-------|
| `logo.jpg` | Telecharge du bucket Supabase public `static-files` le 2026-06-11 | 1216×1216 (carre) | Logo institutionnel principal |
| `og-image.jpg` | Copie de `logo.jpg` | 1216×1216 (carre) | Open Graph + Twitter Card fallback |

## Why this directory exists

Before Wave 2.6, the FEGESPORT logo was served exclusively from a Supabase
public bucket URL hardcoded in 15 places across the codebase (favicon,
Open Graph, Twitter, Schema.org, Navbar, Hero, Press Kit, sitemap, etc.).

Wave 2.6 ("Public Assets Hardening") moves these references to **local
Netlify-served static files** under `/assets/brand/` so that the
documentary Wave 2 private bucket migration can later proceed without
breaking any public visual.

## How to update the logo

1. Replace `logo.jpg` here with the new official high-res file.
2. Run `npm run build` to validate the asset is included in `dist/`.
3. Commit + push. Netlify rebuilds and the new logo is served immediately.

## Fallback policy

For now (Wave 2.6 transition phase), the existing Supabase public URL is
KEPT in code as a documented fallback comment next to each reference.
A future Wave 2.7 may remove these fallbacks once the Supabase source
bucket is decommissioned.
