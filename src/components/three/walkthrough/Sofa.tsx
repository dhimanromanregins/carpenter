import { useCleanedGltf } from "./useCleanedGltf";
import { useGLTF } from "@react-three/drei";

// Real glTF sofa in place of a procedural box-built one — replaces the
// drawing room's old U-shaped sectional in legacyFloorSceneBuilder.ts.
// Default: Khronos glTF-Sample-Assets "GlamVelvetSofa", CC-BY 4.0,
// © 2021 Wayfair LLC.
const DEFAULT_MODEL_URL = "/models/sofa.glb";
useGLTF.preload(DEFAULT_MODEL_URL);

interface SofaProps {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number | [number, number, number];
  modelUrl?: string;
}

export function Sofa({ position = [0, 0, 0], rotationY = 0, scale = 1, modelUrl = DEFAULT_MODEL_URL }: SofaProps) {
  const model = useCleanedGltf(modelUrl);
  return <primitive object={model} position={position} rotation={[0, rotationY, 0]} scale={scale} />;
}
