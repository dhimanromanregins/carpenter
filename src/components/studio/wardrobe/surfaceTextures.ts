import * as THREE from "three";
import { FINISHES, type MeshKind, type Surface, type WallpaperKind } from "./wardrobeConfig";

/* Everything here paints onto a canvas and wraps it as a Three material. Painting is
 * resolution-independent (it only uses W/H), so the same code draws the big shutter
 * texture and the small pattern previews in the UI. */

export const TEX_W = 512;
export const TEX_H = 1024;

/* ───────────────────────── colour helpers ───────────────────────── */

export function tokenColor(tok: string): string {
  if (tok.startsWith("wood:")) {
    const f = FINISHES.find((x) => x.id === tok.slice(5));
    return f?.color ?? "#8a6a4a";
  }
  return tok;
}

function shade(hex: string, k: number): string {
  const c = new THREE.Color(tokenColor(hex));
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}

function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/* ───────────────────────── fills ───────────────────────── */

function fillToken(ctx: CanvasRenderingContext2D, tok: string, x: number, y: number, w: number, h: number) {
  const f = tok.startsWith("wood:") ? FINISHES.find((v) => v.id === tok.slice(5)) : undefined;
  if (!f) {
    ctx.fillStyle = tok;
    ctx.fillRect(x, y, w, h);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = f.color;
  ctx.fillRect(x, y, w, h);
  const r = seeded(hashStr(f.id));
  // vertical grain
  for (let i = 0; i < 46; i++) {
    const gx = x + (i / 46) * w + (r() - 0.5) * 6;
    ctx.strokeStyle = f.ring ?? "#000";
    ctx.globalAlpha = 0.06 + r() * 0.14;
    ctx.lineWidth = 1 + r() * 2.2;
    ctx.beginPath();
    for (let gy = 0; gy <= h; gy += 8) {
      const wob = Math.sin(gy * 0.014 + i * 1.3) * 5 + Math.sin(gy * 0.004 + i * 2.1) * 9;
      if (gy === 0) ctx.moveTo(gx + wob, y + gy);
      else ctx.lineTo(gx + wob, y + gy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][], tok: string) {
  ctx.save();
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  fillToken(ctx, tok, 0, 0, TEX_W, TEX_H);
  ctx.restore();
}

function archPath(ctx: CanvasRenderingContext2D, inset: number) {
  const r = (TEX_W - 2 * inset) / 2;
  ctx.beginPath();
  ctx.moveTo(inset, TEX_H - inset);
  ctx.lineTo(inset, inset + r);
  ctx.arc(TEX_W / 2, inset + r, r, Math.PI, 0);
  ctx.lineTo(TEX_W - inset, TEX_H - inset);
  ctx.closePath();
}

/* ───────────────────────── patterns ───────────────────────── */

function paintPattern(ctx: CanvasRenderingContext2D, s: Surface) {
  const cols = s.colors.length ? s.colors : ["#cccccc"];
  const c = (i: number) => cols[((i % cols.length) + cols.length) % cols.length];
  const n = Math.max(2, Math.round(s.scale));
  const W = TEX_W;
  const H = TEX_H;

  switch (s.pattern) {
    case "split-h":
      fillToken(ctx, c(0), 0, 0, W, H / 2);
      fillToken(ctx, c(1), 0, H / 2, W, H / 2);
      break;
    case "split-v":
      fillToken(ctx, c(0), 0, 0, W / 2, H);
      fillToken(ctx, c(1), W / 2, 0, W / 2, H);
      break;
    case "stripes-v":
      for (let i = 0; i < n; i++) fillToken(ctx, c(i), (i * W) / n, 0, W / n + 1, H);
      break;
    case "stripes-h":
      for (let i = 0; i < n; i++) fillToken(ctx, c(i), 0, (i * H) / n, W, H / n + 1);
      break;
    case "blocks": {
      const rows = 4;
      const cc = 2;
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < cc; k++) fillToken(ctx, c(r * 2 + k * 3 + (r >> 1)), (k * W) / cc, (r * H) / rows, W / cc + 1, H / rows + 1);
      }
      break;
    }
    case "checker": {
      const cells = Math.max(2, Math.round(n / 2));
      const size = W / cells;
      const rows = Math.ceil(H / size);
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < cells; k++) fillToken(ctx, c((r + k) % 2), k * size, r * size, size + 1, size + 1);
      }
      break;
    }
    case "gradient": {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      const colors = cols.length === 1 ? [cols[0], shade(cols[0], 0.55)] : cols;
      colors.forEach((col, i) => g.addColorStop(i / (colors.length - 1), tokenColor(col)));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      break;
    }
    case "diagonal":
      fillToken(ctx, c(0), 0, 0, W, H);
      poly(ctx, [[W, 0], [W, H], [0, H]], c(1));
      break;
    case "chevron": {
      const band = H / n;
      fillToken(ctx, c(0), 0, 0, W, H);
      for (let i = -1; i < n + 1; i++) {
        const y0 = i * band;
        poly(
          ctx,
          [
            [0, y0 + band * 0.5],
            [W / 2, y0],
            [W, y0 + band * 0.5],
            [W, y0 + band * 1.5],
            [W / 2, y0 + band],
            [0, y0 + band * 1.5],
          ],
          c(i)
        );
      }
      break;
    }
    case "arch": {
      fillToken(ctx, c(0), 0, 0, W, H);
      ctx.save();
      archPath(ctx, 70);
      ctx.clip();
      fillToken(ctx, c(1), 0, 0, W, H);
      ctx.restore();
      if (cols.length > 2) {
        ctx.save();
        archPath(ctx, 150);
        ctx.clip();
        fillToken(ctx, c(2), 0, 0, W, H);
        ctx.restore();
      }
      break;
    }
    case "circle": {
      fillToken(ctx, c(0), 0, 0, W, H);
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, W * 0.36, 0, Math.PI * 2);
      ctx.clip();
      fillToken(ctx, c(1), 0, 0, W, H);
      ctx.restore();
      if (cols.length > 2) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, W * 0.2, 0, Math.PI * 2);
        ctx.clip();
        fillToken(ctx, c(2), 0, 0, W, H);
        ctx.restore();
      }
      break;
    }
    case "diamond": {
      fillToken(ctx, c(0), 0, 0, W, H);
      poly(ctx, [[W / 2, H * 0.16], [W * 0.9, H / 2], [W / 2, H * 0.84], [W * 0.1, H / 2]], c(1));
      if (cols.length > 2) poly(ctx, [[W / 2, H * 0.32], [W * 0.66, H / 2], [W / 2, H * 0.68], [W * 0.34, H / 2]], c(2));
      break;
    }
    case "frame": {
      fillToken(ctx, c(0), 0, 0, W, H);
      const t = 54;
      const m = 46;
      fillToken(ctx, c(1), m, m, W - 2 * m, t);
      fillToken(ctx, c(1), m, H - m - t, W - 2 * m, t);
      fillToken(ctx, c(1), m, m, t, H - 2 * m);
      fillToken(ctx, c(1), W - m - t, m, t, H - 2 * m);
      if (cols.length > 2) fillToken(ctx, c(2), m + t + 18, m + t + 18, W - 2 * (m + t + 18), H - 2 * (m + t + 18));
      break;
    }
    default:
      fillToken(ctx, c(0), 0, 0, W, H);
  }
}

