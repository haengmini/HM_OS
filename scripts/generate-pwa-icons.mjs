// One-off icon generator for the PWA manifest (Milestone 5).
// Produces flat-color square PNGs with a simple pixel "H" mark,
// entirely via Node's built-in zlib (no ImageMagick/sharp/PIL
// available in this environment) so the output is deterministic and
// dependency-free. Run once; committed PNGs are the actual asset.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import process from 'node:process';

function crc32Buf(buf) {
  // node:zlib doesn't export crc32 in older Node; use a manual table
  // implementation for portability across Node versions.
  let c;
  const table = crc32Buf.table ?? (crc32Buf.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32Buf(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makeIcon(size, bg, fg) {
  const width = size;
  const height = size;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  // Simple pixel-art "H" mark centered on a flat background.
  const barWidth = Math.max(2, Math.round(width * 0.12));
  const barHeight = Math.round(height * 0.6);
  const top = Math.round((height - barHeight) / 2);
  const leftBarX = Math.round(width * 0.28);
  const rightBarX = Math.round(width * 0.72) - barWidth;
  const crossY = Math.round(height * 0.46);
  const crossHeight = Math.max(2, Math.round(height * 0.1));

  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter type 0 (none)
    for (let x = 0; x < width; x++) {
      const isBarPixel =
        y >= top &&
        y < top + barHeight &&
        ((x >= leftBarX && x < leftBarX + barWidth) || (x >= rightBarX && x < rightBarX + barWidth));
      const isCrossPixel =
        y >= crossY &&
        y < crossY + crossHeight &&
        x >= leftBarX + barWidth &&
        x < rightBarX;
      const useFg = isBarPixel || isCrossPixel;
      const [r, g, b] = useFg ? fg : bg;
      const offset = rowStart + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [15, 23, 42]; // matches --hm-os-bg
const FG = [59, 130, 246]; // matches idle-state blue accent

writeFileSync(new URL('../apps/web/public/icons/icon-192.png', import.meta.url), makeIcon(192, BG, FG));
writeFileSync(new URL('../apps/web/public/icons/icon-512.png', import.meta.url), makeIcon(512, BG, FG));
writeFileSync(new URL('../apps/web/public/icons/icon-maskable-512.png', import.meta.url), makeIcon(512, BG, FG));

process.stdout.write('Generated icon-192.png, icon-512.png, icon-maskable-512.png\n');
