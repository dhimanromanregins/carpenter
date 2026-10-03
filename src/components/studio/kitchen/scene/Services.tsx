/**
 * Electrical plates (always visible, like the real thing) and the wiring /
 * plumbing / gas views: faded cabinets with colour-coded conduit and pipes and
 * animated flow that runs from the source to each point.
 */
import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import type { ElectricalPoint, KitchenDesignConfig } from "../model/types";
import { getModuleType } from "../data/modules";
import { buildCounterSlabs } from "../engine/countertop";
import { planRoutes, wallNormal, wallXZ, type Route, type Vec3 } from "../engine/services";
import { mm, rotToRad } from "../model/units";
import { useUi } from "../store/uiStore";
import { useDrag } from "../store/dragStore";
import { Box, Cyl } from "./common";
import { getUtilMaterial } from "./materials";

/* ───────────────────────── plates ───────────────────────── */

const PLATE = new THREE.MeshStandardMaterial({ color: "#f4f2ec", roughness: 0.45 });
const PLATE_HEAVY = new THREE.MeshStandardMaterial({ color: "#f0d9c0", roughness: 0.45 });
const PLATE_DB = new THREE.MeshStandardMaterial({ color: "#aab2ba", roughness: 0.4, metalness: 0.5 });

function Tag({ position, children }: { position: Vec3; children: string }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ background: "rgba(8,12,20,0.9)", color: "#f4ecd6", border: "1px solid rgba(226,205,154,0.7)", borderRadius: 4, padding: "1px 6px", font: "600 10px/1.35 Inter, system-ui, sans-serif", whiteSpace: "nowrap" }}>{children}</div>
    </Html>
  );
}

function PlateMesh({ p, selected }: { p: ElectricalPoint; selected: boolean }) {
  const dark = getUtilMaterial("dark");
  const steel = getUtilMaterial("steel");
  const mat = p.kind === "appliance" && (p.amps ?? 0) >= 16 ? PLATE_HEAVY : PLATE;

  if (p.kind === "db")
    return (
      <group>
        <Box size={[0.3, 0.4, 0.07]} position={[0, 0, 0.035]} material={PLATE_DB} />
        <Box size={[0.26, 0.34, 0.006]} position={[0, 0, 0.073]} material={getUtilMaterial("white")} cast={false} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box key={i} size={[0.03, 0.05, 0.01]} position={[-0.1 + i * 0.04, 0.08, 0.08]} material={dark} cast={false} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box key={i} size={[0.03, 0.05, 0.01]} position={[-0.1 + i * 0.04, -0.02, 0.08]} material={dark} cast={false} />
        ))}
        {selected && <Box size={[0.32, 0.42, 0.075]} position={[0, 0, 0.037]} material={getUtilMaterial("steel")} cast={false} />}
      </group>
    );

  if (p.kind === "switchboard") {
    const n = p.switches ?? 4;
    const cols = Math.max(2, Math.ceil(n / 2));
    const rows = n > 3 ? 2 : 1;
    const w = cols * 0.04 + 0.03;
    const h = rows * 0.055 + 0.03;
    return (
      <group>
        <Box size={[w, h, 0.012]} position={[0, 0, 0.006]} material={mat} />
        {Array.from({ length: n }).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          return (
            <group key={i} position={[-w / 2 + 0.035 + c * 0.04, h / 2 - 0.0425 - r * 0.055, 0.013]}>
              <Box size={[0.026, 0.04, 0.006]} position={[0, 0, 0]} material={getUtilMaterial("white")} cast={false} />
              <Box size={[0.026, 0.0015, 0.007]} position={[0, 0, 0.0005]} material={steel} cast={false} />
            </group>
          );
        })}
        {selected && <Box size={[w + 0.02, h + 0.02, 0.008]} position={[0, 0, 0.004]} material={steel} cast={false} />}
      </group>
    );
  }

  if (p.kind === "popup")
    return (
      <group>
        <Cyl r={0.035} h={0.012} position={[0, 0.006, 0]} material={steel} segments={20} />
        <Cyl r={0.026} h={0.004} position={[0, 0.013, 0]} material={dark} segments={16} cast={false} />
      </group>
    );

  // socket / appliance point
  return (
    <group>
      <Box size={[0.086, 0.086, 0.012]} position={[0, 0, 0.006]} material={mat} />
      {[-0.015, 0.015].map((x) => (
        <Box key={x} size={[0.005, 0.016, 0.004]} position={[x, 0.008, 0.013]} material={dark} cast={false} />
      ))}
      <Box size={[0.005, 0.012, 0.004]} position={[0, -0.016, 0.013]} material={dark} cast={false} />
      {p.kind === "appliance" && <Box size={[0.014, 0.006, 0.004]} position={[0.028, 0.03, 0.013]} material={getUtilMaterial("steel")} cast={false} />}
      {selected && <Box size={[0.1, 0.1, 0.008]} position={[0, 0, 0.004]} material={steel} cast={false} />}
    </group>
  );
}

