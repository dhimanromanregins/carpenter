// Types mirror the backend's actual (snake_case) response shapes exactly —
// verified against a live instance of apps/quotation (Django/DRF) rather than
// hand-guessed, so these are the real contract, not an approximation.

export type ProductTier = "STANDARD" | "LUXURY";

export interface Product {
  id: number;
  brand: number;
  brand_name: string;
  category: number;
  category_code: string;
  name: string;
  slug: string;
  description: string;
  tier: ProductTier;
  grade: string;
  unit: "sqft" | "running_ft" | "piece" | string;
  base_price: number | null;
  price_per_sqft: string | null;
  price_per_running_ft: string | null;
  price_per_piece: string | null;
  image_url: string;
  features: Record<string, unknown>;
  recommended_for: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string | number;
  tier?: ProductTier;
  spaceType?: string;
  recommendedFor?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  category: string;
  tier: ProductTier;
  description: string;
  logo: string;
  website: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandFilters {
  category?: string;
  tier?: ProductTier;
}

export interface Category {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  region: string;
  state: string;
  is_active: boolean;
}

// Only KITCHEN is wired up end-to-end today; the rest of the union documents
// where the backend/UI are headed as more spaces come online.
export type SpaceType =
  | "KITCHEN"
  | "WARDROBE"
  | "TV_PANEL"
  | "FALSE_CEILING"
  | "WALL_PANEL"
  | "BEDROOM"
  | "LIVING_ROOM"
  | "FLOORING"
  | "CUSTOM_FURNITURE";

export type DimensionUnit = "FT" | "CM" | "MM" | "INCH";

export interface QuoteAccessorySelection {
  accessory_id: number;
  quantity: number;
}

export interface QuoteSpaceConfiguration {
  board_product_id?: number;
  hardware_product_id?: number;
  laminate_product_id?: number;
  countertop_product_id?: number;
  sink_product_id?: number;
  hob_product_id?: number;
  chimney_product_id?: number;
  flooring_product_id?: number;
  ceiling_product_id?: number;
  paint_product_id?: number;
  veneer_product_id?: number;
  adhesive_product_id?: number;
  lighting_product_id?: number;
  accessories?: QuoteAccessorySelection[];
}

export type ConfigurationRoleKey = Exclude<keyof QuoteSpaceConfiguration, "accessories">;

export interface QuoteSpaceInput {
  type: SpaceType;
  name?: string;
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  configuration: QuoteSpaceConfiguration;
}

export interface QuoteCalculateRequest {
  city?: string;
  discount_code?: string;
  spaces: QuoteSpaceInput[];
}

export interface QuoteMaterialLine {
  role: string;
  product_id: number;
  product_name: string;
  brand_name: string;
  category: string;
  unit: string;
  quantity: number;
  unit_price: number;
  tier_multiplier: number;
  total: number;
}

export interface QuoteSpaceBreakdown {
  name: string;
  type: SpaceType;
  area: number;
  running_feet: number;
  base: number;
  materials: QuoteMaterialLine[];
  accessories: unknown[];
  installation: number;
  subtotal: number;
  total: number;
}

export interface QuoteCalculateResponse {
  currency: string;
  subtotal: number;
  installation: number;
  discount: number;
  tax: number;
  total: number;
  breakdown: QuoteSpaceBreakdown[];
}

export interface RecommendationCriteria {
  space_type: SpaceType;
  budget?: number;
  budget_tier?: string;
  durability?: "LOW" | "MEDIUM" | "HIGH";
  moisture_exposure?: "LOW" | "MEDIUM" | "HIGH";
}

export interface RecommendationItem {
  category: string;
  product: {
    id: number;
    name: string;
    brand: string;
    tier: ProductTier;
    unit: string;
    image_url: string;
  };
  reason: string;
}

export interface RecommendationResponse {
  space_type: SpaceType;
  budget_tier: string;
  recommendations: RecommendationItem[];
  configuration: QuoteSpaceConfiguration;
}
