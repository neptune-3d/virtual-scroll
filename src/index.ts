import type { TrackClickDirection } from "./types";

/**
 * Computes the maximum scrollTop value for a scroll container.
 *
 * This is the largest scrollTop you can have before reaching the bottom
 * of the content. If the content fits entirely, returns 0.
 *
 * @param scrollContainerHeight - Visible height of the scroll container (viewport).
 * @param scrollHeight - Total scrollable content height.
 * @returns Maximum scrollTop value in pixels.
 */
export function getMaxScrollTop(
  scrollContainerHeight: number,
  scrollHeight: number
): number {
  return Math.max(0, scrollHeight - scrollContainerHeight);
}

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

/**
 * Computes the virtual DOMRect.top of the scrollbar thumb relative to the track.
 * Equivalent to what you'd get from thumb.getBoundingClientRect().top,
 * but derived from scroll state and track geometry.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param viewportTrackTop - The top Y coordinate of the track element (in viewport coordinates).
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb's top Y coordinate in pixels, relative to the viewport.
 */
export function getViewportThumbTop(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  viewportTrackTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) {
    // Thumb fills track → top aligns with track top
    return viewportTrackTop;
  }

  // Thumb offset within track
  const thumbTop = getThumbTop(
    scrollContainerHeight,
    scrollHeight,
    scrollTop,
    trackHeight
  );

  // Absolute coordinate relative to viewport
  return viewportTrackTop + thumbTop;
}

/**
 * Computes the virtual DOMRect.bottom of the scrollbar thumb relative to the track.
 * Equivalent to what you'd get from thumb.getBoundingClientRect().bottom,
 * but derived from scroll state and track geometry.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param viewportTrackTop - The top Y coordinate of the track element (in viewport coordinates).
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb's bottom Y coordinate in pixels, relative to the viewport.
 */
export function getViewportThumbBottom(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  viewportTrackTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) {
    // No scrolling possible → thumb fills track
    return viewportTrackTop + trackHeight;
  }

  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  // Thumb offset within track
  const thumbTop = getThumbTop(
    scrollContainerHeight,
    scrollHeight,
    scrollTop,
    trackHeight
  );

  // Absolute bottom coordinate relative to viewport
  return viewportTrackTop + thumbTop + thumbHeight;
}

/**
 * Gets the total scrollable content height.
 *
 * @param contentHeight - The full height of the scrollable content.
 * @param scrollContainerHeight - The visible height of the scroll container (clientHeight).
 * @returns The scrollable height (contentHeight). If content fits entirely, returns viewportHeight.
 */
export function getScrollHeight(
  scrollContainerHeight: number,
  contentHeight: number
): number {
  // If content fits, scrollHeight should equal viewportHeight
  return Math.max(contentHeight, scrollContainerHeight);
}

/**
 * Computes the thumb's top offset in pixels within the scrollbar track.
 *
 * This value is the distance from the track's top edge to the thumb's top edge,
 * expressed in track-local pixels. At scrollTop = 0, the result is 0. At
 * scrollTop = maxScrollTop, the result is (trackHeight - thumbHeight).
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The thumb's top offset in pixels relative to the track.
 */
export function getThumbTop(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  return (
    getScrollProgressRatio(scrollContainerHeight, scrollHeight, scrollTop) *
    getThumbTravelHeight(scrollContainerHeight, scrollHeight, trackHeight)
  );
}

/**
 * Computes the thumb's vertical offset as a percentage of the thumb's own height,
 * suitable for direct use with CSS translateY(%).
 *
 * At scrollTop = 0 → 0%.
 * At scrollTop = maxScrollTop → (trackHeight - thumbHeight) / thumbHeight * 100%,
 * which moves the thumb so its bottom aligns flush with the track bottom.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The translateY percentage relative to the thumb's height.
 */
export function getThumbPercent(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  const thumbTop = getThumbTop(
    scrollContainerHeight,
    scrollHeight,
    scrollTop,
    trackHeight
  );

  // Percent relative to thumb height (what CSS translateY(%) uses)
  return (thumbTop / thumbHeight) * 100;
}

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

/**
 * Computes the conversion factor between track movement and scroll movement.
 *
 * This tells you how many track pixels correspond to one content pixel.
 * Used when converting drag deltas into scrollTop changes.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param trackHeight - The pixel height of the scrollbar track element.
 * @returns The factor (track pixels per content pixel).
 */
export function getTrackToScrollFactor(
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const maxScrollTop = scrollHeight - scrollContainerHeight;

  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  return thumbTravelHeight / maxScrollTop;
}

/**
 * Computes the normalized scroll progress ratio of a scroll container.
 *
 * This is scrollTop divided by the maximum scrollable distance.
 * Used when positioning the thumb relative to the track.
 *
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @param scrollTop - The current scrollTop of the scroll container.
 * @returns A number between 0 and 1 representing scroll progress.
 */
export function getScrollProgressRatio(
  scrollContainerHeight: number,
  scrollHeight: number,
  scrollTop: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  return scrollTop / maxScrollTop;
}

