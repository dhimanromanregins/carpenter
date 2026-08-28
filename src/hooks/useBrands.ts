import { useQuery } from "@tanstack/react-query";
import { getBrands } from "@/api/brands";
import type { BrandFilters } from "@/api/types";

export function useBrands(filters: BrandFilters = {}) {
  return useQuery({
    queryKey: ["brands", filters],
    queryFn: ({ signal }) => getBrands(filters, signal),
  });
}
