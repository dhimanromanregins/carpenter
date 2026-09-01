import { apiClient } from "./client";
import type {
  BoardProduct,
  GlassCabinetProduct,
  HardwareBrand,
  HardwareCategory,
  HardwareProduct,
  LightingProduct,
  PantryTypeProduct,
  RollingShutterProduct,
  ScrewProduct,
  ShutterProduct,
} from "@/types/quotation";

export function getBoards(signal?: AbortSignal) {
  return apiClient.get<BoardProduct[]>("v1/products/boards", { signal });
}

export function getShutters(signal?: AbortSignal) {
  return apiClient.get<ShutterProduct[]>("v1/products/shutters", { signal });
}

export function getGlassCabinets(signal?: AbortSignal) {
  return apiClient.get<GlassCabinetProduct[]>("v1/products/glass-cabinets", { signal });
}

export function getPantryTypes(signal?: AbortSignal) {
  return apiClient.get<PantryTypeProduct[]>("v1/products/pantry-types", { signal });
}

export function getHardwareBrands(signal?: AbortSignal) {
  return apiClient.get<HardwareBrand[]>("v1/products/hardware-brands", { signal });
}

export function getHardware(category: HardwareCategory, brandId?: number, signal?: AbortSignal) {
  return apiClient.get<HardwareProduct[]>("v1/products/hardware", {
    params: { category, brand_id: brandId },
    signal,
  });
}

export function getRollingShutters(signal?: AbortSignal) {
  return apiClient.get<RollingShutterProduct[]>("v1/products/rolling-shutters", { signal });
}

export function getScrewBrands(signal?: AbortSignal) {
  return apiClient.get<ScrewProduct[]>("v1/products/screws", { signal });
}

export function getLighting(signal?: AbortSignal) {
  return apiClient.get<LightingProduct[]>("v1/products/lighting", { signal });
}
