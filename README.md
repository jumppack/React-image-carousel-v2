# React Image Carousel v2

A **3-image depth carousel** built with React and Vite. Inspired by Android's coverflow UI — the center image is always the dominant focal point, with flanking images visibly receding behind it. Navigation slides images smoothly into place using CSS transitions driven by React state.

---

## Demo

![Animated demo of the carousel navigating through 5 images](docs/carousel.gif)

> Center image is the dominant focal point — side images scale down and darken to create depth.

---

## Screenshot

![Carousel initial state — image 1 of 15](docs/screenshot-1.png)

---

## ✨ Features

### 🎠 3-Image Fan Layout
Three images are always on screen — left, center, right. The center image is the focal point:

| Slot | Scale | Brightness | z-index |
|------|-------|------------|---------|
| Center | `1.3×` (dominant) | `100%` | `10` |
| Side (±1) | `0.80×` | `40%` | `5` |
| Edge (±2) | `0.50×` | `20%` | `2` |

Side cards are also dimmed with `filter: brightness()` on top of `opacity`, reinforcing the sense that they are physically behind the center card.

### 🎬 Real Sliding Animation
Each image is keyed by its unique `image.id` — the same DOM node persists across React re-renders. When `currentIndex` changes, each slide's inline `transform` style updates and the CSS `transition` fires automatically, animating the card between its old and new position.

The easing `cubic-bezier(0.35, 0, 0.25, 1)` (Material Design "standard") gives a snappy start and smooth landing — matching the feel of Android carousels.

### ♾️ Infinite Loop
Navigation wraps seamlessly in both directions using shortest-path modular arithmetic, so the wrap-around animation always takes one step — never the long way round.

### 🌐 Live Image Fetching
Images are fetched from the [Lorem Picsum](https://picsum.photos) API. Loading, error, and empty states are all handled gracefully.

### ♿ Accessible
- `aria-label` on both nav buttons
- `aria-live="polite"` + `aria-atomic="true"` on the viewport
- `aria-hidden={true}` on all non-center slides
- `loading="lazy"` on side images, `loading="eager"` on the center

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Carousel.jsx   # fetch, state, slide position logic
│   └── Carousel.css   # transforms, transitions, depth effect, edge mask
├── App.jsx            # mounts <Carousel url limit />
├── App.css            # .card, .read-the-docs
├── index.css          # :root, body, #root globals
└── index.jsx          # React DOM entry point
docs/
├── screenshot-1.png   # Initial carousel state
└── screenshot-2.png   # After navigating
```

---

## 🚀 Getting Started

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev) | UI + state |
| [Vite 7](https://vitejs.dev) | Dev server & bundler |
| Vanilla CSS | Transitions, depth effect, edge mask |
| [Lorem Picsum API](https://picsum.photos/v2/list) | Free stock photos |
