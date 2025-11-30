/**
 * Gets the total scrollable content height.
 *
 * @param contentHeight - The full height of the scrollable content.
 * @param scrollContainerHeight - The visible height of the scroll container (clientHeight).
 * @returns The scrollable height (contentHeight). If content fits entirely, returns viewportHeight.
 */
export function getScrollHeight(
  scrollContainerHeight: number,
  contentHeight: number
): number {
  // If content fits, scrollHeight should equal viewportHeight
  return Math.max(contentHeight, scrollContainerHeight);
}
