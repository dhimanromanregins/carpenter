/**
 * Camera systems:
 *  - CameraRig: orbit / pan / zoom with animated views, presets and focus.
 *  - FirstPersonController: pointer-lock walk-through with eye height, smoothed
 *    movement, collision against cabinets / counters / walls and look-at interaction.
 *  - PresentationController: cinematic tour through predefined viewpoints.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraControls, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import type CameraControlsImpl from "camera-controls";
import type { KitchenDesignConfig } from "../model/types";
import { getModuleType } from "../data/modules";
import { buildCounterSlabs } from "../engine/countertop";
import { footprint } from "../engine/geometry";
import { mm } from "../model/units";
import { useInteraction, useSelection } from "../store/interactionStore";
import { useUi } from "../store/uiStore";
import { focusPose, poseFor, presentationSteps, type Pose } from "./cameraPoses";

/* ───────────────────────── orbit rig ───────────────────────── */

export function CameraRig({ design }: { design: KitchenDesignConfig }) {
  const ref = useRef<CameraControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const cmd = useUi((s) => s.cameraCommand);
  const ortho = useUi((s) => s.ortho);
  const designRef = useRef(design);
  designRef.current = design;

  // dev-only: lets automated checks project 3D points to screen pixels
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __kitchenCam?: unknown; __project?: (x: number, y: number, z: number) => [number, number] };
    w.__kitchenCam = camera;
    w.__project = (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(camera);
      return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height];
    };
  }, [camera, size]);

  const go = (pose: Pose, animate = true) => {
    const c = ref.current;
    if (!c) return;
    void c.setLookAt(pose.pos[0], pose.pos[1], pose.pos[2], pose.target[0], pose.target[1], pose.target[2], animate);
    if ((camera as THREE.OrthographicCamera).isOrthographicCamera) {
      const d = designRef.current.room;
      const extent = Math.max(mm(d.width), mm(d.depth), mm(d.height)) * 1.25;
      void c.zoomTo(size.height / extent, animate);
    }
  };

  // initial pose
  useEffect(() => {
    go(poseFor("perspective", designRef.current, ortho), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ortho]);

  useEffect(() => {
    if (!cmd) return;
    const d = designRef.current;
    if (cmd.kind === "focus" && cmd.moduleId) {
      const m = d.modules.find((x) => x.id === cmd.moduleId);
      if (m) go(focusPose(d, m, 1.6));
      return;
    }
    if (cmd.name === "interior") {
      const m = d.modules.find((x) => ["base-drawers", "base-cutlery"].includes(getModuleType(x.typeId).kind));
      if (m) useInteraction.getState().setOpen(`${m.id}:drawer0`, true);
    }
    go(poseFor(cmd.name, d, ortho));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmd?.nonce]);

  return <CameraControls ref={ref} makeDefault minDistance={0.8} maxDistance={20} maxPolarAngle={Math.PI - 0.05} dollySpeed={0.7} smoothTime={0.28} />;
}

/* ───────────────────────── first person ───────────────────────── */

const RADIUS = 0.24;

interface Blocker {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export function FirstPersonController({ design }: { design: KitchenDesignConfig }) {
  const { camera, scene } = useThree();
  const eyeMm = useUi((s) => s.eyeHeight);
  const locked = useUi((s) => s.walkLocked);
  const setLocked = useUi((s) => s.setWalkLocked);
  const keys = useRef<Record<string, boolean>>({});
  const vel = useRef(new THREE.Vector3());
  const lockRef = useRef<{ lock: () => void; unlock: () => void } | null>(null);
  const frame = useRef(0);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const room = design.room;
  const W = mm(room.width);
  const D = mm(room.depth);

