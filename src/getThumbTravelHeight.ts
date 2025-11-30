import { getThumbHeight } from "./getThumbHeight";

/**
 * Computes the thumb travel height (the vertical distance the thumb can move within the track).
 *
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns Thumb travel height in pixels.
 */
export function getThumbTravelHeight(
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  return Math.max(0, trackHeight - thumbHeight);
}
