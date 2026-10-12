// Renders the extension icons: the BlueBranch mark in white on a brand-blue
// rounded square, with a small check badge on the larger sizes. No image
// library needed: SVG path flattening + nonzero fill + supersampling + zlib.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const SIZES = [16, 32, 48, 128];
const OUT_DIR = new URL('../public/icon/', import.meta.url);
const BRAND = [0, 54, 255];
const BRAND_DARK = [0, 38, 196];
const WHITE = [255, 255, 255];

// Single source of truth for the mark: src/shared/brand.ts
const brandSource = readFileSync(new URL('../src/shared/brand.ts', import.meta.url), 'utf8');
const MARK_PATH = /export const MARK_PATH =\s*'([^']+)'/.exec(brandSource)[1];

/** Parses an SVG path (M, L, H, V, C, S, Z and lower-case variants) into polygons. */
function parsePath(d) {
  const tokens = d.match(/[MLHVCSZmlhvcsz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g);
  const polygons = [];
  let current = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let lastControl = null;
  let command = '';
  let i = 0;
  const num = () => Number(tokens[i++]);
  const cubic = (x1, y1, x2, y2, ex, ey) => {
    const [sx, sy] = [x, y];
    for (let step = 1; step <= 12; step++) {
      const t = step / 12;
      const mt = 1 - t;
      current.push([
        mt ** 3 * sx + 3 * mt ** 2 * t * x1 + 3 * mt * t ** 2 * x2 + t ** 3 * ex,
        mt ** 3 * sy + 3 * mt ** 2 * t * y1 + 3 * mt * t ** 2 * y2 + t ** 3 * ey,
      ]);
    }
    lastControl = [x2, y2];
    x = ex;
    y = ey;
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) command = tokens[i++];
    const rel = command === command.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (command.toUpperCase()) {
      case 'M':
        if (current.length) polygons.push(current);
        x = ox + num();
        y = oy + num();
        startX = x;
        startY = y;
        current = [[x, y]];
        command = rel ? 'l' : 'L'; // further pairs are implicit line-tos
        lastControl = null;
        break;
      case 'L':
        x = ox + num();
        y = oy + num();
        current.push([x, y]);
        lastControl = null;
        break;
      case 'H':
        x = ox + num();
        current.push([x, y]);
        lastControl = null;
        break;
      case 'V':
        y = oy + num();
        current.push([x, y]);
        lastControl = null;
        break;
      case 'C': {
        const v = [num(), num(), num(), num(), num(), num()];
        cubic(ox + v[0], oy + v[1], ox + v[2], oy + v[3], ox + v[4], oy + v[5]);
        break;
      }
      case 'S': {
        const v = [num(), num(), num(), num()];
        const [cx, cy] = lastControl ? [2 * x - lastControl[0], 2 * y - lastControl[1]] : [x, y];
        cubic(cx, cy, ox + v[0], oy + v[1], ox + v[2], oy + v[3]);
        break;
      }
      case 'Z':
        x = startX;
        y = startY;
        if (current.length) polygons.push(current);
        current = [];
        lastControl = null;
        break;
      default:
        throw new Error(`Unsupported path command ${command}`);
    }
  }
  if (current.length) polygons.push(current);
  return polygons;
}

function bounds(polygons) {
  const xs = polygons.flat().map((p) => p[0]);
  const ys = polygons.flat().map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/** Nonzero winding rule, like SVG's default fill-rule. */
function inside(polygons, px, py) {
  let winding = 0;
  for (const polygon of polygons) {
    for (let k = 0; k < polygon.length; k++) {
      const [x1, y1] = polygon[k];
      const [x2, y2] = polygon[(k + 1) % polygon.length];
      if (y1 <= py) {
        if (y2 > py && (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) > 0) winding++;
      } else if (y2 <= py && (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1) < 0) winding--;
    }
  }
  return winding !== 0;
}

function roundedRectDistance(x, y, half, radius) {
  const qx = Math.abs(x) - half + radius;
  const qy = Math.abs(y) - half + radius;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function segmentDistance(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

const markPolygons = parsePath(MARK_PATH);
const markBounds = bounds(markPolygons);

/** Colour at a point in the -1..1 square, or null for transparent. */
function sample(x, y, size) {
  if (roundedRectDistance(x, y, 0.96, 0.4) > 0) return null;

  const withBadge = size >= 48;
  if (withBadge) {
    // Check badge, bottom right: white circle with a brand-blue check mark.
    const [bx, by, br] = [0.56, 0.56, 0.34];
    const d = Math.hypot(x - bx, y - by);
    if (d <= br) {
      const check = [
        [bx - 0.15, by + 0.0],
        [bx - 0.04, by + 0.11],
        [bx + 0.16, by - 0.1],
      ];
      const onCheck = Math.min(segmentDistance(x, y, check[0], check[1]), segmentDistance(x, y, check[1], check[2])) <= 0.05;
      return onCheck ? BRAND : WHITE;
    }
    if (d <= br + 0.07) return BRAND_DARK; // ring separating badge and mark
  }

  // Mark: centred (shifted up-left a bit when the badge is shown), 62 % of the icon.
  const scale = (withBadge ? 1.18 : 1.3) / (markBounds.maxY - markBounds.minY);
  const offsetX = withBadge ? -0.1 : 0;
  const offsetY = withBadge ? -0.08 : 0;
  const mx = (x - offsetX) / scale + (markBounds.minX + markBounds.maxX) / 2;
  const my = (y - offsetY) / scale + (markBounds.minY + markBounds.maxY) / 2;
  if (inside(markPolygons, mx, my)) return WHITE;

  const t = (y + 1) / 2;
  return BRAND.map((c, i) => Math.round(c + (BRAND_DARK[i] - c) * t * 0.6));
}

function render(size) {
  const ss = 5;
  const pixels = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = ((px + (sx + 0.5) / ss) / size) * 2 - 1;
          const y = ((py + (sy + 0.5) / ss) / size) * 2 - 1;
          const color = sample(x, y, size);
          if (color) {
            r += color[0];
            g += color[1];
            b += color[2];
            a += 1;
          }
        }
      }
      const i = (py * size + px) * 4;
      pixels[i] = a ? Math.round(r / a) : 0;
      pixels[i + 1] = a ? Math.round(g / a) : 0;
      pixels[i + 2] = a ? Math.round(b / a) : 0;
      pixels[i + 3] = Math.round((a / (ss * ss)) * 255);
    }
  }
  return pixels;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  writeFileSync(new URL(`${size}.png`, OUT_DIR), png(size, render(size)));
}
console.log(`Icons written to ${OUT_DIR.pathname}`);