/* ───────────────────────── wallpaper ───────────────────────── */

function paintWallpaper(ctx: CanvasRenderingContext2D, kind: WallpaperKind, base: string, accent: string) {
  const W = TEX_W;
  const H = TEX_H;
  fillToken(ctx, base, 0, 0, W, H);
  const a = tokenColor(accent);
  const dark = shade(base, 0.82);
  const r = seeded(hashStr(kind + base));

  switch (kind) {
    case "damask": {
      const cw = 128;
      const ch = 170;
      for (let y = -1; y * ch < H + ch; y++) {
        for (let x = 0; x * cw < W + cw; x++) {
          const ox = x * cw + (y % 2 ? cw / 2 : 0);
          const oy = y * ch;
          ctx.fillStyle = a;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.ellipse(ox, oy, 15, 34, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(ox, oy, 34, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.55;
          [-1, 1].forEach((sx) => {
            ctx.beginPath();
            ctx.ellipse(ox + sx * 24, oy + 30, 10, 19, sx * 0.7, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "geometric": {
      const s = 64;
      ctx.strokeStyle = a;
      ctx.lineWidth = 3;
      for (let y = 0; y < H / s + 1; y++) {
        for (let x = 0; x < W / s + 1; x++) {
          const cx = x * s + (y % 2 ? s / 2 : 0);
          const cy = y * s * 0.9;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const ang = (Math.PI / 3) * k + Math.PI / 6;
            const px = cx + Math.cos(ang) * (s / 2 - 4);
            const py = cy + Math.sin(ang) * (s / 2 - 4);
            if (k) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }
    case "floral": {
      for (let i = 0; i < 70; i++) {
        const cx = r() * W;
        const cy = r() * H;
        const sz = 14 + r() * 22;
        ctx.fillStyle = a;
        ctx.globalAlpha = 0.5 + r() * 0.4;
        for (let p = 0; p < 6; p++) {
          const ang = (Math.PI / 3) * p;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(ang) * sz * 0.8, cy + Math.sin(ang) * sz * 0.8, sz * 0.6, sz * 0.32, ang, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = dark;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, sz * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "pinstripe": {
      ctx.fillStyle = a;
      for (let x = 0; x < W; x += 36) {
        ctx.fillRect(x, 0, 4, H);
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x + 12, 0, 1.5, H);
        ctx.globalAlpha = 1;
      }
      break;
    }
    case "marble": {
      for (let i = 0; i < 16; i++) {
        ctx.strokeStyle = i % 3 ? a : dark;
        ctx.globalAlpha = 0.18 + r() * 0.5;
        ctx.lineWidth = 0.8 + r() * 3.2;
        ctx.beginPath();
        let x = r() * W;
        let y = 0;
        ctx.moveTo(x, y);
        while (y < H) {
          y += 14 + r() * 24;
          x += (r() - 0.5) * 70;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "grasscloth": {
      for (let y = 0; y < H; y += 3) {
        ctx.strokeStyle = r() > 0.5 ? a : dark;
        ctx.globalAlpha = 0.1 + r() * 0.3;
        ctx.lineWidth = 1 + r() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y + (r() - 0.5) * 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
  }
}

/* ───────────────────────── type overlays ───────────────────────── */

function overlayType(ctx: CanvasRenderingContext2D, s: Surface) {
  const W = TEX_W;
  const H = TEX_H;
  const r = seeded(hashStr(s.type + s.colors.join()));
  switch (s.type) {
    case "laminate":
      ctx.fillStyle = "#000";
      for (let i = 0; i < 1500; i++) {
        ctx.globalAlpha = 0.03 + r() * 0.04;
        ctx.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
      }
      ctx.globalAlpha = 1;
      break;
    case "membrane": {
      // routed shaker-style grooves: a dark channel with a highlight lip
      [60, 126].forEach((m, i) => {
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 6;
        ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 3;
        ctx.strokeRect(m + 5, m + 5, W - 2 * m, H - 2 * m);
        if (i === 0 && s.pattern !== "solid") ctx.globalAlpha = 0.6;
      });
      ctx.globalAlpha = 1;
      break;
    }
    case "pu": {
      const g = ctx.createLinearGradient(0, 0, W, H * 0.6);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.4, "rgba(255,255,255,0.16)");
      g.addColorStop(0.55, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      break;
    }
    case "acrylic": {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "rgba(255,255,255,0.32)");
      g.addColorStop(0.28, "rgba(255,255,255,0.04)");
      g.addColorStop(0.5, "rgba(255,255,255,0.22)");
      g.addColorStop(0.62, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, W - 20, H - 20);
      break;
    }
    default:
      break;
  }
}

/** Paints a complete surface onto any canvas (shutter textures and UI previews). */
export function paintSurface(canvas: HTMLCanvasElement, s: Surface) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // draw at texture resolution, then scale down for small previews
  const off = document.createElement("canvas");
  off.width = TEX_W;
  off.height = TEX_H;
  const o = off.getContext("2d");
  if (!o) return;
  if (s.type === "wallpaper") paintWallpaper(o, s.wallpaper, s.colors[0] ?? "#d9c7a8", s.colors[1] ?? "#c6a86a");
  else paintPattern(o, s);
  overlayType(o, s);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

/* ───────────────────────── see-through textures ───────────────────────── */

function ribNormalMap(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 4;
  const ctx = c.getContext("2d");
  if (ctx) {
    const img = ctx.createImageData(256, 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 256; x++) {
        const phase = (x / 256) * 4; // 4 ribs per tile
        const slope = Math.cos(phase * Math.PI * 2) * 0.85;
        const i = (y * 256 + x) * 4;
        img.data[i] = 128 + slope * 127;
        img.data[i + 1] = 128;
        img.data[i + 2] = 230;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 1); // 16 ribs across a door
  return t;
}

function meshTexture(kind: MeshKind, color: string): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, S, S);
    const col = tokenColor(color);
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    if (kind === "wire") {
      ctx.lineWidth = 7;
      ctx.strokeRect(0, 0, S, S);
    } else if (kind === "cane") {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(S, S);
      ctx.moveTo(S, 0);
      ctx.lineTo(0, S);
      ctx.moveTo(S / 2, 0);
      ctx.lineTo(S / 2, S);
      ctx.moveTo(0, S / 2);
      ctx.lineTo(S, S / 2);
      ctx.stroke();
    } else {
      // perforated: solid sheet with round holes
      ctx.fillRect(0, 0, S, S);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(S / 2, S / 2, S * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 16);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ───────────────────────── materials ───────────────────────── */

export interface SurfaceResult {
  /** Opaque shutter material (also the fallback for drawer fronts / loft doors). */
  solid: THREE.Material;
  /** Material for the see-through pane of fluted / mesh / sandwich shutters. */
  pane: THREE.Material | null;
}

export const isFramedType = (s: Surface) => s.type === "fluted" || s.type === "mesh";

function solidParams(s: Surface): THREE.MeshPhysicalMaterialParameters {
  switch (s.type) {
    case "membrane":
      return { roughness: 0.5, clearcoat: 0.1 };
    case "pu":
      return { roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.4 };
    case "acrylic":
      return { roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.4, metalness: 0.05 };
    case "wallpaper":
      return { roughness: 0.92 };
    case "fluted":
    case "mesh":
      return { roughness: 0.5 };
    default:
      return { roughness: 0.62 };
  }
}

export function buildSurface(s: Surface, ghost: boolean): SurfaceResult {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  paintSurface(canvas, s);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const solid = new THREE.MeshPhysicalMaterial({
    map,
    ...solidParams(s),
    transparent: ghost,
    opacity: ghost ? 0.1 : 1,
    depthWrite: !ghost,
  });

  let pane: THREE.Material | null = null;
  if (s.type === "fluted") {
    pane = new THREE.MeshPhysicalMaterial({
      map,
      normalMap: ribNormalMap(),
      normalScale: new THREE.Vector2(1.1, 1.1),
      transparent: true,
      opacity: ghost ? 0.12 : 0.55,
      roughness: 0.22,
      metalness: 0,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  } else if (s.type === "mesh" && s.mesh === "sandwich") {
    pane = new THREE.MeshPhysicalMaterial({
      map,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 2.2,
      transparent: ghost,
      opacity: ghost ? 0.1 : 1,
    });
  } else if (s.type === "mesh") {
    pane = new THREE.MeshStandardMaterial({
      map: meshTexture(s.mesh, s.colors[0] ?? "#c9a86a"),
      transparent: true,
      alphaTest: 0.35,
      metalness: 0.7,
      roughness: 0.35,
      envMapIntensity: 2,
      side: THREE.DoubleSide,
      opacity: ghost ? 0.3 : 1,
    });
  }
  return { solid, pane };
}

/** Stable cache key for a surface + ghost flag. */
export const surfaceKey = (s: Surface, ghost: boolean) =>
  `${ghost ? "g" : "n"}|${s.type}|${s.pattern}|${s.scale}|${s.wallpaper}|${s.mesh}|${s.colors.join(",")}`;
