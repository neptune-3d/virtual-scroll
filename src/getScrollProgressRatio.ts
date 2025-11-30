import { getMaxScrollOffset } from "./getMaxScrollOffset";

/**
 * Computes the normalized scroll progress ratio of a scroll container.
 *
 * This is scrollOffset divided by the maximum scrollable distance.
 * Used when positioning the thumb relative to the track.
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @param scrollOffset - The current scroll offset (scrollTop for Y, scrollLeft for X).
 * @returns A number between 0 and 1 representing scroll progress.
 */
export function getScrollProgressRatio(
  viewportSize: number,
  contentSize: number,
  scrollOffset: number
): number {
  if (contentSize <= viewportSize) return 0;

  const maxScrollOffset = getMaxScrollOffset(viewportSize, contentSize);

  return scrollOffset / maxScrollOffset;
}
