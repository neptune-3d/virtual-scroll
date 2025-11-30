import { getMaxScrollTop } from "./getMaxScrollTop";
import { getThumbHeight } from "./getThumbHeight";
import { getThumbTravelHeight } from "./getThumbTravelHeight";

/**
 * Computes both the scrollTop and the clamped thumbTop when clicking on the track.
 * The thumb is centered on the click position, then clamped within the track.
 *
 * @param clientY - Pointer Y coordinate in viewport space.
 * @param viewportTrackTop - The top offset of the track in viewport space.
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns An object containing both scrollTop and thumbTop (in track-relative pixels).
 */
export function getValuesFromTrackClick(
  clientY: number,
  viewportTrackTop: number,
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): { scrollTop: number; thumbTop: number } {
  // Thumb size
  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  // Click position relative to track
  const clickY = clientY - viewportTrackTop;

  // Desired thumb top (centered on click)
  const desiredThumbTop = clickY - thumbHeight / 2;

  // Clamp thumb top within travel height
  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );
  const clampedThumbTop = Math.max(
    0,
    Math.min(desiredThumbTop, thumbTravelHeight)
  );

  // Map to scrollTop
  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);
  const scrollTop = (clampedThumbTop / thumbTravelHeight) * maxScrollTop;

  return { scrollTop, thumbTop: clampedThumbTop };
}
