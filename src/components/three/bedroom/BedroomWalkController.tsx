import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  COLLIDERS,
  DOOR_CLOSED_COLLIDER,
  DOOR_OPEN_COLLIDER,
  EYE_HEIGHT,
  MAIN_DOOR_CLOSED_COLLIDER,
  MAIN_DOOR_OPEN_COLLIDER,
  PLAYER_RADIUS,
  SLIDER_CLOSED_COLLIDER,
  SPAWN,
  WALLS,
  WORLD,
  floorHeightAt,
  spaceAt,
  type Box2,
} from "./bedroomLayout";
import { openingState, walkInput } from "./bedroomState";
import { findPath } from "./pathfinding";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

/** Shortest signed angle from a to b. */
function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(b - a), Math.cos(b - a));
}

const WALK_SPEED = 1.5; // m/s — an unhurried indoor stroll
const RUN_SPEED = 2.6;
const LOOK_SPEED = 0.0042;

const STATIC_BOXES: Box2[] = [...WALLS, ...COLLIDERS];
const TOUR_SPEED = 1.7;

/** Colliders for the doors and sliding panel in their current state. */
function openingBoxes(): Box2[] {
  const out: Box2[] = [];
  // A half-open door blocks the doorway; a mostly open one blocks where it swung to.
  out.push(openingState.door > 0.7 ? DOOR_OPEN_COLLIDER : DOOR_CLOSED_COLLIDER);
  out.push(openingState.mainDoor > 0.7 ? MAIN_DOOR_OPEN_COLLIDER : MAIN_DOOR_CLOSED_COLLIDER);
  if (openingState.slider < 0.75) out.push(SLIDER_CLOSED_COLLIDER);
  return out;
}

/** Which opening joins two adjacent spaces (see spaceAt). */
function openingBetween(a: number, b: number): "door" | "slider" | "mainDoor" | null {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  if (lo === 0 && hi === 1) return "door";
  if (lo === 1 && hi === 2) return "slider";
  if (lo === 1 && hi === 3) return "mainDoor";
  return null;
}

function isOpenEnough(o: ReturnType<typeof openingBetween>) {
  if (o === "door") return openingState.door >= 0.75;
  if (o === "slider") return openingState.slider >= 0.8;
  if (o === "mainDoor") return openingState.mainDoor >= 0.75;
  return true;
}

/** Pushes a circle at `p` out of every wall and furniture footprint. */
function resolveCollisions(p: THREE.Vector3) {
  const r = PLAYER_RADIUS;
  const boxes = [...STATIC_BOXES, ...openingBoxes()];
  for (let pass = 0; pass < 3; pass++) {
    for (const b of boxes) {
      const cx = clamp(p.x, b.x0, b.x1);
      const cz = clamp(p.z, b.z0, b.z1);
      const dx = p.x - cx;
      const dz = p.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-10) {
        const d = Math.sqrt(d2);
        p.x = cx + (dx / d) * r;
        p.z = cz + (dz / d) * r;
      } else {
        // Centre is inside the box: leave along the shallowest side.
        const exits = [p.x - b.x0, b.x1 - p.x, p.z - b.z0, b.z1 - p.z];
        const min = Math.min(...exits);
        if (min === exits[0]) p.x = b.x0 - r;
        else if (min === exits[1]) p.x = b.x1 + r;
        else if (min === exits[2]) p.z = b.z0 - r;
        else p.z = b.z1 + r;
      }
    }
    p.x = clamp(p.x, WORLD.x0 + r, WORLD.x1 - r);
    p.z = clamp(p.z, WORLD.z0 + r, WORLD.z1 - r);
  }
}

/**
 * First-person walk: drag (mouse or touch) to look, WASD/arrows or the
 * on-screen joystick to walk, Shift to walk faster. Movement eases in and
 * out, there's a subtle head-bob, and the walker slides along furniture
 * instead of passing through it. Tour buttons glide the camera to a
 * viewpoint along a walkable route — around furniture and through the
 * doorways, opening them on the way; any manual input takes control back.
 */
