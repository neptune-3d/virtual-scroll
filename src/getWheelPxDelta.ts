/**
 * Convert wheel deltas from a WheelEvent into pixel units
 * for use in virtual scroll.
 *
 * - Pixel mode (DOM_DELTA_PIXEL): returns delta in px directly.
 * - Line mode (DOM_DELTA_LINE): scales delta by itemSize.
 * - Page mode (DOM_DELTA_PAGE): scales delta by viewport size.
 *
 * This function is axis‑agnostic: it works for both vertical (deltaY)
 * and horizontal (deltaX) scrolling. The caller provides the delta,
 * viewport size, and itemSize along the relevant axis.
 *
 * @param delta - Delta from WheelEvent (deltaY for vertical, deltaX for horizontal).
 * @param deltaMode - WheelEvent.DOM_DELTA_PIXEL (0), LINE (1), or PAGE (2).
 * @param viewportSize - Size of the scroll viewport in px (height or width).
 * @param itemSize - Height of one line/item in px (row height or column width).
 * @returns Pixel delta (positive = forward, negative = backward).
 */
export function getWheelPxDelta(
  delta: number,
  deltaMode: number,
  viewportSize: number,
  itemSize: number
): number {
  if (deltaMode === 1) {
    return delta * itemSize; // line units → px
  }
  //
  else if (deltaMode === 2) {
    return delta * viewportSize; // page units → px
  }
  
  return delta; // pixel mode → px directly
}
