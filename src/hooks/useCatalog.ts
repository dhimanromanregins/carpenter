import { useQuery } from "@tanstack/react-query";
import { getQuotationConfig } from "@/api/config";
import { getPackages } from "@/api/packages";
import {
  getBoards,
  getGlassCabinets,
  getHardware,
  getHardwareBrands,
  getLighting,
  getPantryTypes,
  getRollingShutters,
  getScrewBrands,
  getShutters,
} from "@/api/products";
import type { HardwareCategory } from "@/types/quotation";

// Product/brand/package catalogs change rarely relative to how often a step
// re-renders — a longer staleTime avoids refetching the same list every time
// the user revisits a step.
const CATALOG_STALE_TIME = 5 * 60 * 1000;

export function useQuotationConfig() {
  return useQuery({ queryKey: ["quotation-config"], queryFn: ({ signal }) => getQuotationConfig(signal), staleTime: CATALOG_STALE_TIME });
}

export function usePackages() {
  return useQuery({ queryKey: ["packages"], queryFn: ({ signal }) => getPackages(signal), staleTime: CATALOG_STALE_TIME });
}

export function useBoards() {
  return useQuery({ queryKey: ["boards"], queryFn: ({ signal }) => getBoards(signal), staleTime: CATALOG_STALE_TIME });
}

export function useShutters() {
  return useQuery({ queryKey: ["shutters"], queryFn: ({ signal }) => getShutters(signal), staleTime: CATALOG_STALE_TIME });
}

export function useGlassCabinets() {
  return useQuery({ queryKey: ["glass-cabinets"], queryFn: ({ signal }) => getGlassCabinets(signal), staleTime: CATALOG_STALE_TIME });
}

export function usePantryTypes() {
  return useQuery({ queryKey: ["pantry-types"], queryFn: ({ signal }) => getPantryTypes(signal), staleTime: CATALOG_STALE_TIME });
}

export function useHardwareBrands() {
  return useQuery({ queryKey: ["hardware-brands"], queryFn: ({ signal }) => getHardwareBrands(signal), staleTime: CATALOG_STALE_TIME });
}

export function useHardwareByCategory(category: HardwareCategory, brandId?: number) {
  return useQuery({
    queryKey: ["hardware", category, brandId],
    queryFn: ({ signal }) => getHardware(category, brandId, signal),
    staleTime: CATALOG_STALE_TIME,
  });
}

export function useRollingShutters() {
  return useQuery({ queryKey: ["rolling-shutters"], queryFn: ({ signal }) => getRollingShutters(signal), staleTime: CATALOG_STALE_TIME });
}

export function useScrewBrands() {
  return useQuery({ queryKey: ["screws"], queryFn: ({ signal }) => getScrewBrands(signal), staleTime: CATALOG_STALE_TIME });
}

export function useLighting() {
  return useQuery({ queryKey: ["lighting"], queryFn: ({ signal }) => getLighting(signal), staleTime: CATALOG_STALE_TIME });
}
