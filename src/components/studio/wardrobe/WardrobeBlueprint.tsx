import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import {
  INNER_DRAWER_H,
  PANEL,
  totalHeight,
  totalWidth,
  type WardrobeConfig,
  type WardrobeSection,
} from "./wardrobeConfig";
import { GAP, doorHeight, leafCount, shelfLevels, slidingPanelCount, SLIDE_OVERLAP } from "./wardrobeParts";

type V3 = [number, number, number];
const GOLD = "#e2cd9a";
const mm = (m: number) => `${Math.round(m * 1000)}`;

function Tag({ position, children, strong }: { position: V3; children: string; strong?: boolean }) {
  return (
    <Html position={position} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div
        style={{
          background: strong ? "rgba(198,168,106,0.95)" : "rgba(8,12,20,0.88)",
          color: strong ? "#0a0a0a" : "#f2e3bd",
          border: "1px solid #c6a86a",
          borderRadius: 4,
          padding: "1px 5px",
          font: "600 10px/1.3 Inter, system-ui, sans-serif",
          whiteSpace: "nowrap",
          letterSpacing: 0.2,
        }}
      >
        {children}
      </div>
    </Html>
  );
}

/** A measured line with end ticks and a millimetre label. `tick` is the tick direction. */
function Dim({ a, b, tick, label, strong }: { a: V3; b: V3; tick: V3; label?: string; strong?: boolean }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const t = 0.035;
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const tk = (p: V3): [V3, V3] => [
    [p[0] - tick[0] * t, p[1] - tick[1] * t, p[2] - tick[2] * t],
    [p[0] + tick[0] * t, p[1] + tick[1] * t, p[2] + tick[2] * t],
  ];
  return (
    <group>
      <Line points={[a, b]} color={GOLD} lineWidth={1.2} depthTest={false} />
      <Line points={tk(a)} color={GOLD} lineWidth={1.2} depthTest={false} />
      <Line points={tk(b)} color={GOLD} lineWidth={1.2} depthTest={false} />
      <Tag position={mid} strong={strong}>
        {label ?? mm(len)}
      </Tag>
    </group>
  );
}

function SectionDetails({ s, cx, c }: { s: WardrobeSection; cx: number; c: WardrobeConfig }) {
  const T = PANEL;
  const D = c.depth;
  const H = c.height;
  const dh = doorHeight(c);
  const doorCy = c.plinth + GAP + dh / 2;
  const zFront = D / 2 + 0.06;
  const innerBottom = c.plinth + T;
  const innerTop = H - T;
  const tags: { p: V3; t: string }[] = [];
  const innerN = s.kind === "doors" ? (s.innerDrawers ?? 0) : 0;
  const innerH = innerN * (INNER_DRAWER_H + 0.004);

  if (s.kind === "doors") {
    if (s.doorMode === "hinged") {
      const n = leafCount(s.width);
      const lw = (s.width - 2 * GAP - (n - 1) * 0.004) / n;
      for (let i = 0; i < n; i++) {
        const x = cx - s.width / 2 + GAP + lw / 2 + i * (lw + 0.004);
        tags.push({ p: [x, doorCy + dh * 0.08, zFront], t: `Door ${mm(lw)} × ${mm(dh)}` });
      }
    } else {
      const n = slidingPanelCount(s.width);
      const pw = (s.width - 2 * GAP + (n - 1) * SLIDE_OVERLAP) / n;
      for (let i = 0; i < n; i++) {
        const x = cx - s.width / 2 + GAP + pw / 2 + i * (pw - SLIDE_OVERLAP);
        tags.push({ p: [x, doorCy + dh * 0.08 + (i % 2) * 0.12, zFront + 0.03], t: `Panel ${mm(pw)} × ${mm(dh)}` });
      }
    }
  }
  if (s.kind === "drawers") {
    const fh = (innerTop - innerBottom - GAP * (s.drawers + 1)) / s.drawers;
    for (let i = 0; i < s.drawers; i++) {
      tags.push({
        p: [cx, innerBottom + GAP + fh / 2 + i * (fh + GAP), zFront],
        t: `Drawer ${mm(s.width - 2 * GAP)} × ${mm(fh)}`,
      });
    }
  }
  for (let i = 0; i < innerN; i++) {
    tags.push({
      p: [cx, innerBottom + 0.004 + INNER_DRAWER_H / 2 + i * (INNER_DRAWER_H + 0.004), D / 2 - 0.02],
      t: `Inner drawer ${mm(s.width - T - 0.01)} × ${mm(INNER_DRAWER_H)}`,
    });
  }
  if (c.loft) {
    const n = leafCount(s.width);
    const lw = (s.width - 2 * GAP - (n - 1) * 0.004) / n;
    for (let i = 0; i < n; i++) {
      const x = cx - s.width / 2 + GAP + lw / 2 + i * (lw + 0.004);
      tags.push({ p: [x, H + c.loftHeight / 2, zFront], t: `Loft ${mm(lw)} × ${mm(c.loftHeight - 2 * GAP)}` });
    }
  }

  // interior vertical spacing (shelf-to-shelf) down the inner-left edge
  const levels = s.kind === "drawers" ? [] : shelfLevels(s, innerBottom + innerH, innerTop - innerBottom - innerH);
  const xi = cx - s.width / 2 + T / 2 + 0.07;
  const zi = D / 2 - 0.03;
  const pts = [innerBottom + innerH, ...levels, innerTop];

  return (
    <>
      {tags.map((t, i) => (
        <Tag key={i} position={t.p}>
          {t.t}
        </Tag>
      ))}
      {s.kind !== "drawers" &&
        pts.slice(0, -1).map((y0, i) => (
          <Dim key={i} a={[xi, y0, zi]} b={[xi, pts[i + 1], zi]} tick={[1, 0, 0]} />
        ))}
      {/* clear internal width */}
      <Dim
        a={[cx - s.width / 2 + T / 2, innerBottom + 0.03, zi]}
        b={[cx + s.width / 2 - T / 2, innerBottom + 0.03, zi]}
        tick={[0, 1, 0]}
        label={`inside ${mm(s.width - T)}`}
      />
    </>
  );
}

