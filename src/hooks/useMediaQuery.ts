import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  // Resolved synchronously on the first render — starting at `false` and
  // correcting in the effect makes a mobile visitor briefly render the
  // desktop branch, which for heavy branches (video, 3D) means a layout jump
  // and a wasted fetch before it unmounts.
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsCoarsePointer() {
  return useMediaQuery("(pointer: coarse)");
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
