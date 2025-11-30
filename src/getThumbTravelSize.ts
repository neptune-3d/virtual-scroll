import { getThumbSize } from "./getThumbSize";

/**
 * Computes the thumb travel size (the distance the thumb can move within the track).
 *
 * This function is axis‑agnostic: it works for both vertical (height) and
 * horizontal (width) scrolling. The caller provides the viewport size,
 * content size, and track size along the relevant axis.
 *
 * @param viewportSize - Visible size of the scroll container (height or width).
 * @param contentSize - Total scrollable content size (height or width).
 * @param trackSize - Total track size (height or width).
 * @returns Thumb travel size in pixels.
 */
export function getThumbTravelSize(
  viewportSize: number,
  contentSize: number,
  trackSize: number
): number {
  const thumbSize = getThumbSize(viewportSize, contentSize, trackSize);
  return Math.max(0, trackSize - thumbSize);
}
