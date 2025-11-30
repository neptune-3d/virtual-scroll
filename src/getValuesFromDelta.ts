import { getMaxScrollTop } from "./getMaxScrollTop";
import { getThumbTravelHeight } from "./getThumbTravelHeight";

/**
 * Computes both scrollTop and thumbTop from a vertical delta in track space.
 * Useful for drag, wheel, or synthetic scroll updates.
 *
 * @param scrollTop - Current scrollTop before applying the delta.
 * @param deltaY - Vertical movement in track space (e.g. pointer, wheel).
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns An object containing the updated scrollTop and thumbTop (track-relative).
 */
export function getValuesFromDelta(
  scrollTop: number,
  deltaY: number,
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): { scrollTop: number; thumbTop: number } {
  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  const trackToScrollFactor = thumbTravelHeight / maxScrollTop;

  // Update scrollTop from delta
  const newScrollTop = Math.max(
    0,
    Math.min(scrollTop + deltaY / trackToScrollFactor, maxScrollTop)
  );

  // Map scrollTop back to thumbTop
  const newThumbTop = (newScrollTop / maxScrollTop) * thumbTravelHeight;

  return { scrollTop: newScrollTop, thumbTop: newThumbTop };
}
