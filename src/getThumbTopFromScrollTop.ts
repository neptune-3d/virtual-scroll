import { getMaxScrollTop } from "./getMaxScrollTop";
import { getThumbTravelHeight } from "./getThumbTravelHeight";

/**
 * Maps a given scrollTop to its track-relative thumb position.
 * Useful for scroll restoration (e.g. restoring thumb position after reload).
 *
 * @param scrollTop - Current scrollTop value.
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns The thumbTop (track-relative position in pixels).
 */
export function getThumbTopFromScrollTop(
  scrollTop: number,
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  // Clamp scrollTop to valid range
  const clampedScrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));

  // Map scrollTop to thumbTop
  return (clampedScrollTop / maxScrollTop) * thumbTravelHeight;
}
