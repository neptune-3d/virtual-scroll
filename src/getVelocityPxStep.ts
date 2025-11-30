/**
 * Convert a normalized scroll delta into a discrete pixel scroll step.
 *
 * - A minimal delta (±1) always scrolls exactly minPx pixels.
 * - Larger gestures are clamped between minPx and maxPx.
 * - Zero deltas return 0 (no scroll).
 *
 * This function is axis‑agnostic and input‑agnostic: the normalized delta
 * may come from vertical or horizontal scrolling, and from a wheel event,
 * trackpad gesture, keyboard input, or any other source that produces
 * pixel‑based scroll units.
 *
 * @param normalizedDeltaPx - The scroll delta already normalized into pixel units.
 * @param minPx - The minimum pixel step for small gestures (default 10).
 * @param maxPx - The maximum pixel step for larger gestures (default 60).
 * @returns Pixel step (positive or negative).
 */
export function getVelocityPxStep(
  normalizedDeltaPx: number,
  minPx: number = 10,
  maxPx: number = 60
): number {
  const sign = Math.sign(normalizedDeltaPx);
  if (sign === 0) return 0;

  if (Math.abs(normalizedDeltaPx) <= minPx) {
    return sign * minPx; // always at least minPx
  }

  const clamped = Math.min(Math.max(Math.abs(normalizedDeltaPx), minPx), maxPx);
  return sign * clamped;
}
