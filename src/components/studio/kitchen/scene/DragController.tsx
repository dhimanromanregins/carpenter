/**
 * DragController: grab-and-drop for everything in the 3D view.
 *
 *  - cabinets / appliances: pointer-down on any part (see ModuleView), drag across the
 *    floor (or the wall for wall units), it docks to walls and neighbours, R turns it,
 *    Esc cancels, release commits ONE undoable move.
 *  - counter-top items: drag onto another cabinet's worktop.
 *  - sockets / switches: drag along the walls.
 *  - library cards dragged over the viewport (HTML5 drag) are placed the same way.
 *
 * The design store is only touched on release, so a drag never fills the undo history.
 */
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useKitchenStore } from "../store/kitchenStore";
import { useDrag } from "../store/dragStore";
import { useSelection } from "../store/interactionStore";
import { useUi } from "../store/uiStore";
import { dockModule } from "../engine/snapping";
import { canPlace } from "../engine/validation";
import { footprint } from "../engine/geometry";
import { getModuleType } from "../data/modules";
import { makeModule } from "../engine/layouts";
import { registerPicker } from "./pick";
import type { Rotation, WallSide } from "../model/types";

const THRESHOLD = 6; // px before a press becomes a drag
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();

export function DragController() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null;
  const raycaster = useThree((s) => s.raycaster);

  useEffect(() => {
    const el = gl.domElement;
    let freeRot: Rotation | null = null;
    let swallowClick = false;

    const ndc = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      return new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    };
    const onPlane = (cx: number, cy: number, y: number): [number, number] | null => {
      raycaster.setFromCamera(ndc(cx, cy), camera);
      plane.constant = -y;
      return raycaster.ray.intersectPlane(plane, hit) ? [hit.x * 1000, hit.z * 1000] : null;
    };
    registerPicker(onPlane);

    /** First wall the pointer ray runs into from inside the room. */
    const onWall = (cx: number, cy: number): { wall: WallSide; offset: number; height: number } | null => {
      const { room } = useKitchenStore.getState().design;
      const W = room.width / 1000;
      const D = room.depth / 1000;
      const H = room.height / 1000;
      raycaster.setFromCamera(ndc(cx, cy), camera);
      const { origin: o, direction: d } = raycaster.ray;
      let best: { t: number; wall: WallSide; offset: number; height: number } | null = null;
      const test = (wall: WallSide, t: number, facing: number) => {
        if (!(t > 0) || facing >= 0) return;
        const x = o.x + d.x * t;
        const y = o.y + d.y * t;
        const z = o.z + d.z * t;
        if (y < 0.05 || y > H || x < 0 || x > W || z < 0 || z > D) return;
        if (!best || t < best.t) best = { t, wall, offset: (wall === "back" || wall === "front" ? x : z) * 1000, height: y * 1000 };
      };
      test("back", -o.z / d.z, d.z); // inside normal +z
      test("front", (D - o.z) / d.z, -d.z); // inside normal -z
      test("left", -o.x / d.x, d.x);
      test("right", (W - o.x) / d.x, -d.x);
      const b = best as { wall: WallSide; offset: number; height: number } | null;
      return b ? { wall: b.wall, offset: Math.round(b.offset / 5) * 5, height: Math.round(b.height / 10) * 10 } : null;
    };

    const compute = (cx: number, cy: number) => {
      const st = useDrag.getState();
      const a = st.active;
      if (!a) return;
      const store = useKitchenStore.getState();
      const design = store.design;

      if (a.kind === "electrical") {
        const w = onWall(cx, cy);
        if (w) st.setElectricalPreview(w);
        return;
      }
      const p = onPlane(cx, cy, a.grab.planeY);
      if (!p) return;
      if (a.kind === "item") {
        const [px, pz] = [p[0] + a.grab.ox, p[1] + a.grab.oz];
        const target = design.modules.find((m) => {
          const z = getModuleType(m.typeId).zone;
          if ((z !== "base" && z !== "island") || m.id === a.id) return false;
          const f = footprint(m);
          return px >= f.x0 && px <= f.x1 && pz >= f.z0 && pz <= f.z1;
        });
        st.setItemTarget(target ? target.id : null);
        return;
      }
      const m = design.modules.find((v) => v.id === a.id);
      if (!m) return;
      const others = design.modules.filter((o) => o.id !== m.id);
      const placed = dockModule(m, p[0] + a.grab.ox, p[1] + a.grab.oz, design.room, others, freeRot ?? m.rot);
      const next = { ...m, x: placed.x, z: placed.z, rot: placed.rot };
      st.setPreview({ x: placed.x, z: placed.z, rot: placed.rot, valid: canPlace(next, design.modules, design.room).ok });
    };

    const finish = (commit: boolean, cx = 0, cy = 0) => {
      const st = useDrag.getState();
      const a = st.active;
      if (a && commit) {
        const store = useKitchenStore.getState();
        if (a.kind === "module" && st.preview) {
          const m = store.design.modules.find((v) => v.id === a.id);
          const pv = st.preview;
          if (m && (pv.x !== m.x || pv.z !== m.z || pv.rot !== m.rot)) {
            if (pv.valid) store.placeModule(a.id, pv.x, pv.z, pv.rot);
            else useKitchenStore.setState({ notice: "That spot is taken — the cabinet went back." });
          }
        } else if (a.kind === "item") {
          if (st.itemTarget && st.itemTarget !== a.id) store.moveTopItem(a.id, a.itemId, st.itemTarget);
        } else if (a.kind === "electrical" && st.electricalPreview) {
          store.updateElectrical(a.id, st.electricalPreview);
        }
      }
      if (a) {
        swallowClick = true;
        setTimeout(() => (swallowClick = false), 0);
      }
      void cx;
      void cy;
      freeRot = null;
      st.end();
      document.body.style.cursor = "";
      if (controls) controls.enabled = true;
    };

    const onMove = (e: PointerEvent) => {
      const st = useDrag.getState();
      if (st.pending) {
        if (Math.hypot(e.clientX - st.pending.startX, e.clientY - st.pending.startY) < THRESHOLD) return;
        st.begin();
        if (useDrag.getState().active) document.body.style.cursor = "grabbing";
      }
      if (useDrag.getState().active) compute(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      const st = useDrag.getState();
      if (st.active) finish(true, e.clientX, e.clientY);
      else if (st.pending) {
        st.disarm();
        if (controls) controls.enabled = true;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const st = useDrag.getState();
      if (!st.active) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        finish(false);
      } else if (e.key === "r" || e.key === "R") {
        const m = useKitchenStore.getState().design.modules.find((v) => v.id === st.active?.id);
        if (m) {
          freeRot = (((freeRot ?? st.preview?.rot ?? m.rot) + 90) % 360) as Rotation;
          if (st.active && "grab" in st.active) compute(lastX, lastY);
        }
      }
    };
    let lastX = 0;
    let lastY = 0;
    const track = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };
    // a drag must not also "click" the thing that was dropped (that would toggle its door)
    const onClickCapture = (e: MouseEvent) => {
      if (swallowClick) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    /* library cards dragged over the viewport */
    const dropInfo = (e: DragEvent) => {
      const typeId = e.dataTransfer?.getData("application/x-kitchen-module") || "";
      return typeId;
    };
    const overDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("application/x-kitchen-module")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      const typeId = useDrag.getState().drop?.typeId ?? libraryType;
      if (!typeId) return;
      const design = useKitchenStore.getState().design;
      const probe = makeModule(typeId, {}, design.style);
      const y = getModuleType(typeId).zone === "wall" ? (probe.elevation + probe.height / 2) / 1000 : 0.4;
      const p = onPlane(e.clientX, e.clientY, y);
      if (!p) return;
      const placed = dockModule(probe, p[0], p[1], design.room, design.modules);
      useDrag.getState().setDrop({ typeId, x: placed.x, z: placed.z, rot: placed.rot, valid: canPlace({ ...probe, ...placed }, design.modules, design.room).ok });
    };
    const leaveDrop = (e: DragEvent) => {
      if (e.relatedTarget === null || !el.contains(e.relatedTarget as Node)) useDrag.getState().setDrop(null);
    };
    const doDrop = (e: DragEvent) => {
      const typeId = dropInfo(e);
      const d = useDrag.getState().drop;
      useDrag.getState().setDrop(null);
      if (!typeId || !d) return;
      e.preventDefault();
      const id = useKitchenStore.getState().addModule(typeId, { x: d.x, z: d.z, rot: d.rot });
      if (id) useSelection.getState().select(id);
    };
    // browsers hide drag data while dragging, so remember which card started it
    let libraryType = "";
    const dragStart = (e: DragEvent) => {
      libraryType = (e.target as HTMLElement | null)?.closest?.("[data-module-type]")?.getAttribute("data-module-type") ?? "";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointermove", track, true);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("click", onClickCapture, true);
    window.addEventListener("dragstart", dragStart, true);
    el.addEventListener("dragover", overDrop);
    el.addEventListener("dragleave", leaveDrop);
    el.addEventListener("drop", doDrop);
    return () => {
      registerPicker(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", track, true);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("dragstart", dragStart, true);
      el.removeEventListener("dragover", overDrop);
      el.removeEventListener("dragleave", leaveDrop);
      el.removeEventListener("drop", doDrop);
      if (controls) controls.enabled = true;
    };
  }, [gl, camera, controls, raycaster]);

  // the camera must not orbit while something is being held
  const pending = useDrag((s) => s.pending);
  const active = useDrag((s) => s.active);
  useEffect(() => {
    if (controls) controls.enabled = !(pending || active) || useUi.getState().mode !== "design";
  }, [pending, active, controls]);

  return null;
}
