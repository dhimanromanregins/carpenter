import * as THREE from "three";
import { getBedroomTextures, withRepeat, type PbrMaps } from "./proceduralTextures";

// Shared PBR materials for the bedroom. Fabrics use MeshPhysicalMaterial's
// sheen lobe — the soft rim-glow real textiles have at grazing angles,
// which is most of what separates "fabric" from "matte plastic" on screen.

function fabric(color: string, maps: PbrMaps, repeat: number, bumpScale: number) {
  const m = withRepeat(maps, repeat, repeat);
  return new THREE.MeshPhysicalMaterial({
    color,
    map: m.map,
    bumpMap: m.bumpMap,
    bumpScale,
    roughness: 0.92,
    sheen: 1,
    sheenRoughness: 0.75,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.55),
    side: THREE.DoubleSide,
  });
}

function wood(maps: PbrMaps, repeat: number, roughness = 0.9) {
  const m = withRepeat(maps, repeat, repeat);
  return new THREE.MeshPhysicalMaterial({
    map: m.map,
    roughnessMap: m.roughnessMap,
    roughness,
    bumpMap: m.bumpMap,
    bumpScale: 0.25,
    clearcoat: 0.25,
    clearcoatRoughness: 0.45,
  });
}

function build() {
  const t = getBedroomTextures();
  const plaster = withRepeat(t.plaster, 3, 2);
  return {
    wall: new THREE.MeshStandardMaterial({
      color: "#ECE5DA",
      map: plaster.map,
      bumpMap: plaster.bumpMap,
      bumpScale: 0.4,
      roughness: 0.95,
    }),
    ceiling: new THREE.MeshStandardMaterial({ color: "#F4F1EB", roughness: 0.96 }),
    walnut: wood(t.walnut, 1),
    oak: wood(t.oak, 1, 0.95),
    linenWhite: fabric("#F2EFE9", t.linen, 3, 0.35),
    linenDuvet: fabric("#EDE9E1", t.linen, 1.5, 0.35),
    upholstery: fabric("#B6AA98", t.linen, 3, 0.5),
    sage: fabric("#8B967E", t.linen, 3, 0.45),
    rust: fabric("#A5643C", t.knit, 1, 1.2),
    boucle: fabric("#E6DED0", t.boucle, 3, 1.6),
    velvetSage: new THREE.MeshPhysicalMaterial({
      color: "#5F6B58",
      roughness: 0.85,
      sheen: 1,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color("#b8c4ae"),
    }),
    brass: new THREE.MeshStandardMaterial({ color: "#C9A461", metalness: 1, roughness: 0.28 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: "#27272A", metalness: 0.7, roughness: 0.42 }),
    ceramic: new THREE.MeshPhysicalMaterial({
      color: "#DCD5C9",
      roughness: 0.4,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    }),
    ceramicDark: new THREE.MeshPhysicalMaterial({
      color: "#5B5148",
      roughness: 0.55,
      clearcoat: 0.3,
    }),
    laminate: new THREE.MeshStandardMaterial({ color: "#D8D1C5", roughness: 0.55 }),
    carcassInterior: new THREE.MeshStandardMaterial({ color: "#EFE9DF", roughness: 0.7 }),
    carcassDark: new THREE.MeshStandardMaterial({ color: "#2B211A", roughness: 0.8 }),
    drawerBox: new THREE.MeshStandardMaterial({ color: "#E4D3B6", roughness: 0.65 }),
    stone: new THREE.MeshPhysicalMaterial({ color: "#E7E2D9", roughness: 0.25, clearcoat: 0.4 }),
    frameBronze: new THREE.MeshStandardMaterial({ color: "#3A342E", metalness: 0.6, roughness: 0.4 }),
    // Unlit so the room's lamps don't leave hot specular dots on the pane.
    glass: new THREE.MeshBasicMaterial({
      color: "#dfe9ee",
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    leaf: new THREE.MeshPhysicalMaterial({
      color: "#3F5B37",
      roughness: 0.5,
      sheen: 0.4,
      sheenColor: new THREE.Color("#9fbf8a"),
      side: THREE.DoubleSide,
    }),
    stem: new THREE.MeshStandardMaterial({ color: "#5A4632", roughness: 0.8 }),

    // ── Living hall ──
    sofa: fabric("#CDBFAC", t.linen, 3, 0.5),
    leather: new THREE.MeshPhysicalMaterial({
      color: "#8C5635",
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      sheen: 0.3,
      sheenColor: new THREE.Color("#d9a57c"),
    }),
    neroSlab: (() => {
      const n = withRepeat(t.neroMarble, 1, 1);
      return new THREE.MeshPhysicalMaterial({
        map: n.map,
        roughnessMap: n.roughnessMap,
        roughness: 1,
        clearcoat: 1,
        // Honed-polish: glossy, but reflections stay soft.
        clearcoatRoughness: 0.28,
      });
    })(),
    marbleTop: (() => {
      // A window onto a single floor tile, so no grout lines show.
      const w = withRepeat(t.marbleFloor, 0.42, 0.42);
      w.map.offset.set(0.04, 0.04);
      w.roughnessMap.offset.set(0.04, 0.04);
      return new THREE.MeshPhysicalMaterial({
        map: w.map,
        roughnessMap: w.roughnessMap,
        roughness: 1,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      });
    })(),
    teak: (() => {
      const w = withRepeat(t.oakFloor, 3, 3);
      return new THREE.MeshStandardMaterial({
        color: "#A27A56",
        map: w.map,
        roughnessMap: w.roughnessMap,
        bumpMap: w.bumpMap,
        bumpScale: 0.6,
        roughness: 0.9,
      });
    })(),
    aluminium: new THREE.MeshStandardMaterial({ color: "#1E1F21", metalness: 0.75, roughness: 0.35 }),
    steel: new THREE.MeshStandardMaterial({ color: "#B9BDC1", metalness: 1, roughness: 0.25 }),
    concrete: new THREE.MeshStandardMaterial({
      color: "#9E9890",
      map: plaster.map,
      bumpMap: plaster.bumpMap,
      bumpScale: 1.2,
      roughness: 0.95,
    }),
    trim: new THREE.MeshStandardMaterial({ color: "#E6DFD3", roughness: 0.55 }),

    // ── Entrance and garden ──
    travertine: (() => {
      const w = withRepeat(t.travertine, 1, 1);
      return new THREE.MeshStandardMaterial({ map: w.map, roughness: 0.72, bumpMap: w.roughnessMap, bumpScale: 0.4 });
    })(),
    grass: (() => {
      const w = withRepeat(t.grass, 22, 22);
      return new THREE.MeshStandardMaterial({ map: w.map, bumpMap: w.bumpMap, bumpScale: 1.2, roughness: 0.95 });
    })(),
    hedge: new THREE.MeshStandardMaterial({
      color: "#3F5E36",
      map: plaster.map,
      bumpMap: plaster.bumpMap,
      bumpScale: 3,
      roughness: 0.95,
    }),
    paver: new THREE.MeshStandardMaterial({ color: "#8E8A84", map: plaster.map, roughness: 0.85 }),
    charcoal: new THREE.MeshStandardMaterial({ color: "#2A2A2C", roughness: 0.7 }),
    paper: new THREE.MeshStandardMaterial({ color: "#EEE8DC", roughness: 0.9 }),
  };
}

export type BedroomMaterials = ReturnType<typeof build>;

let cache: BedroomMaterials | null = null;

export function getBedroomMaterials(): BedroomMaterials {
  if (!cache) cache = build();
  return cache;
}
