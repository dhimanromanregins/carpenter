import { HANDLE_STYLES, INNER_DRAWER_H, PANEL, PATTERNS, SURFACE_TYPES, totalHeight, totalWidth, type WardrobeConfig, type WardrobeSection } from "./wardrobeConfig";

/** Shared geometry constants — keep in sync with WardrobeModel. */
export const GAP = 0.003;
export const FRAME_W = 0.032;

export const leafCount = (width: number) => (width < 0.65 ? 1 : 2);
export const slidingPanelCount = (width: number) => (width > 1.3 ? 3 : 2);
export const SLIDE_OVERLAP = 0.04;

/** Y positions of the interior shelves of a door/open section (mirrors the 3D model). */
export function shelfLevels(s: WardrobeSection, innerBottom: number, ih: number): number[] {
  const ys: number[] = [];
  const span = s.kind === "doors" && s.rod ? ih * 0.4 : ih;
  for (let i = 1; i <= s.shelves; i++) ys.push(innerBottom + (span / (s.shelves + 1)) * i);
  return ys;
}

export interface MirrorSpec {
  w: number;
  h: number;
  /** Centre offset from the door's centre (m). */
  cy: number;
}

/** Size + placement of the inset viewing mirror on a laminate door of size w × h. */
export function mirrorSpec(w: number, h: number, size: "full" | "half"): MirrorSpec {
  const mw = Math.max(0.2, w - 0.16);
  if (size === "half") {
    const mh = 0.8;
    return { w: mw, h: mh, cy: 0.1 };
  }
  const mh = Math.min(h - 0.25, 1.85);
  return { w: mw, h: mh, cy: -h / 2 + 0.1 + mh / 2 };
}

export interface Part {
  group: string;
  name: string;
  /** mm */
  w: number;
  h: number;
  t: number;
  qty: number;
  note?: string;
}

const mm = (m: number) => Math.round(m * 1000);

export function doorHeight(c: WardrobeConfig) {
  return c.height - c.plinth - 2 * GAP;
}

