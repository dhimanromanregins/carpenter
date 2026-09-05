import { useCleanedGltf } from "./useCleanedGltf";
import { useGLTF } from "@react-three/drei";

// Real glTF coffee table (Poly Haven "Coffee Table Round 01" — marble top,
// metal base, CC0) in place of the procedural box-built one it replaces in
// legacyFloorSceneBuilder.ts.
const DEFAULT_MODEL_URL = "/models/table-round/coffee_table_round_01_1k.gltf";
useGLTF.preload(DEFAULT_MODEL_URL);

interface CoffeeTableProps {
  position?: [number, number, number];
  rotationY?: number;
  modelUrl?: string;
}

export function CoffeeTable({ position = [0, 0, 0], rotationY = 0, modelUrl = DEFAULT_MODEL_URL }: CoffeeTableProps) {
  const model = useCleanedGltf(modelUrl);
  return <primitive object={model} position={position} rotation={[0, rotationY, 0]} />;
}
