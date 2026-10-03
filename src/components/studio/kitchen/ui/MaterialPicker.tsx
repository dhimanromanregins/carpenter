import { useState } from "react";
import { MATERIALS, materialsIn, resolveMaterial, type MaterialCategory } from "../data/materials";
import { Chip, Swatch } from "./atoms";

const LABEL: Record<string, string> = { laminate: "Laminate", acrylic: "Acrylic", pu: "PU", veneer: "Veneer", glass: "Glass", countertop: "Stone", backsplash: "Tile", floor: "Floor" };

/** Category chips + swatch grid + (optionally) a custom colour. Everything comes from the material registry. */
export function MaterialPicker({ value, onChange, categories, allowCustom = false, onClearOverride }: { value: string; onChange: (id: string) => void; categories: MaterialCategory[]; allowCustom?: boolean; onClearOverride?: () => void }) {
  const current = resolveMaterial(value);
  const [cat, setCat] = useState<MaterialCategory>(categories.includes(current.category) ? current.category : categories[0]);
  const list = materialsIn(cat);
  const customHex = value.startsWith("custom:") ? value.slice(7) : "#c6a86a";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {LABEL[c] ?? c}
          </Chip>
        ))}
        {allowCustom && (
          <Chip active={value.startsWith("custom:")} onClick={() => onChange(`custom:${customHex}`)}>
            Custom
          </Chip>
        )}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {list.map((m) => (
          <Swatch key={m.id} title={`${m.name} · ${m.sku}`} color={m.color} texture={m.texture === "wood" ? "wood" : undefined} active={value === m.id} onClick={() => onChange(m.id)} size="h-8 w-8" />
        ))}
      </div>
      {allowCustom && value.startsWith("custom:") && (
        <label className="flex items-center gap-3 rounded-lg border border-gold/10 bg-ink/40 p-2.5 text-xs text-cream">
          <input type="color" value={customHex} onChange={(e) => onChange(`custom:${e.target.value}`)} className="h-8 w-10 cursor-pointer rounded border border-gold/30 bg-transparent p-0" />
          Pick any colour
        </label>
      )}
      <div className="flex items-center justify-between text-[11px] text-grey">
        <span>
          {current.name} <span className="text-grey/60">· {current.sku}</span>
        </span>
        {onClearOverride && (
          <button type="button" onClick={onClearOverride} className="text-gold underline">
            Use global
          </button>
        )}
      </div>
    </div>
  );
}

export const ALL_MATERIAL_COUNT = MATERIALS.length;
