/** Dimension lines, walkway-clearance indicators and service-point markers. */
import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import type { KitchenDesignConfig } from "../model/types";
import { getModuleType } from "../data/modules";
import { mm } from "../model/units";
import { footprint } from "../engine/geometry";
import { clearanceSpans, pointPlan } from "../engine/validation";
import { wallPoint } from "./Room";

type V3 = [number, number, number];
const GOLD = "#e2cd9a";

function Tag({ position, children, tone = "gold" }: { position: V3; children: string; tone?: "gold" | "ok" | "bad" }) {
  const bg = tone === "ok" ? "rgba(46,125,80,0.92)" : tone === "bad" ? "rgba(168,48,48,0.94)" : "rgba(8,12,20,0.88)";
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ background: bg, color: "#f4ecd6", border: "1px solid rgba(226,205,154,0.8)", borderRadius: 4, padding: "1px 6px", font: "600 10px/1.35 Inter, system-ui, sans-serif", whiteSpace: "nowrap" }}>{children}</div>
    </Html>
  );
}

function Dim({ a, b, tick, label, color = GOLD }: { a: V3; b: V3; tick: V3; label?: string; color?: string }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const t = 0.04;
  const tk = (p: V3): [V3, V3] => [[p[0] - tick[0] * t, p[1] - tick[1] * t, p[2] - tick[2] * t], [p[0] + tick[0] * t, p[1] + tick[1] * t, p[2] + tick[2] * t]];
  return (
    <group>
      <Line points={[a, b]} color={color} lineWidth={1.4} depthTest={false} />
      <Line points={tk(a)} color={color} lineWidth={1.4} depthTest={false} />
      <Line points={tk(b)} color={color} lineWidth={1.4} depthTest={false} />
      <Tag position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]}>{label ?? `${Math.round(len * 1000)} mm`}</Tag>
    </group>
  );
}

export function Measurements({ design }: { design: KitchenDesignConfig }) {
  const { room, modules, style } = design;
  const W = mm(room.width);
  const D = mm(room.depth);
  const H = mm(room.height);
  const floor = useMemo(() => modules.filter((m) => m.elevation < 100 && getModuleType(m.typeId).kind !== "filler"), [modules]);
  const counterTop = mm(style.plinthHeight + 720 + style.counterThickness);
  return (
    <group>
      <Dim a={[0, 0.01, D + 0.25]} b={[W, 0.01, D + 0.25]} tick={[0, 0, 1]} label={`${room.width} mm`} />
      <Dim a={[-0.25, 0.01, 0]} b={[-0.25, 0.01, D]} tick={[1, 0, 0]} label={`${room.depth} mm`} />
      <Dim a={[-0.25, 0, -0.0]} b={[-0.25, H, 0]} tick={[1, 0, 0]} label={`${room.height} mm`} />
      {floor.map((m) => {
        const f = footprint(m);
        const horizontal = m.rot === 0 || m.rot === 180;
        const top = mm(m.height) + mm(style.counterThickness) + 0.04;
        if (horizontal) {
          const z = m.rot === 0 ? mm(f.z1) + 0.02 : mm(f.z0) - 0.02;
          return <Dim key={m.id} a={[mm(f.x0), top, z]} b={[mm(f.x1), top, z]} tick={[0, 1, 0]} label={`${Math.round(m.width)}`} />;
        }
        const x = m.rot === 90 ? mm(f.x1) + 0.02 : mm(f.x0) - 0.02;
        return <Dim key={m.id} a={[x, top, mm(f.z0)]} b={[x, top, mm(f.z1)]} tick={[0, 1, 0]} label={`${Math.round(m.width)}`} />;
      })}
      {floor.length > 0 && <Dim a={[0.12, 0, 0.12]} b={[0.12, counterTop, 0.12]} tick={[1, 0, 0]} label={`counter ${Math.round(counterTop * 1000)}`} />}
    </group>
  );
}

export function Clearances({ design }: { design: KitchenDesignConfig }) {
  const spans = useMemo(() => clearanceSpans(design), [design]);
  return (
    <group>
      {spans.map((s, i) => (
        <group key={i}>
          <Line points={[[mm(s.from[0]), 0.02, mm(s.from[1])], [mm(s.to[0]), 0.02, mm(s.to[1])]]} color={s.ok ? "#4cc38a" : "#ff6a6a"} lineWidth={3} depthTest={false} dashed dashSize={0.08} gapSize={0.05} />
          <Tag position={[mm((s.from[0] + s.to[0]) / 2), 0.05, mm((s.from[1] + s.to[1]) / 2)]} tone={s.ok ? "ok" : "bad"}>
            {s.ok ? `${Math.round(s.gap)} mm clear` : `${Math.round(s.gap)} mm — clearance too small`}
          </Tag>
        </group>
      ))}
    </group>
  );
}

const POINT_COLOR = { plumbing: "#4aa3ff", gas: "#ff9a3c", electrical: "#ffd84a", drain: "#9aa3ad" } as const;

export function ServicePoints({ design }: { design: KitchenDesignConfig }) {
  const { room } = design;
  return (
    <group>
      {room.points.map((p) => {
        const pos = wallPoint(room, p.wall, p.offset, p.height, 0.03);
        void pointPlan;
        return (
          <group key={p.id} position={pos}>
            <mesh>
              <sphereGeometry args={[0.04, 14, 14]} />
              <meshBasicMaterial color={POINT_COLOR[p.kind]} toneMapped={false} />
            </mesh>
            <Tag position={[0, 0.1, 0]}>{p.kind}</Tag>
          </group>
        );
      })}
    </group>
  );
}
