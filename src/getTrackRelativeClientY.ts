/**
 * Computes the click position relative to the track.
 *
 * @param clientY - Pointer Y coordinate in viewport space.
 * @param viewportTrackTop - The top offset of the track in viewport space.
 * @returns Click position relative to the track.
 */
export function getTrackRelativeClientY(
  clientY: number,
  viewportTrackTop: number
): number {
  return clientY - viewportTrackTop;
}
