import { getMaxScrollTop } from "./getMaxScrollTop";

/**
 * Computes the normalized scroll progress ratio of a scroll container.
 *
 * This is scrollTop divided by the maximum scrollable distance.
 * Used when positioning the thumb relative to the track.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @returns A number between 0 and 1 representing scroll progress.
 */
export function getScrollProgressRatio(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  return scrollTop / maxScrollTop;
}
