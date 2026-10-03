import { BOARD_BRANDS_BY_NAME, BOARD_TYPES_BY_ID, type BoardBrand, type FullBoardType } from "./boardCatalog";
import { CEILING_BRANDS_BY_NAME, CEILING_RATING_ROWS, CEILING_TYPES_BY_ID } from "./ceilingCatalog";
import { PAINT_BRANDS_BY_NAME, PAINT_RATING_ROWS, PAINT_TYPES_BY_ID } from "./paintCatalog";
import { FLOORING_BRANDS_BY_NAME, FLOORING_RATING_ROWS, FLOORING_TYPES_BY_ID } from "./flooringCatalog";

export interface CatalogConfig {
  /** Brands by display name (must match the names in materials.ts). */
  brands: Record<string, BoardBrand>;
  types: Record<string, FullBoardType>;
  ratingRows: { key: string; label: string }[];
  noun: string;
  sizeLabel: string;
}

const BOARD_RATING_ROWS = [
  { key: "waterResistance", label: "Water resistance" },
  { key: "strength", label: "Strength" },
  { key: "screwHolding", label: "Screw holding" },
  { key: "smoothFinish", label: "Smooth finish" },
  { key: "termiteProtection", label: "Termite protection" },
  { key: "fireResistance", label: "Fire resistance" },
  { key: "cost", label: "Price level" },
];

/** Catalogue config per material-category id (see materials.ts). */
export const CATALOGS: Record<string, CatalogConfig> = {
  boards: {
    brands: BOARD_BRANDS_BY_NAME,
    types: BOARD_TYPES_BY_ID,
    ratingRows: BOARD_RATING_ROWS,
    noun: "boards",
    sizeLabel: "Thickness",
  },
  ceiling: {
    brands: CEILING_BRANDS_BY_NAME,
    types: CEILING_TYPES_BY_ID,
    ratingRows: CEILING_RATING_ROWS,
    noun: "products",
    sizeLabel: "Thickness",
  },
  paints: {
    brands: PAINT_BRANDS_BY_NAME,
    types: PAINT_TYPES_BY_ID,
    ratingRows: PAINT_RATING_ROWS,
    noun: "products",
    sizeLabel: "Pack sizes",
  },
  flooring: {
    brands: FLOORING_BRANDS_BY_NAME,
    types: FLOORING_TYPES_BY_ID,
    ratingRows: FLOORING_RATING_ROWS,
    noun: "floors",
    sizeLabel: "Thickness",
  },
};
