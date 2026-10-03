import { useId, useMemo } from "react";
import type { BoardType } from "@/data/boardCatalog";

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seedOf(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Generated illustration of a board: a face panel above a cut-away edge section. */
export function BoardArt({ type, seedKey }: { type: BoardType; seedKey: string }) {
  const uid = useId().replace(/:/g, "");
  const [light, dark] = type.tone;

  const art = useMemo(() => {
    const r = rng(seedOf(seedKey + type.id));
    const grain: string[] = [];
    const W = 320;
    const FACE_Y = 18;
    const FACE_H = 118;

    if (["plywood", "blockboard", "door", "finish", "plank"].includes(type.art)) {
      for (let i = 0; i < 26; i++) {
        const y = FACE_Y + 4 + r() * (FACE_H - 8);
        const x0 = 22 + r() * 20;
        const amp = 1 + r() * 4;
        grain.push(
          `M${x0} ${y} C ${x0 + 80} ${y - amp}, ${x0 + 160} ${y + amp}, ${W - 22 - r() * 30} ${y + (r() - 0.5) * 2}`
        );
      }
    }

    const specks: { x: number; y: number; w: number; h: number; o: number }[] = [];
    if (["particle", "mdf", "hdhmr", "gypsum", "cement", "tile"].includes(type.art)) {
      const n = type.art === "particle" ? 220 : type.art === "cement" ? 200 : type.art === "gypsum" ? 70 : 120;
      for (let i = 0; i < n; i++) {
        specks.push({
          x: 20 + r() * (W - 40),
          y: FACE_Y + 2 + r() * (FACE_H - 4),
          w: type.art === "particle" ? 3 + r() * 7 : 1 + r() * 2,
          h: type.art === "particle" ? 1.5 + r() * 3 : 1 + r() * 1.5,
          o: 0.15 + r() * 0.35,
        });
      }
    }
    return { grain, specks };
  }, [seedKey, type.id, type.art]);

  const EDGE_Y = 152;
  const EDGE_H = 40;
  const n = Math.max(1, type.layers);
  const layerH = EDGE_H / n;

  return (
    <svg viewBox="0 0 320 210" className="h-full w-full" role="img" aria-label={`${type.name} illustration`}>
      <defs>
        <linearGradient id={`${uid}f`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${uid}s`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
        <clipPath id={`${uid}c`}>
          <rect x="20" y="18" width="280" height="118" rx="3" />
        </clipPath>
      </defs>

      {/* soft floor shadow */}
      <ellipse cx="160" cy="203" rx="120" ry="5" fill="#000" opacity="0.35" />

      {/* face */}
      <g clipPath={`url(#${uid}c)`}>
        <rect x="20" y="18" width="280" height="118" fill={`url(#${uid}f)`} />
        {art.grain.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#3a210c" strokeOpacity={0.14 + (i % 4) * 0.04} strokeWidth="0.8" />
        ))}
        {art.specks.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill="#3a2a14" opacity={s.o} />
        ))}
        {type.art === "paint" && (
          <>
            <path d="M20 18 L150 18 L70 136 L20 136 Z" fill="#fff" opacity="0.16" />
            <rect x="20" y="124" width="280" height="12" fill="#000" opacity="0.12" />
          </>
        )}
        {type.art === "finish" && (
          <path d="M150 18 L215 18 L120 136 L55 136 Z" fill="#fff" opacity="0.2" />
        )}
        {type.art === "plank" && (
          <>
            {[57, 96].map((y) => (
              <line key={y} x1="20" x2="300" y1={y} y2={y} stroke="#000" strokeOpacity="0.35" strokeWidth="1.4" />
            ))}
            {[
              [18, 57, 120],
              [57, 96, 215],
              [96, 136, 85],
            ].map(([y0, y1, x]) => (
              <line key={x} x1={x} x2={x} y1={y0} y2={y1} stroke="#000" strokeOpacity="0.35" strokeWidth="1.4" />
            ))}
          </>
        )}
        {type.art === "perforated" &&
          Array.from({ length: 10 * 5 }).map((_, i) => (
            <circle
              key={i}
              cx={44 + (i % 10) * 25.5}
              cy={38 + Math.floor(i / 10) * 20}
              r="3.2"
              fill={dark}
              opacity="0.75"
            />
          ))}
        {type.art === "tile" && (
          <>
            <rect x="28" y="26" width="264" height="102" fill="none" stroke={dark} strokeOpacity="0.45" strokeWidth="3" />
            <rect x="40" y="38" width="240" height="78" fill="none" stroke={dark} strokeOpacity="0.25" />
          </>
        )}
        {type.art === "channel" && (
          <>
            <rect x="20" y="18" width="280" height="118" fill="#2b2f33" />
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x="20" y={34 + i * 34} width="280" height="22" fill="#b9c0c7" />
                <rect x="20" y={34 + i * 34} width="280" height="6" fill="#e6ebef" />
                <rect x="20" y={50 + i * 34} width="280" height="6" fill="#7b838b" />
                {Array.from({ length: 9 }).map((_, k) => (
                  <ellipse key={k} cx={46 + k * 31} cy={45 + i * 34} rx="4" ry="2.2" fill="#2b2f33" />
                ))}
              </g>
            ))}
          </>
        )}
        {type.art === "door" && (
          <>
            <rect x="36" y="30" width="248" height="94" fill="none" stroke="#000" strokeOpacity="0.2" />
            <circle cx="270" cy="77" r="4" fill="#e2cd9a" />
          </>
        )}
        <rect x="20" y="18" width="280" height="118" fill={`url(#${uid}s)`} />
      </g>

      {/* edge cross-section */}
      <rect x="20" y={EDGE_Y} width="280" height={EDGE_H} rx="2" fill="#2a1a0c" />
      {type.art === "plywood" &&
        Array.from({ length: n }).map((_, i) => (
          <rect
            key={i}
            x="20"
            y={EDGE_Y + i * layerH}
            width="280"
            height={layerH - 0.8}
            fill={i % 2 ? dark : light}
          />
        ))}
      {(type.art === "paint" || type.art === "finish" || type.art === "plank") &&
        (type.layerColors ?? [light, dark]).map((c, i, arr) => (
          <rect
            key={i}
            x="20"
            y={EDGE_Y + (i * EDGE_H) / arr.length}
            width="280"
            height={EDGE_H / arr.length - 0.6}
            fill={c}
          />
        ))}
      {type.art === "blockboard" && (
        <>
          <rect x="20" y={EDGE_Y} width="280" height="5" fill={light} />
          <rect x="20" y={EDGE_Y + EDGE_H - 5} width="280" height="5" fill={light} />
          {Array.from({ length: 28 }).map((_, i) => (
            <rect
              key={i}
              x={21 + i * 10}
              y={EDGE_Y + 6}
              width="9"
              height={EDGE_H - 12}
              fill={i % 3 === 0 ? dark : light}
              opacity={0.85}
            />
          ))}
        </>
      )}
      {type.art === "door" && (
        <>
          <rect x="20" y={EDGE_Y} width="280" height="4" fill={light} />
          <rect x="20" y={EDGE_Y + EDGE_H - 4} width="280" height="4" fill={light} />
          <rect x="20" y={EDGE_Y + 4} width="280" height={EDGE_H - 8} fill={dark} opacity="0.55" />
        </>
      )}
      {(type.art === "mdf" || type.art === "hdhmr" || type.art === "particle" || type.art === "cement") && (
        <rect x="20" y={EDGE_Y} width="280" height={EDGE_H} fill={dark} opacity="0.85" />
      )}
      {(type.art === "gypsum" || type.art === "perforated" || type.art === "tile") && (
        <>
          <rect x="20" y={EDGE_Y} width="280" height={EDGE_H} fill="#e9e5db" />
          <rect x="20" y={EDGE_Y} width="280" height="4" fill={dark} />
          <rect x="20" y={EDGE_Y + EDGE_H - 4} width="280" height="4" fill={dark} />
          {Array.from({ length: 60 }).map((_, i) => (
            <circle
              key={i}
              cx={24 + ((i * 47) % 270)}
              cy={EDGE_Y + 8 + ((i * 13) % (EDGE_H - 16))}
              r={0.8 + (i % 3) * 0.5}
              fill="#bdb6a4"
            />
          ))}
        </>
      )}
      {type.art === "channel" && (
        <>
          <rect x="20" y={EDGE_Y} width="280" height={EDGE_H} fill="#b9c0c7" />
          <rect x="20" y={EDGE_Y} width="280" height="6" fill="#e6ebef" />
          <rect x="20" y={EDGE_Y + EDGE_H - 6} width="280" height="6" fill="#7b838b" />
          <rect x="20" y={EDGE_Y + 14} width="280" height="12" fill="#5d646b" />
        </>
      )}
      <rect x="20" y={EDGE_Y} width="280" height={EDGE_H} rx="2" fill="none" stroke="#e2cd9a" strokeOpacity="0.25" />
    </svg>
  );
}
