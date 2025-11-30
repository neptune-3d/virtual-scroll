/**
 * Determines whether the content overflows the container and requires a scrollbar.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param contentHeight - The total scrollable content height.
 * @returns True if the content overflows and a scrollbar is needed, false otherwise.
 */
export function getIsScrollingNeeded(
  scrollContainerHeight: number,
  contentHeight: number
): boolean {
  return contentHeight > scrollContainerHeight;
}
