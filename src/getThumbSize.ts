/**
 * Computes the scrollbar thumb size in pixels.
 *
 * This function is axis‑agnostic: it works for both vertical (height)
 * and horizontal (width) scrolling. The caller provides the viewport size,
 * content size, and track size along the relevant axis.
 *
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @param trackSize - The pixel size of the scrollbar track element (height or width).
 * @returns The thumb size in pixels. Returns 0 if contentSize <= 0.
 */
export function getThumbSize(
  viewportSize: number,
  contentSize: number,
  trackSize: number
): number {
  if (contentSize <= 0) return 0;
  return Math.min(1, viewportSize / contentSize) * trackSize;
}
