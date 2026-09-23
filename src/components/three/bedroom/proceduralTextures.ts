import * as THREE from "three";

// Every surface texture in the bedroom is painted here on a canvas at
// runtime instead of being downloaded — the whole room costs zero texture
// bytes over the network, and each map is seamlessly tileable so it can be
// repeated across floors and walls without visible seams.

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LATTICE = 256;

/** Periodic 2D value noise: wraps every `px`/`py` lattice cells, so textures tile. */
function createNoise(seed: number) {
  const rand = mulberry32(seed);
  const vals = new Float32Array(LATTICE * LATTICE);
  for (let i = 0; i < vals.length; i++) vals[i] = rand();

  const noise = (x: number, y: number, px: number, py: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const x0 = ((xi % px) + px) % px;
    const y0 = ((yi % py) + py) % py;
    const x1 = (x0 + 1) % px;
    const y1 = (y0 + 1) % py;
    const s = xf * xf * (3 - 2 * xf);
    const t = yf * yf * (3 - 2 * yf);
    const a = vals[y0 * LATTICE + x0];
    const b = vals[y0 * LATTICE + x1];
    const c = vals[y1 * LATTICE + x0];
    const d = vals[y1 * LATTICE + x1];
    return a + (b - a) * s + (c - a) * t + (a - b - c + d) * s * t;
  };

  /** Fractal noise over u,v ∈ [0,1), `fx`/`fy` base cells across the tile. */
  const fbm = (u: number, v: number, fx: number, fy: number, octaves = 4) => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let ax = fx;
    let ay = fy;
    for (let o = 0; o < octaves; o++) {
      const px = Math.min(ax, LATTICE);
      const py = Math.min(ay, LATTICE);
      sum += amp * noise(u * px, v * py, px, py);
      norm += amp;
      amp *= 0.5;
      ax *= 2;
      ay *= 2;
    }
    return sum / norm;
  };

  return { noise, fbm, rand };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean, repeat = true) {
  const tex = new THREE.CanvasTexture(canvas);
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export interface PbrMaps {
  map: THREE.Texture;
  roughnessMap: THREE.Texture;
  bumpMap: THREE.Texture;
}

function writePixel(d: Uint8ClampedArray, i: number, r: number, g: number, b: number) {
  d[i] = r;
  d[i + 1] = g;
  d[i + 2] = b;
  d[i + 3] = 255;
}

// ── Engineered oak floor: staggered planks, grain, bevelled seams ──────────
// One tile = 1.2 m × 1.2 m of floor, 8 planks of 15 cm.
function makeOakFloor(): PbrMaps {
  const S = 1024;
  const ROWS = 8;
  const rowH = S / ROWS;
  const { fbm, rand } = createNoise(11);

  // Plank end-joints per row (wrapping, so the tile repeats seamlessly).
  const rowSeg: Int16Array[] = [];
  const rowJoints: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const start = Math.floor(rand() * S);
    const joints: number[] = [];
    let x = start;
    while (x < start + S) {
      joints.push(x % S);
      x += Math.floor(S * (0.45 + rand() * 0.5));
    }
    joints.sort((a, b) => a - b);
    const seg = new Int16Array(S);
    for (let px = 0; px < S; px++) {
      let idx = joints.length - 1;
      for (let j = 0; j < joints.length; j++) if (px >= joints[j]) idx = j;
      seg[px] = r * 16 + idx;
    }
    rowSeg.push(seg);
    rowJoints.push(joints);
  }
  const plankTone = new Float32Array(ROWS * 16).map(() => 0.84 + rand() * 0.3);
  const plankShift = new Float32Array(ROWS * 16).map(() => rand() * 10);

  const col = makeCanvas(S, S);
  const rough = makeCanvas(S, S);
  const bump = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const rImg = rough.getContext("2d")!.createImageData(S, S);
  const bImg = bump.getContext("2d")!.createImageData(S, S);

  for (let y = 0; y < S; y++) {
    const row = Math.floor(y / rowH);
    const ly = (y - row * rowH) / rowH;
    const seg = rowSeg[row];
    const joints = rowJoints[row];
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const p = seg[x];
      const tone = plankTone[p];
      const shift = plankShift[p];

      // Quarter-sawn look: grain lines run the plank's length with only a
      // gentle long-wave drift, plus fine pore streaks.
      const warp = fbm(u, v, 4, 8, 3);
      const ringCoord = ly * 5.0 + warp * 1.4 + shift;
      const ring = ringCoord - Math.floor(ringCoord);
      const line = Math.pow(1 - Math.abs(ring * 2 - 1), 9);
      const streak = fbm(u, v, 2, 192, 3);
      const cathedral = Math.pow(Math.max(0, Math.sin(ringCoord * 0.7 + u * 6.283 * 2)), 16) * 0.6;

      let jointDist = S;
      for (const j of joints) {
        const dd = Math.abs(x - j);
        jointDist = Math.min(jointDist, dd, S - dd);
      }
      const seamDist = Math.min(ly * rowH, (1 - ly) * rowH, jointDist);
      const gap = seamDist < 1.2 ? 1 : 0;
      const bevel = seamDist < 4 ? 1 - seamDist / 4 : 0;

      let shade = tone * (1 - 0.13 * line - 0.1 * cathedral) * (0.9 + 0.18 * streak);
      shade *= 1 - 0.22 * bevel;
      if (gap) shade *= 0.42;

      const i = (y * S + x) * 4;
      writePixel(cImg.data, i, 196 * shade, 152 * shade, 108 * shade);
      const rv = gap ? 255 : 105 + 55 * line + 40 * (1 - streak);
      writePixel(rImg.data, i, rv, rv, rv);
      const bv = gap ? 0 : 190 - 60 * bevel - 40 * line + 30 * streak;
      writePixel(bImg.data, i, bv, bv, bv);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  rough.getContext("2d")!.putImageData(rImg, 0, 0);
  bump.getContext("2d")!.putImageData(bImg, 0, 0);
  return { map: toTexture(col, true), roughnessMap: toTexture(rough, false), bumpMap: toTexture(bump, false) };
}

// ── Straight-grain veneer for furniture (grain runs along v) ────────────────
function makeVeneer(seed: number, base: [number, number, number]): PbrMaps {
  const S = 512;
  const { fbm } = createNoise(seed);
  const col = makeCanvas(S, S);
  const rough = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const rImg = rough.getContext("2d")!.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const warp = fbm(u, v, 8, 2, 3);
      const rc = u * 14 + warp * 4;
      const ring = rc - Math.floor(rc);
      const line = Math.pow(1 - Math.abs(ring * 2 - 1), 5);
      const fine = fbm(u, v, 200, 4, 2);
      const shade = (1 - 0.28 * line) * (0.88 + 0.22 * fine);
      const i = (y * S + x) * 4;
      writePixel(cImg.data, i, base[0] * shade, base[1] * shade, base[2] * shade);
      const rv = 120 + 60 * line;
      writePixel(rImg.data, i, rv, rv, rv);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  rough.getContext("2d")!.putImageData(rImg, 0, 0);
  const roughnessMap = toTexture(rough, false);
  return { map: toTexture(col, true), roughnessMap, bumpMap: roughnessMap };
}

// ── Plain-weave fabric: neutral grey, tinted by the material colour ─────────
function makeWeave(seed: number, threadPx: number, slub: number): PbrMaps {
  const S = 512;
  const { fbm } = createNoise(seed);
  const col = makeCanvas(S, S);
  const bump = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const bImg = bump.getContext("2d")!.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const cx = Math.floor(x / threadPx);
      const cy = Math.floor(y / threadPx);
      const fx = (x % threadPx) / threadPx;
      const fy = (y % threadPx) / threadPx;
      const warpOver = (cx + cy) % 2 === 0;
      const h = warpOver ? Math.sin(fx * Math.PI) : Math.sin(fy * Math.PI);
      const slubs = fbm(u, v, 64, 8, 3) * 0.5 + fbm(u, v, 8, 64, 3) * 0.5;
      const i = (y * S + x) * 4;
      const c = 255 * (0.86 + 0.1 * h + slub * (slubs - 0.5));
      writePixel(cImg.data, i, c, c, c);
      const b = 255 * (0.35 + 0.55 * h * (0.8 + 0.4 * slubs));
      writePixel(bImg.data, i, b, b, b);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  bump.getContext("2d")!.putImageData(bImg, 0, 0);
  const bumpMap = toTexture(bump, false);
  return { map: toTexture(col, true), roughnessMap: bumpMap, bumpMap };
}

// ── Bouclé: dense looped nubs, used on the armchair ─────────────────────────
function makeBoucle(): PbrMaps {
  const S = 512;
  const { fbm } = createNoise(29);
  const col = makeCanvas(S, S);
  const bump = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const bImg = bump.getContext("2d")!.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const nubs = fbm(u, v, 96, 96, 3);
      const loops = Math.pow(Math.max(0, nubs - 0.35) / 0.65, 0.6);
      const i = (y * S + x) * 4;
      const c = 255 * (0.8 + 0.2 * loops);
      writePixel(cImg.data, i, c, c, c);
      const b = 255 * loops;
      writePixel(bImg.data, i, b, b, b);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  bump.getContext("2d")!.putImageData(bImg, 0, 0);
  const bumpMap = toTexture(bump, false);
  return { map: toTexture(col, true), roughnessMap: bumpMap, bumpMap };
}

// ── Lime-wash plaster: very soft mottling for the walls ────────────────────
function makePlaster(): PbrMaps {
  const S = 512;
  const { fbm } = createNoise(5);
  const col = makeCanvas(S, S);
  const bump = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const bImg = bump.getContext("2d")!.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const broad = fbm(u, v, 4, 4, 4);
      const grit = fbm(u, v, 128, 128, 2);
      const i = (y * S + x) * 4;
      const c = 255 * (0.93 + 0.07 * broad);
      writePixel(cImg.data, i, c, c, c);
      const b = 255 * (0.5 + 0.3 * grit + 0.2 * broad);
      writePixel(bImg.data, i, b, b, b);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  bump.getContext("2d")!.putImageData(bImg, 0, 0);
  const bumpMap = toTexture(bump, false);
  return { map: toTexture(col, true), roughnessMap: bumpMap, bumpMap };
}

// ── Hand-knotted wool rug with a double border ──────────────────────────────
function makeRug(): PbrMaps {
  const W = 1024;
  const H = 768;
  const { fbm } = createNoise(41);
  const col = makeCanvas(W, H);
  const bump = makeCanvas(W, H);
  const cImg = col.getContext("2d")!.createImageData(W, H);
  const bImg = bump.getContext("2d")!.createImageData(W, H);
  const field: [number, number, number] = [214, 204, 188];
  const border: [number, number, number] = [150, 128, 108];
  const accent: [number, number, number] = [178, 112, 80];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const edge = Math.min(x, y, W - x, H - y);
      let c = field;
      if (edge < 46) c = border;
      else if (edge > 62 && edge < 70) c = accent;
      else if (edge > 84 && edge < 88) c = border;
      // Faint abrash — the tone drift real hand-dyed wool rugs have.
      const abrash = fbm(u, v, 3, 2, 3);
      const pile = fbm(u, v, 256, 192, 2);
      const motif = Math.sin(u * 40 + Math.sin(v * 18) * 2) * Math.sin(v * 30 + Math.sin(u * 14) * 2);
      const motifMask = edge > 100 && motif > 0.82 ? 0.9 : 1;
      const shade = (0.88 + 0.12 * abrash) * (0.9 + 0.14 * pile) * motifMask;
      const i = (y * W + x) * 4;
      writePixel(cImg.data, i, c[0] * shade, c[1] * shade, c[2] * shade);
      const b = 255 * pile;
      writePixel(bImg.data, i, b, b, b);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  bump.getContext("2d")!.putImageData(bImg, 0, 0);
  const bumpMap = toTexture(bump, false, false);
  return { map: toTexture(col, true, false), roughnessMap: bumpMap, bumpMap };
}

// ── Marble: domain-warped veins, optional tile grout ───────────────────────
interface MarbleOptions {
  seed: number;
  size: number;
  base: [number, number, number];
  cloud: [number, number, number];
  vein: [number, number, number];
  /** Tiles per texture edge (0 = one continuous slab). */
  tiles: number;
  veinWidth: number;
}

function makeMarble({ seed, size: S, base, cloud, vein, tiles, veinWidth }: MarbleOptions): PbrMaps {
  const { fbm } = createNoise(seed);
  const clouds0 = (u: number, v: number) => fbm(u, v, 2, 2, 3);
  const col = makeCanvas(S, S);
  const rough = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const rImg = rough.getContext("2d")!.createImageData(S, S);
  const tilePx = tiles ? S / tiles : S;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      // Each tile is cut from a different part of the block.
      const ti = tiles ? Math.floor(x / tilePx) + Math.floor(y / tilePx) * 7 : 0;
      const ox = ti * 0.37;
      const warp = fbm(u, v, 3, 3, 5);
      const warp2 = fbm(u, v, 6, 6, 4);
      const t1 = (u + ox) * 2.2 + v * 1.4 + warp * 2.6;
      const t2 = (u - ox) * 5.5 - v * 3.1 + warp2 * 3.2;
      // Veins: a soft halo around a thinner core, broken up by noise so
      // they drift in and out like real stone rather than reading as cracks.
      const d1 = Math.abs(Math.sin(t1 * Math.PI));
      const d2 = Math.abs(Math.sin(t2 * Math.PI));
      const core = Math.exp(-d1 / (veinWidth * 0.35));
      const halo = Math.exp(-d1 / (veinWidth * 2.2)) * 0.45;
      const fine = Math.exp(-d2 / (veinWidth * 0.3)) * 0.35;
      const presence = Math.min(1, Math.max(0, (clouds0(u, v) - 0.3) * 2.4));
      const veinAmt = Math.min(1, (core * 0.75 + halo) * presence + fine * (0.3 + warp2) * presence);
      const clouds = fbm(u, v, 4, 4, 4);
      let r = base[0] + (cloud[0] - base[0]) * clouds;
      let g = base[1] + (cloud[1] - base[1]) * clouds;
      let b = base[2] + (cloud[2] - base[2]) * clouds;
      r += (vein[0] - r) * veinAmt;
      g += (vein[1] - g) * veinAmt;
      b += (vein[2] - b) * veinAmt;
      let grout = false;
      if (tiles) {
        const lx = x % tilePx;
        const ly = y % tilePx;
        grout = lx < 1.5 || ly < 1.5 || lx > tilePx - 1.5 || ly > tilePx - 1.5;
      }
      const i = (y * S + x) * 4;
      if (grout) writePixel(cImg.data, i, 196, 192, 186);
      else writePixel(cImg.data, i, r, g, b);
      const rv = grout ? 200 : 22 + 20 * veinAmt + 10 * clouds;
      writePixel(rImg.data, i, rv, rv, rv);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  rough.getContext("2d")!.putImageData(rImg, 0, 0);
  const roughnessMap = toTexture(rough, false);
  return { map: toTexture(col, true), roughnessMap, bumpMap: roughnessMap };
}

// ── The view out of the window: soft-focus tree line and lawn over a
// transparent sky — the sky dome behind it supplies the sky, so the
// backdrop's edges never show a seam against it.
function makeWindowView(evening: boolean, withSky = false) {
  const W = 1024;
  const H = 512;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;
  if (withSky) {
    // Used where there's no sky dome behind it (the TV screen).
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    sky.addColorStop(0, "#7fa9d8");
    sky.addColorStop(0.6, "#bcd3e8");
    sky.addColorStop(1, "#eef1ee");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }
  const { rand } = createNoise(evening ? 77 : 78);
  ctx.filter = "blur(5px)";
  // Two depth layers of tree canopies — the far one hazier, like depth of field.
  const layers = evening
    ? [
        { base: H * 0.6, color: "#2d3142", size: 22 },
        { base: H * 0.64, color: "#1a1d26", size: 36 },
      ]
    : [
        { base: H * 0.6, color: "#9fb29a", size: 22 },
        { base: H * 0.64, color: "#5d7a4f", size: 36 },
      ];
  for (const layer of layers) {
    ctx.fillStyle = layer.color;
    for (let i = 0; i < 110; i++) {
      const x = rand() * W;
      const r = layer.size * (0.5 + rand());
      ctx.beginPath();
      ctx.arc(x, layer.base - rand() * r * 0.8, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillRect(0, layer.base, W, H - layer.base);
  }
  ctx.filter = "blur(3px)";
  ctx.fillStyle = evening ? "#14171d" : "#6f8f55";
  ctx.fillRect(0, H * 0.66, W, H * 0.34);
  if (evening) {
    // A few warm windows in the distance.
    ctx.filter = "blur(2px)";
    ctx.fillStyle = "#ffcf8a";
    for (let i = 0; i < 14; i++) ctx.fillRect(rand() * W, H * (0.58 + rand() * 0.06), 4, 3);
  }
  ctx.filter = "none";
  return toTexture(c, true, false);
}

// ── Abstract canvas for the artwork above the bed ──────────────────────────
function makeArtwork() {
  const W = 768;
  const H = 480;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#e9e1d3";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#c07a55";
  ctx.beginPath();
  ctx.arc(W * 0.38, H * 0.95, H * 0.62, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#8f9a83";
  ctx.beginPath();
  ctx.arc(W * 0.7, H * 0.36, H * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d9b98c";
  ctx.fillRect(W * 0.58, H * 0.6, W * 0.3, H * 0.4);
  ctx.strokeStyle = "#2f2a25";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W * 0.12, H * 0.3);
  ctx.bezierCurveTo(W * 0.35, H * 0.05, W * 0.55, H * 0.55, W * 0.9, H * 0.18);
  ctx.stroke();
  // Canvas-texture grain over the paint.
  const img = ctx.getImageData(0, 0, W, H);
  const { rand } = createNoise(3);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 18;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c, true, false);
}

// ── Lawn: patchy greens with fine blade flecks ─────────────────────────────
function makeGrass(): PbrMaps {
  const S = 512;
  const { fbm, rand } = createNoise(91);
  const col = makeCanvas(S, S);
  const bump = makeCanvas(S, S);
  const cImg = col.getContext("2d")!.createImageData(S, S);
  const bImg = bump.getContext("2d")!.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;
      const patch = fbm(u, v, 4, 4, 4);
      const blades = fbm(u, v, 128, 128, 2);
      const fleck = rand() > 0.985 ? 0.25 : 0;
      const g = 0.75 + 0.35 * patch + 0.25 * blades + fleck;
      const i = (y * S + x) * 4;
      writePixel(cImg.data, i, 78 * g * (0.9 + 0.3 * (1 - patch)), 112 * g, 58 * g);
      const b = 255 * (0.3 + 0.7 * blades);
      writePixel(bImg.data, i, b, b, b);
    }
  }
  col.getContext("2d")!.putImageData(cImg, 0, 0);
  bump.getContext("2d")!.putImageData(bImg, 0, 0);
  const bumpMap = toTexture(bump, false);
  return { map: toTexture(col, true), roughnessMap: bumpMap, bumpMap };
}

// ── House-number plate text ───────────────────────────────────────────────
function makeHouseNumber() {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = "#ffffff";
  ctx.font = "300 190px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("12", 128, 138);
  return toTexture(c, false, false);
}

// ── Large abstract for the hall: layered washes and a gold arc ─────────────
function makeHallArtwork() {
  const W = 800;
  const H = 520;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#d9cbb6");
  bg.addColorStop(1, "#b9a58a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.filter = "blur(18px)";
  ctx.fillStyle = "#3f4b45";
  ctx.beginPath();
  ctx.ellipse(W * 0.3, H * 0.62, W * 0.26, H * 0.3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8a4f33";
  ctx.beginPath();
  ctx.ellipse(W * 0.68, H * 0.4, W * 0.2, H * 0.26, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.filter = "none";
  ctx.strokeStyle = "#c9a461";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(W * 0.55, H * 0.9, H * 0.55, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  ctx.fillStyle = "#efe7da";
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.22, 26, 0, Math.PI * 2);
  ctx.fill();
  const img = ctx.getImageData(0, 0, W, H);
  const { rand } = createNoise(8);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 16;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c, true, false);
}

export interface BedroomTextures {
  oakFloor: PbrMaps;
  walnut: PbrMaps;
  oak: PbrMaps;
  linen: PbrMaps;
  knit: PbrMaps;
  boucle: PbrMaps;
  plaster: PbrMaps;
  rug: PbrMaps;
  viewDay: THREE.Texture;
  viewEvening: THREE.Texture;
  tvPicture: THREE.Texture;
  artwork: THREE.Texture;
  hallArtwork: THREE.Texture;
  marbleFloor: PbrMaps;
  neroMarble: PbrMaps;
  travertine: PbrMaps;
  grass: PbrMaps;
  houseNumber: THREE.Texture;
}

let cache: BedroomTextures | null = null;

/**
 * Builds (once per page load) every texture the bedroom uses. This is a
 * few hundred ms of synchronous canvas work, so the page calls it behind a
 * loading screen before mounting the Canvas.
 */
export function getBedroomTextures(): BedroomTextures {
  if (cache) return cache;
  cache = {
    oakFloor: makeOakFloor(),
    walnut: makeVeneer(17, [122, 84, 56]),
    oak: makeVeneer(23, [196, 158, 116]),
    linen: makeWeave(31, 4, 0.18),
    knit: makeWeave(37, 8, 0.1),
    boucle: makeBoucle(),
    plaster: makePlaster(),
    rug: makeRug(),
    viewDay: makeWindowView(false),
    viewEvening: makeWindowView(true),
    tvPicture: makeWindowView(false, true),
    artwork: makeArtwork(),
    hallArtwork: makeHallArtwork(),
    // Statuario-style polished floor: 2×2 tiles of 1.2 m per texture.
    marbleFloor: makeMarble({
      seed: 51,
      size: 1024,
      base: [238, 235, 230],
      cloud: [222, 218, 212],
      vein: [150, 144, 138],
      tiles: 2,
      veinWidth: 0.06,
    }),
    // Nero Marquina with warm gold veining for the TV feature wall.
    neroMarble: makeMarble({
      seed: 61,
      size: 768,
      base: [34, 32, 33],
      cloud: [48, 45, 44],
      vein: [196, 170, 128],
      tiles: 0,
      veinWidth: 0.05,
    }),
    // Honed travertine for the facade cladding and the entrance steps:
    // 2×2 slabs per texture with faint banding.
    travertine: makeMarble({
      seed: 71,
      size: 512,
      base: [214, 201, 180],
      cloud: [192, 176, 150],
      vein: [178, 158, 128],
      tiles: 2,
      veinWidth: 0.14,
    }),
    grass: makeGrass(),
    houseNumber: makeHouseNumber(),
  };
  return cache;
}

/** Clones a map set with its own repeat, sharing the uploaded image. */
export function withRepeat(maps: PbrMaps, rx: number, ry: number): PbrMaps {
  const r = (t: THREE.Texture) => {
    const c = t.clone();
    c.repeat.set(rx, ry);
    c.needsUpdate = true;
    return c;
  };
  return { map: r(maps.map), roughnessMap: r(maps.roughnessMap), bumpMap: r(maps.bumpMap) };
}
