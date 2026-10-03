import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ title, hint, children, className }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("border-b border-gold/10 py-4", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{title}</p>
        {hint && <p className="truncate text-[10px] text-grey">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Seg<T extends string | number>({ value, options, onChange, small }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; small?: boolean }) {
  return (
    <div className="flex gap-1 rounded-lg border border-gold/15 bg-ink/60 p-1">
      {options.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "flex-1 rounded-md px-2 uppercase tracking-wider transition-colors",
            small ? "py-1.5 text-[10px]" : "py-2 text-[11px]",
            value === o.id ? "bg-gold text-ink" : "text-grey hover:text-cream"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-gold/10 bg-ink/40 px-3 py-2.5 text-left transition-colors hover:border-gold/40"
    >
      <span>
        <span className="block text-sm text-cream">{label}</span>
        {sub && <span className="block text-[11px] text-grey">{sub}</span>}
      </span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-gold" : "bg-cream/15")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full transition-all", checked ? "left-[18px] bg-ink" : "left-0.5 bg-cream")} />
      </span>
    </button>
  );
}

/** Millimetre field: edits freely, commits on blur / Enter, clamps to range. */
export function NumField({ label, value, min, max, step = 10, onCommit, unit = "mm", disabled }: { label: string; value: number; min?: number; max?: number; step?: number; onCommit: (v: number) => void; unit?: string; disabled?: boolean }) {
  const [text, setText] = useState(String(Math.round(value)));
  useEffect(() => setText(String(Math.round(value))), [value]);
  const commit = () => {
    let v = parseFloat(text);
    if (Number.isNaN(v)) {
      setText(String(Math.round(value)));
      return;
    }
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    onCommit(v);
    setText(String(Math.round(v)));
  };
  const invalid = (() => {
    const v = parseFloat(text);
    return !Number.isNaN(v) && ((min !== undefined && v < min) || (max !== undefined && v > max));
  })();
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-[11px] text-grey">
        {label}
        {min !== undefined && max !== undefined && <span className="text-grey/60">{min}–{max}</span>}
      </span>
      <span className={cn("flex items-center rounded-lg border bg-ink/60 pr-2", invalid ? "border-red-400/70" : "border-gold/15 focus-within:border-gold")}>
        <input
          type="number"
          inputMode="numeric"
          step={step}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur(), undefined)}
          className="w-full bg-transparent px-3 py-2 text-sm text-cream outline-none disabled:opacity-40"
        />
        <span className="text-[10px] text-grey">{unit}</span>
      </span>
      {invalid && <span className="mt-1 block text-[10px] text-red-300">Allowed range is {min}–{max} {unit}.</span>}
    </label>
  );
}

export function RangeField({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-xs text-grey">
        {label}
        <span className="text-cream">{format ? format(value) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-cream/15 accent-[#c6a86a]" />
    </label>
  );
}

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between text-xs text-grey">
      {label}
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-7 w-7 rounded-full border border-gold/30 text-gold disabled:opacity-30">
          −
        </button>
        <span className="w-4 text-center text-cream">{value}</span>
        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="h-7 w-7 rounded-full border border-gold/30 text-gold disabled:opacity-30">
          +
        </button>
      </div>
    </div>
  );
}

export function Chip({ active, children, onClick, title }: { active?: boolean; children: ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn("rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors", active ? "border-gold bg-gold text-ink" : "border-gold/25 text-grey hover:border-gold/60 hover:text-cream")}
    >
      {children}
    </button>
  );
}

export function Btn({ children, onClick, variant = "outline", disabled, title, className }: { children: ReactNode; onClick?: () => void; variant?: "solid" | "outline" | "ghost" | "danger"; disabled?: boolean; title?: string; className?: string }) {
  const styles = {
    solid: "bg-gold text-ink hover:bg-gold-light",
    outline: "border border-gold/40 text-gold hover:bg-gold/10",
    ghost: "text-grey hover:text-cream",
    danger: "border border-red-400/40 text-red-300 hover:bg-red-400/10",
  } as const;
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={cn("rounded-lg px-3 py-2 text-[11px] uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-35", styles[variant], className)}>
      {children}
    </button>
  );
}

export function Swatch({ color, texture, active, title, onClick, size = "h-9 w-9" }: { color: string; texture?: "wood" | string; active?: boolean; title: string; onClick: () => void; size?: string }) {
  const background = texture === "wood" ? `repeating-linear-gradient(90deg, ${color} 0 5px, color-mix(in srgb, ${color} 70%, black) 5px 6px)` : color;
  return (
    <button type="button" title={title} aria-label={title} aria-pressed={active} onClick={onClick} className={cn("rounded-full border-2 transition-transform hover:scale-110", size, active ? "scale-110 border-gold" : "border-cream/20")} style={{ background }} />
  );
}

export function SelectBox({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink/60 px-3 py-2 text-sm text-cream outline-none focus:border-gold">
      {options.map((o) => (
        <option key={o.id} value={o.id} className="bg-charcoal">
          {o.label}
        </option>
      ))}
    </select>
  );
}
