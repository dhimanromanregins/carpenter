import { useCleanedGltf } from "./useCleanedGltf";
import { useGLTF } from "@react-three/drei";

// Real glTF bed, replacing the procedural hydraulic-lift bed rig that used
// to be built in legacyFloorSceneBuilder.ts (buildDetailedBed/buildBed) —
// this one is a static decorative model, not interactive.
const DEFAULT_MODEL_URL = "/models/bed.glb";
useGLTF.preload(DEFAULT_MODEL_URL);

interface BedProps {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number | [number, number, number];
  modelUrl?: string;
}

export function Bed({ position = [0, 0, 0], rotationY = 0, scale = 1, modelUrl = DEFAULT_MODEL_URL }: BedProps) {
  const model = useCleanedGltf(modelUrl);
  return <primitive object={model} position={position} rotation={[0, rotationY, 0]} scale={scale} />;
}
