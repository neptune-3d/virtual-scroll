/**
 * Computes the maximum scroll offset for a scroll container.
 *
 * This is the largest scroll offset you can have before reaching the end
 * of the content along the given axis. If the content fits entirely,
 * returns 0.
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param viewportSize - Visible size of the scroll container (height or width).
 * @param contentSize - Total scrollable content size (height or width).
 * @returns Maximum scroll offset in pixels.
 */
export function getMaxScrollOffset(
  viewportSize: number,
  contentSize: number
): number {
  return Math.max(0, contentSize - viewportSize);
}
