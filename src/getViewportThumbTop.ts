import { getThumbTop } from "./getThumbTop";

/**
 * Computes the virtual DOMRect.top of the scrollbar thumb relative to the track.
 * Equivalent to what you'd get from thumb.getBoundingClientRect().top,
 * but derived from scroll state and track geometry.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param viewportTrackTop - The top Y coordinate of the track element (in viewport coordinates).
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb's top Y coordinate in pixels, relative to the viewport.
 */
export function getViewportThumbTop(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  viewportTrackTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) {
    // Thumb fills track → top aligns with track top
    return viewportTrackTop;
  }

  // Thumb offset within track
  const thumbTop = getThumbTop(
    scrollContainerHeight,
    scrollHeight,
    scrollTop,
    trackHeight
  );

  // Absolute coordinate relative to viewport
  return viewportTrackTop + thumbTop;
}
