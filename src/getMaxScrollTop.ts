/**
 * Computes the maximum scrollTop value for a scroll container.
 *
 * This is the largest scrollTop you can have before reaching the bottom
 * of the content. If the content fits entirely, returns 0.
 *
 * @param scrollContainerHeight - Visible height of the scroll container (viewport).
 * @param scrollHeight - Total scrollable content height.
 * @returns Maximum scrollTop value in pixels.
 */
export function getMaxScrollTop(
  scrollContainerHeight: number,
  scrollHeight: number
): number {
  return Math.max(0, scrollHeight - scrollContainerHeight);
}
