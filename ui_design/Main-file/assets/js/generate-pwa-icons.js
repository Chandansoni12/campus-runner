/**
 * Generate PWA icons for manifest.json (required for "Add to Home Screen").
 * Run: node scripts/generate-pwa-icons.js
 * Creates solid orange (#FD6931) PNGs using Node built-ins only — no network, no extra deps.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '..', 'icons');

// Orange #FD6931
const R = 253, G = 105, B = 49, A = 255;

function writeChunk(buffer, type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, Buffer.from(type), data, crcBuf]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const crc32Table = (() => {
  const t = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function createPng(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(2, 9);   // color type RGB
  ihdr.writeUInt8(0, 10);  // compression
  ihdr.writeUInt8(0, 11);  // filter
  ihdr.writeUInt8(0, 12);  // interlace
  const ihdrChunk = writeChunk(null, 'IHDR', ihdr);

  const raw = Buffer.alloc(size * (1 + size * 3));
  let off = 0;
  for (let y = 0; y < size; y++) {
    raw[off++] = 0;
    for (let x = 0; x < size; x++) {
      raw[off++] = R;
      raw[off++] = G;
      raw[off++] = B;
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = writeChunk(null, 'IDAT', compressed);
  const iendChunk = writeChunk(null, 'IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function main() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const size of sizes) {
    const png = createPng(size);
    const file = path.join(outDir, `icon-${size}x${size}.png`);
    fs.writeFileSync(file, png);
    console.log('Written:', file);
  }
  console.log('Done. Commit the icons/ folder and redeploy.');
}

main();