export function WardrobeBlueprint({ config: c }: { config: WardrobeConfig }) {
  const W = totalWidth(c);
  const TH = totalHeight(c);
  const D = c.depth;
  const T = PANEL;
  const zFront = D / 2 + 0.06;

  const centres = useMemo(() => {
    const xs: number[] = [];
    let x = -W / 2 + T / 2;
    c.sections.forEach((s) => {
      xs.push(x + s.width / 2);
      x += s.width;
    });
    return xs;
  }, [c.sections, W, T]);

  const left = -W / 2 - 0.14;
  const farLeft = -W / 2 - 0.34;

  return (
    <group>
      {/* overall width + per-section widths */}
      <Dim a={[-W / 2, TH + 0.26, zFront]} b={[W / 2, TH + 0.26, zFront]} tick={[0, 1, 0]} strong label={`${mm(W)} wide`} />
      {c.sections.map((s, i) => (
        <Dim
          key={s.id}
          a={[centres[i] - s.width / 2, TH + 0.1, zFront]}
          b={[centres[i] + s.width / 2, TH + 0.1, zFront]}
          tick={[0, 1, 0]}
        />
      ))}

      {/* heights */}
      <Dim a={[farLeft, 0, zFront]} b={[farLeft, TH, zFront]} tick={[1, 0, 0]} strong label={`${mm(TH)} high`} />
      <Dim a={[left, 0, zFront]} b={[left, c.plinth, zFront]} tick={[1, 0, 0]} />
      <Dim a={[left, c.plinth, zFront]} b={[left, c.height, zFront]} tick={[1, 0, 0]} />
      {c.loft && <Dim a={[left, c.height, zFront]} b={[left, TH, zFront]} tick={[1, 0, 0]} />}

      {/* depth */}
      <Dim a={[W / 2 + 0.16, TH, -D / 2]} b={[W / 2 + 0.16, TH, D / 2]} tick={[0, 1, 0]} strong label={`${mm(D)} deep`} />

      {/* board thickness callout */}
      <Tag position={[-W / 2 - 0.02, TH * 0.62, D / 2 + 0.02]}>{`18 mm board`}</Tag>

      {c.sections.map((s, i) => (
        <SectionDetails key={s.id} s={s} cx={centres[i]} c={c} />
      ))}
    </group>
  );
}
