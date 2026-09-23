import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Procedural soft-goods geometry — the pieces that make a bedroom read as
// real are the ones that aren't boxes: puffy pillows, a duvet that drapes
// over the mattress edge, curtain folds, leaves.

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/** Cheap smooth 3D-ish wrinkle field from a few summed sines. */
function wrinkle(x: number, y: number, seed: number) {
  return (
    Math.sin(x * 9.1 + seed) * Math.sin(y * 7.3 + seed * 1.7) * 0.5 +
    Math.sin(x * 23.0 + y * 17.0 + seed * 3.1) * 0.25 +
    Math.sin(x * 4.2 - y * 5.1 + seed * 0.7) * 0.25
  );
}

/**
 * A pillow: a superellipsoid (boxy outline, domed middle, pinched seams).
 * Width along x, height along y, thickness along z; front faces +z.
 */
export function pillowGeometry(w: number, h: number, t: number, seed = 1) {
  const g = new THREE.SphereGeometry(1, 56, 40);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const sx = Math.sign(v.x) * Math.pow(Math.abs(v.x), 0.42);
    const sy = Math.sign(v.y) * Math.pow(Math.abs(v.y), 0.5);
    // Seam pinch: corners go thinner than a pure superellipsoid would.
    const corner = Math.pow(Math.abs(sx * sy), 3);
    const dent = 1 + 0.035 * wrinkle(sx, sy, seed) - 0.35 * corner;
    p.setXYZ(i, (sx * w) / 2, (sy * h) / 2, ((v.z * t) / 2) * dent);
  }
  g.computeVertexNormals();
  return g;
}

interface CoverOptions {
  /** Flat top footprint (the mattress top it rests on). */
  width: number;
  length: number;
  /** How far it hangs down each long side, and over the foot. */
  drop: number;
  footDrop: number;
  top: number;
  /** Edge roll radius where it turns down over the mattress. */
  radius?: number;
  /** Quilting channel depth across the top. */
  puff?: number;
  quiltPitch?: number;
  folds?: number;
  seed?: number;
  segments?: [number, number];
}

/**
 * A duvet/throw draped over a box: a grid laid flat on top that rolls over
 * the long sides and the foot and hangs down with gravity folds. Local
 * origin is the head-end centre at floor level; it extends toward +z.
 */
