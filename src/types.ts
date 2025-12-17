/**
 * Props for configuring a VirtualScroll instance.
 *
 * The host provides measurement callbacks and may override
 * scroll physics constants. VirtualScroll will invoke the
 * measurement callbacks whenever it needs fresh values.
 */
export type VirtualScrollProps = {
  /** Callback returning the current visible size of the scroll viewport (height or width in px). */
  getViewportSize: () => number;

  /** Callback returning the total size of the scrollable content (height or width in px). */
  getContentSize: () => number;

  /** Callback returning the pixel size of the scrollbar track (height or width). */
  getTrackSize: () => number;

  /**
   * Optional callback returning the fixed size of each scrollable item
   * in pixels (or logical units).
   *
   * If provided, VirtualScroll will invoke this callback whenever it
   * needs the current item size. If omitted, the class falls back to
   * a default value of `1` via the `itemSize` getter, ensuring that
   * scroll math remains valid even without a host-supplied callback.
   */
  getItemSize?: () => number;

  /**
   * Optional callback returning the total number of scrollable items.
   *
   * If provided, VirtualScroll will invoke this callback whenever it
   * needs the current item count. If omitted, the class falls back to
   * a default value of `0` via the `itemCount` getter, ensuring that
   * VirtualScroll can operate safely even when the host does not
   * supply an item count callback.
   */
  getItemCount?: () => number;

  /** Optional callback invoked only when actual scrolling occurs. */
  onScroll?: () => void;

  /** Minimum pixel size of the scrollbar thumb. Default: 12. */
  minThumbSize?: number;

  /** Minimum velocity step in pixels per frame. Default: 10. */
  minVelocityPxStep?: number;

  /** Maximum velocity step in pixels per frame. Default: 60. */
  maxVelocityPxStep?: number;

  /** Minimum velocity step in items per frame. Default: 1. */
  minVelocityItemStep?: number;

  /** Maximum velocity step in items per frame. Default: 3. */
  maxVelocityItemStep?: number;

  /** Inertia decay factor applied to wheel/inertial scrolling. Default: 0.7. */
  inertiaDecay?: number;
};
