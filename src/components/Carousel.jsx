import { useState, useEffect, useCallback } from 'react';
import './Carousel.css';

/**
 * Returns the full inline-style transform block for a slide
 * at the given offset from the center.
 *
 * Every slide is anchored at top:50% / left:50% in the track.
 * translate(-50%, -50%) centres it, then additional X/Y/scale
 * shift it to the correct visual position.
 *
 * When currentIndex changes, React updates the style on the
 * *same* DOM node (keyed by image.id), so the CSS transition
 * fires and the card visibly glides from its old slot to the new one.
 *
 * The shrinking scale + brightness-filter gives the "cards receding
 * behind the center image" (cartwheel / coverflow) effect.
 */
const getSlideStyle = (offset) => {
  const abs  = Math.abs(offset);
  const sign = offset > 0 ? 1 : -1;

  switch (abs) {
    /* ── Center (active) ─────────────────────────────────── */
    case 0:
      return {
        transform:  'translate(-50%, -50%) scale(1.3)',
        opacity:    1,
        zIndex:     10,
        filter:     'brightness(1)',
        boxShadow:  '0 24px 60px rgba(0, 0, 0, 0.75)',
      };

    /* ── Adjacent (±1) ───────────────────────────────────── */
    case 1:
      /*
       * translateX moves the card to the side.
       * translateY(-43%) instead of (-50%) nudges the card
       * downward by ~7% of slide height, so only the top portion
       * overl aps behind the center card — reinforcing the "behind" feel.
       * scale(0.60) makes it noticeably smaller.
       * brightness(0.50) darkens it so it reads as receded.
       */
      return {
        transform:  `translate(calc(-50% + ${sign * 150}px), -50%) scale(0.80)`,
        opacity:    0.78,
        zIndex:     5,
        filter:     'brightness(0.40)',
        boxShadow:  '0 8px 24px rgba(0, 0, 0, 0.55)',
      };

    /* ── Outer edge (±2) ─────────────────────────────────── */
    case 2:
      return {
        transform:  `translate(calc(-50% + ${sign * 250}px), -50%) scale(0.50)`,
        opacity:    0.38,
        zIndex:     2,
        filter:     'brightness(0.20)',
        boxShadow:  '0 4px 10px rgba(0, 0, 0, 0.40)',
      };

    /* ── Hidden (|offset| > 2) ───────────────────────────── */
    default:
      /*
       * Kept in the DOM so they can animate OUT smoothly
       * (opacity:0 still lets the transition play).
       * pointerEvents:none prevents them from intercepting clicks.
       */
      return {
        transform:  `translate(calc(-50% + ${sign * 480}px), -50%) scale(0.25)`,
        opacity:    0,
        zIndex:     0,
        filter:     'brightness(0)',
        pointerEvents: 'none',
      };
  }
};

/* ─────────────────────────────────────────────────────────── */

const Carousel = ({ url, limit = 15 }) => {
  const [images, setImages]           = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  /* ── Fetch images ────────────────────────────────────────── */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const fetchUrl = url.includes('?')
          ? `${url}&limit=${limit}`
          : `${url}?limit=${limit}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Failed to fetch images');
        const data = await response.json();
        setImages(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [url, limit]);

  const n = images.length;

  /* ── Index helpers ───────────────────────────────────────── */
  // Normalises any integer index into [0, n-1] — handles negative wrap.
  const wrapIndex = useCallback(
    (idx) => ((idx % n) + n) % n,
    [n]
  );

  const handleNext = useCallback(
    () => setCurrentIndex((prev) => wrapIndex(prev + 1)),
    [wrapIndex]
  );

  const handlePrev = useCallback(
    () => setCurrentIndex((prev) => wrapIndex(prev - 1)),
    [wrapIndex]
  );

  /* ── Guards ──────────────────────────────────────────────── */
  if (loading) return <div className="carousel-status">Loading images…</div>;
  if (error)   return <div className="carousel-status carousel-status--error">Error: {error}</div>;
  if (!n)      return <div className="carousel-status">No images found.</div>;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="carousel-container">

      {/* Prev button */}
      <button
        className="carousel-btn"
        onClick={handlePrev}
        aria-label="Previous image"
      >
        &#8249;
      </button>

      {/*
       * The viewport clips and masks the track.
       * aria-live lets screen readers announce image changes.
       */}
      <div
        className="carousel-viewport"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="carousel-track">
          {images.map((image, idx) => {
            /*
             * Shortest-path offset:
             * For n=15, going from index 14→0 gives raw offset = 0-14 = -14.
             * After normalisation: -14 + 15 = +1, so image 0 correctly
             * appears ONE step to the RIGHT of image 14. Wrap looks seamless.
             */
            let offset = idx - currentIndex;
            if (offset >  n / 2) offset -= n;
            if (offset < -n / 2) offset += n;

            const isCenter = offset === 0;
            const style    = getSlideStyle(offset);

            return (
              /*
               * key=image.id is CRITICAL.
               * React keeps the same DOM node for each image, so when
               * currentIndex changes and the inline style updates,
               * the CSS transition fires and the card physically slides
               * from its old position to its new one.
               */
              <div
                key={image.id}
                className="carousel-slide"
                style={style}
                aria-hidden={!isCenter}
              >
                <img
                  src={image.download_url}
                  alt={`Photo by ${image.author}`}
                  className="carousel-slide__img"
                  loading={isCenter ? 'eager' : 'lazy'}
                  draggable={false}
                />

                {/* Caption only on the active center slide */}
                {isCenter && (
                  <div className="carousel-slide__caption">
                    <span className="carousel-slide__author">{image.author}</span>
                    <span className="carousel-slide__indicator">
                      {currentIndex + 1}&nbsp;/&nbsp;{n}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <button
        className="carousel-btn"
        onClick={handleNext}
        aria-label="Next image"
      >
        &#8250;
      </button>

    </div>
  );
};

export default Carousel;
