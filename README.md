# React Image Carousel v2

A polished **3-image depth carousel** built with React and Vite. Inspired by Android's coverflow-style UI, it keeps three photos on screen simultaneously — with the **center image twice the size** of the flanking ones — and uses smooth CSS transitions to physically slide images into place when navigating.

---

## ✨ Features

### 🎠 3-Image Fan Carousel
The carousel always shows **three images at once**: left, center, and right. The center image is the focal point — it is **2× larger, fully bright, and elevated** (higher z-index + drop shadow). Side images are scaled down to 50%, dimmed with a brightness filter, and sit visually *behind* the center card, giving a natural depth-of-field feel.

### 🎬 Smooth Slide Animation
Clicking **‹** or **›** triggers a real CSS transition — images physically glide from one slot to the next. This works because each image is keyed to its own DOM node (`key={image.id}`), so when `currentIndex` changes the browser animates the `transform` change frame-by-frame rather than snapping to a new layout. The easing uses Material Design's standard curve (`cubic-bezier(0.35, 0, 0.25, 1)`) for a snappy, tactile feel.

### ♾️ Infinite Loop
Navigation wraps seamlessly in both directions. Pressing **›** from the last image transitions to the first, and pressing **‹** from the first transitions to the last — with no jump or flash.

### 🌐 Live Image Fetching
Images are fetched from the [Lorem Picsum](https://picsum.photos) REST API via `fetch` inside a `useEffect` hook. A loading state is shown while the request is in flight, and an error state is shown if the fetch fails.

### ♿ Accessible
- `aria-label` on both navigation buttons
- `aria-live="polite"` on the carousel viewport (screen readers announce image changes)
- `aria-hidden={true}` on non-center slides

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Carousel.jsx   # 3-image carousel — fetch, state, render
│   └── Carousel.css   # slide transforms, transitions, depth effect
├── App.jsx            # mounts <Carousel />, passes API url + limit
├── App.css            # app-level styles (.card, .read-the-docs)
├── index.css          # global styles (:root, body, #root)
└── index.jsx          # React DOM entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev) | UI library |
| [Vite 7](https://vitejs.dev) | Dev server & bundler |
| Vanilla CSS | Component-scoped styles, transitions |
| [Lorem Picsum API](https://picsum.photos/v2/list) | Free stock photo source |

---

## 🎨 How the Depth Effect Works

Each slide is `position: absolute` anchored at `top: 50%; left: 50%` inside the track. An inline `transform` style is computed per-slide based on its offset from the current center:

| Position | `scale` | `brightness` | `z-index` |
|----------|---------|-------------|---------|
| Center (0) | `1.3` | `100%` | `10` |
| Side (±1) | `0.50` | `50%` | `5` |
| Edge (±2) | `0.40` | `30%` | `2` |

When `currentIndex` updates, React keeps the same DOM node for each image and updates its inline style — the CSS `transition` on `transform`, `opacity`, `filter`, and `box-shadow` fires automatically, producing the sliding depth animation.
