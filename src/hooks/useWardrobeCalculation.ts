import { useQuery } from "@tanstack/react-query";
import { calculateWardrobe } from "@/api/wardrobe";

/** Backend-authoritative Standard/Premium totals for the given wardrobe area. */
export function useWardrobeCalculation(areaSqft: number | null) {
  return useQuery({
    queryKey: ["wardrobe-calculate", areaSqft],
    queryFn: ({ signal }) => calculateWardrobe({ area_sqft: areaSqft as number }, signal),
    enabled: !!areaSqft && areaSqft > 0,
  });
}
