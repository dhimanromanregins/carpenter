import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import type { ProductFilters } from "@/api/types";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: ({ signal }) => getProducts(filters, signal),
  });
}
