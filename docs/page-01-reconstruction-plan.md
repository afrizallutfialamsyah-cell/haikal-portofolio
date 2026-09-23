# Page 01 — Reconstruction Plan
**Purpose:** Technical blueprint for rebuilding the Hero page as a native interactive web composition.  
**Reference:** `reference/page-01-reference.png` and `reference/Portfolio Akhmad Haikal Prammana2026.pdf`  
**Design Source:** Canva — https://www.canva.com/design/DAHRV6pXHHk/RHmZ7ecio6tDJb6jjG9_tA/edit  
**Status:** Pre-implementation (asset audit phase complete)

---

## Composition Overview

Page 01 is the Hero / Cover page. It contains:

- A full-bleed outdoor photograph as background
- Two dark gradient overlays (top + bottom) creating a cinematic vignette
- A large central ornamental badge (Victorian/Baroque scalloped shape) in dark charcoal
- An inner decorative white stroke border inside the badge
- The word "Portfolio" composed of two typographic layers:
  - "P" in Snell Roundhand Bold Script (large, decorative, white)
  - "ortfolio" in Plus Jakarta Sans Italic (medium, white)
- Three category labels in the corners:
  - Top-left: `(01) Branding`
  - Bottom-left: `(03) Graphic Design`
  - Bottom-right: `Illustration (02)`
- Year label bottom-right: `2026`

The composition is symmetrically balanced around the badge center with text elements positioned in the corners.

---

## Layer Stack / z-index Order

```
z-index: 0    — White base rectangle (CSS background: #fff or #FAFAFA)
z-index: 1    — Background photo (hero-background.webp)
z-index: 2    — Top dark gradient overlay (hero-overlay-top.png)
z-index: 3    — Bottom dark gradient overlay (hero-overlay-bottom.png)
z-index: 4    — Badge filled shape (hero-badge-fill.svg)
z-index: 5    — Badge inner stroke outline (hero-badge-outline.svg)
z-index: 6    — Portfolio text: "P" (Snell Roundhand)
z-index: 7    — Portfolio text: "ortfolio" (Plus Jakarta Sans Italic)
z-index: 8    — Corner category labels: (01) Branding / (03) Graphic Design / Illustration (02)
z-index: 9    — Year label: 2026
```

---

## Element Reconstruction Guide

### 1. White Base Rectangle
```
Implementation: CSS
background-color: #FFFFFF (or transparent)
position: absolute; inset: 0;
```
This is simply the page background. In web context this is just the default `<body>` or hero container background color.

---

### 2. Background Photo
```
Asset: public/assets/hero/hero-background.webp
Implementation: CSS background-image or <img> with object-fit: cover
position: absolute; inset: 0;
width: 100%; height: 100%;
object-fit: cover;
object-position: center;
```
**Interaction:** Subtle parallax on mousemove (translate X/Y by a small fraction of mouse offset). Possible desaturation filter if Canva applied one — verify from Canva Adjust panel data.

---

### 3. Top Dark Gradient Overlay
```
Asset: public/assets/hero/hero-overlay-top.png (PNG with alpha)
Implementation: <img> or CSS background
position: absolute; top: 0; left: 0;
width: 100%; height: ~44% of container;
pointer-events: none;
```
**Alternative CSS rebuild (if raster not available):**
```css
background: linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%);
```
This may be sufficient if the gradient is simple. Verify against reference image.

---

### 4. Bottom Dark Gradient Overlay
```
Asset: public/assets/hero/hero-overlay-bottom.png (PNG with alpha)
Implementation: <img> or CSS background
position: absolute; bottom: 0; left: 0;
width: 100%; height: ~28% of container;
pointer-events: none;
```
**Alternative CSS rebuild:**
```css
background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
```

---

### 5. Badge Filled Shape
```
Asset: public/assets/hero/hero-badge-fill.svg
Implementation: <img> or inline <svg>
position: absolute;
Approximate center: 50% from left, 50% from top
Width: ~57% of page width
Height: ~82% of page height
Prefer inline SVG for animation/interaction capability.
Fill color: #343236 (dark charcoal)
```
**Interaction:**
- Subtle scale on hover (transform: scale(1.02))
- Very slow continuous rotation (optional)
- Parallax depth effect (moves slightly opposite to cursor)

---

### 6. Badge Inner Stroke Outline
```
Asset: public/assets/hero/hero-badge-outline.svg
Implementation: <img> or inline <svg>
position: absolute;
Same center as badge fill but slightly inset (~6-7% smaller)
Stroke: white, ~2-3px equivalent at web scale
Fill: none
```
**Interaction:** Moves together with badge fill as a unit.

---

### 7. Typography: "P" (Script Capital)
```
Font: Snell Roundhand LT Std Bold Script
Web font strategy: 
  - Option A: Self-host the font file (if licensed)
  - Option B: Use similar web alternative — "Pinyon Script" (Google Fonts) 
              or "Great Vibes" or "Pacifico" as fallback
  - PREFERRED: Self-host Snell Roundhand via @font-face if available in the system.
Size: ~174pt → proportionally scaled to viewport
Color: #FFFFFF
Position: Overlapping with "ortfolio", creating combined "Portfolio" word
z-index: Above badge
```
**Interaction:** 
- Scale hover on the combined "Portfolio" word
- Magnetic cursor response
- Tracking change on hover

