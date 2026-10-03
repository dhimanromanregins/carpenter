/**
 * MaterialLibrary: turns a MaterialDef from the registry into a cached PBR Three
 * material. Textures are painted procedurally on first use and reused afterwards;
 * if a texture fails for any reason the material falls back to its plain colour,
 * so a bad texture can never crash the scene.
 */
import * as THREE from "three";
import type { MaterialDef } from "../data/materials";
import { HANDLE_FINISH_BY_ID } from "../data/handles";
import type { HandleFinishId } from "../model/types";

const texCache = new Map<string, THREE.Texture | null>();
const matCache = new Map<string, THREE.Material>();

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  return [c, ctx];
}

/* ───────────────────────── painters ───────────────────────── */

function paintWood(ctx: CanvasRenderingContext2D, S: number, base: string, ring: string, r: () => number) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 52; i++) {
    const x = (i / 52) * S + (r() - 0.5) * 6;
    ctx.strokeStyle = ring;
    ctx.globalAlpha = 0.05 + r() * 0.15;
    ctx.lineWidth = 1 + r() * 2.4;
    ctx.beginPath();
    for (let y = 0; y <= S; y += 8) {
      const wob = Math.sin(y * 0.016 + i * 1.3) * 5 + Math.sin(y * 0.004 + i * 2.1) * 10;
      if (y === 0) ctx.moveTo(x + wob, y);
      else ctx.lineTo(x + wob, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = r() > 0.5 ? ring : "#000";
    ctx.fillRect(r() * S, r() * S, 1 + r() * 2, 5 + r() * 12);
  }
  ctx.globalAlpha = 1;
}

function paintMarble(ctx: CanvasRenderingContext2D, S: number, base: string, vein: string, r: () => number) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 14; i++) {
    ctx.strokeStyle = vein;
    ctx.globalAlpha = 0.15 + r() * 0.5;
    ctx.lineWidth = 0.6 + r() * 3;
    ctx.beginPath();
    let x = r() * S;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < S) {
      y += 14 + r() * 30;
      x += (r() - 0.5) * 90;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // soft clouds
  for (let i = 0; i < 18; i++) {
    const g = ctx.createRadialGradient(r() * S, r() * S, 4, r() * S, r() * S, 70 + r() * 90);
    g.addColorStop(0, `${vein}18`);
    g.addColorStop(1, `${vein}00`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  ctx.globalAlpha = 1;
}

function paintSpeckle(ctx: CanvasRenderingContext2D, S: number, base: string, fleck: string, r: () => number, density: number, size: number) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < density; i++) {
    ctx.globalAlpha = 0.15 + r() * 0.55;
    ctx.fillStyle = r() > 0.5 ? fleck : "#000";
    const sz = 0.6 + r() * size;
    ctx.fillRect(r() * S, r() * S, sz, sz);
  }
  ctx.globalAlpha = 1;
}

function paintConcrete(ctx: CanvasRenderingContext2D, S: number, base: string, dark: string, r: () => number) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 40; i++) {
    const g = ctx.createRadialGradient(r() * S, r() * S, 2, r() * S, r() * S, 60 + r() * 120);
    g.addColorStop(0, `${dark}22`);
    g.addColorStop(1, `${dark}00`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }
  paintSpeckleOver(ctx, S, r, 900);
}

function paintSpeckleOver(ctx: CanvasRenderingContext2D, S: number, r: () => number, n: number) {
  for (let i = 0; i < n; i++) {
    ctx.globalAlpha = 0.04 + r() * 0.08;
    ctx.fillStyle = r() > 0.5 ? "#fff" : "#000";
    ctx.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  ctx.globalAlpha = 1;
}

function paintSubway(ctx: CanvasRenderingContext2D, S: number, base: string, grout: string) {
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, S, S);
  const rows = 8;
  const cols = 4;
  const h = S / rows;
  const w = S / cols;
  for (let y = 0; y < rows; y++) {
    for (let x = -1; x < cols + 1; x++) {
      const ox = (y % 2 ? w / 2 : 0) + x * w;
      const g = ctx.createLinearGradient(ox, y * h, ox, (y + 1) * h);
      g.addColorStop(0, base);
      g.addColorStop(1, shadeHex(base, 0.94));
      ctx.fillStyle = g;
      ctx.fillRect(ox + 2, y * h + 2, w - 4, h - 4);
    }
  }
}

