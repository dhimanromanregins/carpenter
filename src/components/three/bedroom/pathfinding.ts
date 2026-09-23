import {
  COLLIDERS,
  DOOR_OPEN_COLLIDER,
  MAIN_DOOR_OPEN_COLLIDER,
  PLAYER_RADIUS,
  WALLS,
  WORLD,
  type Box2,
} from "./bedroomLayout";

// Grid A* over the walkable floor, used by the tour buttons so the camera
// walks around furniture and through doorways instead of gliding through
// walls. Planning assumes the door and sliding panel are open — the walk
// controller opens them on the way.

const CELL = 0.1;
const MARGIN = PLAYER_RADIUS + 0.04;
const NX = Math.ceil((WORLD.x1 - WORLD.x0) / CELL);
const NZ = Math.ceil((WORLD.z1 - WORLD.z0) / CELL);
const PLANNING_BOXES: Box2[] = [...WALLS, ...COLLIDERS, DOOR_OPEN_COLLIDER, MAIN_DOOR_OPEN_COLLIDER];

function freeAt(x: number, z: number) {
  if (x < WORLD.x0 + MARGIN || x > WORLD.x1 - MARGIN || z < WORLD.z0 + MARGIN || z > WORLD.z1 - MARGIN) return false;
  for (const b of PLANNING_BOXES) {
    if (x > b.x0 - MARGIN && x < b.x1 + MARGIN && z > b.z0 - MARGIN && z < b.z1 + MARGIN) return false;
  }
  return true;
}

let grid: Uint8Array | null = null;
function getGrid() {
  if (grid) return grid;
  grid = new Uint8Array(NX * NZ);
  for (let j = 0; j < NZ; j++) {
    for (let i = 0; i < NX; i++) {
      grid[j * NX + i] = freeAt(WORLD.x0 + (i + 0.5) * CELL, WORLD.z0 + (j + 0.5) * CELL) ? 1 : 0;
    }
  }
  return grid;
}

const cellOf = (x: number, z: number) => [
  Math.min(NX - 1, Math.max(0, Math.floor((x - WORLD.x0) / CELL))),
  Math.min(NZ - 1, Math.max(0, Math.floor((z - WORLD.z0) / CELL))),
];
const centreOf = (i: number, j: number) => ({ x: WORLD.x0 + (i + 0.5) * CELL, z: WORLD.z0 + (j + 0.5) * CELL });

/** Nearest walkable cell to (i, j), searching outward ring by ring. */
function nearestFree(g: Uint8Array, i: number, j: number): [number, number] | null {
  if (g[j * NX + i]) return [i, j];
  for (let r = 1; r < 30; r++) {
    for (let dj = -r; dj <= r; dj++) {
      for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const a = i + di;
        const b = j + dj;
        if (a >= 0 && b >= 0 && a < NX && b < NZ && g[b * NX + a]) return [a, b];
      }
    }
  }
  return null;
}

function lineOfSight(a: { x: number; z: number }, b: { x: number; z: number }) {
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  const steps = Math.ceil(len / (CELL * 0.5));
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    if (!freeAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false;
  }
  return true;
}

/** Binary min-heap keyed on f-score. */
class Heap {
  private items: number[] = [];
  private score: Float32Array;
  constructor(score: Float32Array) {
    this.score = score;
  }
  get size() {
    return this.items.length;
  }
  push(n: number) {
    const a = this.items;
    a.push(n);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.score[a[p]] <= this.score[a[i]]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.score[a[l]] < this.score[a[m]]) m = l;
        if (r < a.length && this.score[a[r]] < this.score[a[m]]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

/**
 * Walkable route from `from` to `to`, simplified to as few straight legs
 * as the room allows. Excludes the start point; ends exactly at `to`.
 * Falls back to a straight line if no route exists.
 */
export function findPath(from: { x: number; z: number }, to: { x: number; z: number }) {
  if (lineOfSight(from, to)) return [{ x: to.x, z: to.z }];
  const g = getGrid();
  const s = nearestFree(g, ...(cellOf(from.x, from.z) as [number, number]));
  const e = nearestFree(g, ...(cellOf(to.x, to.z) as [number, number]));
  if (!s || !e) return [{ x: to.x, z: to.z }];

  const N = NX * NZ;
  const gScore = new Float32Array(N).fill(Infinity);
  const fScore = new Float32Array(N).fill(Infinity);
  const came = new Int32Array(N).fill(-1);
  const closed = new Uint8Array(N);
  const start = s[1] * NX + s[0];
  const goal = e[1] * NX + e[0];
  const h = (n: number) => Math.hypot((n % NX) - e[0], Math.floor(n / NX) - e[1]);
  gScore[start] = 0;
  fScore[start] = h(start);
  const open = new Heap(fScore);
  open.push(start);

  while (open.size) {
    const cur = open.pop();
    if (cur === goal) break;
    if (closed[cur]) continue;
    closed[cur] = 1;
    const ci = cur % NX;
    const cj = Math.floor(cur / NX);
    for (let dj = -1; dj <= 1; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ni = ci + di;
        const nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ) continue;
        const n = nj * NX + ni;
        if (!g[n] || closed[n]) continue;
        // No corner-cutting past a blocked cell.
        if (di && dj && (!g[cj * NX + ni] || !g[nj * NX + ci])) continue;
        const tentative = gScore[cur] + (di && dj ? Math.SQRT2 : 1);
        if (tentative < gScore[n]) {
          gScore[n] = tentative;
          fScore[n] = tentative + h(n);
          came[n] = cur;
          open.push(n);
        }
      }
    }
  }
  if (came[goal] === -1 && goal !== start) return [{ x: to.x, z: to.z }];

  const cells: { x: number; z: number }[] = [];
  for (let n = goal; n !== -1; n = came[n]) cells.push(centreOf(n % NX, Math.floor(n / NX)));
  cells.reverse();
  cells[cells.length - 1] = { x: to.x, z: to.z };

  // String-pull: keep only the corners the straight line can't skip.
  const out: { x: number; z: number }[] = [];
  let anchor = { x: from.x, z: from.z };
  let i = 0;
  while (i < cells.length - 1) {
    let j = cells.length - 1;
    while (j > i + 1 && !lineOfSight(anchor, cells[j])) j--;
    out.push(cells[j]);
    anchor = cells[j];
    i = j;
  }
  if (!out.length || out[out.length - 1] !== cells[cells.length - 1]) out.push(cells[cells.length - 1]);
  return out;
}