export function coverGeometry({
  width,
  length,
  drop,
  footDrop,
  top,
  radius = 0.06,
  puff = 0.02,
  quiltPitch = 0.32,
  folds = 0.02,
  seed = 1,
  segments = [120, 110],
}: CoverOptions) {
  const [su, sv] = segments;
  const unfoldArc = (Math.PI * radius) / 2;
  const totalW = width + 2 * (drop - radius + unfoldArc);
  const totalL = length + (footDrop - radius + unfoldArc);

  // Turns distance past the edge into (outward, downward) along a rolled edge.
  const roll = (d: number): [number, number] => {
    if (d <= 0) return [0, 0];
    if (d < unfoldArc) {
      const a = d / radius;
      return [radius * Math.sin(a), radius * (1 - Math.cos(a))];
    }
    return [radius, radius + (d - unfoldArc)];
  };

  const positions: number[] = [];
  const uvs: number[] = [];
  for (let j = 0; j <= sv; j++) {
    const t = (j / sv) * totalL;
    for (let i = 0; i <= su; i++) {
      const s = (i / su - 0.5) * totalW;
      const ex = Math.max(0, Math.abs(s) - width / 2);
      const ez = Math.max(0, t - length);
      const [ox, dx] = roll(ex);
      const [oz, dz] = roll(ez);
      const down = Math.max(dx, dz);
      const hang = Math.min(1, Math.max(0, down - radius) / Math.max(drop, footDrop));

      let x = Math.sign(s) * (Math.min(Math.abs(s), width / 2) + ox);
      let z = Math.min(t, length) + oz;
      let y = top - down;

      // Hanging folds grow toward the hem; a slight outward flare too.
      const foldWave = wrinkle(s * 0.8 + z, t * 0.4, seed) * folds * hang;
      if (ex > 0) x += Math.sign(s) * (foldWave + 0.025 * hang);
      if (ez > 0) z += foldWave + 0.025 * hang;

      if (ex === 0 && ez === 0) {
        // Channel quilting plus a gentle overall loft and soft rumples.
        const channel = 0.5 + 0.5 * Math.cos((t / quiltPitch) * Math.PI * 2);
        const edgeFade = Math.min(1, (width / 2 - Math.abs(s)) / 0.12, (length - t) / 0.12);
        y += (puff * (0.6 + 0.4 * channel) + 0.006 * wrinkle(s * 2, t * 2, seed + 4)) * edgeFade;
      }
      positions.push(x, y, z);
      uvs.push(s * 2, t * 2);
    }
  }

  const index: number[] = [];
  for (let j = 0; j < sv; j++) {
    for (let i = 0; i < su; i++) {
      const a = j * (su + 1) + i;
      const b = a + 1;
      const c = a + su + 1;
      const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

/** Pleated curtain panel hanging from its top edge at y=0, spanning +x. */
export function curtainGeometry(width: number, height: number, pleat = 0.14, depth = 0.05, seed = 1) {
  const g = new THREE.PlaneGeometry(width, height, Math.ceil(width / 0.012), 24);
  g.translate(width / 2, -height / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const fall = -y / height;
    const z =
      Math.sin((x / pleat) * Math.PI * 2 + seed) * depth * (0.85 + 0.3 * fall) +
      Math.sin(x * 3.1 + seed * 2) * 0.015 * fall;
    p.setZ(i, z);
  }
  g.computeVertexNormals();
  return g;
}

/** One leaf: a pointed-oval blade curled along its length, base at the origin, pointing +y. */
function leafGeometry(len: number, wid: number) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(wid * 0.6, len * 0.15, wid * 0.55, len * 0.75, 0, len);
  shape.bezierCurveTo(-wid * 0.55, len * 0.75, -wid * 0.6, len * 0.15, 0, 0);
  const g = new THREE.ShapeGeometry(shape, 10);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i) / len;
    // Midrib fold + backward curl toward the tip.
    p.setZ(i, Math.abs(x) * 0.35 - y * y * len * 0.35);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * A leafy indoor tree (fiddle-leaf-fig style) as two merged geometries —
 * stems and leaves — so the whole plant is two draw calls.
 */
export function plantGeometry(seed = 7) {
  const leaves: THREE.BufferGeometry[] = [];
  const stems: THREE.BufferGeometry[] = [];
  const STEMS = 4;
  for (let s = 0; s < STEMS; s++) {
    const angle = (s / STEMS) * Math.PI * 2 + hash(seed + s) * 0.8;
    const lean = 0.12 + hash(seed + s * 3) * 0.12;
    const height = 1.0 + hash(seed + s * 5) * 0.45;
    const top = new THREE.Vector3(Math.cos(angle) * lean, height, Math.sin(angle) * lean);
    const stemLen = top.length();
    const stem = new THREE.CylinderGeometry(0.008, 0.014, stemLen, 6);
    stem.translate(0, stemLen / 2, 0);
    stem.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().normalize())
    );
    stems.push(stem);

    const count = 9 + Math.floor(hash(seed + s * 7) * 5);
    for (let k = 0; k < count; k++) {
      const f = 0.35 + (k / count) * 0.65;
      const at = top.clone().multiplyScalar(f);
      const size = 0.16 + hash(seed * 13 + s * 31 + k) * 0.1;
      const leaf = leafGeometry(size * 1.35, size);
      const m = new THREE.Matrix4()
        .makeRotationY(hash(seed + k * 17 + s) * Math.PI * 2)
        .multiply(new THREE.Matrix4().makeRotationX(-0.5 - hash(seed + k * 3) * 0.7));
      leaf.applyMatrix4(m);
      leaf.translate(at.x, at.y, at.z);
      leaves.push(leaf);
    }
  }
  return { leaves: mergeGeometries(leaves)!, stems: mergeGeometries(stems)! };
}

/** Lathe profile of a ceramic vessel (vase / pot / lamp base). */
export function vesselGeometry(profile: [number, number][], segments = 48) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments
  );
}
