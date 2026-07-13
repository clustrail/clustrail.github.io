// Generates public/og.png (1200x630) - the social share card.
//
// Authored as an SVG in the site's own visual language (near-black canvas,
// subtle dot grid, two-tone wordmark, mono metrics strip) and rasterized
// with sharp. Run once and commit the PNG: `node scripts/gen-og.mjs`.
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/og.png');

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" fill-opacity="0.035"/>
    </pattern>
  </defs>

  <!-- Near-black canvas with a quiet dot grid -->
  <rect width="${W}" height="${H}" fill="#1a1a1a"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- Thin Kubernetes-blue accent line -->
  <rect x="90" y="196" width="72" height="3" rx="1.5" fill="#326ce5"/>

  <!-- Two-tone wordmark -->
  <text x="88" y="322" font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
        font-size="132" font-weight="700" letter-spacing="-4">
    <tspan fill="#85a8f1">Clus</tspan><tspan fill="#ffffff">trail</tspan>
  </text>

  <!-- Tagline -->
  <text x="90" y="392" font-family="Inter, 'Helvetica Neue', Arial, sans-serif"
        font-size="40" font-weight="400" fill="#e5e5e5" letter-spacing="-0.5">A Kubernetes UI on steroids</text>

  <!-- Mono metrics strip -->
  <text x="90" y="536" font-family="'JetBrains Mono', 'SF Mono', Menlo, monospace"
        font-size="26" font-weight="400" fill="#a3a3a3" letter-spacing="0.5">175 KB initial JS  -  49 MB idle  -  one binary</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT} (${meta.width}x${meta.height})`);