/**
 * Restores a scrollTop value from a normalized scroll progress ratio.
 *
 * The ratio should be the value returned by getScrollProgressRatio,
 * i.e. scrollTop / maxScrollTop.
 *
 * @param scrollProgressRatio - A number between 0 and 1 representing scroll progress.
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @returns The restored scrollTop value, clamped to the valid range.
 */
export function getScrollTopFromRatio(
  scrollProgressRatio: number,
  scrollContainerHeight: number,
  scrollHeight: number
): number {
  if (scrollHeight <= scrollContainerHeight) return 0;

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  // Clamp ratio to [0, 1] to avoid invalid values
  const clampedRatio = Math.max(0, Math.min(scrollProgressRatio, 1));

  return clampedRatio * maxScrollTop;
}

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

/**
 * Computes the thumb travel height (the vertical distance the thumb can move within the track).
 *
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns Thumb travel height in pixels.
 */
export function getThumbTravelHeight(
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  return Math.max(0, trackHeight - thumbHeight);
}

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

/**
 * Calculates the new scrollTop value when the user clicks on the track.
 * Simulates native scrollbar paging behavior (scrolling one viewport height).
 *
 * @param direction - The direction of the track click ("up", "down", or "none").
 * @param scrollTop - The current scrollTop of the scroll container.
 * @param scrollContainerHeight - The visible height of the scroll container (viewport).
 * @param scrollHeight - The total scrollable content height.
 * @returns The updated scrollTop value, clamped between 0 and the maximum scrollable offset.
 */
export function getPageScrollTop(
  direction: TrackClickDirection,
  scrollTop: number,
  scrollContainerHeight: number,
  scrollHeight: number
) {
  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  if (direction === "up") {
    return Math.max(0, scrollTop - scrollContainerHeight);
  }
  //
  else if (direction === "down") {
    return Math.min(maxScrollTop, scrollTop + scrollContainerHeight);
  }
  return scrollTop;
}

/**
 * Maps a given scrollTop to its track-relative thumb position.
 * Useful for scroll restoration (e.g. restoring thumb position after reload).
 *
 * @param scrollTop - Current scrollTop value.
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns The thumbTop (track-relative position in pixels).
 */
export function getThumbTopFromScrollTop(
  scrollTop: number,
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): number {
  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  // Clamp scrollTop to valid range
  const clampedScrollTop = Math.max(0, Math.min(scrollTop, maxScrollTop));

  // Map scrollTop to thumbTop
  return (clampedScrollTop / maxScrollTop) * thumbTravelHeight;
}

/**
 * Computes both scrollTop and thumbTop from a vertical delta in track space.
 * Useful for drag, wheel, or synthetic scroll updates.
 *
 * @param scrollTop - Current scrollTop before applying the delta.
 * @param deltaY - Vertical movement in track space (e.g. pointer, wheel).
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns An object containing the updated scrollTop and thumbTop (track-relative).
 */
export function getValuesFromDelta(
  scrollTop: number,
  deltaY: number,
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): { scrollTop: number; thumbTop: number } {
  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);

  const trackToScrollFactor = thumbTravelHeight / maxScrollTop;

  // Update scrollTop from delta
  const newScrollTop = Math.max(
    0,
    Math.min(scrollTop + deltaY / trackToScrollFactor, maxScrollTop)
  );

  // Map scrollTop back to thumbTop
  const newThumbTop = (newScrollTop / maxScrollTop) * thumbTravelHeight;

  return { scrollTop: newScrollTop, thumbTop: newThumbTop };
}

/**
 * Computes both the scrollTop and the clamped thumbTop when clicking on the track.
 * The thumb is centered on the click position, then clamped within the track.
 *
 * @param clientY - Pointer Y coordinate in viewport space.
 * @param viewportTrackTop - The top offset of the track in viewport space.
 * @param scrollContainerHeight - Visible height of the scroll container.
 * @param scrollHeight - Total scrollable content height.
 * @param trackHeight - Total track height.
 * @returns An object containing both scrollTop and thumbTop (in track-relative pixels).
 */
export function getValuesFromTrackClick(
  clientY: number,
  viewportTrackTop: number,
  scrollContainerHeight: number,
  scrollHeight: number,
  trackHeight: number
): { scrollTop: number; thumbTop: number } {
  // Thumb size
  const thumbHeight = getThumbHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );

  // Click position relative to track
  const clickY = clientY - viewportTrackTop;

  // Desired thumb top (centered on click)
  const desiredThumbTop = clickY - thumbHeight / 2;

  // Clamp thumb top within travel height
  const thumbTravelHeight = getThumbTravelHeight(
    scrollContainerHeight,
    scrollHeight,
    trackHeight
  );
  const clampedThumbTop = Math.max(
    0,
    Math.min(desiredThumbTop, thumbTravelHeight)
  );

  // Map to scrollTop
  const maxScrollTop = getMaxScrollTop(scrollContainerHeight, scrollHeight);
  const scrollTop = (clampedThumbTop / thumbTravelHeight) * maxScrollTop;

  return { scrollTop, thumbTop: clampedThumbTop };
}
