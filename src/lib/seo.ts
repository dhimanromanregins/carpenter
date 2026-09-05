export const SITE_NAME = "Dhiman Interiors";

const RAW_SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;
export const SITE_URL = (RAW_SITE_URL ?? "https://dhimaninteriors.in").replace(/\/+$/, "");

// Falls back to a real project photo until a dedicated 1200x630 branded
// OG image is provided.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/projects/mohali-sector-59-kitchen/front.png`;
