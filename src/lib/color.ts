import { DEFAULT_ACCENT } from "./types";

/** "#0ea5e9" -> "14 165 233" (for `rgb(var(--accent) / alpha)` in Tailwind). */
export function hexToRgbTriplet(hex: string): string {
  let h = (hex || DEFAULT_ACCENT).trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) h = DEFAULT_ACCENT.slice(1);
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