---

### 8. Typography: "ortfolio" (Italic Sans-Serif)
```
Font: Plus Jakarta Sans Italic
Web font: Available on Google Fonts → import via @import or <link>
Size: ~86pt → proportionally scaled
Color: #FFFFFF
font-style: italic
Position: Adjacent to P, forming "Portfolio"
```

---

### 9. Category Labels: (01) Branding, (02) Illustration, (03) Graphic Design
```
Font: Plus Jakarta Sans
Weights: Regular for numbers, Bold for labels
Sizes: ~23.3pt for numbers, ~14.3pt for labels
Color: #FFFFFF
Positions:
  - (01) Branding: top-left corner (~10% from left, ~13% from top)
  - (03) Graphic Design: bottom-left corner (~12% from left, ~83% from top)
  - Illustration (02): bottom-right corner (~77% from left, ~83% from top)
```
**HTML Structure:**
```html
<div class="hero-category hero-category--top-left">
  <span class="hero-category-number">(01)</span>
  <span class="hero-category-label">Branding</span>
</div>
```
**Interaction:** Hover scale, cursor expand on hover.

---

### 10. Year: 2026
```
Font: Plus Jakarta Sans Bold
Size: ~23.3pt → proportionally scaled
Color: #FFFFFF
Position: Bottom-right corner (~89% from left, ~90% from top)
```

---

## Positioning Strategy (Web)

Since the original is a fixed A4 Landscape composition, on the web this should be implemented as a:

```
Full-viewport hero section
width: 100vw;
height: 100vh; (or 100svh for mobile)
position: relative;
overflow: hidden;
```

All internal elements should use **percentage-based positioning** derived from the original A4 dimensions (842.25 × 595.5 pt):

```
Position formula:
  left: (x0_pt / 842.25) * 100%
  top: (top_pt / 595.5) * 100%
```

Font sizes should use `clamp()` or `vw`-based sizing for responsiveness.

---

## Asset Export Guide (Manual — Canva)

Since the browser subagent quota was exhausted during the automated export session, these assets must be exported manually from Canva:

### How to export individual elements from Canva:

**Background Photo:**
1. Open Canva design → Page 01
2. Click the background photo to select it
3. Click `...` (three dots) in the top toolbar
4. Select "Download" → choose JPG (High quality) or PNG
5. Save as: `public/assets/hero/hero-background.webp` (convert to WebP after download)

**Badge Shape (SVG — preferred):**
1. In the Layers panel, expand the Portfolio group
2. Click the badge fill shape layer
3. Right-click → Download, or `...` → Download
4. Choose SVG format if available
5. Save as: `public/assets/hero/hero-badge-fill.svg`

**Badge Inner Stroke:**
1. Same as above but for the inner stroke outline layer
2. Save as: `public/assets/hero/hero-badge-outline.svg`

**Top and Bottom Overlays:**
1. Click each overlay element
2. Download as PNG (must preserve transparency)
3. Save as: `hero-overlay-top.png` and `hero-overlay-bottom.png`

**Alternative for overlays:** If the overlays are simple gradient shapes in Canva (not imported images), they can be recreated as CSS `linear-gradient` without needing to export.

---

## Fonts Required

| Font | Weight/Style | Source | Notes |
|---|---|---|---|
| Snell Roundhand LT Std Bold Script | Bold Script | Proprietary (Adobe) | Self-host if licensed. If not available: use "Pinyon Script" from Google Fonts as close alternative |
| Plus Jakarta Sans | Regular, Italic, Bold | Google Fonts | Freely available — add via Google Fonts CDN |

Google Fonts import (Plus Jakarta Sans):
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
```

Snell Roundhand alternative if not self-hostable:
```html
<link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" rel="stylesheet">
```

---

## Responsive Breakpoints

| Breakpoint | Strategy |
|---|---|
| Desktop (>1024px) | Full-viewport hero, all elements visible and positioned |
| Tablet (768–1024px) | Scale badge down, reduce font sizes proportionally |
| Mobile (<768px) | Stack composition vertically or hide corner labels, keep badge + Portfolio text centered |

---

## Visual QA Checklist (Pre-implementation)

Before implementing, verify these assets are available:
- [ ] `hero-background.webp` — full bleed background photo
- [ ] `hero-badge-fill.svg` — dark ornamental badge shape
- [ ] `hero-badge-outline.svg` — white inner border stroke
- [ ] `hero-overlay-top.png` — top dark gradient (or CSS alternative confirmed)
- [ ] `hero-overlay-bottom.png` — bottom dark gradient (or CSS alternative confirmed)
- [ ] Plus Jakarta Sans font loaded via Google Fonts
- [ ] Snell Roundhand or approved alternative loaded/self-hosted

After implementation, compare against `reference/page-01-reference.png`:
- [ ] Badge occupies same visual proportion
- [ ] Portfolio text sits correctly inside badge
- [ ] Corner labels positioned correctly
- [ ] 2026 sits bottom-right
- [ ] Gradient overlays create same cinematic vignette
- [ ] Color of badge matches (#343236 or visually equivalent)
- [ ] Inner white border visible and correctly inset
