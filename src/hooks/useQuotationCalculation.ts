import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { calculateQuotation } from "@/api/quotations";
import { useDebouncedValue } from "./useDebouncedValue";
import type { AreaInput, CustomQuotationInput, QuotationCalculateRequest, QuotationType } from "@/types/quotation";

const CALCULATE_DEBOUNCE_MS = 400;

/**
 * Live, backend-authoritative price for the current builder state. The
 * request fingerprint changes on every meaningful edit (a product pick, a
 * quantity change, a dimension), so TanStack Query aborts any in-flight
 * request for the previous fingerprint automatically — a slow stale response
 * can never clobber a newer one. Debounced by CALCULATE_DEBOUNCE_MS so free
 * typing (shutter area override, custom cabinet dimensions) doesn't fire a
 * request per keystroke.
 */
export function useQuotationCalculation(
  quotationType: QuotationType | null,
  area: AreaInput | null,
  packageId: string | null,
  custom: CustomQuotationInput | null
) {
  const fingerprint = JSON.stringify({ quotationType, area, packageId, custom });
  const debouncedFingerprint = useDebouncedValue(fingerprint, CALCULATE_DEBOUNCE_MS);

  const ready = quotationType !== null && area !== null && area.area_sqft > 0 && (quotationType !== "package" || !!packageId);

  return useQuery({
    queryKey: ["quotation-calculate", debouncedFingerprint],
    queryFn: ({ signal }) => {
      const payload: QuotationCalculateRequest = {
        quotation_type: quotationType as QuotationType,
        package_id: packageId,
        area: area as AreaInput,
        custom,
      };
      return calculateQuotation(payload, signal);
    },
    enabled: ready,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
