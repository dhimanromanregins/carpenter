import { create } from "zustand";

export type StudioMode = "design" | "walk" | "present";
export type ViewPreset = "perspective" | "front" | "top" | "left" | "right";
export type CameraPreset = "eye" | "wide" | "cabinet" | "countertop" | "interior" | "island";
export type LeftTab = "layout" | "room" | "modules" | "hardware" | "style" | "counter" | "appliances" | "lighting" | "services";
export type ServiceViewMode = "none" | "electrical" | "plumbing";

export interface CameraCommand {
  kind: "view" | "preset" | "focus";
  name: string;
  moduleId?: string;
  nonce: number;
}

interface UiState {
  mode: StudioMode;
  leftTab: LeftTab;
  rightOpen: boolean;
  ortho: boolean;
  view: ViewPreset;
  showMeasurements: boolean;
  showClearances: boolean;
  showFloorPlan: boolean;
  showPoints: boolean;
  quoteOpen: boolean;
  infoOpen: boolean;
  /** Eye height in mm for walk mode. */
  eyeHeight: number;
  /** Wiring / plumbing view: faded cabinets with the routes drawn. */
  serviceView: ServiceViewMode;
  selectedElectrical: string | null;
  cameraCommand: CameraCommand | null;
  walkLocked: boolean;
  presentStep: number;
  toast: string | null;

  setMode: (m: StudioMode) => void;
  setLeftTab: (t: LeftTab) => void;
  setRightOpen: (v: boolean) => void;
  setOrtho: (v: boolean) => void;
  setView: (v: ViewPreset) => void;
  toggle: (k: "showMeasurements" | "showClearances" | "showFloorPlan" | "showPoints" | "quoteOpen" | "infoOpen") => void;
  setEyeHeight: (v: number) => void;
  setServiceView: (v: ServiceViewMode) => void;
  setSelectedElectrical: (id: string | null) => void;
  command: (c: Omit<CameraCommand, "nonce">) => void;
  setWalkLocked: (v: boolean) => void;
  setPresentStep: (n: number) => void;
  setToast: (t: string | null) => void;
}

let nonce = 1;

export const useUi = create<UiState>((set) => ({
  mode: "design",
  leftTab: "layout",
  rightOpen: true,
  ortho: false,
  view: "perspective",
  showMeasurements: false,
  showClearances: false,
  showFloorPlan: false,
  showPoints: false,
  quoteOpen: false,
  infoOpen: false,
  eyeHeight: 1650,
  serviceView: "none",
  selectedElectrical: null,
  cameraCommand: null,
  walkLocked: false,
  presentStep: 0,
  toast: null,

  setMode: (mode) => set({ mode, walkLocked: false, presentStep: 0 }),
  setLeftTab: (leftTab) => set({ leftTab }),
  setRightOpen: (rightOpen) => set({ rightOpen }),
  setOrtho: (ortho) => set({ ortho }),
  setView: (view) => set({ view, cameraCommand: { kind: "view", name: view, nonce: nonce++ } }),
  toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<UiState>),
  setEyeHeight: (eyeHeight) => set({ eyeHeight }),
  setServiceView: (serviceView) => set((s) => ({ serviceView: s.serviceView === serviceView ? "none" : serviceView })),
  setSelectedElectrical: (selectedElectrical) => set({ selectedElectrical }),
  command: (c) => set({ cameraCommand: { ...c, nonce: nonce++ } }),
  setWalkLocked: (walkLocked) => set({ walkLocked }),
  setPresentStep: (presentStep) => set({ presentStep }),
  setToast: (toast) => set({ toast }),
}));
