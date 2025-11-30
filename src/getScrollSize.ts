/**
 * Gets the total scrollable content size.
 *
 * This function is axis‑agnostic: it works for both vertical (height)
 * and horizontal (width) scrolling.
 *
 * @param contentSize - The full size of the scrollable content (height or width).
 * @param viewportSize - The visible size of the scroll container (clientHeight or clientWidth).
 * @returns The scrollable size. If content fits entirely, returns viewport size.
 */
export function getScrollSize(
  viewportSize: number,
  contentSize: number
): number {
  // If content fits, scrollSize should equal viewportSize
  return Math.max(contentSize, viewportSize);
}
