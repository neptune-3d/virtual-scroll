import { getScrollSize } from "./getScrollSize";
import { getThumbOffsetFromScrollOffset } from "./getThumbOffsetFromScrollOffset";

/**
 * Compute the next scroll position, decayed velocity, and thumb position
 * for virtual scroll based on a velocity in item units.
 *
 * This function is axis‑agnostic: it works for both horizontal and vertical
 * scrolling. The caller provides the current scroll offset, velocity,
 * viewport size, content size, and item size/count.
 *
 * @param scrollOffset - Current scroll offset in px (scrollTop for Y, scrollLeft for X).
 * @param velocity - Current scroll velocity expressed in item units.
 * @param viewportSize - Visible size of the scroll container in px (height or width).
 * @param contentSize - Total size of the scrollable content in px.
 * @param itemSize - Size of one item in px (row height or column width).
 * @param itemCount - Total number of items.
 * @param decay - Velocity decay factor per step (default 0.7).
 * @param trackSize - Total track size (height or width).
 * @returns An object containing:
 *   - scrollOffset: the updated scroll offset in px
 *   - velocity: the decayed velocity for the next step
 *   - thumbOffset: the updated thumb position in track space
 */
export function getValuesFromScrollVelocity(
  scrollOffset: number,
  velocity: number,
  viewportSize: number,
  contentSize: number,
  itemSize: number,
  itemCount: number,
  decay: number = 0.7,
  trackSize: number
): { scrollOffset: number; velocity: number; thumbOffset: number } {
  const scrollExtent = getScrollSize(viewportSize, contentSize);

  const remainder = viewportSize % itemSize;
  const downOffset = remainder === 0 ? 0 : itemSize - remainder;

  let stepItems = Math.round(velocity);
  const nextVelocity = velocity * decay;

  let newScrollOffset = scrollOffset;

  if (stepItems > 0) {
    const baseIndex = Math.floor((scrollOffset - downOffset) / itemSize);
    let newIndex = Math.floor(baseIndex + stepItems);

    const visibleItemsFloat = viewportSize / itemSize;
    const maxIndex = itemCount - Math.ceil(visibleItemsFloat);
    newIndex = Math.max(0, Math.min(maxIndex, newIndex));

    newScrollOffset = newIndex * itemSize + downOffset;
  } else if (stepItems < 0) {
    const baseIndex = Math.ceil(scrollOffset / itemSize);
    let newIndex = Math.ceil(baseIndex + stepItems);

    const visibleItemsFloat = viewportSize / itemSize;
    const maxIndex = itemCount - Math.ceil(visibleItemsFloat);
    newIndex = Math.max(0, Math.min(maxIndex, newIndex));

    newScrollOffset = newIndex * itemSize;
  }

  const maxScrollOffset = scrollExtent - viewportSize;
  newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

  // Use axis‑agnostic helper directly
  const thumbOffset = getThumbOffsetFromScrollOffset(
    newScrollOffset,
    viewportSize,
    contentSize,
    trackSize
  );

  return { scrollOffset: newScrollOffset, velocity: nextVelocity, thumbOffset };
}
