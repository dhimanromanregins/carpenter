/**
 * Interaction + selection state, kept apart from the design so that opening a
 * drawer never creates an undo step and never re-flows the layout.
 *
 * Every interactive part has a string key ("<moduleId>:<part>"). A part's
 * lifecycle is closed → opening → open → closing → closed; the *intent* (open or
 * not) lives here, the in-between animation lives in `useOpenProgress`.
 */
import { create } from "zustand";

export type InteractionPhase = "closed" | "opening" | "open" | "closing";

export interface HoverInfo {
  key: string;
  moduleId: string;
  /** Text such as "Open Drawer". */
  label: string;
}

/** Every currently-mounted openable part. Parts register themselves, so "open the kitchen" never needs a hand-kept list. */
const registry = new Set<string>();
export const registerInteractive = (key: string) => {
  registry.add(key);
  return () => {
    registry.delete(key);
  };
};

export type SurfaceTarget = "counter" | "backsplash" | "floor" | "wall";

interface InteractionState {
  open: Record<string, boolean>;
  hover: HoverInfo | null;
  pointer: { x: number; y: number };
  contextMenu: { x: number; y: number; moduleId: string } | null;

  toggle: (key: string) => void;
  setOpen: (key: string, value: boolean) => void;
  closeAll: () => void;
  /** Opens every door, drawer, pull-out and appliance in the kitchen. */
  openAll: () => void;
  /** Open / close every part whose key starts with `prefix`. */
  setGroup: (prefix: string, value: boolean) => void;
  isOpen: (key: string) => boolean;
  setHover: (h: HoverInfo | null) => void;
  setPointer: (x: number, y: number) => void;
  showContextMenu: (m: InteractionState["contextMenu"]) => void;
}

export const useInteraction = create<InteractionState>((set, get) => ({
  open: {},
  hover: null,
  pointer: { x: 0, y: 0 },
  contextMenu: null,

  toggle: (key) => set((s) => ({ open: { ...s.open, [key]: !s.open[key] } })),
  setOpen: (key, value) => set((s) => (!!s.open[key] === value ? s : { open: { ...s.open, [key]: value } })),
  closeAll: () => set({ open: {} }),
  openAll: () =>
    set(() => {
      const next: Record<string, boolean> = {};
      registry.forEach((k) => {
        // hobs, chimneys and faucets are "turned on" rather than opened — leave them to their own click
        if (!k.endsWith(":hob") && !k.endsWith(":chimney") && !k.endsWith(":faucet")) next[k] = true;
      });
      return { open: next };
    }),
  setGroup: (prefix, value) => {
    const keys = Object.keys(get().open).filter((k) => k.startsWith(prefix));
    set((s) => {
      const next = { ...s.open };
      keys.forEach((k) => (next[k] = value));
      return { open: next };
    });
  },
  isOpen: (key) => !!get().open[key],
  setHover: (h) => set((s) => (s.hover?.key === h?.key && s.hover?.label === h?.label ? s : { hover: h })),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  showContextMenu: (contextMenu) => set({ contextMenu }),
}));

interface SelectionState {
  selectedId: string | null;
  /** A non-cabinet surface (countertop, backsplash, floor, wall) picked in the 3D view. */
  surface: SurfaceTarget | null;
  hoveredModuleId: string | null;
  select: (id: string | null) => void;
  selectSurface: (s: SurfaceTarget | null) => void;
  setHoveredModule: (id: string | null) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedId: null,
  surface: null,
  hoveredModuleId: null,
  select: (id) => set({ selectedId: id, surface: null }),
  selectSurface: (surface) => set({ surface, selectedId: null }),
  setHoveredModule: (id) => set((s) => (s.hoveredModuleId === id ? s : { hoveredModuleId: id })),
}));

/** Subscribe to the phase-less open flag of a single key (re-renders only that part). */
export const useIsOpen = (key: string) => useInteraction((s) => !!s.open[key]);
