import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getBedroomMaterials } from "./bedroomMaterials";
import { mixValue, useEveningMix } from "./bedroomState";
import { Box, type V3 } from "./primitives";

const BAND_T = 0.1;

// Warm light bleeding out of the tray-ceiling cove: a gradient that's
// brightest along the tray edges, added on top of the recessed ceiling.
let washTexture: THREE.CanvasTexture | null = null;
function coveWashTexture() {
  if (washTexture) return washTexture;
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const e = Math.min(x, y, S - 1 - x, S - 1 - y) / (S / 2);
      const a = Math.pow(1 - Math.min(1, e / 0.55), 2.2);
      const i = (y * S + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 196;
      img.data[i + 2] = 130;
      img.data[i + 3] = a * 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  washTexture = new THREE.CanvasTexture(c);
  washTexture.colorSpace = THREE.SRGBColorSpace;
  return washTexture;
}

interface TrayCeilingProps {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  /** Height of the recessed (upper) ceiling. */
  height: number;
  /** Underside of the perimeter drop band. */
  bandBottom: number;
  /** Width of the drop band. */
  inset: number;
  /** Recessed downlights in the band, as [x, z]. */
  downlights?: [number, number][];
}

/**
 * A ceiling with a perimeter drop band and a recessed centre tray: an LED
 * strip hidden behind an upstand lip washes the tray with warm light in
 * the evening. Used by both the bedroom and the hall.
 */
export function TrayCeiling({ x0, x1, z0, z1, height, bandBottom, inset, downlights = [] }: TrayCeilingProps) {
  const m = getBedroomMaterials();
  const mix = useEveningMix();
  const W = x1 - x0;
  const D = z1 - z0;
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const innerW = W - 2 * inset;
  const innerD = D - 2 * inset;
  const bandY = bandBottom + BAND_T / 2;
  const washTex = useMemo(coveWashTexture, []);
  const washMat = useRef<THREE.MeshBasicMaterial>(null);
  const stripMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000", emissive: "#FFC98A" }), []);
  const discMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f4f1ea", emissive: "#FFE2B8", side: THREE.DoubleSide }),
    []
  );
  const bezelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d8d4cc", metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }),
    []
  );

  useFrame(() => {
    const t = mix.current;
    if (washMat.current) washMat.current.opacity = mixValue(0.0, 0.95, t);
    stripMat.emissiveIntensity = mixValue(0, 6, t);
    discMat.emissiveIntensity = mixValue(0.15, 8, t);
  });

  const lipY = bandBottom + BAND_T + 0.03;
  const stripY = bandBottom + BAND_T + 0.006;
  const strips: { s: V3; p: V3 }[] = [
    { s: [innerW, 0.012, 0.012], p: [cx, stripY, z0 + inset - 0.05] },
    { s: [innerW, 0.012, 0.012], p: [cx, stripY, z1 - inset + 0.05] },
    { s: [0.012, 0.012, innerD], p: [x0 + inset - 0.05, stripY, cz] },
    { s: [0.012, 0.012, innerD], p: [x1 - inset + 0.05, stripY, cz] },
  ];

  return (
    <group>
      <Box size={[W + 0.4, 0.1, D + 0.4]} position={[cx, height + 0.05, cz]} material={m.ceiling} />
      {/* Perimeter drop band */}
      <Box size={[W, BAND_T, inset]} position={[cx, bandY, z0 + inset / 2]} material={m.ceiling} />
      <Box size={[W, BAND_T, inset]} position={[cx, bandY, z1 - inset / 2]} material={m.ceiling} />
      <Box size={[inset, BAND_T, innerD]} position={[x0 + inset / 2, bandY, cz]} material={m.ceiling} />
      <Box size={[inset, BAND_T, innerD]} position={[x1 - inset / 2, bandY, cz]} material={m.ceiling} />
      {/* Upstand lips that hide the LED strip from below */}
      <Box size={[innerW, 0.06, 0.02]} position={[cx, lipY, z0 + inset - 0.01]} material={m.ceiling} cast={false} />
      <Box size={[innerW, 0.06, 0.02]} position={[cx, lipY, z1 - inset + 0.01]} material={m.ceiling} cast={false} />
      <Box size={[0.02, 0.06, innerD]} position={[x0 + inset - 0.01, lipY, cz]} material={m.ceiling} cast={false} />
      <Box size={[0.02, 0.06, innerD]} position={[x1 - inset + 0.01, lipY, cz]} material={m.ceiling} cast={false} />
      {strips.map((s, i) => (
        <mesh key={i} position={s.p} material={stripMat}>
          <boxGeometry args={s.s} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, height - 0.002, cz]}>
        <planeGeometry args={[innerW, innerD]} />
        <meshBasicMaterial
          ref={washMat}
          map={washTex}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {downlights.map(([x, z], i) => (
        <group key={i} position={[x, bandBottom - 0.001, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={bezelMat}>
            <ringGeometry args={[0.045, 0.058, 32]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={discMat}>
            <circleGeometry args={[0.045, 32]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