/** Every physical component of the design, in millimetres — used for the cut list. */
export function buildParts(c: WardrobeConfig): Part[] {
  const T = PANEL;
  const W = totalWidth(c);
  const TH = totalHeight(c);
  const D = c.depth;
  const parts: Part[] = [];
  const add = (p: Omit<Part, "w" | "h" | "t"> & { w: number; h: number; t: number }) =>
    parts.push({ ...p, w: mm(p.w), h: mm(p.h), t: p.t < 0.05 ? Math.round(p.t * 1000 * 10) / 10 : mm(p.t) });

  // carcass
  add({ group: "Carcass", name: "Side panel", w: D, h: TH, t: T, qty: 2 });
  if (c.sections.length > 1) add({ group: "Carcass", name: "Vertical divider", w: D, h: TH - c.plinth, t: T, qty: c.sections.length - 1 });
  add({ group: "Carcass", name: "Bottom panel", w: W - 2 * T, h: D, t: T, qty: 1 });
  add({ group: "Carcass", name: "Top panel", w: W - 2 * T, h: D, t: T, qty: 1 });
  if (c.loft) {
    add({ group: "Carcass", name: "Loft bottom panel", w: W - 2 * T, h: D, t: T, qty: 1 });
    add({ group: "Carcass", name: "Loft top panel", w: W - 2 * T, h: D, t: T, qty: 1 });
  }
  add({ group: "Carcass", name: "Back panel", w: W, h: TH, t: 0.008, qty: 1 });
  add({ group: "Carcass", name: "Plinth board", w: W - 2 * T, h: c.plinth, t: 0.012, qty: 1 });

  const dh = doorHeight(c);
  c.sections.forEach((s: WardrobeSection, i) => {
    const n = i + 1;
    const iw = s.width - T;
    const sec = `Section ${n}`;
    const surf = s.surface ?? c.surface;
    const surfNote = `${SURFACE_TYPES.find((t) => t.id === surf.type)?.name ?? surf.type}${
      surf.type === "wallpaper" ? ` · ${surf.wallpaper}` : surf.pattern !== "solid" ? ` · ${PATTERNS.find((p) => p.id === surf.pattern)?.name ?? ""}` : ""
    }`;

    // interior
    if (s.shelves > 0 && s.kind !== "drawers") {
      add({ group: sec, name: "Shelf", w: iw, h: D - 0.05, t: T * 0.8, qty: s.shelves });
    }
    if (s.kind === "doors" && s.rod) {
      add({ group: sec, name: "Rod shelf", w: iw, h: D - 0.05, t: T * 0.8, qty: 1 });
      add({ group: sec, name: "Hanging rod (Ø25)", w: iw - 0.01, h: 0.025, t: 0.025, qty: 1, note: "Metal tube" });
    }
    if (s.kind === "open") {
      add({ group: sec, name: "Inner back panel", w: iw, h: c.height - c.plinth - 2 * T, t: 0.006, qty: 1 });
    }

    // doors
    if (s.kind === "doors") {
      const mirror = s.mirrorLeaf ?? -1;
      const mSize = s.mirrorSize ?? "full";
      if (s.doorMode === "hinged") {
        const nl = leafCount(s.width);
        const lw = (s.width - 2 * GAP - (nl - 1) * 0.004) / nl;
        if (s.face === "laminate") add({ group: sec, name: "Hinged door", w: lw, h: dh, t: 0.018, qty: nl, note: surfNote });
        if (s.face === "mirror") add({ group: sec, name: "Mirror door", w: lw, h: dh, t: 0.012, qty: nl, note: "Mirror" });
        if (s.face === "glass") {
          add({ group: sec, name: "Glass door — frame (long)", w: FRAME_W, h: dh, t: 0.018, qty: 2 * nl, note: "Aluminium" });
          add({ group: sec, name: "Glass door — frame (short)", w: lw - 2 * FRAME_W, h: FRAME_W, t: 0.018, qty: 2 * nl, note: "Aluminium" });
          add({ group: sec, name: "Glass pane", w: lw - 2 * FRAME_W, h: dh - 2 * FRAME_W, t: 0.006, qty: nl, note: c.glassTint });
        }
        if (s.face === "laminate" && mirror >= 0 && mirror < nl) {
          const m = mirrorSpec(lw, dh, mSize);
          add({ group: sec, name: `Viewing mirror (door ${mirror + 1})`, w: m.w, h: m.h, t: 0.006, qty: 1, note: "Inset on door" });
        }
      } else {
        const np = slidingPanelCount(s.width);
        const pw = (s.width - 2 * GAP + (np - 1) * SLIDE_OVERLAP) / np;
        if (s.face === "laminate") add({ group: sec, name: "Sliding panel", w: pw, h: dh, t: 0.018, qty: np, note: surfNote });
        if (s.face === "mirror") add({ group: sec, name: "Sliding mirror panel", w: pw, h: dh, t: 0.012, qty: np, note: "Mirror" });
        if (s.face === "glass") {
          add({ group: sec, name: "Sliding glass — frame (long)", w: FRAME_W, h: dh, t: 0.018, qty: 2 * np, note: "Aluminium" });
          add({ group: sec, name: "Sliding glass — frame (short)", w: pw - 2 * FRAME_W, h: FRAME_W, t: 0.018, qty: 2 * np, note: "Aluminium" });
          add({ group: sec, name: "Glass pane", w: pw - 2 * FRAME_W, h: dh - 2 * FRAME_W, t: 0.006, qty: np, note: c.glassTint });
        }
        if (s.face === "laminate" && mirror >= 0 && mirror < np) {
          const m = mirrorSpec(pw, dh, mSize);
          add({ group: sec, name: `Viewing mirror (panel ${mirror + 1})`, w: m.w, h: m.h, t: 0.006, qty: 1, note: "Inset on panel" });
        }
        add({ group: sec, name: "Top & bottom track", w: s.width, h: 0.02, t: 0.07, qty: 2, note: "Aluminium" });
      }
    }

    // drawers fitted inside a doors section
    const inner = s.kind === "doors" ? (s.innerDrawers ?? 0) : 0;
    if (inner > 0) {
      add({ group: sec, name: "Inner drawer front", w: iw - 0.01, h: INNER_DRAWER_H, t: 0.018, qty: inner });
      add({ group: sec, name: "Inner drawer base", w: iw - 0.05, h: D - 0.2, t: 0.01, qty: inner });
      add({ group: sec, name: "Inner drawer side", w: D - 0.2, h: INNER_DRAWER_H - 0.07, t: 0.01, qty: 2 * inner });
      add({ group: sec, name: "Inner drawer back", w: iw - 0.05, h: INNER_DRAWER_H - 0.07, t: 0.01, qty: inner });
    }

    // drawers
    if (s.kind === "drawers") {
      const ih = c.height - c.plinth - 2 * T;
      const fh = (ih - GAP * (s.drawers + 1)) / s.drawers;
      add({ group: sec, name: "Drawer front", w: s.width - 2 * GAP, h: fh, t: 0.018, qty: s.drawers });
      add({ group: sec, name: "Drawer base", w: iw - 0.04, h: D - 0.12, t: 0.012, qty: s.drawers });
      add({ group: sec, name: "Drawer side", w: D - 0.12, h: fh - 0.07, t: 0.012, qty: 2 * s.drawers });
      add({ group: sec, name: "Drawer back", w: iw - 0.04, h: fh - 0.07, t: 0.012, qty: s.drawers });
    }

    // loft doors
    if (c.loft) {
      const nl = leafCount(s.width);
      const lw = (s.width - 2 * GAP - (nl - 1) * 0.004) / nl;
      add({ group: sec, name: "Loft door", w: lw, h: c.loftHeight - 2 * GAP, t: 0.018, qty: nl });
    }
  });

  // handles
  if (c.handle !== "none") {
    let count = 0;
    c.sections.forEach((s) => {
      if (s.kind === "doors") {
        count += s.doorMode === "hinged" ? leafCount(s.width) : slidingPanelCount(s.width);
        count += s.innerDrawers ?? 0;
      }
      if (s.kind === "drawers") count += s.drawers;
      if (c.loft) count += leafCount(s.width);
    });
    const label = HANDLE_STYLES.find((h) => h.id === c.handle)?.name ?? c.handle;
    parts.push({ group: "Handles", name: `${label} (${c.handleFinish})`, w: 0, h: 0, t: 0, qty: count, note: "Hardware — see supplier size" });
  }

  return parts;
}

export const fmtMm = (v: number) => `${v}`;
