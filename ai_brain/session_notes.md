# AI Brain — Advanced Image Carousel (image-carousel-adv)

**Date:** 2026-02-19  
**Project:** `/Users/karanmehta/Desktop/Code/Prep_Materials/image-carousel-adv`

## What Was Built

An advanced **3-image fan carousel** — shows left, center, and right images simultaneously. Center image is larger and fully-opaque; side images are dimmed and scaled down. Smooth CSS transitions on next/prev.

## Pattern Notes

- **5-slot render trick**: Always render 5 positions (offset −2 to +2). Center is index 0. Scale/opacity CSS classes do the work — no strip translateX needed.
- **Infinite loop**: `wrapIndex = ((idx % len) + len) % len` — handles both positive and negative wrap.
- **CSS scoping**: All carousel styles live in `Carousel.css`, app-level in `App.css`, globals in `index.css`.
- **`useCallback`**: Both `handleNext` and `handlePrev` wrapped to avoid re-creation each render.
- **`aria-live="polite"`** on the viewport container for screen reader support.

## Files

| File | Purpose |
|------|---------|
| `src/components/Carousel.jsx` | 3-image fan carousel component |
| `src/components/Carousel.css` | Scale/opacity/transition styles, edge mask |
| `src/App.jsx` | Passes `url` + `limit` to Carousel |
| `src/App.css` | `.card` + `.read-the-docs` |
| `src/index.css` | Global `:root`, `body`, `#root`, `h1` |
