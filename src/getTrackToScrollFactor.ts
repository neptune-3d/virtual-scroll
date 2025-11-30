import { getThumbTravelSize } from "./getThumbTravelSize";

/**
 * Computes the conversion factor between track movement and scroll movement.
 *
 * This tells you how many track pixels correspond to one content pixel.
 * Used when converting drag deltas into scrollTop changes.
 *
 * @param viewportHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The factor (track pixels per content pixel).
 */
export function getTrackToScrollFactor(
  viewportHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  if (scrollHeight <= viewportHeight) return 0;

  const maxScrollTop = scrollHeight - viewportHeight;

  const thumbTravelHeight = getThumbTravelSize(
    viewportHeight,
    scrollHeight,
    trackHeight
  );

  return thumbTravelHeight / maxScrollTop;
}
