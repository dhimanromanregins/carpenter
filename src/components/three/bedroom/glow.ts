import * as THREE from "three";

/**
 * Additive halo texture for hidden LED strips: transparent over a w×h
 * rectangle's footprint, glowing just outside its edges and fading out
 * over `pad`. Laid on the surface behind/under the lit object.
 */
export function rectGlowTexture(w: number, h: number, pad: number, falloff = 0.09, rgb: [number, number, number] = [255, 190, 120]) {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const tw = w + 2 * pad;
  const th = h + 2 * pad;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = (x / S - 0.5) * tw;
      const py = (y / S - 0.5) * th;
      const ox = Math.max(0, Math.abs(px) - w / 2);
      const oy = Math.max(0, Math.abs(py) - h / 2);
      const a = Math.exp(-Math.hypot(ox, oy) / falloff);
      const i = (y * S + x) * 4;
      img.data[i] = rgb[0];
      img.data[i + 1] = rgb[1];
      img.data[i + 2] = rgb[2];
      img.data[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
