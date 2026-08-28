import { useQuery } from "@tanstack/react-query";
import { getCategories, getCities } from "@/api/categories";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => getCategories(signal),
  });
}

export function useCities() {
  return useQuery({
    queryKey: ["cities"],
    queryFn: ({ signal }) => getCities(signal),
  });
}