function PlatesImpl({ design, labels }: { design: KitchenDesignConfig; labels: boolean }) {
  const selected = useUi((s) => s.selectedElectrical);
  const setSel = useUi.getState().setSelectedElectrical;
  const { room } = design;
  const drag = useDrag((s) => (s.active?.kind === "electrical" ? s.active.id : null));
  const dragPreview = useDrag((s) => s.electricalPreview);
  return (
    <group>
      {design.electrical.map((p0) => {
        const p = drag === p0.id && dragPreview ? { ...p0, ...dragPreview } : p0;
        let position: Vec3;
        let rotY = 0;
        if (p.wall === "free") {
          position = [mm(p.x ?? room.width / 2), mm(p.height), mm(p.z ?? room.depth / 2)];
        } else {
          const [x, z] = wallXZ(room, p.wall, p.offset);
          const [nx, nz] = wallNormal(p.wall);
          position = [mm(x) + nx * 0.002, mm(p.height), mm(z) + nz * 0.002];
          rotY = p.wall === "back" ? 0 : p.wall === "front" ? Math.PI : p.wall === "left" ? Math.PI / 2 : -Math.PI / 2;
        }
        return (
          <group
            key={p.id}
            position={position}
            onPointerDown={(e) => {
              if (useUi.getState().mode !== "design" || e.nativeEvent.button !== 0 || p.wall === "free") return;
              e.stopPropagation();
              useDrag.getState().arm({ kind: "electrical", id: p.id }, e.nativeEvent.clientX, e.nativeEvent.clientY, { planeY: 0, ox: 0, oz: 0 });
            }}
            rotation={p.wall === "free" ? [0, 0, 0] : [0, rotY, 0]}
            onClick={(e) => {
              if (useUi.getState().mode !== "design") return;
              e.stopPropagation();
              setSel(p.id);
              useUi.getState().setLeftTab("services");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <PlateMesh p={p} selected={selected === p.id} />
            {labels && <Tag position={[0, 0.12, 0.05]}>{p.kind === "socket" ? `${p.label} · ${p.amps ?? 16}A` : p.kind === "appliance" ? `${p.label} · ${p.amps ?? 16}A` : p.kind === "switchboard" ? `${p.label} · ${p.switches ?? 4} switches` : p.label}</Tag>}
          </group>
        );
      })}
    </group>
  );
}

export const ElectricalPlates = memo(PlatesImpl, (a, b) => a.design.electrical === b.design.electrical && a.design.room === b.design.room && a.labels === b.labels);

/* ───────────────────────── routes ───────────────────────── */

function FlowLine({ r }: { r: Route }) {
  const ref = useRef<{ material: { dashOffset: number } } | null>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.material.dashOffset -= dt * 0.35;
  });
  return (
    <>
      {/* solid faint pipe / conduit */}
      <Line points={r.points} color={r.color} lineWidth={r.width + (r.system === "electrical" ? 0 : 2)} transparent opacity={0.55} depthTest={false} />
      {/* animated flow */}
      <Line ref={ref as never} points={r.points} color="#ffffff" lineWidth={r.width + 0.6} dashed dashSize={0.07} gapSize={0.2} transparent opacity={0.95} depthTest={false} />
      {/* end caps */}
      {[r.points[0], r.points[r.points.length - 1]].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshBasicMaterial color={r.color} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

export type ServiceView = "none" | "electrical" | "plumbing";

export function ServiceRoutes({ design, view }: { design: KitchenDesignConfig; view: ServiceView }) {
  const plan = useMemo(() => planRoutes(design), [design.modules, design.room, design.electrical, design.style, design.lighting]); // eslint-disable-line react-hooks/exhaustive-deps
  const routes = plan.routes.filter((r) => (view === "electrical" ? r.system === "electrical" : r.system !== "electrical"));
  const markers = plan.markers.filter((m) => (view === "electrical" ? ["m-db", "m-led"].includes(m.id) || m.id.startsWith("m-e") : !["m-db", "m-led"].includes(m.id) && !m.id.startsWith("m-e")));
  return (
    <group>
      {routes.map((r) => (
        <FlowLine key={r.id} r={r} />
      ))}
      {markers.map((m) => (
        <group key={m.id} position={m.pos}>
          <mesh>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color={m.color} toneMapped={false} />
          </mesh>
          <Tag position={[0, 0.09, 0]}>{m.label}</Tag>
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────── faded kitchen ───────────────────────── */

const GHOST = {
  base: new THREE.MeshBasicMaterial({ color: "#c6a86a", transparent: true, opacity: 0.07, depthWrite: false }),
  wall: new THREE.MeshBasicMaterial({ color: "#7aa7d8", transparent: true, opacity: 0.06, depthWrite: false }),
  tall: new THREE.MeshBasicMaterial({ color: "#8fbf8a", transparent: true, opacity: 0.07, depthWrite: false }),
  counter: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.05, depthWrite: false }),
};

/** Every cabinet as a see-through box with an outline, so the wiring behind is easy to read. */
export function GhostKitchen({ design }: { design: KitchenDesignConfig }) {
  const slabs = useMemo(() => buildCounterSlabs(design), [design.modules, design.style, design.room]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      {design.modules.map((m) => {
        const t = getModuleType(m.typeId);
        const zone = t.zone === "wall" ? "wall" : t.zone === "tall" ? "tall" : "base";
        const edge = zone === "wall" ? "#7aa7d8" : zone === "tall" ? "#8fbf8a" : "#c6a86a";
        const appliance = ["base-hob", "base-sink", "base-dishwasher", "base-washer", "tall-fridge", "tall-oven", "wall-chimney", "wall-microwave"].includes(t.kind);
        return (
          <group key={m.id} position={[mm(m.x), mm(m.elevation), mm(m.z)]} rotation={[0, rotToRad(m.rot), 0]}>
            <mesh position={[0, mm(m.height) / 2, 0]} material={GHOST[zone]} raycast={() => null}>
              <boxGeometry args={[mm(m.width), mm(m.height), mm(m.depth)]} />
              <Edges color={appliance ? "#ffffff" : edge} transparent opacity={appliance ? 0.9 : 0.45} />
            </mesh>
            {appliance && (
              <Html position={[0, mm(m.height) + 0.04, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
                <div style={{ color: "#f4ecd6", font: "600 9px Inter, system-ui", textShadow: "0 0 3px #000", whiteSpace: "nowrap" }}>{t.name}</div>
              </Html>
            )}
          </group>
        );
      })}
      {slabs.map((s) => (
        <mesh key={s.id} position={[mm((s.x0 + s.x1) / 2), mm(s.top) - 0.015, mm((s.z0 + s.z1) / 2)]} material={GHOST.counter} raycast={() => null}>
          <boxGeometry args={[mm(s.x1 - s.x0), 0.03, mm(s.z1 - s.z0)]} />
          <Edges color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
