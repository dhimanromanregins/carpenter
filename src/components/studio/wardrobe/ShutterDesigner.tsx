import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { paintSurface, tokenColor } from "./surfaceTextures";
import {
  FINISHES,
  MAX_COLORS,
  MESHES,
  PATTERNS,
  SURFACE_TYPES,
  WALLPAPERS,
  type MeshKind,
  type PatternId,
  type Surface,
  type SurfaceType,
  type WallpaperKind,
} from "./wardrobeConfig";

const DESIGNER_COLOURS = [
  "#ffffff", "#f4efe6", "#e9d8c0", "#d9c7a8", "#c9a678", "#a5733c",
  "#d9a5a0", "#c97b63", "#b24a3d", "#7a2e3a", "#e8c76a", "#c6a86a",
  "#9db8a0", "#7da28b", "#4b6b5b", "#6f8fa8", "#3d5a80", "#2b3a55",
  "#8e7cc3", "#5a4a42", "#2e2f31", "#141414", "#a9a9a9", "#d3dce0",
];

const EXTRA_COLOURS = ["#c6a86a", "#2e2f31", "#8a9a7b", "#b24a3d"];

function Thumb({ surface, className }: { surface: Surface; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) paintSurface(ref.current, surface);
  }, [surface]);
  return <canvas ref={ref} width={44} height={88} className={className} />;
}

function Swatch({ token, size = "h-9 w-9" }: { token: string; size?: string }) {
  const f = token.startsWith("wood:") ? FINISHES.find((x) => x.id === token.slice(5)) : null;
  return (
    <span
      className={cn("block rounded-full border border-cream/20", size)}
      style={{
        background: f?.ring
          ? `repeating-linear-gradient(90deg, ${f.color} 0 5px, ${f.ring} 5px 6px)`
          : tokenColor(token),
      }}
    />
  );
}

interface ShutterDesignerProps {
  surface: Surface;
  onChange: (s: Surface) => void;
  scope: "all" | "section";
  onScope: (s: "all" | "section") => void;
  /** A doors section is currently selected. */
  canSection: boolean;
  sectionLabel: string | null;
  hasOverride: boolean;
  onResetSection: () => void;
}

