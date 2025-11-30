/**
 * Convert wheel deltas from a WheelEvent into item units
 * for use in virtual scroll.
 *
 * - Line mode (DOM_DELTA_LINE): returns delta in line units.
 * - Page mode (DOM_DELTA_PAGE): scales delta by viewport size / item size.
 * - Pixel mode (DOM_DELTA_PIXEL): collapses each wheel notch to ±1 item.
 *
 * This function is axis‑agnostic: it works for both vertical (deltaY)
 * and horizontal (deltaX) scrolling. The caller provides the delta,
 * viewport size, and item size along the relevant axis.
 *
 * @param delta - Delta from WheelEvent (deltaY for vertical, deltaX for horizontal).
 * @param deltaMode - WheelEvent.DOM_DELTA_PIXEL (0), LINE (1), or PAGE (2).
 * @param viewportSize - Size of the scroll viewport in px (height or width).
 * @param itemSize - Size of one item in px (row height or column width).
 * @returns Number of items to scroll (positive = forward, negative = backward).
 */
export function getWheelItemDelta(
  delta: number,
  deltaMode: number,
  viewportSize: number,
  itemSize: number
): number {
  if (deltaMode === 1) {
    return delta; // line units
  }
  //
  else if (deltaMode === 2) {
    return delta * (viewportSize / itemSize); // page units
  }

  return Math.sign(delta); // pixel mode → ±1 item
}
