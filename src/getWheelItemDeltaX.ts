/**
 * Convert wheel delta into item units for horizontal virtual scroll.
 *
 * @param deltaX - horizontal delta from WheelEvent
 * @param deltaMode - WheelEvent.DOM_DELTA_PIXEL (0), LINE (1), or PAGE (2)
 * @param viewportWidth - width of the scroll viewport in px
 * @param itemWidth - width of one item in px
 * @returns number of items to scroll (positive = right, negative = left)
 */
export function getWheelItemDeltaX(
  deltaX: number,
  deltaMode: number,
  viewportWidth: number,
  itemWidth: number
): number {
  // line units
  if (deltaMode === 1) {
    return deltaX;
  }
  // page units
  else if (deltaMode === 2) {
    return deltaX * (viewportWidth / itemWidth);
  }
  // pixel mode → ±1 item
  return Math.sign(deltaX);
}
