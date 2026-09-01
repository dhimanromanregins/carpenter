import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AreaMode,
  CustomQuotationInput,
  DimensionUnit,
  GlassCabinetCustomItem,
  LightingItem,
  QuotationType,
} from "@/types/quotation";

export const CUSTOM_STEPS = [
  "board",
  "shutter",
  "glassCabinets",
  "pantry",
  "pantryHardwareBrand",
  "individualHardware",
  "rollingShutter",
  "screws",
  "lighting",
] as const;
export type CustomStep = (typeof CUSTOM_STEPS)[number];

export type BuilderStage = "area" | "packageOrCustom" | "packageEstimate" | "custom" | "customerInfo";

interface AreaState {
  mode: AreaMode;
  areaSqft: number | null;
  length: number | null;
  width: number | null;
  unit: DimensionUnit;
  runningFeet: number | null;
}

interface CustomerState {
  name: string;
  phone: string;
  email: string;
}

function emptyCustom(): CustomQuotationInput {
  return {
    board_id: null,
    shutter_id: null,
    shutter_area_sqft: null,
    glass_cabinets: { enabled: false, standard_quantity: 0, custom_items: [] },
    pantry: { enabled: false, pantry_type_id: null },
    hardware: {
      use_brand_throughout: false,
      brand_id: null,
      hinges_product_id: null,
      drawer_channels_product_id: null,
      pantry_product_id: null,
      lift_up_product_id: null,
      other_product_id: null,
    },
    rolling_shutter: { enabled: false, product_id: null, quantity: 1, width: null, height: null, unit: null },
    screw_id: null,
    lighting: [],
  };
}

interface QuotationState {
  stage: BuilderStage;
  quotationType: QuotationType | null;
  area: AreaState;
  packageId: string | null;
  custom: CustomQuotationInput;
  customStepIndex: number;
  customer: CustomerState;

  setStage(stage: BuilderStage): void;
  setAreaMode(mode: AreaMode): void;
  setAreaSqft(value: number | null): void;
  setDimensions(length: number | null, width: number | null): void;
  setUnit(unit: DimensionUnit): void;
  applyAreaResult(areaSqft: number, runningFeet: number): void;

  chooseQuotationType(type: QuotationType): void;
  selectPackage(packageId: string): void;

  setBoard(boardId: number | null): void;
  setShutter(shutterId: number | null, areaSqft?: number | null): void;
  setGlassCabinetsEnabled(enabled: boolean): void;
  setGlassCabinetStandardQuantity(quantity: number): void;
  addGlassCabinetCustomItem(item: GlassCabinetCustomItem): void;
  removeGlassCabinetCustomItem(index: number): void;
  setPantryEnabled(enabled: boolean): void;
  setPantryType(pantryTypeId: number | null): void;
  setHardwareBrandThroughout(brandId: number, throughout: boolean): void;
  setIndividualHardware(field: keyof CustomQuotationInput["hardware"], productId: number | null): void;
  setRollingShutter(update: Partial<CustomQuotationInput["rolling_shutter"]>): void;
  setScrew(screwId: number | null): void;
  addLightingItem(item: LightingItem): void;
  updateLightingQuantity(productId: number, quantity: number): void;
  removeLightingItem(productId: number): void;

  goToCustomStep(index: number): void;
  nextCustomStep(): void;
  prevCustomStep(): void;

  setCustomer(update: Partial<CustomerState>): void;

  reset(): void;
}

const initialArea: AreaState = { mode: "total_area", areaSqft: null, length: null, width: null, unit: "FEET", runningFeet: null };
const initialCustomer: CustomerState = { name: "", phone: "", email: "" };

