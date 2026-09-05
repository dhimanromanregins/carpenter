import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Shared cleanup for loaded glTF models used around the walkthrough:
// - Strips any embedded punctual lights (some source files bundle their
//   own studio "Key Light" for their own viewer, which we don't want
//   adding an unexpected extra light into this scene).
// - Enables shadows on every mesh.
// - Fixes a recurring mis-export where fabric/wood is tagged
//   metallicFactor:1 (meant to be overridden per-pixel by the
//   metallicRoughnessTexture) — with no environment map in this scene
//   that reads as flat grey plastic instead of the real base-color
//   texture, so this forces it back to a non-metal response.
export function useCleanedGltf(modelUrl: string): THREE.Group {
  const { scene } = useGLTF(modelUrl);

  return useMemo(() => {
    const clone = scene.clone(true);
    const lightsToRemove: THREE.Object3D[] = [];
    clone.traverse((obj) => {
      if ((obj as THREE.Light).isLight) lightsToRemove.push(obj);
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial && m.metalness === 1) {
            m.metalness = 0;
            m.roughness = Math.max(m.roughness, 0.75);
          }
        });
      }
    });
    lightsToRemove.forEach((light) => light.parent?.remove(light));
    if (import.meta.env.DEV && new URLSearchParams(location.search).has("debugBbox")) {
      const box = new THREE.Box3().setFromObject(clone);
      const size = new THREE.Vector3();
      box.getSize(size);
      // eslint-disable-next-line no-console
      console.log("GLTF_DEBUG_BBOX", modelUrl, JSON.stringify({ size: [size.x, size.y, size.z], min: box.min.toArray(), max: box.max.toArray() }));
    }
    return clone;
  }, [scene, modelUrl]);
}