function paintMosaic(ctx: CanvasRenderingContext2D, S: number, base: string, accent: string, r: () => number) {
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, S, S);
  const n = 24;
  const sz = S / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = shadeHex(base, 0.8 + r() * 0.35);
      ctx.fillRect(x * sz + 1.5, y * sz + 1.5, sz - 3, sz - 3);
    }
  }
}

function paintPlank(ctx: CanvasRenderingContext2D, S: number, base: string, ring: string, r: () => number) {
  const planks = 6;
  const h = S / planks;
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = shadeHex(base, 0.88 + r() * 0.2);
    ctx.fillRect(0, i * h, S, h);
    for (let k = 0; k < 7; k++) {
      ctx.strokeStyle = ring;
      ctx.globalAlpha = 0.08 + r() * 0.16;
      ctx.lineWidth = 1 + r() * 1.6;
      ctx.beginPath();
      const y = i * h + (k / 7) * h + r() * 6;
      for (let x = 0; x <= S; x += 10) ctx.lineTo(x, y + Math.sin(x * 0.02 + k + i) * 2.5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, i * h, S, 2);
    const off = r() * S;
    ctx.fillRect(off, i * h, 2, h);
  }
}

function paintTile(ctx: CanvasRenderingContext2D, S: number, base: string, grout: string, r: () => number) {
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, S, S);
  const n = 2;
  const sz = S / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = shadeHex(base, 0.96 + r() * 0.08);
      ctx.fillRect(x * sz + 3, y * sz + 3, sz - 6, sz - 6);
    }
  }
  paintSpeckleOver(ctx, S, r, 700);
}

function shadeHex(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}

/** Normal map with vertical ribs, for fluted fronts and fluted glass. */
export function flutedNormal(): THREE.Texture {
  const key = "__fluted-normal";
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 4;
  const ctx = c.getContext("2d");
  if (ctx) {
    const img = ctx.createImageData(256, 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 256; x++) {
        const slope = Math.cos((x / 256) * 4 * Math.PI * 2) * 0.9;
        const i = (y * 256 + x) * 4;
        img.data[i] = 128 + slope * 127;
        img.data[i + 1] = 128;
        img.data[i + 2] = 225;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(7, 1);
  texCache.set(key, t);
  return t;
}

/* ───────────────────────── textures ───────────────────────── */

function textureFor(def: MaterialDef): THREE.Texture | null {
  if (def.texture === "none" || def.texture === "fluted") return null;
  const key = `${def.id}`;
  if (texCache.has(key)) return texCache.get(key) ?? null;
  let tex: THREE.Texture | null = null;
  try {
    const S = 512;
    const [c, ctx] = canvas(S);
    const r = rng(hash(def.id));
    const accent = def.accent ?? "#888888";
    switch (def.texture) {
      case "wood":
        paintWood(ctx, S, def.color, accent, r);
        break;
      case "marble":
        paintMarble(ctx, S, def.color, accent, r);
        break;
      case "granite":
        paintSpeckle(ctx, S, def.color, accent, r, 5200, 3.2);
        break;
      case "stone":
        paintSpeckle(ctx, S, def.color, accent, r, 3200, 2.4);
        break;
      case "concrete":
        paintConcrete(ctx, S, def.color, accent, r);
        break;
      case "terrazzo":
        paintSpeckle(ctx, S, def.color, accent, r, 1800, 7);
        break;
      case "subway":
        paintSubway(ctx, S, def.color, accent);
        break;
      case "mosaic":
        paintMosaic(ctx, S, def.color, accent, r);
        break;
      case "plank":
        paintPlank(ctx, S, def.color, accent, r);
        break;
      case "tile":
        paintTile(ctx, S, def.color, accent, r);
        break;
    }
    tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
  } catch {
    tex = null; // fall back to flat colour
  }
  texCache.set(key, tex);
  return tex;
}

/* ───────────────────────── materials ───────────────────────── */

export interface MaterialOptions {
  /** Texture repeat (for floors / walls). */
  repeat?: [number, number];
  /** Vertical-grain rotation for wood on doors. */
  rotate?: boolean;
  fluted?: boolean;
  ghost?: boolean;
}

export function getMaterial(def: MaterialDef, opts: MaterialOptions = {}): THREE.Material {
  const key = `${def.id}|${opts.repeat?.join("x") ?? ""}|${opts.rotate ? "r" : ""}|${opts.fluted ? "f" : ""}|${opts.ghost ? "g" : ""}`;
  const hit = matCache.get(key);
  if (hit) return hit;

  let map = textureFor(def);
  if (map && (opts.repeat || opts.rotate)) {
    map = map.clone();
    map.needsUpdate = true;
    if (opts.repeat) map.repeat.set(opts.repeat[0], opts.repeat[1]);
    if (opts.rotate) {
      map.center.set(0.5, 0.5);
      map.rotation = Math.PI / 2;
    }
  }

  const isGlass = def.category === "glass";
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(map ? "#ffffff" : def.color),
    map: map ?? null,
    roughness: def.roughness,
    metalness: def.metalness,
    clearcoat: def.clearcoat ?? 0,
    clearcoatRoughness: 0.1,
    envMapIntensity: def.clearcoat && def.clearcoat > 0.5 ? 1.6 : 1,
    transparent: isGlass || !!opts.ghost,
    opacity: isGlass ? def.opacity ?? 0.3 : opts.ghost ? 0.12 : 1,
    side: isGlass ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: !isGlass && !opts.ghost,
  });
  if (opts.fluted || def.texture === "fluted") {
    mat.normalMap = flutedNormal();
    mat.normalScale = new THREE.Vector2(1.1, 1.1);
  }
  matCache.set(key, mat);
  return mat;
}

