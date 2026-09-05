import { useQuery } from "@tanstack/react-query";
import { calculateTiles } from "@/api/tiles";
import type { TileInstallationMethod } from "@/types/quotation";

/** Backend-authoritative Standard/Premium totals for the given tiling area and installation method. */
export function useTileCalculation(areaSqft: number | null, installationMethod: TileInstallationMethod | null) {
  return useQuery({
    queryKey: ["tiles-calculate", areaSqft, installationMethod],
    queryFn: ({ signal }) =>
      calculateTiles({ area_sqft: areaSqft as number, installation_method: installationMethod as TileInstallationMethod }, signal),
    enabled: !!areaSqft && areaSqft > 0 && !!installationMethod,
  });
}
