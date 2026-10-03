/**
 * Pricing & bill-of-quantities engine. Pure functions over KitchenDesignConfig;
 * no visual component knows a price. Rates live in `RATES` so they can be swapped
 * for a database / CMS later.
 */
import type { KitchenDesignConfig, ModuleInstance } from "../model/types";
import { getModuleType } from "../data/modules";
import { getProduct, SINKS, FAUCETS } from "../data/products";
import { resolveMaterial } from "../data/materials";
import { HANDLE_FINISH_BY_ID, HANDLE_STYLES, SHUTTER_STYLE_BY_ID } from "../data/handles";
import { buildCounterSlabs, slabAreaSqm } from "./countertop";
import { sqft, sqm } from "../model/units";

/** All rates in INR. Replace with real figures. */
export const RATES = {
  /** Backing carcass material, per m² of carcass front area (included in module rate; kept for BOQ). */
  carcassSheetPerSqm: 1800,
  /** Counter edge profile surcharge per running metre. */
  edgePerMetre: { straight: 0, bullnose: 650, chamfer: 450, waterfall: 4200 } as Record<string, number>,
  /** Countertop rate per m² at material multiplier 1.0 (20 mm). */
  counterPerSqm: 9500,
  thicknessFactor: (t: number) => (t <= 20 ? 1 : t <= 30 ? 1.18 : 1.4),
  backsplashPerSqm: 6200,
  installationPct: 0.08,
  labourPct: 0.07,
  /** Delivery + site protection, flat. */
  logistics: 6000,
  gstPct: 0.18,
};

