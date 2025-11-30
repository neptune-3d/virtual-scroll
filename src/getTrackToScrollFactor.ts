import { getThumbTravelHeight } from "./getThumbTravelHeight";

/**
 * Computes the conversion factor between track movement and scroll movement.
 *
 * This tells you how many track pixels correspond to one content pixel.
 * Used when converting drag deltas into scrollTop changes.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The factor (track pixels per content pixel).
 */
export function getTrackToScrollFactor(
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const maxScrollTop = scrollHeight - scrollContainerHeight;

  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  return thumbTravelHeight / maxScrollTop;
}
