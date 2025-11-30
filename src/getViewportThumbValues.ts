import { getThumbOffset } from "./getThumbOffset";
import { getThumbSize } from "./getThumbSize";

/**
 * Computes virtual DOMRect‑like values for the scrollbar thumb relative to the track.
 * Equivalent to thumb.getBoundingClientRect() values, but derived from scroll state
 * and track geometry.
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @param scrollOffset - The current scroll offset (scrollTop for Y, scrollLeft for X).
 * @param viewportTrackStart - The track's start coordinate in viewport space
 *                             (top Y for vertical, left X for horizontal).
 * @param trackSize - The pixel size of the scrollbar track element (height or width).
 * @returns An object containing:
 *   - start: thumb start coordinate (DOMRect.top/left equivalent)
 *   - end: thumb end coordinate (DOMRect.bottom/right equivalent)
 *   - size: thumb size (DOMRect.height/width equivalent)
 */
export function getViewportThumbValues(
  viewportSize: number,
  contentSize: number,
  scrollOffset: number,
  viewportTrackStart: number,
  trackSize: number
): { start: number; end: number; size: number } {
  if (contentSize <= viewportSize) {
    // Thumb fills track
    return {
      start: viewportTrackStart,
      end: viewportTrackStart + trackSize,
      size: trackSize,
    };
  }

  const thumbSize = getThumbSize(viewportSize, contentSize, trackSize);
  const thumbOffset = getThumbOffset(
    viewportSize,
    contentSize,
    scrollOffset,
    trackSize
  );

  const start = viewportTrackStart + thumbOffset;
  const end = start + thumbSize;

  return { start, end, size: thumbSize };
}