export function ShutterDesigner({ surface, onChange, scope, onScope, canSection, sectionLabel, hasOverride, onResetSection }: ShutterDesignerProps) {
  const [active, setActive] = useState(0);
  const slot = Math.min(active, surface.colors.length - 1);
  const patternDef = PATTERNS.find((p) => p.id === surface.pattern);
  const set = (patch: Partial<Surface>) => onChange({ ...surface, ...patch });

  const setColor = (i: number, token: string) => {
    const colors = [...surface.colors];
    colors[i] = token;
    set({ colors });
  };

  const addColor = () => {
    if (surface.colors.length >= MAX_COLORS) return;
    const colors = [...surface.colors, EXTRA_COLOURS[surface.colors.length % EXTRA_COLOURS.length]];
    set({ colors });
    setActive(colors.length - 1);
  };

  const removeColor = (i: number) => {
    if (surface.colors.length <= 1) return;
    const colors = surface.colors.filter((_, k) => k !== i);
    const need = PATTERNS.find((p) => p.id === surface.pattern)?.minColors ?? 1;
    set({ colors, pattern: colors.length < need ? "solid" : surface.pattern });
    setActive(0);
  };

  const choosePattern = (id: PatternId) => {
    const def = PATTERNS.find((p) => p.id === id);
    const colors = [...surface.colors];
    while (def && colors.length < def.minColors) colors.push(EXTRA_COLOURS[colors.length % EXTRA_COLOURS.length]);
    set({ pattern: id, colors });
  };

  const isWallpaper = surface.type === "wallpaper";
  const colourLabels = isWallpaper ? ["Background", "Print"] : null;

  return (
    <div className="space-y-5">
      {/* scope */}
      <div>
        <div className="flex gap-1 rounded-lg border border-gold/15 bg-ink/60 p-1">
          {(["all", "section"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onScope(s)}
              className={cn(
                "flex-1 rounded-md px-2 py-2 text-[11px] uppercase tracking-wider transition-colors",
                scope === s ? "bg-gold text-ink" : "text-grey hover:text-cream"
              )}
            >
              {s === "all" ? "All doors" : "Selected section"}
            </button>
          ))}
        </div>
        {scope === "section" && (
          <p className="mt-2 text-[11px] leading-snug text-grey">
            {canSection ? (
              <>
                Editing <span className="text-gold">{sectionLabel}</span> only.
                {hasOverride && (
                  <button type="button" onClick={onResetSection} className="ml-2 text-gold underline">
                    Match other doors
                  </button>
                )}
              </>
            ) : (
              "Click a door in the 3D view (or a section in the Layout tab) to design just that section."
            )}
          </p>
        )}
      </div>

      {/* material type */}
      <div>
        <p className="mb-2 text-xs text-grey">Material</p>
        <div className="grid grid-cols-2 gap-2">
          {SURFACE_TYPES.map((t) => {
            const on = surface.type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => set({ type: t.id as SurfaceType })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-colors",
                  on ? "border-gold bg-gold/10" : "border-gold/10 bg-ink/40 hover:border-gold/40"
                )}
              >
                <span className={cn("block text-[12px]", on ? "text-gold" : "text-cream")}>{t.name}</span>
                <span className="block text-[10px] leading-snug text-grey">{t.blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* colours */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs text-grey">Colours ({surface.colors.length}/{MAX_COLORS})</p>
          {surface.colors.length < MAX_COLORS && (
            <button type="button" onClick={addColor} className="text-[11px] uppercase tracking-wider text-gold hover:text-cream">
              + Add colour
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {surface.colors.map((tok, i) => (
            <div key={i} className={cn("relative rounded-lg border p-1.5", i === slot ? "border-gold bg-gold/10" : "border-gold/15")}>
              <button type="button" onClick={() => setActive(i)} aria-label={`Colour ${i + 1}`} className="block">
                <Swatch token={tok} size="h-10 w-10" />
              </button>
              <p className="mt-1 text-center text-[9px] uppercase tracking-wider text-grey">{colourLabels?.[i] ?? `Colour ${i + 1}`}</p>
              {surface.colors.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove colour ${i + 1}`}
                  onClick={() => removeColor(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] text-grey ring-1 ring-gold/30 hover:text-cream"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-lg border border-gold/10 bg-ink/40 p-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-cream">
            <input
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(surface.colors[slot]) ? surface.colors[slot] : tokenColor(surface.colors[slot])}
              onChange={(e) => setColor(slot, e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-gold/30 bg-transparent p-0"
            />
            Custom colour
          </label>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-grey">Editing colour {slot + 1}</span>
        </div>

        <p className="mb-2 mt-3 text-[11px] text-grey">Quick picks — woods</p>
        <div className="flex flex-wrap gap-2">
          {FINISHES.filter((f) => f.ring).map((f) => (
            <button key={f.id} type="button" title={f.name} aria-label={f.name} onClick={() => setColor(slot, `wood:${f.id}`)}>
              <Swatch token={`wood:${f.id}`} size="h-7 w-7" />
            </button>
          ))}
        </div>
        <p className="mb-2 mt-3 text-[11px] text-grey">Quick picks — colours</p>
        <div className="grid grid-cols-8 gap-1.5">
          {DESIGNER_COLOURS.map((col) => (
            <button
              key={col}
              type="button"
              title={col}
              aria-label={col}
              onClick={() => setColor(slot, col)}
              className="aspect-square rounded-full border border-cream/20 transition-transform hover:scale-110"
              style={{ background: col }}
            />
          ))}
        </div>
      </div>

      {/* wallpaper kind */}
      {isWallpaper && (
        <div>
          <p className="mb-2 text-xs text-grey">Wallpaper design</p>
          <div className="grid grid-cols-3 gap-2">
            {WALLPAPERS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => set({ wallpaper: w.id as WallpaperKind, colors: surface.colors.length < 2 ? [...surface.colors, "#c6a86a"] : surface.colors })}
                className={cn(
                  "overflow-hidden rounded-lg border p-1.5 text-center transition-colors",
                  surface.wallpaper === w.id ? "border-gold bg-gold/10" : "border-gold/10 hover:border-gold/40"
                )}
              >
                <Thumb surface={{ ...surface, wallpaper: w.id, colors: surface.colors.length < 2 ? [...surface.colors, "#c6a86a"] : surface.colors }} className="mx-auto h-16 w-8 rounded" />
                <span className="mt-1 block text-[10px] text-cream">{w.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* mesh kind */}
      {surface.type === "mesh" && (
        <div>
          <p className="mb-2 text-xs text-grey">Mesh style</p>
          <div className="grid grid-cols-2 gap-2">
            {MESHES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => set({ mesh: m.id as MeshKind })}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-[12px] transition-colors",
                  surface.mesh === m.id ? "border-gold bg-gold/10 text-gold" : "border-gold/10 text-cream hover:border-gold/40"
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-grey">
            Colour 1 is the mesh / glass colour. Wire, cane and perforated mesh are see-through; sandwich is solid glossy glass.
          </p>
        </div>
      )}

      {/* patterns */}
      {!isWallpaper && (
        <div>
          <p className="mb-2 text-xs text-grey">Colour pattern &amp; shape</p>
          {(["colour", "shape"] as const).map((group) => (
            <div key={group} className="mb-3">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.25em] text-gold/80">{group === "colour" ? "Colour patterns" : "Shape insets"}</p>
              <div className="grid grid-cols-4 gap-2">
                {PATTERNS.filter((p) => p.group === group).map((p) => {
                  const on = surface.pattern === p.id;
                  const preview: Surface = {
                    ...surface,
                    type: surface.type === "wallpaper" ? "laminate" : surface.type,
                    pattern: p.id,
                    colors: surface.colors.length >= p.minColors ? surface.colors : [...surface.colors, ...EXTRA_COLOURS.slice(0, p.minColors - surface.colors.length)],
                  };
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      aria-label={p.name}
                      aria-pressed={on}
                      onClick={() => choosePattern(p.id)}
                      className={cn("rounded-lg border p-1.5 transition-colors", on ? "border-gold bg-gold/10" : "border-gold/10 hover:border-gold/40")}
                    >
                      <Thumb surface={preview} className="mx-auto h-[72px] w-9 rounded" />
                      <span className="mt-1 block text-[9px] leading-tight text-grey">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {patternDef?.scalable && (
            <label className="block">
              <span className="mb-1.5 flex justify-between text-xs text-grey">
                Pattern size
                <span className="text-cream">{surface.scale}</span>
              </span>
              <input
                type="range"
                min={2}
                max={14}
                step={1}
                value={surface.scale}
                onChange={(e) => set({ scale: parseInt(e.target.value, 10) })}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cream/15 accent-[#c6a86a]"
              />
            </label>
          )}
        </div>
      )}
      <p className="text-[11px] leading-snug text-grey">
        This applies to hinged and sliding shutters, drawer fronts and loft doors. Glass and mirror doors keep their own look.
      </p>
    </div>
  );
}
