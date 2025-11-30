/**
 * Convert wheel delta into item units for vertical virtual scroll.
 *
 * @param deltaY - vertical delta from WheelEvent
 * @param deltaMode - WheelEvent.DOM_DELTA_PIXEL (0), LINE (1), or PAGE (2)
 * @param viewportHeight - height of the scroll viewport in px
 * @param itemHeight - height of one item in px
 * @returns number of items to scroll (positive = down, negative = up)
 */
export function getWheelItemDeltaY(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
  itemHeight: number
): number {
  // line units
  if (deltaMode === 1) {
    return deltaY;
  }
  // page units
  else if (deltaMode === 2) {
    return deltaY * (viewportHeight / itemHeight);
  }

  // pixel mode → ±1 item
  return Math.sign(deltaY);
}