export interface BoqLine {
  category: string;
  item: string;
  detail?: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface CostBreakdown {
  material: number;
  hardware: number;
  accessories: number;
  appliances: number;
  countertop: number;
  installation: number;
  labour: number;
  subtotal: number;
  gst: number;
  total: number;
}

export interface Quotation {
  lines: BoqLine[];
  cabinetList: { type: string; qty: number; size: string; finish: string; zone: string }[];
  breakdown: CostBreakdown;
  areaSqft: number;
  materialSheetSqm: Record<string, number>;
}

const finishOf = (m: ModuleInstance, d: KitchenDesignConfig) => resolveMaterial(m.overrides.shutterMaterial ?? d.style.shutterMaterial);


export interface ModuleCost {
  material: number;
  hardware: number;
  accessories: number;
  appliances: number;
  total: number;
  finish: string;
  finishId: string;
}

/** Cost of one module: carcass + shutters, handles, built-in hardware and appliances. */
export function costOfModule(design: KitchenDesignConfig, m: ModuleInstance): ModuleCost {
  const t = getModuleType(m.typeId);
  const mat = finishOf(m, design);
  const shutterStyle = SHUTTER_STYLE_BY_ID[m.overrides.shutterStyle ?? design.style.shutterStyle];
  const material = sqm(m.width, m.height) * t.ratePerSqm * mat.priceMultiplier * shutterStyle.priceMultiplier;
  let hardware = 0;
  let accessories = 0;
  let appliances = 0;

  const hs = m.overrides.handleStyle ?? design.style.handleStyle;
  const hf = m.overrides.handleFinish ?? design.style.handleFinish;
  if (hs !== "none" && !shutterStyle.handleless && t.kind !== "filler") {
    const per = (HANDLE_STYLES.find((h) => h.id === hs)?.price ?? 0) + HANDLE_FINISH_BY_ID[hf].price;
    accessories += per * handleCount(m);
  }

  const ids = [...(t.includes ?? []), ...(m.params.hardware ? [m.params.hardware] : []), ...(m.params.organiser ? [m.params.organiser] : [])];
  ids.forEach((id) => {
    const p = getProduct(id);
    if (!p) return;
    if (p.category === "appliance") appliances += p.price;
    else if (p.category === "accessory") accessories += p.price;
    else hardware += p.price;
  });
  if (m.params.appliance && !(t.includes ?? []).includes(m.params.appliance)) {
    const p = getProduct(m.params.appliance);
    if (p) appliances += p.price;
  }
  (m.params.topItems ?? []).forEach((id) => {
    const p = getProduct(id);
    if (p) appliances += p.price;
  });
  return { material, hardware, accessories, appliances, total: material + hardware + accessories + appliances, finish: mat.name, finishId: mat.id };
}

export function priceDesign(design: KitchenDesignConfig): Quotation {
  const lines: BoqLine[] = [];
  const add = (l: Omit<BoqLine, "amount">) => lines.push({ ...l, amount: Math.round(l.qty * l.rate) });
  const sheet: Record<string, number> = {};
  const cabinets = new Map<string, { type: string; qty: number; size: string; finish: string; zone: string }>();

  let material = 0;
  let hardware = 0;
  let accessories = 0;
  let appliances = 0;
  let frontArea = 0;

  design.modules.forEach((m) => {
    const t = getModuleType(m.typeId);
    const c = costOfModule(design, m);
    frontArea += sqft(m.width, m.height);
    material += c.material;
    hardware += c.hardware;
    accessories += c.accessories;
    appliances += c.appliances;
    sheet[c.finish] = (sheet[c.finish] ?? 0) + sqm(m.width, m.height);
    const key = `${m.typeId}|${Math.round(m.width)}x${Math.round(m.height)}x${Math.round(m.depth)}|${c.finishId}`;
    const prev = cabinets.get(key);
    if (prev) prev.qty += 1;
    else cabinets.set(key, { type: t.name, qty: 1, size: `${Math.round(m.width)} × ${Math.round(m.height)} × ${Math.round(m.depth)} mm`, finish: c.finish, zone: t.zone });
  });

  // sink, faucet, hob
  const sinks = design.modules.filter((m) => getModuleType(m.typeId).kind === "base-sink");
  const sinkDef = SINKS.find((s) => s.id === design.style.sinkType) ?? SINKS[0];
  const faucetDef = FAUCETS.find((f) => f.id === design.style.faucetType) ?? FAUCETS[0];
  appliances += sinks.length * (sinkDef.price + faucetDef.price);
  const hobs = design.modules.filter((m) => getModuleType(m.typeId).kind === "base-hob");
  const hobP = getProduct(design.style.hobType);
  if (hobP) appliances += hobs.length * hobP.price;
  const chimneys = design.modules.filter((m) => getModuleType(m.typeId).kind === "wall-chimney");
  const chimP = getProduct(design.style.chimneyType);
  if (chimP) appliances += chimneys.length * chimP.price;

  // countertop
  const slabs = buildCounterSlabs(design);
  const counterMat = resolveMaterial(design.style.counterMaterial);
  const counterArea = slabAreaSqm(slabs, design.style.counterOverhang);
  let counter = counterArea * RATES.counterPerSqm * counterMat.priceMultiplier * RATES.thicknessFactor(design.style.counterThickness);
  const edgeMetres = slabs.reduce((n, s) => n + (s.x1 - s.x0 + (s.z1 - s.z0)) / 1000, 0);
  counter += edgeMetres * (RATES.edgePerMetre[design.style.counterEdge] ?? 0);
  if (design.style.backsplash.enabled) {
    const bs = resolveMaterial(design.style.backsplash.material);
    const runMetres = slabs.filter((s) => s.wallBack).reduce((n, s) => n + (s.x1 - s.x0 > s.z1 - s.z0 ? s.x1 - s.x0 : s.z1 - s.z0) / 1000, 0);
    counter += runMetres * (design.style.backsplash.height / 1000) * RATES.backsplashPerSqm * bs.priceMultiplier;
  }

  // BOQ lines
  add({ category: "Cabinets", item: "Cabinet modules (carcass + shutters)", detail: `${design.modules.length} modules`, qty: Math.round(frontArea * 10) / 10, unit: "sq ft front", rate: material / Math.max(frontArea, 1) });
  add({ category: "Hardware", item: "Drawer systems, pull-outs, corner & lift mechanisms", qty: 1, unit: "lot", rate: hardware });
  add({ category: "Accessories", item: "Handles, organisers & accessories", qty: 1, unit: "lot", rate: accessories });
  add({ category: "Appliances", item: "Appliances, sink, faucet, hob, chimney", qty: 1, unit: "lot", rate: appliances });
  add({ category: "Countertop", item: `${counterMat.name} countertop & backsplash`, detail: `${(counterArea * SQ_FT).toFixed(1)} sq ft`, qty: 1, unit: "lot", rate: counter });

  const base = material + hardware + accessories + appliances + counter;
  const installation = base * RATES.installationPct + RATES.logistics;
  const labour = base * RATES.labourPct;
  add({ category: "Installation", item: "Installation, delivery & site protection", qty: 1, unit: "lot", rate: installation });
  add({ category: "Labour", item: "Carpentry & fitting labour", qty: 1, unit: "lot", rate: labour });
  // fix the first (cabinet) line's amount
  lines[0].amount = Math.round(material);

  const subtotal = material + hardware + accessories + appliances + counter + installation + labour;
  const gst = subtotal * RATES.gstPct;
  return {
    lines,
    cabinetList: [...cabinets.values()],
    breakdown: {
      material: Math.round(material),
      hardware: Math.round(hardware),
      accessories: Math.round(accessories),
      appliances: Math.round(appliances),
      countertop: Math.round(counter),
      installation: Math.round(installation),
      labour: Math.round(labour),
      subtotal: Math.round(subtotal),
      gst: Math.round(gst),
      total: Math.round(subtotal + gst),
    },
    areaSqft: Math.round(frontArea * 10) / 10,
    materialSheetSqm: Object.fromEntries(Object.entries(sheet).map(([k, v]) => [k, Math.round(v * 100) / 100])),
  };
}

const SQ_FT = 10.7639;

/** Number of handles a module carries (one per door / drawer front). */
export function handleCount(m: ModuleInstance): number {
  const k = getModuleType(m.typeId).kind;
  switch (k) {
    case "base-doors":
    case "wall-doors":
    case "wall-glass":
    case "wall-lift":
      return m.width >= 600 ? 2 : 1;
    case "base-drawers":
    case "base-cutlery":
      return m.params.drawers ?? 3;
    case "base-sink":
    case "base-hob":
      return 2;
    case "base-corner":
    case "base-bottle":
      return 1;
    case "base-dustbin":
      return 1;
    case "tall-pantry":
    case "tall-storage":
    case "tall-utility":
      return 2;
    case "tall-oven":
    case "tall-fridge":
      return 1;
    default:
      return 0;
  }
}

/** CSV export of the full BOQ. */
export function quotationToCsv(q: Quotation, design: KitchenDesignConfig): string {
  const rows: string[][] = [];
  rows.push(["Kitchen quotation", design.name]);
  rows.push([]);
  rows.push(["Category", "Item", "Detail", "Qty", "Unit", "Rate (INR)", "Amount (INR)"]);
  q.lines.forEach((l) => rows.push([l.category, l.item, l.detail ?? "", String(l.qty), l.unit, String(Math.round(l.rate)), String(l.amount)]));
  rows.push([]);
  rows.push(["Cabinet list"]);
  rows.push(["Type", "Qty", "Size", "Finish", "Zone"]);
  q.cabinetList.forEach((c) => rows.push([c.type, String(c.qty), c.size, c.finish, c.zone]));
  rows.push([]);
  rows.push(["Subtotal", String(q.breakdown.subtotal)], ["GST", String(q.breakdown.gst)], ["Total", String(q.breakdown.total)]);
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

/** Aggregated hardware / appliance / accessory products used in the design (for the BOQ). */
export function bomProducts(design: KitchenDesignConfig): { product: NonNullable<ReturnType<typeof getProduct>>; qty: number }[] {
  const counts = new Map<string, number>();
  const add = (id: string | undefined) => id && counts.set(id, (counts.get(id) ?? 0) + 1);
  design.modules.forEach((m) => {
    const t = getModuleType(m.typeId);
    (t.includes ?? []).forEach(add);
    add(m.params.hardware);
    add(m.params.organiser);
    if (m.params.appliance && !(t.includes ?? []).includes(m.params.appliance)) add(m.params.appliance);
    (m.params.topItems ?? []).forEach(add);
  });
  const sinks = design.modules.filter((m) => getModuleType(m.typeId).kind === "base-sink").length;
  for (let i = 0; i < sinks; i++) {
    add(design.style.sinkType);
    add(design.style.faucetType);
  }
  design.modules.filter((m) => getModuleType(m.typeId).kind === "base-hob").forEach(() => add(design.style.hobType));
  design.modules.filter((m) => getModuleType(m.typeId).kind === "wall-chimney").forEach(() => add(design.style.chimneyType));
  return [...counts.entries()]
    .map(([id, qty]) => ({ product: getProduct(id), qty }))
    .filter((x): x is { product: NonNullable<ReturnType<typeof getProduct>>; qty: number } => !!x.product);
}
