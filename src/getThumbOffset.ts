import { getScrollProgressRatio } from "./getScrollProgressRatio";
import { getThumbTravelSize } from "./getThumbTravelSize";

/**
 * Computes the thumb's offset in pixels within the scrollbar track.
 *
 * This value is the distance from the track's start edge to the thumb's start edge,
 * expressed in track‑local pixels. At scrollOffset = 0, the result is 0. At
 * scrollOffset = maxScrollOffset, the result is (trackSize - thumbSize).
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @param scrollOffset - The current scroll offset (scrollTop for Y, scrollLeft for X).
 * @param trackSize - The pixel size of the scrollbar track element (height or width).
 * @returns The thumb's offset in pixels relative to the track.
 */
export function getThumbOffset(
  viewportSize: number,
  contentSize: number,
  scrollOffset: number,
  trackSize: number
): number {
  if (contentSize <= viewportSize) return 0;

  return (
    getScrollProgressRatio(viewportSize, contentSize, scrollOffset) *
    getThumbTravelSize(viewportSize, contentSize, trackSize)
  );
}
