import { getTrackRelativeClientY } from "./getTrackRelativeClientY";

/**
 * Computes the desired thumb top so that its center aligns with the click.
 *
 * @param clientY - Pointer Y coordinate in viewport space.
 * @param viewportTrackTop - The top offset of the track in viewport space.
 * @param thumbHeight - Height of the thumb in pixels.
 * @returns Desired thumb top position.
 */
export function getThumbTopFromClick(
  clientY: number,
  viewportTrackTop: number,
  thumbHeight: number
): number {
  return getTrackRelativeClientY(clientY, viewportTrackTop) - thumbHeight / 2;
}
