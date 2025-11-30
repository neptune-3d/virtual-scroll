import { getMaxScrollOffset } from "./getMaxScrollOffset";
import { getThumbTravelSize } from "./getThumbTravelSize";

/**
 * Maps a given scroll offset to its track‑relative thumb position.
 * Useful for scroll restoration (e.g. restoring thumb position after reload).
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling. The caller provides the offset,
 * viewport size, content size, and track size.
 *
 * @param scrollOffset - Current scroll offset (scrollTop for Y, scrollLeft for X).
 * @param viewportSize - Visible size of the scroll container (height or width).
 * @param contentSize - Total scrollable content size (height or width).
 * @param trackSize - Total track size (height or width).
 * @returns The thumb offset (track‑relative position in pixels).
 */
export function getThumbOffsetFromScrollOffset(
  scrollOffset: number,
  viewportSize: number,
  contentSize: number,
  trackSize: number
): number {
  const thumbTravelSize = getThumbTravelSize(
    viewportSize,
    contentSize,
    trackSize
  );

  const maxScrollOffset = getMaxScrollOffset(viewportSize, contentSize);

  // Clamp scrollOffset to valid range
  const clampedScrollOffset = Math.max(
    0,
    Math.min(scrollOffset, maxScrollOffset)
  );

  // Map scrollOffset to thumbOffset
  return (clampedScrollOffset / maxScrollOffset) * thumbTravelSize;
}
