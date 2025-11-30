import { getThumbHeight } from "./getThumbHeight";
import { getThumbTop } from "./getThumbTop";

/**
 * Computes the virtual DOMRect.bottom of the scrollbar thumb relative to the track.
 * Equivalent to what you'd get from thumb.getBoundingClientRect().bottom,
 * but derived from scroll state and track geometry.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param viewportTrackTop - The top Y coordinate of the track element (in viewport coordinates).
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb's bottom Y coordinate in pixels, relative to the viewport.
 */
export function getViewportThumbBottom(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  viewportTrackTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) {
    // No scrolling possible → thumb fills track
    return viewportTrackTop + trackHeight;
  }

  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  // Thumb offset within track
  const thumbTop = getThumbTop(
    scrollContainerHeight,
    scrollHeight,
    scrollTop,
    trackHeight
  );

  // Absolute bottom coordinate relative to viewport
  return viewportTrackTop + thumbTop + thumbHeight;
}
