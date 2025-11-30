import { getMaxScrollTop } from "./getMaxScrollTop";
import type { TrackClickDirection } from "./types";

/**
 * Calculates the new scrollTop value when the user clicks on the track.
 * Simulates native scrollbar paging behavior (scrolling one viewport height).
 *
 * @param direction - The direction of the track click ("up", "down", or "none").
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @returns The updated scrollTop value, clamped between 0 and the maximum scrollable offset.
 */
export function getPageScrollTop(
  direction: TrackClickDirection,
  scrollTop: number,
  scrollContainerHeight: number,
  scrollHeight: number
) {
  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  if (direction === "up") {
    return Math.max(0, scrollTop - scrollContainerHeight);
  }
  //
  else if (direction === "down") {
    return Math.min(maxScrollTop, scrollTop + scrollContainerHeight);
  }
  return scrollTop;
}
