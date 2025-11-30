import { getScrollSize } from "./getScrollSize";
import { getThumbOffsetFromScrollOffset } from "./getThumbOffsetFromScrollOffset";

/**
 * Compute the next scroll position, decayed velocity, and thumb position
 * for virtual scroll based on a velocity in pixel units.
 *
 * This function is axis‑agnostic: it works for both horizontal (X/width)
 * and vertical (Y/height) scrolling.
 *
 * @param scrollOffset - Current scroll offset in px (scrollTop for Y, scrollLeft for X).
 * @param velocityPx - Current scroll velocity expressed in px per step.
 * @param viewportSize - Visible size of the scroll container in px (height or width).
 * @param contentSize - Total size of the scrollable content in px.
 * @param decay - Velocity decay factor per step (default 0.7).
 * @param trackSize - Total track size (height or width).
 * @returns An object containing:
 *   - scrollOffset: the updated scroll offset in px
 *   - velocity: the decayed velocity for the next step (still px units)
 *   - thumbOffset: the updated thumb position in track space
 */
export function getVelocityPxValues(
  scrollOffset: number,
  velocityPx: number,
  viewportSize: number,
  contentSize: number,
  decay: number = 0.7,
  trackSize: number
): { scrollOffset: number; velocity: number; thumbOffset: number } {
  const scrollExtent = getScrollSize(viewportSize, contentSize);
  const maxScrollOffset = scrollExtent - viewportSize;

  // Apply velocity directly in px
  let newScrollOffset = scrollOffset + velocityPx;

  // Clamp within bounds
  newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

  // Decay velocity for next step
  const nextVelocity = velocityPx * decay;

  // Map to thumb offset
  const thumbOffset = getThumbOffsetFromScrollOffset(
    newScrollOffset,
    viewportSize,
    contentSize,
    trackSize
  );

  return { scrollOffset: newScrollOffset, velocity: nextVelocity, thumbOffset };
}
