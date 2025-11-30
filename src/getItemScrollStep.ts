/**
 * Convert a normalized scroll delta into a discrete item scroll step.
 *
 * - A minimal delta (±1) always scrolls exactly one item.
 * - Larger gestures are clamped between minItems and maxItems.
 * - Zero deltas return 0 (no scroll).
 *
 * This function is axis‑agnostic and input‑agnostic: the normalized delta
 * may come from vertical or horizontal scrolling, and from a wheel event,
 * trackpad gesture, keyboard input, or any other source that produces
 * item‑based scroll units.
 *
 * @param {number} normalizedDelta - The scroll delta already normalized into item units.
 * @param {number} [minItems=1] - The minimum number of items to scroll for larger gestures.
 * @param {number} [maxItems=3] - The maximum number of items to scroll for larger gestures.
 * @returns {number} The number of items to scroll (positive or negative).
 */
export function getItemScrollStep(
  normalizedDelta: number,
  minItems: number = 1,
  maxItems: number = 3
): number {
  const sign = Math.sign(normalizedDelta);
  if (sign === 0) return 0;

  if (Math.abs(normalizedDelta) === 1) {
    return sign * 1; // always one item for smallest tick
  }

  const clamped = Math.min(
    Math.max(Math.abs(normalizedDelta), minItems),
    maxItems
  );
  return sign * clamped;
}
