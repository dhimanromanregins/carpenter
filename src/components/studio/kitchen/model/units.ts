/** Unit helpers. The model is in millimetres; the 3D scene is in metres. */

export const mm = (v: number) => v / 1000;
export const sqm = (wMm: number, hMm: number) => (wMm / 1000) * (hMm / 1000);
export const SQFT_PER_SQM = 10.7639;
export const sqft = (wMm: number, hMm: number) => sqm(wMm, hMm) * SQFT_PER_SQM;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const snap = (v: number, step: number) => Math.round(v / step) * step;

export function fmtMm(v: number): string {
  return `${Math.round(v)} mm`;
}

export function fmtFeetInches(v: number): string {
  const totalIn = v / 25.4;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return `${ft}' ${inch}"`;
}

export const inr = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(v));

let counter = 1;
export const uid = (prefix = "m") => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

export const rotToRad = (r: number) => (r * Math.PI) / 180;
