import { useState } from "react";
import { GLASS_FINISHES, GLASS_FINISH_GROUPS, findGlassFinish, type GlassGroup } from "@/data/glassFinishes";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null | undefined;
  onChange: (id: string) => void;
  className?: string;
}

/** Swatch grid of all glass finishes, filterable by group. */
export function GlassFinishPicker({ value, onChange, className }: Props) {
  const [group, setGroup] = useState<GlassGroup | "All">("All");
  const list = group === "All" ? GLASS_FINISHES : GLASS_FINISHES.filter((f) => f.group === group);
  const current = value ? findGlassFinish(value) : null;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["All", ...GLASS_FINISH_GROUPS] as const).map((gr) => (
          <button
            key={gr}
            type="button"
            onClick={() => setGroup(gr)}
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest transition-colors",
              group === gr ? "border-gold bg-gold/10 text-gold" : "border-cream/15 text-grey hover:border-gold/40"
            )}
          >
            {gr}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {list.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            title={f.name}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors",
              current?.id === f.id ? "border-gold bg-gold/10" : "border-cream/10 hover:border-gold/40"
            )}
          >
            <span
              className="h-9 w-full rounded-md border border-cream/10"
              style={{
                background:
                  f.texture === "fluted"
                    ? `repeating-linear-gradient(90deg, ${f.color} 0 3px, rgba(255,255,255,0.35) 3px 4px)`
                    : `linear-gradient(135deg, ${f.color}, rgba(255,255,255,0.4))`,
                opacity: Math.max(0.45, f.opacity + 0.3),
              }}
            />
            <span className="text-[10px] leading-tight text-cream/80">{f.name}</span>
          </button>
        ))}
      </div>
      {current && <p className="mt-2 text-[11px] text-grey">Selected: {current.name}</p>}
    </div>
  );
}
