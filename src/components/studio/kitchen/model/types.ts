/**
 * Kitchen Studio data model.
 *
 * Everything the studio can render or price is described by `KitchenDesignConfig`.
 * It is plain JSON on purpose — it can be saved, loaded, diffed for undo/redo,
 * exported, priced, and (later) produced by an AI from a natural-language brief.
 *
 * All dimensions are millimetres. Plan coordinates: x runs left→right along the
 * back wall, z runs from the back wall (z = 0) towards the viewer (z = depth).
 */

export type WallSide = "back" | "left" | "right" | "front";
export type Rotation = 0 | 90 | 180 | 270;
export type Zone = "base" | "wall" | "tall" | "island";

/* ───────────────────────── room ───────────────────────── */

export interface WindowSpec {
  enabled: boolean;
  wall: WallSide;
  /** Centre of the opening along the wall, from the wall's left end (mm). */
  offset: number;
  width: number;
  height: number;
  sill: number;
}

export interface DoorSpec {
  enabled: boolean;
  wall: WallSide;
  offset: number;
  width: number;
  height: number;
}

export type ServicePointKind = "plumbing" | "gas" | "electrical" | "drain";
export interface ServicePoint {
  id: string;
  kind: ServicePointKind;
  wall: WallSide;
  offset: number;
  /** Height above the floor (mm). */
  height: number;
}

export interface Room {
  width: number;
  depth: number;
  height: number;
  wallThickness: number;
  window: WindowSpec;
  door: DoorSpec;
  points: ServicePoint[];
}

/* ───────────────────────── layouts ───────────────────────── */

export type LayoutId =
  | "straight"
  | "parallel"
  | "l-shape"
  | "u-shape"
  | "g-shape"
  | "island"
  | "peninsula"
  | "l-island"
  | "u-island"
  | "parallel-island"
  | "open-plan"
  | "breakfast"
  | "tall-wall";

/* ───────────────────────── catalogue entries ───────────────────────── */

export type ModuleKind =
  | "base-doors"
  | "base-drawers"
  | "base-sink"
  | "base-hob"
  | "base-corner"
  | "base-bottle"
  | "base-dustbin"
  | "base-open"
  | "base-dishwasher"
  | "base-washer"
  | "base-cutlery"
  | "base-glass"
  | "wall-doors"
  | "wall-lift"
  | "wall-glass"
  | "wall-open"
  | "wall-chimney"
  | "wall-microwave"
  | "wall-corner"
  | "wall-loft"
  | "tall-pantry"
  | "tall-fridge"
  | "tall-oven"
  | "tall-storage"
  | "tall-utility"
  | "tall-glass"
  | "filler";

export interface Range {
  min: number;
  max: number;
  default: number;
}

export interface ModuleType {
  id: string;
  kind: ModuleKind;
  zone: Zone;
  name: string;
  subcategory: string;
  manufacturer: string;
  sku: string;
  width: Range;
  height: Range;
  depth: Range;
  /** Standard widths offered in the library (mm). */
  standardWidths: number[];
  /** Price per m² of front area at multiplier 1.0. */
  ratePerSqm: number;
  /** Extra fixed price for built-in hardware / appliance. */
  fixedPrice: number;
  /** Corner / pull-out mechanisms etc. that the module includes. */
  includes?: string[];
  modelUrl?: string;
  description?: string;
}

/* ───────────────────────── module instances ───────────────────────── */

export type ShutterStyle =
  | "flat"
  | "profile"
  | "shaker"
  | "fluted"
  | "glass-alu"
  | "glass-wood"
  | "handleless-j"
  | "handleless-g"
  | "handleless-c"
  | "handleless-push"
  | "glass-frameless"
  | "glass-black";

export type HandleStyle = "knob" | "bar" | "edge" | "profile" | "none";
export type HandleFinishId = "black" | "chrome" | "brushed-steel" | "gold" | "brass" | "bronze";

export interface ModuleOverrides {
  shutterMaterial?: string;
  bodyMaterial?: string;
  shutterStyle?: ShutterStyle;
  handleStyle?: HandleStyle;
  handleFinish?: HandleFinishId;
  /** Glass tint for glass shutters (a `gl-*` material id). */
  glassMaterial?: string;
}

