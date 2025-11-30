import { getMaxScrollOffset } from "./getMaxScrollOffset";
import { getThumbOffset } from "./getThumbOffset";
import { getThumbSize } from "./getThumbSize";
import { getThumbTravelSize } from "./getThumbTravelSize";

/**
 * Computes both the scrollOffset and the clamped thumbOffset when clicking on the track,
 * snapping to whole items.
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * @param clientCoord - Pointer coordinate in viewport space (clientY for vertical, clientX for horizontal).
 * @param viewportTrackStart - The track's start coordinate in viewport space (top Y or left X).
 * @param viewportSize - Visible size of the scroll container (height or width).
 * @param contentSize - Total scrollable content size (height or width).
 * @param trackSize - Total track size (height or width).
 * @param itemSize - Size of one item in px (row height or column width).
 * @param itemCount - Total number of items.
 * @returns An object containing both scrollOffset and thumbOffset (in track‑relative pixels).
 */
export function getTrackClickItemValues(
  clientCoord: number,
  viewportTrackStart: number,
  viewportSize: number,
  contentSize: number,
  trackSize: number,
  itemSize: number,
  itemCount: number
): { scrollOffset: number; thumbOffset: number } {
  // Thumb size
  const thumbSize = getThumbSize(viewportSize, contentSize, trackSize);

  // Click position relative to track
  const clickPos = clientCoord - viewportTrackStart;

  // Desired thumb start (centered on click)
  const desiredThumbOffset = clickPos - thumbSize / 2;

  // Clamp thumb offset within travel size
  const thumbTravelSize = getThumbTravelSize(
    viewportSize,
    contentSize,
    trackSize
  );
  const clampedThumbOffset = Math.max(
    0,
    Math.min(desiredThumbOffset, thumbTravelSize)
  );

  // Map to scrollOffset (continuous)
  const maxScrollOffset = getMaxScrollOffset(viewportSize, contentSize);
  let scrollOffset = (clampedThumbOffset / thumbTravelSize) * maxScrollOffset;

  // --- Snap to nearest item boundary ---
  const visibleItemsFloat = viewportSize / itemSize;
  const maxIndex = itemCount - Math.ceil(visibleItemsFloat);

  const snappedIndex = Math.max(
    0,
    Math.min(maxIndex, Math.round(scrollOffset / itemSize))
  );
  scrollOffset = snappedIndex * itemSize;

  // Recompute thumbOffset from snapped scrollOffset
  const thumbOffset = getThumbOffset(
    viewportSize,
    contentSize,
    scrollOffset,
    trackSize
  );

  return { scrollOffset, thumbOffset };
}