export function BedroomWalkController() {
  const { camera, gl, size } = useThree();
  const yaw = useRef(SPAWN.yaw);
  const pitch = useRef(SPAWN.pitch);
  const keys = useRef<Record<string, boolean>>({});
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const bob = useRef(0);
  const next = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const floorY = useRef(floorHeightAt(SPAWN.x, SPAWN.z));

  useEffect(() => {
    floorY.current = floorHeightAt(SPAWN.x, SPAWN.z);
    camera.position.set(SPAWN.x, floorY.current + EYE_HEIGHT, SPAWN.z);
    yaw.current = SPAWN.yaw;
    pitch.current = SPAWN.pitch;
    camera.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"));
  }, [camera]);

  // Portrait phones get a wider vertical FOV so the room doesn't feel like
  // it's seen through a letterbox slot.
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = size.width / size.height < 1 ? 78 : 62;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";

    const onPointerDown = (e: PointerEvent) => {
      if (drag.current) return; // first finger looks; ignore extra touches
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      walkInput.tour = null;
    };
    const onPointerMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const sensitivity = e.pointerType === "touch" ? LOOK_SPEED * 1.25 : LOOK_SPEED;
      yaw.current -= (e.clientX - d.x) * sensitivity;
      pitch.current = clamp(pitch.current - (e.clientY - d.y) * sensitivity, -1.25, 1.25);
      d.x = e.clientX;
      d.y = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (drag.current?.id === e.pointerId) drag.current = null;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      keys.current[k] = true;
      if (k.startsWith("arrow")) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    const onBlur = () => {
      keys.current = {};
      drag.current = null;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [gl]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const k = keys.current;
    const fwd =
      (k["w"] || k["arrowup"] ? 1 : 0) - (k["s"] || k["arrowdown"] ? 1 : 0) + walkInput.joyY;
    const side =
      (k["d"] || k["arrowright"] ? 1 : 0) - (k["a"] || k["arrowleft"] ? 1 : 0) + walkInput.joyX;
    const moving = Math.abs(fwd) > 0.01 || Math.abs(side) > 0.01;
    if (moving) walkInput.tour = null;

    const pos = camera.position;
    const tour = walkInput.tour;
    if (tour) {
      if (!tour.path) {
        tour.path = findPath({ x: pos.x, z: pos.z }, tour);
        // Open whatever the route passes through.
        let prev = spaceAt(pos.x, pos.z);
        for (const n of tour.path) {
          const sp = spaceAt(n.x, n.z);
          const o = sp !== prev ? openingBetween(sp, prev) : null;
          if (o === "door") walkInput.openings?.setDoorOpen(true);
          if (o === "slider") walkInput.openings?.setSliderOpen(true);
          if (o === "mainDoor") walkInput.openings?.setMainDoorOpen(true);
          prev = sp;
        }
      }
      const node = tour.path[0];
      const last = tour.path.length === 1;
      const dx = node.x - pos.x;
      const dz = node.z - pos.z;
      const dist = Math.hypot(dx, dz);
      const px = pos.x;
      const pz = pos.z;
      // Wait at a threshold until its door has swung clear.
      const from = spaceAt(pos.x, pos.z);
      const to = spaceAt(node.x, node.z);
      const blocked = from !== to && !isOpenEnough(openingBetween(from, to));
      if (last) {
        const s = 1 - Math.exp(-dt * 2.6);
        if (!blocked) {
          const step = Math.min(dist, TOUR_SPEED * dt, dist * s * 2.2 + 0.002);
          if (dist > 1e-4) {
            pos.x += (dx / dist) * step;
            pos.z += (dz / dist) * step;
          }
        }
        yaw.current += angleDelta(yaw.current, tour.yaw) * s;
        pitch.current += (tour.pitch - pitch.current) * s;
        if (dist < 0.01 && Math.abs(angleDelta(yaw.current, tour.yaw)) < 0.003) walkInput.tour = null;
      } else {
        // Walk the leg at a steady pace, looking where we're going.
        if (!blocked) {
          const step = Math.min(dist, TOUR_SPEED * dt);
          if (dist > 1e-4) {
            pos.x += (dx / dist) * step;
            pos.z += (dz / dist) * step;
          }
        }
        const turn = 1 - Math.exp(-dt * 4);
        if (dist > 0.05) yaw.current += angleDelta(yaw.current, Math.atan2(-dx, -dz)) * turn;
        pitch.current += (-0.08 - pitch.current) * turn;
        if (dist < 0.04) tour.path.shift();
      }
      if (dt > 0) velocity.current.set((pos.x - px) / dt, 0, (pos.z - pz) / dt);
    } else {
      const speed = k["shift"] ? RUN_SPEED : WALK_SPEED;
      const sinY = Math.sin(yaw.current);
      const cosY = Math.cos(yaw.current);
      // forward = (-sin, -cos), right = (cos, -sin) on the xz plane
      let vx = -sinY * fwd + cosY * side;
      let vz = -cosY * fwd - sinY * side;
      const len = Math.hypot(vx, vz);
      if (len > 1) {
        vx /= len;
        vz /= len;
      }
      const accel = 1 - Math.exp(-dt * (moving ? 9 : 12));
      velocity.current.x += (vx * speed - velocity.current.x) * accel;
      velocity.current.z += (vz * speed - velocity.current.z) * accel;

      next.current.set(pos.x + velocity.current.x * dt, 0, pos.z + velocity.current.z * dt);
      resolveCollisions(next.current);
      // Recompute velocity from the resolved step so we slide, not stick.
      if (dt > 0) {
        velocity.current.x = (next.current.x - pos.x) / dt;
        velocity.current.z = (next.current.z - pos.z) / dt;
      }
      pos.x = next.current.x;
      pos.z = next.current.z;
    }

    const planar = Math.hypot(velocity.current.x, velocity.current.z);
    bob.current += dt * planar * 5.2;
    const bobAmt = Math.min(1, planar / WALK_SPEED);
    // Ease the eye height onto the floor below, so the steps feel climbed.
    floorY.current += (floorHeightAt(pos.x, pos.z) - floorY.current) * (1 - Math.exp(-dt * 10));
    pos.y = floorY.current + EYE_HEIGHT + Math.sin(bob.current * 2) * 0.012 * bobAmt;
    euler.current.set(pitch.current, yaw.current, Math.sin(bob.current) * 0.0025 * bobAmt);
    camera.quaternion.setFromEuler(euler.current);
  });

  return null;
}
