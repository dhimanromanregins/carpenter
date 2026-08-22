import { useMemo } from "react";
import * as THREE from "three";

interface LightShaftProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
  color?: string;
  opacity?: number;
}

export function LightShaft({
  position,
  rotation = [0, 0, 0],
  size = [3, 8],
  color = "#c6a86a",
  opacity = 0.18,
}: LightShaftProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;

    const radial = ctx.createRadialGradient(64, 0, 0, 64, 128, 64);
    radial.addColorStop(0, "rgba(255,255,255,1)");
    radial.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 128, 256);
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, 128, 256);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
