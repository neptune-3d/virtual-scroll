/**
 * Computes the thumb height in pixels.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb height in pixels. Returns 0 if scrollHeight <= 0.
 */
export function getThumbHeight(
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  if (scrollHeight <= 0) return 0;
  return Math.min(1, scrollContainerHeight / scrollHeight) * trackHeight;
}
