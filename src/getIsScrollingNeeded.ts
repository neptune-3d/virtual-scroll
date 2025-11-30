/**
 * Determines whether the content overflows the container and requires a scrollbar.
 *
 * This function is axis‑agnostic: it works for both vertical (height)
 * and horizontal (width) scrolling.
 *
 * @param viewportSize - The visible size of the scroll container (height or width).
 * @param contentSize - The total scrollable content size (height or width).
 * @returns True if the content overflows and a scrollbar is needed, false otherwise.
 */
export function getIsScrollingNeeded(
  viewportSize: number,
  contentSize: number
): boolean {
  return contentSize > viewportSize;
}
