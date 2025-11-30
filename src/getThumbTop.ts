import { getScrollProgressRatio } from "./getScrollProgressRatio";
import { getThumbTravelHeight } from "./getThumbTravelHeight";

/**
 * Computes the thumb's top offset in pixels within the scrollbar track.
 *
 * This value is the distance from the track's top edge to the thumb's top edge,
 * expressed in track-local pixels. At scrollTop = 0, the result is 0. At
 * scrollTop = maxScrollTop, the result is (trackHeight - thumbHeight).
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb's top offset in pixels relative to the track.
 */
export function getThumbTop(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  return (
    getScrollProgressRatio(scrollContainerHeight, scrollHeight, scrollTop) *
    getThumbTravelHeight(scrollContainerHeight, scrollHeight, trackHeight)
  );
}
