import { getThumbHeight } from "./getThumbHeight";
import { getThumbTop } from "./getThumbTop";

/**
 * Computes the thumb's vertical offset as a percentage of the thumb's own height,
 * suitable for direct use with CSS translateY(%).
 *
 * At scrollTop = 0 → 0%.
 * At scrollTop = maxScrollTop → (trackHeight - thumbHeight) / thumbHeight * 100%,
 * which moves the thumb so its bottom aligns flush with the track bottom.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The translateY percentage relative to the thumb's height.
 */
export function getThumbPercent(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  const thumbTop = getThumbTop(
    scrollContainerHeight,
    scrollHeight,
    scrollTop,
    trackHeight
  );

  // Percent relative to thumb height (what CSS translateY(%) uses)
  return (thumbTop / thumbHeight) * 100;
}
