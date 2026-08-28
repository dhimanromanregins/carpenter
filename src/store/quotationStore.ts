import { create } from "zustand";
import type {
  ConfigurationRoleKey,
  DimensionUnit,
  QuoteSpaceConfiguration,
  SpaceType,
} from "@/api/types";

export interface SpaceState {
  id: string;
  type: SpaceType;
  name: string;
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
  configuration: QuoteSpaceConfiguration;
}

function createKitchenSpace(): SpaceState {
  return {
    id: "kitchen",
    type: "KITCHEN",
    name: "Kitchen",
    length: 10,
    width: 8,
    height: 8,
    unit: "FT",
    configuration: {},
  };
}

interface QuotationState {
  city: string;
  // Shaped as an array (matching the backend's `spaces: [...]` payload) even
  // though this slice always seeds exactly one Kitchen space, so adding more
  // space types later is additive rather than a state-shape rewrite.
  spaces: SpaceState[];
  setCity: (city: string) => void;
  updateDimensions: (spaceId: string, dims: Partial<Pick<SpaceState, "length" | "width" | "height">>) => void;
  setProductSelection: (spaceId: string, role: ConfigurationRoleKey, productId: number | undefined) => void;
  applyConfiguration: (spaceId: string, configuration: QuoteSpaceConfiguration) => void;
}

export const useQuotationStore = create<QuotationState>((set) => ({
  city: "Chandigarh",
  spaces: [createKitchenSpace()],

  setCity: (city) => set({ city }),

  updateDimensions: (spaceId, dims) =>
    set((state) => ({
      spaces: state.spaces.map((space) =>
        space.id === spaceId ? { ...space, ...dims } : space
      ),
    })),

  setProductSelection: (spaceId, role, productId) =>
    set((state) => ({
      spaces: state.spaces.map((space) =>
        space.id === spaceId
          ? { ...space, configuration: { ...space.configuration, [role]: productId } }
          : space
      ),
    })),

  applyConfiguration: (spaceId, configuration) =>
    set((state) => ({
      spaces: state.spaces.map((space) =>
        space.id === spaceId
          ? { ...space, configuration: { ...space.configuration, ...configuration } }
          : space
      ),
    })),
}));
