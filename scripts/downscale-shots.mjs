// Emits downscaled siblings for every product screenshot.
//
// The masters under public/shots are 3200x2000. For each `foo.png` this
// writes `foo-1600w.png` and `foo-2400w.png` so BrowserFrame can advertise a
// srcSet and the browser can fetch a variant that fits the layout instead of
// always paying for the 3200px master. Variants are committed; a variant is
// skipped when it already exists and is newer than its master.
//
// Run: `node scripts/downscale-shots.mjs` (or `pnpm shots:build`).
import {fileURLToPath} from 'node:url';
import {dirname, resolve, join} from 'node:path';
import {readdirSync, statSync, existsSync} from 'node:fs';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(__dirname, '../public/shots');
const WIDTHS = [1600, 2400];

const masters = readdirSync(SHOTS).filter(
  (f) => f.endsWith('.png') && !/-\d+w\.png$/.test(f),
);

let written = 0;
let skipped = 0;

for (const file of masters) {
  const master = join(SHOTS, file);
  const masterMtime = statSync(master).mtimeMs;
  const stem = file.replace(/\.png$/, '');

  for (const width of WIDTHS) {
    const out = join(SHOTS, `${stem}-${width}w.png`);
    if (existsSync(out) && statSync(out).mtimeMs >= masterMtime) {
      skipped += 1;
      continue;
    }
    await sharp(master).resize({width}).png({compressionLevel: 9}).toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`Wrote ${stem}-${width}w.png (${meta.width}x${meta.height})`);
    written += 1;
  }
}

console.log(`Done: ${written} written, ${skipped} skipped.`);
