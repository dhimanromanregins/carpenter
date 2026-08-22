import { useMemo } from "react";
import * as THREE from "three";

interface WoodTextureOptions {
  baseColor?: string;
  ringColor?: string;
  size?: number;
  repeatX?: number;
  repeatY?: number;
}

function paintWoodGrain(
  ctx: CanvasRenderingContext2D,
  size: number,
  baseColor: string,
  ringColor: string
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const lines = 46;
  for (let i = 0; i < lines; i++) {
    const y = (i / lines) * size + (Math.random() - 0.5) * 5;
    ctx.strokeStyle = ringColor;
    ctx.globalAlpha = 0.06 + Math.random() * 0.14;
    ctx.lineWidth = 1 + Math.random() * 2.2;
    ctx.beginPath();
    for (let x = 0; x <= size; x += 6) {
      const wobble =
        Math.sin(x * 0.018 + i * 1.3) * 5 +
        Math.sin(x * 0.004 + i * 2.1) * 10;
      if (x === 0) ctx.moveTo(x, y + wobble);
      else ctx.lineTo(x, y + wobble);
    }
    ctx.stroke();
  }

  // subtle vertical grain flecks
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? ringColor : "#000000";
    const w = Math.random() * 2;
    ctx.fillRect(Math.random() * size, Math.random() * size, w, w * 6);
  }

  ctx.globalAlpha = 1;
}

export function useWoodTexture({
  baseColor = "#7a5535",
  ringColor = "#3d2712",
  size = 512,
  repeatX = 2,
  repeatY = 2,
}: WoodTextureOptions = {}) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    paintWoodGrain(ctx, size, baseColor, ringColor);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseColor, ringColor, size, repeatX, repeatY]);
}
