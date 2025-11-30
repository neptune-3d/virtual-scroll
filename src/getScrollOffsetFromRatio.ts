import { getMaxScrollOffset } from "./getMaxScrollOffset";

/**
 * Restores a scroll offset value from a normalized scroll progress ratio.
 *
 * The ratio should be the value returned by getScrollProgressRatio,
 * i.e. scrollOffset / maxScrollOffset.
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param scrollProgressRatio - A number between 0 and 1 representing scroll progress.
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @returns The restored scroll offset value, clamped to the valid range.
 */
export function getScrollOffsetFromRatio(
  scrollProgressRatio: number,
  viewportSize: number,
  contentSize: number
): number {
  if (contentSize <= viewportSize) return 0;

  const maxScrollOffset = getMaxScrollOffset(viewportSize, contentSize);

  // Clamp ratio to [0, 1] to avoid invalid values
  const clampedRatio = Math.max(0, Math.min(scrollProgressRatio, 1));

  return clampedRatio * maxScrollOffset;
}
