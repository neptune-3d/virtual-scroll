import { getMaxScrollTop } from "./getMaxScrollTop";

/**
 * Restores a scrollTop value from a normalized scroll progress ratio.
 *
 * The ratio should be the value returned by getScrollProgressRatio,
 * i.e. scrollTop / maxScrollTop.
 *
 * @param scrollProgressRatio - A number between 0 and 1 representing scroll progress.
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @returns The restored scrollTop value, clamped to the valid range.
 */
export function getScrollTopFromRatio(
  scrollProgressRatio: number,
  scrollContainerHeight: number,
  scrollHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  // Clamp ratio to [0, 1] to avoid invalid values
  const clampedRatio = Math.max(0, Math.min(scrollProgressRatio, 1));

  return clampedRatio * maxScrollTop;
}