export const useQuotationStore = create<QuotationState>()(
  persist(
    (set, get) => ({
      stage: "area",
      quotationType: null,
      area: initialArea,
      packageId: null,
      custom: emptyCustom(),
      customStepIndex: 0,
      customer: initialCustomer,

      setStage: (stage) => set({ stage }),
      setAreaMode: (mode) => set((s) => ({ area: { ...s.area, mode } })),
      setAreaSqft: (value) => set((s) => ({ area: { ...s.area, areaSqft: value } })),
      setDimensions: (length, width) => set((s) => ({ area: { ...s.area, length, width } })),
      setUnit: (unit) => set((s) => ({ area: { ...s.area, unit } })),
      applyAreaResult: (areaSqft, runningFeet) =>
        set((s) => ({ area: { ...s.area, areaSqft, runningFeet } })),

      chooseQuotationType: (type) =>
        set({ quotationType: type, stage: type === "package" ? "packageOrCustom" : "custom", customStepIndex: 0 }),
      selectPackage: (packageId) => set({ packageId, stage: "packageEstimate" }),

      setBoard: (boardId) => set((s) => ({ custom: { ...s.custom, board_id: boardId } })),
      setShutter: (shutterId, areaSqft) =>
        set((s) => ({
          custom: { ...s.custom, shutter_id: shutterId, shutter_area_sqft: areaSqft ?? s.custom.shutter_area_sqft },
        })),
      setGlassCabinetsEnabled: (enabled) =>
        set((s) => ({ custom: { ...s.custom, glass_cabinets: { ...s.custom.glass_cabinets, enabled } } })),
      setGlassCabinetStandardQuantity: (quantity) =>
        set((s) => ({
          custom: { ...s.custom, glass_cabinets: { ...s.custom.glass_cabinets, standard_quantity: Math.max(0, quantity) } },
        })),
      addGlassCabinetCustomItem: (item) =>
        set((s) => ({
          custom: {
            ...s.custom,
            glass_cabinets: {
              ...s.custom.glass_cabinets,
              custom_items: [...s.custom.glass_cabinets.custom_items, item],
            },
          },
        })),
      removeGlassCabinetCustomItem: (index) =>
        set((s) => ({
          custom: {
            ...s.custom,
            glass_cabinets: {
              ...s.custom.glass_cabinets,
              custom_items: s.custom.glass_cabinets.custom_items.filter((_, i) => i !== index),
            },
          },
        })),
      setPantryEnabled: (enabled) => set((s) => ({ custom: { ...s.custom, pantry: { ...s.custom.pantry, enabled } } })),
      setPantryType: (pantryTypeId) =>
        set((s) => ({ custom: { ...s.custom, pantry: { ...s.custom.pantry, pantry_type_id: pantryTypeId } } })),
      setHardwareBrandThroughout: (brandId, throughout) =>
        set((s) => ({
          custom: {
            ...s.custom,
            hardware: { ...s.custom.hardware, brand_id: brandId, use_brand_throughout: throughout },
          },
        })),
      setIndividualHardware: (field, productId) =>
        set((s) => ({ custom: { ...s.custom, hardware: { ...s.custom.hardware, [field]: productId } } })),
      setRollingShutter: (update) =>
        set((s) => ({ custom: { ...s.custom, rolling_shutter: { ...s.custom.rolling_shutter, ...update } } })),
      setScrew: (screwId) => set((s) => ({ custom: { ...s.custom, screw_id: screwId } })),
      addLightingItem: (item) =>
        set((s) => ({
          custom: {
            ...s.custom,
            lighting: s.custom.lighting.some((l) => l.product_id === item.product_id)
              ? s.custom.lighting
              : [...s.custom.lighting, item],
          },
        })),
      updateLightingQuantity: (productId, quantity) =>
        set((s) => ({
          custom: {
            ...s.custom,
            lighting: s.custom.lighting.map((l) => (l.product_id === productId ? { ...l, quantity } : l)),
          },
        })),
      removeLightingItem: (productId) =>
        set((s) => ({ custom: { ...s.custom, lighting: s.custom.lighting.filter((l) => l.product_id !== productId) } })),

      goToCustomStep: (index) => set({ customStepIndex: Math.max(0, Math.min(index, CUSTOM_STEPS.length - 1)) }),
      nextCustomStep: () => {
        const { custom, customStepIndex } = get();
        let next = customStepIndex + 1;
        // Skip individual-hardware step entirely when one brand covers the whole kitchen.
        if (CUSTOM_STEPS[next] === "individualHardware" && custom.hardware.use_brand_throughout) {
          next += 1;
        }
        if (next >= CUSTOM_STEPS.length) {
          set({ stage: "customerInfo" });
          return;
        }
        set({ customStepIndex: next });
      },
      prevCustomStep: () => {
        const { custom, customStepIndex } = get();
        let prev = customStepIndex - 1;
        if (prev >= 0 && CUSTOM_STEPS[prev] === "individualHardware" && custom.hardware.use_brand_throughout) {
          prev -= 1;
        }
        set({ customStepIndex: Math.max(0, prev) });
      },

      setCustomer: (update) => set((s) => ({ customer: { ...s.customer, ...update } })),

      reset: () =>
        set({
          stage: "area",
          quotationType: null,
          area: initialArea,
          packageId: null,
          custom: emptyCustom(),
          customStepIndex: 0,
          customer: initialCustomer,
        }),
    }),
    { name: "kitchen-quotation-draft" }
  )
);