export interface ModuleParams {
  /** Number of drawers for drawer units. */
  drawers?: number;
  /** Number of dustbins / bottle trays etc. */
  count?: number;
  /** Interior shelves for door units. */
  shelves?: number;
  /** Hardware catalogue id fitted inside (corner mechanism, drawer system…). */
  hardware?: string;
  /** Interior organiser fitted in the first drawer. */
  organiser?: string;
  /** Door hinge side for single-door units. */
  hinge?: "left" | "right";
  /** Appliance catalogue ids placed on the countertop above this module. */
  topItems?: string[];
  /** Appliance catalogue id built into this module (oven tower, microwave…). */
  appliance?: string;
  /** How glass cabinet doors open. */
  glassMode?: "hinged" | "sliding" | "lift";
  /** Mirrored back panel inside a glass cabinet. */
  mirrorBack?: boolean;
  /** Glass shelves instead of board shelves. */
  glassShelves?: boolean;
  /** Interior LED on/off for this unit (defaults to the kitchen lighting setting). */
  led?: boolean;
}

export interface ModuleInstance {
  id: string;
  typeId: string;
  /** Centre of the footprint in plan (mm). */
  x: number;
  z: number;
  rot: Rotation;
  width: number;
  height: number;
  depth: number;
  /** Height of the module's underside above the floor (mm). 0 for base/tall. */
  elevation: number;
  /** Run this module belongs to (for counters & layout re-flow). */
  run: string;
  params: ModuleParams;
  overrides: ModuleOverrides;
}

/* ───────────────────────── global style ───────────────────────── */

export type CounterEdge = "straight" | "bullnose" | "chamfer" | "waterfall";

export interface KitchenStyle {
  shutterStyle: ShutterStyle;
  shutterMaterial: string;
  bodyMaterial: string;
  handleStyle: HandleStyle;
  handleFinish: HandleFinishId;
  counterMaterial: string;
  counterThickness: number;
  counterEdge: CounterEdge;
  counterOverhang: number;
  backsplash: { enabled: boolean; material: string; height: number };
  plinthHeight: number;
  wallCabinetBottom: number;
  floorMaterial: string;
  wallColor: string;
  /** Fill the gap between wall / tall units and the ceiling with loft cabinets. */
  toCeiling: boolean;
  /** Default glass tint for glass shutters. */
  glassMaterial: string;
  sinkType: string;
  faucetType: string;
  hobType: string;
  chimneyType: string;
}

/* ───────────────────────── lighting ───────────────────────── */

export type TimeOfDay = "day" | "evening" | "night" | "presentation";
export type ColourTemp = 2700 | 3000 | 4000 | 5000;

export interface LightingConfig {
  scene: TimeOfDay;
  ceiling: boolean;
  underCabinet: boolean;
  insideCabinet: boolean;
  toeKick: boolean;
  /** Vertical LED profiles in the gaps between cabinet fronts. */
  profile: boolean;
  /** Cove light on top of cabinets that stop short of the ceiling. */
  cove: boolean;
  /** LED under every shelf in glass and open units. */
  shelfLeds: boolean;
  pendants: boolean;
  spots: boolean;
  temperature: ColourTemp;
  brightness: number;
}

/* ───────────────────────── the complete design ───────────────────────── */

/* ───────────────────────── electrical ───────────────────────── */

export type ElectricalKind = "db" | "switchboard" | "socket" | "appliance" | "popup";
export type CircuitKind = "lighting" | "power" | "heavy";

export interface ElectricalPoint {
  id: string;
  kind: ElectricalKind;
  /** Wall the point sits on, or "free" for island pop-ups. */
  wall: WallSide | "free";
  /** Position along the wall (mm). For wall "back"/"front" this is x; for "left"/"right" it is z. */
  offset: number;
  height: number;
  x?: number;
  z?: number;
  label: string;
  circuit: CircuitKind;
  amps?: number;
  /** Switch count on a switch board. */
  switches?: number;
  moduleId?: string;
}

export interface KitchenDesignConfig {
  version: 1;
  name: string;
  room: Room;
  layout: LayoutId;
  modules: ModuleInstance[];
  style: KitchenStyle;
  lighting: LightingConfig;
  /** Switch boards, sockets and appliance points. */
  electrical: ElectricalPoint[];
  /** Show cutlery, pots, bottles, jars… inside opened units. */
  showContents: boolean;
}

/* ───────────────────────── validation ───────────────────────── */

export type Severity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  severity: Severity;
  message: string;
  moduleIds: string[];
}

/* ───────────────────────── products ───────────────────────── */

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  manufacturer: string;
  sku: string;
  price: number;
  /** mm — width × height × depth. */
  dims?: [number, number, number];
  finish?: string;
  loadKg?: number;
  modelUrl?: string;
  meta?: Record<string, string | number | boolean>;
}
