import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { calculateQuote } from "@/api/pricing";
import type { QuoteSpaceInput } from "@/api/types";
import { useDebouncedValue } from "./useDebouncedValue";
import type { SpaceState } from "@/store/quotationStore";

const DIMENSION_DEBOUNCE_MS = 400;

/**
 * Live, backend-authoritative price for the current configuration.
 *
 * Dimension edits are debounced (typing "12" one digit at a time shouldn't
 * fire three requests) by debouncing only the dimension-derived part of the
 * query key. Product/accessory selection changes are NOT debounced — they
 * flow into the key immediately, so picking a board recalculates right away.
 * Because the query key changes on every meaningful edit, TanStack Query
 * aborts any in-flight request for the previous key automatically, so a slow
 * stale response can never clobber a newer one.
 */
export function useQuoteCalculation(city: string, spaces: SpaceState[]) {
  const dimensionsFingerprint = spaces
    .map((s) => `${s.id}:${s.length}x${s.width}x${s.height}:${s.unit}`)
    .join("|");
  const debouncedDimensions = useDebouncedValue(dimensionsFingerprint, DIMENSION_DEBOUNCE_MS);

  const configFingerprint = JSON.stringify(
    spaces.map((s) => ({ id: s.id, type: s.type, configuration: s.configuration }))
  );

  const hasValidDimensions = spaces.every((s) => s.length > 0 && s.width > 0 && s.height > 0);

  return useQuery({
    queryKey: ["quote-calculate", city, debouncedDimensions, configFingerprint],
    queryFn: ({ signal }) => {
      const payload: { city: string; spaces: QuoteSpaceInput[] } = {
        city,
        spaces: spaces.map(({ type, name, length, width, height, unit, configuration }) => ({
          type,
          name,
          length,
          width,
          height,
          unit,
          configuration,
        })),
      };
      return calculateQuote(payload, signal);
    },
    enabled: spaces.length > 0 && hasValidDimensions,
    // Keep showing the last good total while a new one is being calculated,
    // instead of blanking the price panel on every keystroke/selection.
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