  const blockers = useMemo<Blocker[]>(() => {
    const out: Blocker[] = [];
    design.modules.forEach((m) => {
      if (m.elevation > 900) return;
      const f = footprint(m);
      out.push({ x0: mm(f.x0), x1: mm(f.x1), z0: mm(f.z0), z1: mm(f.z1) });
    });
    buildCounterSlabs(design).forEach((s) => out.push({ x0: mm(s.x0), x1: mm(s.x1), z0: mm(s.z0), z1: mm(s.z1) }));
    return out;
  }, [design]);

  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __kitchenCam?: unknown }).__kitchenCam = camera;
  }, [camera]);

  // start position: just inside the door, facing the kitchen
  useEffect(() => {
    const door = room.door;
    let x = W / 2;
    let z = D - 0.5;
    if (door.enabled) {
      const n = 0.42;
      if (door.wall === "front") [x, z] = [mm(door.offset), D - n];
      else if (door.wall === "back") [x, z] = [mm(door.offset), n];
      else if (door.wall === "left") [x, z] = [n, mm(door.offset)];
      else [x, z] = [W - n, mm(door.offset)];
    }
    if (blockers.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS)) [x, z] = [W / 2, D - 0.7];
    camera.position.set(x, eyeMm / 1000, z);
    camera.lookAt(W / 2, eyeMm / 1000 - 0.15, D / 2);
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      (camera as THREE.PerspectiveCamera).fov = 72;
      (camera as THREE.PerspectiveCamera).near = 0.05;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
    return () => {
      if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
        (camera as THREE.PerspectiveCamera).fov = 38;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "Escape") useInteraction.getState().closeAll();
      if (e.code === "KeyE") {
        const h = useInteraction.getState().hover;
        if (h && !h.key.startsWith("surface:")) useInteraction.getState().toggle(h.key);
      }
      if (e.code === "KeyO") {
        const it = useInteraction.getState();
        if (Object.values(it.open).some(Boolean)) it.closeAll();
        else it.openAll();
      }
    };
    const up = (e: KeyboardEvent) => (keys.current[e.code] = false);
    const click = () => {
      if (!useUi.getState().walkLocked) return;
      const h = useInteraction.getState().hover;
      if (!h) return;
      if (h.key.startsWith("surface:")) {
        // surfaces open their settings instead — release the mouse so the panel can be used
        useSelection.getState().selectSurface(h.key.slice(8) as "counter" | "backsplash" | "floor" | "wall");
        document.exitPointerLock();
      } else {
        useInteraction.getState().toggle(h.key);
        useSelection.getState().select(h.moduleId);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mousedown", click);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousedown", click);
      useInteraction.getState().setHover(null);
    };
  }, []);

  const blocked = (x: number, z: number) => blockers.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    camera.position.y += (eyeMm / 1000 - camera.position.y) * Math.min(1, dt * 8);

    if (locked) {
      const k = keys.current;
      const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
      const strafe = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
      const speed = k.ShiftLeft || k.ShiftRight ? 3.0 : 1.5;

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
      const want = dir.multiplyScalar(fwd * speed).add(right.multiplyScalar(strafe * speed));
      // acceleration + damping gives a human, slightly weighty feel
      vel.current.lerp(want, Math.min(1, dt * 9));

      const p = camera.position;
      const nx = p.x + vel.current.x * dt;
      const nz = p.z + vel.current.z * dt;
      const inside = (x: number, z: number) => x > RADIUS && x < W - RADIUS && z > RADIUS && z < D - RADIUS;
      if (inside(nx, p.z) && !blocked(nx, p.z)) p.x = nx;
      else vel.current.x = 0;
      if (inside(p.x, nz) && !blocked(p.x, nz)) p.z = nz;
      else vel.current.z = 0;
    }

    // look-at interaction, throttled
    if (locked && ++frame.current % 3 === 0) {
      ray.setFromCamera(new THREE.Vector2(0, 0), camera);
      ray.far = 2.4;
      const hits = ray.intersectObjects(scene.children, true);
      let found: { key: string; moduleId: string; label: string } | null = null;
      for (const h of hits) {
        let o: THREE.Object3D | null = h.object;
        while (o) {
          if (o.userData?.interactKey) {
            found = { key: o.userData.interactKey as string, moduleId: o.userData.moduleId as string, label: o.userData.label as string };
            break;
          }
          o = o.parent;
        }
        // the first solid surface hit decides — never interact through walls or cabinets
        if (found) break;
        const mat = (h.object as THREE.Mesh).material as THREE.Material | undefined;
        if (!mat?.transparent) break;
      }
      useInteraction.getState().setHover(found);
    }
  });

  return (
    <PointerLockControls
      ref={(c) => {
        lockRef.current = c as unknown as { lock: () => void; unlock: () => void };
        (window as unknown as { __kitchenLock?: () => void }).__kitchenLock = () => lockRef.current?.lock();
      }}
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  );
}

/* ───────────────────────── presentation ───────────────────────── */

const ease = (t: number) => t * t * (3 - 2 * t);

export function PresentationController({ design }: { design: KitchenDesignConfig }) {
  const { camera } = useThree();
  const steps = useMemo(() => presentationSteps(design), [design]);
  const state = useRef({ i: 0, t: 0, phase: "move" as "move" | "hold", hold: 0 });
  const from = useRef<Pose>({ pos: [0, 0, 0], target: [0, 0, 0] });
  const lookAt = useRef(new THREE.Vector3());
  const setStep = useUi((s) => s.setPresentStep);

  useEffect(() => {
    const first = steps[0];
    from.current = { pos: camera.position.toArray() as [number, number, number], target: first.pose.target };
    lookAt.current.set(...first.pose.target);
    useInteraction.getState().closeAll();
    state.current = { i: 0, t: 0, phase: "move", hold: 0 };
    setStep(0);
    return () => useInteraction.getState().closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  useFrame((_, dt) => {
    const s = state.current;
    const step = steps[s.i];
    if (!step) return;
    if (s.phase === "move") {
      s.t = Math.min(1, s.t + dt / 2.6);
      const e = ease(s.t);
      camera.position.set(
        from.current.pos[0] + (step.pose.pos[0] - from.current.pos[0]) * e,
        from.current.pos[1] + (step.pose.pos[1] - from.current.pos[1]) * e,
        from.current.pos[2] + (step.pose.pos[2] - from.current.pos[2]) * e
      );
      lookAt.current.set(
        from.current.target[0] + (step.pose.target[0] - from.current.target[0]) * e,
        from.current.target[1] + (step.pose.target[1] - from.current.target[1]) * e,
        from.current.target[2] + (step.pose.target[2] - from.current.target[2]) * e
      );
      camera.lookAt(lookAt.current);
      if (s.t >= 1) {
        s.phase = "hold";
        s.hold = 0;
        step.open?.forEach((k) => useInteraction.getState().setOpen(k, true));
      }
    } else {
      s.hold += dt;
      if (s.hold > 4.2) {
        step.open?.forEach((k) => useInteraction.getState().setOpen(k, false));
        from.current = { pos: step.pose.pos, target: step.pose.target };
        s.i = (s.i + 1) % steps.length;
        s.t = 0;
        s.phase = "move";
        setStep(s.i);
      }
    }
  });
  return null;
}
