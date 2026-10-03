/** Lets UI code export the current 3D frame without importing the canvas. */
let capture: ((scale: number) => string) | null = null;

export function registerCapture(fn: ((scale: number) => string) | null) {
  capture = fn;
}

export function capturePng(scale = 1): string | null {
  return capture ? capture(scale) : null;
}

export function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
