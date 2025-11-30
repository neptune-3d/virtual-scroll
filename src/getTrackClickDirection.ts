import type { TrackClickDirection } from "./types";

/**
 * Determines whether a click on the scrollbar track occurred
 * above, below, or directly on the thumb.
 *
 * @param clientY - The vertical mouse coordinate relative to the viewport.
 * @param viewportThumbTop - The top Y coordinate of the thumb element.
 * @param viewportThumbBottom - The bottom Y coordinate of the thumb element.
 * @returns {"up" | "down" | "none"} - "up" if clicked above the thumb,
 * "down" if clicked below, "none" if clicked directly on the thumb.
 */
export function getTrackClickDirection(
  clientY: number,
  viewportThumbTop: number,
  viewportThumbBottom: number
): TrackClickDirection {
  if (clientY < viewportThumbTop) return "up";
  else if (clientY > viewportThumbBottom) return "down";
  else return "none";
}
