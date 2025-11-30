/**
 * Clamps the thumb top position within the usable track height.
 *
 * @param thumbTop - Desired thumb top position.
 * @param thumbTravelHeight - The space the thumb can travel.
 * @returns Clamped thumb top position.
 */
export function clampThumbTop(
  thumbTop: number,
  thumbTravelHeight: number
): number {
  return Math.max(0, Math.min(thumbTop, thumbTravelHeight));
}