const metalCache = new Map<string, THREE.MeshStandardMaterial>();
export function getHandleMaterial(id: HandleFinishId): THREE.MeshStandardMaterial {
  const hit = metalCache.get(id);
  if (hit) return hit;
  const f = HANDLE_FINISH_BY_ID[id];
  const m = new THREE.MeshStandardMaterial({ color: f.color, roughness: f.roughness, metalness: f.metalness, envMapIntensity: f.metalness > 0.8 ? 2.8 : 1.4 });
  metalCache.set(id, m);
  return m;
}

const plain = new Map<string, THREE.MeshStandardMaterial>();
/** Simple shared material by role (steel, glass, rubber, light…) — avoids per-component duplicates. */
export function getUtilMaterial(role: "mirror" | "steel" | "dark" | "rubber" | "glass-dark" | "white" | "ceramic" | "black-glass" | "chrome" | "foam" | "wood-light" | "plastic" | "fabric"): THREE.MeshStandardMaterial {
  const hit = plain.get(role);
  if (hit) return hit;
  const spec: Record<string, THREE.MeshStandardMaterialParameters> = {
    mirror: { color: "#dfe7ea", roughness: 0.04, metalness: 1, envMapIntensity: 3 },
    steel: { color: "#c3c8cc", roughness: 0.32, metalness: 1, envMapIntensity: 2.2 },
    dark: { color: "#1a1a1b", roughness: 0.7, metalness: 0.2 },
    rubber: { color: "#222324", roughness: 0.9 },
    "glass-dark": { color: "#0c0e11", roughness: 0.08, metalness: 0.3, envMapIntensity: 2 },
    "black-glass": { color: "#08090b", roughness: 0.05, metalness: 0.4, envMapIntensity: 2.4 },
    white: { color: "#f2f2f0", roughness: 0.4 },
    ceramic: { color: "#f6f6f3", roughness: 0.12 },
    chrome: { color: "#e6eaee", roughness: 0.08, metalness: 1, envMapIntensity: 3 },
    foam: { color: "#dcdbd4", roughness: 0.95 },
    "wood-light": { color: "#c9a678", roughness: 0.6 },
    plastic: { color: "#e8e6df", roughness: 0.5 },
    fabric: { color: "#8a8f98", roughness: 1 },
  };
  const m = new THREE.MeshStandardMaterial(spec[role]);
  plain.set(role, m);
  return m;
}

/** A coloured emissive material that stays unaffected by tone mapping (so bloom picks it up). */
const emissive = new Map<string, THREE.MeshBasicMaterial>();
export function getEmissive(color: string, intensity: number): THREE.MeshBasicMaterial {
  const key = `${color}|${intensity.toFixed(2)}`;
  const hit = emissive.get(key);
  if (hit) return hit;
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false });
  emissive.set(key, m);
  return m;
}

/** Drops cached materials (used when many custom colours would otherwise accumulate). */
export function clearMaterialCache() {
  matCache.forEach((m) => m.dispose());
  matCache.clear();
}
