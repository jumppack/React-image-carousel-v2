/**
 * capture.mjs  —  headless carousel screenshot + GIF generator
 *
 * Uses puppeteer (bundles its own Chrome, no separate install needed)
 * to take clean screenshots at 5 carousel states, then stitches them
 * into an animated GIF with gif-encoder-2 + pngjs (both pure JS).
 *
 * Run from image-carousel-adv/:
 *   node scripts/capture.mjs
 *
 * Outputs:
 *   docs/screenshot-1.png … screenshot-5.png
 *   docs/carousel.gif
 */

import puppeteer    from 'puppeteer';
import GIFEncoder   from 'gif-encoder-2';
import { PNG }      from 'pngjs';
import fs           from 'fs';
import path         from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS      = path.join(__dirname, '..', 'docs');
const URL       = 'http://localhost:5173';
const W = 1000;
const H = 600;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function shoot(page, name) {
  const dest = path.join(DOCS, name);
  await page.screenshot({ path: dest, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(`  📸  ${name}`);
  return dest;
}

(async () => {
  fs.mkdirSync(DOCS, { recursive: true });

  // ── 1. Launch headless Chrome and capture screenshots ──────
  console.log('\n🚀 Launching headless Chrome…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H });

  console.log(`   Loading ${URL}…`);
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await sleep(2000);   // let images fully render + any entrance animation settle

  const shots = [];

  // Frame 1 — initial state
  shots.push(await shoot(page, 'screenshot-1.png'));

  // Frames 2-5 — click next and capture each transition
  for (let i = 2; i <= 5; i++) {
    await page.click('button[aria-label="Next image"]');
    await sleep(700);   // CSS transition is 0.55s, give it a bit extra
    shots.push(await shoot(page, `screenshot-${i}.png`));
  }

  await browser.close();
  console.log('✅ Screenshots captured.\n');

  // ── 2. Build animated GIF ───────────────────────────────────
  console.log('🎞️  Building GIF…');
  const encoder = new GIFEncoder(W, H, 'neuquant', true);
  const gifPath = path.join(DOCS, 'carousel.gif');
  const fileStream = fs.createWriteStream(gifPath);
  encoder.createReadStream().pipe(fileStream);

  encoder.start();
  encoder.setRepeat(0);     // loop forever
  encoder.setDelay(1200);   // 1.2 seconds per frame
  encoder.setQuality(10);   // 1 (best) → 20

  for (const shotPath of shots) {
    const raw = fs.readFileSync(shotPath);
    const png = PNG.sync.read(raw);
    encoder.addFrame(png.data);
    console.log(`  frame → ${path.basename(shotPath)}`);
  }

  encoder.finish();

  await new Promise(resolve => fileStream.on('finish', resolve));
  console.log(`\n✅ GIF saved → ${gifPath}`);
  console.log('🎉 All done!\n');
})();
