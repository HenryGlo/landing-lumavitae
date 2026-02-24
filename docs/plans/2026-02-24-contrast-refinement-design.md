# Luma Vitae: Contrast & Visual Depth Refinement

## Problem
The entire page lives in one tonal register. Rose on cream on cream on rose. No visual punctuation, no rhythm. Philosophy and CTA sections have ~2:1 contrast ratios. Section labels nearly invisible. Buttons feel ghostly.

## Approach: "Warm Anchor"
Introduce a rich espresso-plum dark (#2D1F21) as a grounding tone. One dark philosophy section, one dark experience section, deeper rose CTA overlay, and improved text contrast throughout. The rose and cream become more beautiful by having something to breathe against.

## Color System

### New Variables
```css
--dark:          #2D1F21    /* Espresso-plum anchor */
--dark-warm:     #3A2428    /* Warmer variant for hover/secondary */
--cream-deep:    #F0E6DC    /* Subtle section alternation */
--rose-deep:     #C4868C    /* Richer rose for overlays */
--text-on-dark:  #FAF3EB    /* Cream text on dark backgrounds */
--text-body:     #3D2E30    /* Slightly darkened body text */
```

### Contrast Ratios Target
- Cream text on dark: ~12:1
- Dark text on cream: ~10:1
- Section labels on cream: ~5:1 (up from ~3:1)

## Section-by-Section Changes

### Hero
- Darken bottom gradient slightly for "descubre" readability
- Push subtitle opacity from 0.7 to 0.85

### Philosophy (Major Change)
- Overlay: `rgba(45,31,33,0.92)` (dark anchor instead of rose)
- Quote text: cream on near-black warm background
- Butterfly icon: cream against dark
- Attribution: cream, opacity 0.8

### About
- Section label: bump to --text-rose-dark
- No structural changes

### Classes
- Background: --cream-deep (#F0E6DC) instead of --cream-light
- Cards stay cream for lift

### Studio
- Bump feature text slightly darker
- No structural changes

### Products
- Bump section label and heading contrast
- No structural changes

### Experience Quote (Major Change)
- Quote side background: --dark (#2D1F21)
- Text: cream italic on dark
- Butterfly icon: cream
- Creates second dark "breath" bookending with philosophy

### CTA
- Overlay: rgba(196,134,140,0.92) (deeper rose)
- Text stays cream, now with real contrast
- Button hover: subtle glow

### Contact & Footer
- Bump label contrast
- Cleaner footer divider

### Buttons
- btn-outline: filled rose background with cream text as primary state
- Outline becomes secondary/hover variant
- CTA buttons feel clickable, not ghostly
