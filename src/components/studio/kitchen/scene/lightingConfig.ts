import type { ColourTemp, TimeOfDay } from "../model/types";

export const LED_COLORS: Record<ColourTemp, string> = {
  2700: "#ffb866",
  3000: "#ffc98a",
  4000: "#ffe6c4",
  5000: "#fff3e0",
};

export interface SceneMood {
  ambient: number;
  ambientColor: string;
  sun: number;
  sunColor: string;
  sunPos: [number, number, number];
  env: number;
  background: string;
  window: string;
  bloom: number;
  exposure: number;
  vignette: number;
}

export const SCENE_MOODS: Record<TimeOfDay, SceneMood> = {
  day: { ambient: 0.32, ambientColor: "#fff6e8", sun: 1.5, sunColor: "#fff1da", sunPos: [4.5, 6, 2.5], env: 0.7, background: "#cdd6dc", window: "#eaf4ff", bloom: 0.12, exposure: 0.82, vignette: 0.3 },
  evening: { ambient: 0.2, ambientColor: "#ffd2a8", sun: 0.7, sunColor: "#ff9a5c", sunPos: [5, 1.6, 2], env: 0.32, background: "#2a2320", window: "#ff9a5c", bloom: 0.5, exposure: 0.9, vignette: 0.5 },
  night: { ambient: 0.06, ambientColor: "#8aa0ff", sun: 0.06, sunColor: "#9db4ff", sunPos: [3, 5, 3], env: 0.1, background: "#06070b", window: "#0a1226", bloom: 0.95, exposure: 1.0, vignette: 0.7 },
  presentation: { ambient: 0.4, ambientColor: "#fff2e0", sun: 1.2, sunColor: "#ffe9cc", sunPos: [4, 5, 3], env: 0.6, background: "#1b1c1f", window: "#dfeaf6", bloom: 0.35, exposure: 0.88, vignette: 0.55 },
};
