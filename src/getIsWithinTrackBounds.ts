/**
 * Determines whether a given mouse Y coordinate is within the vertical bounds
 * of the scrollbar track. Works correctly if trackTop/trackBottom come from
 * getBoundingClientRect().
 *
 * @param clientY - The mouse Y coordinate (from MouseEvent.clientY).
 * @param viewportTrackTop - The top Y coordinate of the track element (in viewport coordinates).
 * @param trackBottom - The bottom Y coordinate of the track element (from DOMRect.bottom).
 * @returns True if the mouse Y is within the track bounds, false otherwise.
 */
export function getIsWithinTrackBounds(
  clientY: number,
  viewportTrackTop: number,
  trackBottom: number
): boolean {
  return clientY >= viewportTrackTop && clientY <= trackBottom;
}
