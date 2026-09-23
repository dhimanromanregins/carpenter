import { createContext, useContext } from "react";

/**
 * 0 = daylight, 1 = evening. Eased every frame by <BedroomLighting>;
 * lights and glowing materials read it inside their own useFrame so the
 * whole room crossfades without React re-renders.
 */
export const EveningMixContext = createContext<{ current: number }>({ current: 0 });

export function useEveningMix() {
  return useContext(EveningMixContext);
}

/** The Day/Evening toggle's target value (the mix eases toward it). */
export const EveningTargetContext = createContext(false);

/**
 * The space the viewer is standing in (see spaceAt). Changes rarely, so
 * it's React state: components use it to switch expensive effects (like
 * planar reflections) on only where they can actually be seen.
 */
export const CameraSpaceContext = createContext(0);

/** Whether the pulsing "you can click this" markers are shown. */
export const HintsContext = createContext(true);

/**
 * Eased 0..1 state of the window dressing, written by the window assembly
 * and read by the lighting rig — closing the drapes really darkens the room.
 */
export const windowState = { drapes: 0, sheers: 0, sash: 0 };

/** Eased 0..1 openness of the bedroom door, the hall's sliding glass panel and the main door. */
export const openingState = { door: 0, slider: 0, mainDoor: 0 };

/**
 * The bedroom door and sliding glass panel are page-level state (tours
 * need to open them on the way through); scene components read it here.
 */
export interface OpeningsControl {
  doorOpen: boolean;
  sliderOpen: boolean;
  mainDoorOpen: boolean;
  setDoorOpen: (open: boolean) => void;
  setSliderOpen: (open: boolean) => void;
  setMainDoorOpen: (open: boolean) => void;
}

export const OpeningsContext = createContext<OpeningsControl>({
  doorOpen: false,
  sliderOpen: false,
  mainDoorOpen: false,
  setDoorOpen: () => {},
  setSliderOpen: () => {},
  setMainDoorOpen: () => {},
});

export function mixValue(day: number, evening: number, t: number) {
  return day + (evening - day) * t;
}

export interface TourTarget {
  x: number;
  z: number;
  yaw: number;
  pitch: number;
  /** Walkable route to the target, filled in by the walk controller. */
  path?: { x: number; z: number }[];
}

/**
 * Plain mutable input channel between the DOM overlay (touch joystick,
 * tour buttons) and the in-Canvas walk controller, which polls it per
 * frame — no React state on the hot path.
 */
export const walkInput = {
  /** Joystick vector, x = strafe right, y = forward, each in [-1, 1]. */
  joyX: 0,
  joyY: 0,
  tour: null as TourTarget | null,
  /** Set by the page so a tour can open doors it needs to walk through. */
  openings: null as OpeningsControl | null,
};

// Lets browser tests wait for a tour to finish. Dev builds only.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { __walkInput: typeof walkInput }).__walkInput = walkInput;
}
