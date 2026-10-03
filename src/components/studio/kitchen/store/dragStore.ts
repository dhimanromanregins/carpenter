/**
 * Drag state, kept apart from the design so a drag in progress never touches the undo
 * history. Only releasing the mouse commits a single undoable move.
 */
import { create } from "zustand";
import type { Rotation, WallSide } from "../model/types";

export interface ModulePreview {
  x: number;
  z: number;
  rot: Rotation;
  valid: boolean;
}

export interface ElectricalPreview {
  wall: WallSide;
  offset: number;
  height: number;
}

export type DragTarget = { kind: "module"; id: string } | { kind: "electrical"; id: string } | { kind: "item"; id: string; itemId: string };

/** Where on the grabbed object the pointer took hold (plane height + offset of the object from the grab point, mm). */
export interface Grab {
  planeY: number;
  ox: number;
  oz: number;
}

interface DragState {
  /** The pointer is down on something draggable but hasn't moved far enough to be a drag yet. */
  pending: (DragTarget & { startX: number; startY: number; grab: Grab }) | null;
  active: (DragTarget & { grab: Grab }) | null;
  /** Cabinet a counter-top item would land on. */
  itemTarget: string | null;
  preview: ModulePreview | null;
  electricalPreview: ElectricalPreview | null;
  /** A library item being dragged over the viewport. */
  drop: { typeId: string; x: number; z: number; rot: Rotation; valid: boolean } | null;

  arm: (t: DragTarget, x: number, y: number, grab: Grab) => void;
  disarm: () => void;
  begin: () => void;
  setItemTarget: (id: string | null) => void;
  setPreview: (p: ModulePreview | null) => void;
  setElectricalPreview: (p: ElectricalPreview | null) => void;
  setDrop: (d: DragState["drop"]) => void;
  end: () => void;
}

export const useDrag = create<DragState>((set) => ({
  pending: null,
  active: null,
  preview: null,
  electricalPreview: null,
  itemTarget: null,
  drop: null,

  arm: (t, startX, startY, grab) => set({ pending: { ...t, startX, startY, grab } }),
  disarm: () => set({ pending: null }),
  begin: () =>
    set((st) => (st.pending ? { active: { ...(st.pending.kind === "item" ? { kind: "item" as const, id: st.pending.id, itemId: st.pending.itemId } : { kind: st.pending.kind, id: st.pending.id } as DragTarget), grab: st.pending.grab }, pending: null } : st)),
  setItemTarget: (itemTarget) => set({ itemTarget }),
  setPreview: (preview) => set({ preview }),
  setElectricalPreview: (electricalPreview) => set({ electricalPreview }),
  setDrop: (drop) => set({ drop }),
  end: () => set({ pending: null, active: null, preview: null, electricalPreview: null, itemTarget: null, drop: null }),
}));
