import { getThumbOffset } from "./getThumbOffset";
import { getThumbSize } from "./getThumbSize";

/**
 * Computes the thumb's offset as a percentage of the thumb's own size,
 * suitable for direct use with CSS translate(%).
 *
 * This function is axis‑agnostic: it works for both vertical (Top/Height)
 * and horizontal (Left/Width) scrolling.
 *
 * At scrollOffset = 0 → 0%.
 * At scrollOffset = maxScrollOffset → (trackSize - thumbSize) / thumbSize * 100%,
 * which moves the thumb so its end aligns flush with the track end.
 *
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @param scrollOffset - The current scroll offset (scrollTop for Y, scrollLeft for X).
 * @param trackSize - The pixel size of the scrollbar track element (height or width).
 * @returns The translate percentage relative to the thumb's size.
 */
export function getThumbPercent(
  viewportSize: number,
  contentSize: number,
  scrollOffset: number,
  trackSize: number
): number {
  if (contentSize <= viewportSize) return 0;

  const thumbSize = getThumbSize(viewportSize, contentSize, trackSize);
  const thumbOffset = getThumbOffset(
    viewportSize,
    contentSize,
    scrollOffset,
    trackSize
  );

  // Percent relative to thumb size (what CSS translate(%) uses)
  return (thumbOffset / thumbSize) * 100;
}
