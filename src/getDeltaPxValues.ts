import { getMaxScrollOffset } from "./getMaxScrollOffset";
import { getThumbTravelSize } from "./getThumbTravelSize";

/**
 * Computes both scrollOffset and thumbOffset from a delta in track space.
 * Useful for drag, wheel, or synthetic scroll updates.
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param scrollOffset - Current scroll offset before applying the delta
 *                       (scrollTop for Y, scrollLeft for X).
 * @param delta - Movement in track space (deltaY for vertical, deltaX for horizontal).
 * @param viewportSize - Visible size of the scroll container (height or width).
 * @param contentSize - Total scrollable content size (height or width).
 * @param trackSize - Total track size (height or width).
 * @returns An object containing the updated scrollOffset and thumbOffset (track‑relative).
 */
export function getDeltaPxValues(
  scrollOffset: number,
  delta: number,
  viewportSize: number,
  contentSize: number,
  trackSize: number
): { scrollOffset: number; thumbOffset: number } {
  const thumbTravelSize = getThumbTravelSize(
    viewportSize,
    contentSize,
    trackSize
  );
  const maxScrollOffset = getMaxScrollOffset(viewportSize, contentSize);

  const trackToScrollFactor = thumbTravelSize / maxScrollOffset;

  // Update scrollOffset from delta
  const newScrollOffset = Math.max(
    0,
    Math.min(scrollOffset + delta / trackToScrollFactor, maxScrollOffset)
  );

  // Map scrollOffset back to thumbOffset
  const newThumbOffset = (newScrollOffset / maxScrollOffset) * thumbTravelSize;

  return { scrollOffset: newScrollOffset, thumbOffset: newThumbOffset };
}
