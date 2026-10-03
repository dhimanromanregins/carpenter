/**
 * 2D floor plan. It renders the SAME KitchenDesignConfig as the 3D scene —
 * move a cabinet here and the 3D view updates instantly (and vice versa).
 */
import { useMemo, useRef, useState } from "react";
import { useKitchenStore } from "../store/kitchenStore";
import { useSelection } from "../store/interactionStore";
import { useUi } from "../store/uiStore";
import { getModuleType } from "../data/modules";
import { makeModule } from "../engine/layouts";
import { footprint, frontDir, type Rect } from "../engine/geometry";
import { clearanceSpans, validateDesign } from "../engine/validation";
import type { ModuleInstance, Rotation } from "../model/types";
import { snapPosition } from "../engine/snapping";

const PAD = 420;

const ZONE_FILL: Record<string, string> = {
  base: "rgba(198,168,106,0.22)",
  island: "rgba(198,168,106,0.28)",
  tall: "rgba(138,154,123,0.38)",
  wall: "rgba(255,255,255,0.04)",
};

export function FloorPlan() {
  const design = useKitchenStore((s) => s.design);
  const selectedId = useSelection((s) => s.selectedId);
  const showClear = useUi((s) => s.showClearances);
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dz: number; x: number; z: number } | null>(null);
  const [over, setOver] = useState(false);
  const { room } = design;

  const issues = useMemo(() => validateDesign(design), [design]);
  const bad = useMemo(() => new Set(issues.filter((i) => i.severity === "error").flatMap((i) => i.moduleIds)), [issues]);
  const spans = useMemo(() => (showClear ? clearanceSpans(design) : []), [showClear, design]);

  const toPlan = (clientX: number, clientY: number): { x: number; z: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, z: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: p.x, z: p.y };
  };

  const startDrag = (e: React.PointerEvent, m: ModuleInstance) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    useSelection.getState().select(m.id);
    const p = toPlan(e.clientX, e.clientY);
    setDrag({ id: m.id, dx: m.x - p.x, dz: m.z - p.z, x: m.x, z: m.z });
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const m = design.modules.find((v) => v.id === drag.id);
    if (!m) return;
    const p = toPlan(e.clientX, e.clientY);
    const s = snapPosition(m, p.x + drag.dx, p.z + drag.dz, design.modules, room);
    setDrag({ ...drag, x: s.x, z: s.z });
  };
  const endDrag = () => {
    if (!drag) return;
    const m = design.modules.find((v) => v.id === drag.id);
    if (m && (Math.abs(drag.x - m.x) > 1 || Math.abs(drag.z - m.z) > 1)) useKitchenStore.getState().moveModule(drag.id, drag.x, drag.z);
    setDrag(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const typeId = e.dataTransfer.getData("application/x-kitchen-module");
    if (!typeId) return;
    const p = toPlan(e.clientX, e.clientY);
    const t = getModuleType(typeId);
    // dock to the nearest wall when dropped close to one
    const distances = [
      { wall: "back", d: p.z, rot: 0 as Rotation },
      { wall: "front", d: room.depth - p.z, rot: 180 as Rotation },
      { wall: "left", d: p.x, rot: 90 as Rotation },
      { wall: "right", d: room.width - p.x, rot: 270 as Rotation },
    ].sort((a, b) => a.d - b.d);
    const near = distances[0];
    const probe = makeModule(typeId, {}, design.style);
    let rot: Rotation = 0;
    let x = p.x;
    let z = p.z;
    if (near.d < 800 && t.zone !== "wall") {
      rot = near.rot;
      const depth = probe.depth;
      if (near.wall === "back") z = depth / 2;
      if (near.wall === "front") z = room.depth - depth / 2;
      if (near.wall === "left") x = depth / 2;
      if (near.wall === "right") x = room.width - depth / 2;
    } else if (near.d < 800) {
      rot = near.rot;
      const depth = probe.depth;
      if (near.wall === "back") z = depth / 2;
      if (near.wall === "front") z = room.depth - depth / 2;
      if (near.wall === "left") x = depth / 2;
      if (near.wall === "right") x = room.width - depth / 2;
    }
    const placed = { ...probe, x, z, rot };
    const s = snapPosition(placed, x, z, design.modules, room);
    const id = useKitchenStore.getState().addModule(typeId, { x: s.x, z: s.z, rot });
    if (id) useSelection.getState().select(id);
  };

  const view = `${-PAD} ${-PAD} ${room.width + 2 * PAD} ${room.depth + 2 * PAD}`;
  const win = room.window;
  const door = room.door;
  const wallOpening = (wall: string, offset: number, width: number, color: string) => {
    const half = width / 2;
    const t = 22;
    switch (wall) {
      case "back":
        return <rect x={offset - half} y={-t} width={width} height={t * 2} fill={color} />;
      case "front":
        return <rect x={offset - half} y={room.depth - t} width={width} height={t * 2} fill={color} />;
      case "left":
        return <rect x={-t} y={offset - half} width={t * 2} height={width} fill={color} />;
      default:
        return <rect x={room.width - t} y={offset - half} width={t * 2} height={width} fill={color} />;
    }
  };

  const floorMods = design.modules.filter((m) => m.elevation < 100);
  const wallMods = design.modules.filter((m) => m.elevation >= 100);

  const rectFor = (m: ModuleInstance): Rect => footprint(drag?.id === m.id ? { ...m, x: drag.x, z: drag.z } : m);

  return (
    <div className="relative h-full w-full bg-[#0d1117]">
      <svg
        ref={svgRef}
        viewBox={view}
        className="h-full w-full touch-none"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClick={() => useSelection.getState().select(null)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <defs>
          <pattern id="plan-grid" width="500" height="500" patternUnits="userSpaceOnUse">
            <path d="M500 0H0V500" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          </pattern>
        </defs>
        <rect x={-PAD} y={-PAD} width={room.width + 2 * PAD} height={room.depth + 2 * PAD} fill="url(#plan-grid)" />
        <rect x={0} y={0} width={room.width} height={room.depth} fill="rgba(255,255,255,0.025)" stroke="#e2cd9a" strokeWidth={14} />
        {win.enabled && wallOpening(win.wall, win.offset, win.width, "#6fb7ff")}
        {door.enabled && wallOpening(door.wall, door.offset, door.width, "#c58f5a")}

        {wallMods.map((m) => {
          const r = footprint(m);
          return <rect key={m.id} x={r.x0} y={r.z0} width={r.x1 - r.x0} height={r.z1 - r.z0} fill="none" stroke="rgba(226,205,154,0.45)" strokeWidth={8} strokeDasharray="30 18" onClick={(e) => { e.stopPropagation(); useSelection.getState().select(m.id); }} />;
        })}

        {floorMods.map((m) => {
          const r = rectFor(m);
          const t = getModuleType(m.typeId);
          const [fx, fz] = frontDir(m.rot);
          const cx = (r.x0 + r.x1) / 2;
          const cz = (r.z0 + r.z1) / 2;
          const sel = selectedId === m.id;
          const isBad = bad.has(m.id);
          return (
            <g key={m.id} onPointerDown={(e) => startDrag(e, m)} onClick={(e) => e.stopPropagation()} style={{ cursor: "grab" }}>
              <rect x={r.x0} y={r.z0} width={r.x1 - r.x0} height={r.z1 - r.z0} fill={ZONE_FILL[t.zone] ?? ZONE_FILL.base} stroke={isBad ? "#ff6a6a" : sel ? "#fff1c7" : "rgba(226,205,154,0.7)"} strokeWidth={sel ? 14 : 8} />
              {(() => {
                // small arrow at the front edge showing which way the doors face
                const ex = cx + (fx * (r.x1 - r.x0)) / 2;
                const ez = cz + (fz * (r.z1 - r.z0)) / 2;
                const px = -fz;
                const pz = fx;
                const pts = [
                  [ex - fx * 120 + px * 70, ez - fz * 120 + pz * 70],
                  [ex - fx * 120 - px * 70, ez - fz * 120 - pz * 70],
                  [ex - fx * 14, ez - fz * 14],
                ];
                return <polygon points={pts.map((q) => q.join(",")).join(" ")} fill="rgba(226,205,154,0.75)" />;
              })()}
              {r.x1 - r.x0 > 260 && r.z1 - r.z0 > 260 && (
                <text x={cx} y={cz} fontSize={86} fill="#f4ecd6" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: "none" }}>
                  {Math.round(m.width)}
                </text>
              )}
            </g>
          );
        })}

        {spans.map((s, i) => (
          <g key={i}>
            <line x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke={s.ok ? "#4cc38a" : "#ff6a6a"} strokeWidth={12} strokeDasharray="40 24" />
            <text x={(s.from[0] + s.to[0]) / 2 + 40} y={(s.from[1] + s.to[1]) / 2} fontSize={80} fill={s.ok ? "#4cc38a" : "#ff8a8a"} dominantBaseline="central">
              {Math.round(s.gap)}
            </text>
          </g>
        ))}

        <text x={room.width / 2} y={room.depth + 300} fontSize={110} fill="#e2cd9a" textAnchor="middle">
          {room.width} mm
        </text>
        <text x={-290} y={room.depth / 2} fontSize={110} fill="#e2cd9a" textAnchor="middle" transform={`rotate(-90 -290 ${room.depth / 2})`}>
          {room.depth} mm
        </text>
      </svg>
      {over && <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-gold/70 bg-gold/5" />}
      <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-grey">Floor plan · drag to move · drop cabinets here</p>
    </div>
  );
}
