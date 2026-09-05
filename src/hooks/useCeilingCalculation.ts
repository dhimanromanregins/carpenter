import { useQuery } from "@tanstack/react-query";
import { calculateCeiling } from "@/api/ceiling";

/** Backend-authoritative flat-rate total for the given ceiling area (single tier, no Standard/Premium split). */
export function useCeilingCalculation(areaSqft: number | null) {
  return useQuery({
    queryKey: ["ceiling-calculate", areaSqft],
    queryFn: ({ signal }) => calculateCeiling({ area_sqft: areaSqft as number }, signal),
    enabled: !!areaSqft && areaSqft > 0,
  });
}
