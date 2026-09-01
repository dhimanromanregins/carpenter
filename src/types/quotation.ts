// Mirrors backend/app/schemas/*.py exactly (snake_case on the wire).

export type DimensionUnit = "FEET" | "INCHES" | "METERS" | "CENTIMETERS";
export type AreaMode = "total_area" | "dimensions";
export type RunningFeetState = "CUSTOMER_PROVIDED" | "ESTIMATED";
export type QuotationType = "package" | "custom";
export type PantryTypeCode = "SINGLE" | "DOUBLE" | "TRIPLE";
export type HardwareCategory = "HINGES" | "DRAWER_CHANNELS" | "PANTRY" | "LIFT_UP" | "OTHER";

export interface QuotationConfig {
  currency: string;
  dimension_units: DimensionUnit[];
  quotation_types: QuotationType[];
  hardware_categories: HardwareCategory[];
  pantry_types: PantryTypeCode[];
  installation_pct: number;
  tax_pct: number;
}

export interface Package {
  id: string;
  name: string;
  rate_per_sqft: number;
  included_items: string[];
  description: string;
  display_order: number;
}

export interface AreaCalculateRequest {
  mode: AreaMode;
  area_sqft?: number;
  length?: number;
  width?: number;
  unit?: DimensionUnit;
}

export interface AreaCalculateResponse {
  mode: AreaMode;
  area_sqft: number;
  running_feet: number;
  running_feet_state: RunningFeetState;
}

export interface BoardProduct {
  id: number;
  brand_name: string;
  name: string;
  board_type: string;
  thickness: string | null;
  price_per_sqft: number;
  image_url: string;
  description: string;
}

export interface ShutterProduct {
  id: number;
  brand_name: string;
  name: string;
  finish_type: string;
  price_per_sqft: number;
  image_url: string;
  description: string;
}

export interface GlassCabinetProduct {
  id: number;
  name: string;
  pricing_mode: "FLAT_PER_CABINET" | "PER_SQFT";
  price: number;
  description: string;
}

export interface PantryTypeProduct {
  id: number;
  pantry_type: PantryTypeCode;
  name: string;
  base_price: number;
  description: string;
}

export interface HardwareBrand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  tier: string;
}

export interface HardwareProduct {
  id: number;
  category: HardwareCategory;
  brand_id: number;
  brand_name: string;
  name: string;
  unit: string;
  price: number;
}

export interface RollingShutterProduct {
  id: number;
  name: string;
  price_per_sqft: number;
  description: string;
}

export interface ScrewProduct {
  id: number;
  brand_name: string;
  name: string;
  price_per_piece: number;
  description: string;
}

export interface LightingProduct {
  id: number;
  brand_name: string;
  name: string;
  price_per_piece: number;
  image_url: string;
  description: string;
}

export interface AreaInput {
  area_sqft: number;
  running_feet?: number | null;
}

export interface GlassCabinetCustomItem {
  width: number;
  height: number;
  unit: DimensionUnit;
  quantity: number;
}

export interface GlassCabinetSelection {
  enabled: boolean;
  standard_quantity: number;
  custom_items: GlassCabinetCustomItem[];
}

export interface PantrySelection {
  enabled: boolean;
  pantry_type_id?: number | null;
}

export interface HardwareSelection {
  use_brand_throughout: boolean;
  brand_id?: number | null;
  hinges_product_id?: number | null;
  drawer_channels_product_id?: number | null;
  pantry_product_id?: number | null;
  lift_up_product_id?: number | null;
  other_product_id?: number | null;
}

export interface RollingShutterSelection {
  enabled: boolean;
  product_id?: number | null;
  quantity: number;
  width?: number | null;
  height?: number | null;
  unit?: DimensionUnit | null;
}

export interface LightingItem {
  product_id: number;
  quantity: number;
}

export interface CustomQuotationInput {
  board_id?: number | null;
  shutter_id?: number | null;
  shutter_area_sqft?: number | null;
  glass_cabinets: GlassCabinetSelection;
  pantry: PantrySelection;
  hardware: HardwareSelection;
  rolling_shutter: RollingShutterSelection;
  screw_id?: number | null;
  lighting: LightingItem[];
}

export interface QuotationCalculateRequest {
  quotation_type: QuotationType;
  package_id?: string | null;
  area: AreaInput;
  custom?: CustomQuotationInput | null;
}

export interface QuoteLineItem {
  role: string;
  label: string;
  subtotal: number;
  detail: Record<string, unknown>;
}

export interface QuotationCalculateResponse {
  quotation_type: QuotationType;
  package: Package | null;
  area_sqft: number;
  line_items: QuoteLineItem[];
  subtotal: number;
  installation: number;
  tax: number;
  total: number;
  currency: string;
}

export interface QuotationSaveRequest extends QuotationCalculateRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
}

export interface QuotationSavedOut extends QuotationCalculateResponse {
  id: number;
  quotation_number: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
}
