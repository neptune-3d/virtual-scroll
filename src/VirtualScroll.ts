import type { VirtualScrollProps } from "./types";

/**
 * VirtualScroll
 *
 * Encapsulates all logic for managing a virtualized scroll container, including:
 * - Geometry: viewport size, content size, track size, scroll offset, and thumb metrics.
 * - Thumb calculations: size, offset, percentage, and track-to-scroll conversion factors.
 * - Wheel handling: supports both pixel-based and item-based wheel flows.
 *   • Pixel flow: continuous scrolling in px units with inertial decay.
 *   • Item flow: discrete row/column scrolling in item units with inertial decay.
 * - Inertia: requestAnimationFrame loops that apply velocity, decay it over time,
 *   and update scrollOffset until motion naturally stops.
 *
 * Usage:
 * - Configure viewport/content/track sizes and itemSize/itemCount.
 * - Call `handleWheelPx(deltaY, deltaMode)` for continuous px-based scrolling.
 * - Call `handleWheelItems(deltaY, deltaMode)` for discrete item-based scrolling.
 * - Use getters (thumbSize, thumbOffset, thumbPercent, trackToScrollFactor, etc.)
 *   to render a custom scrollbar thumb in sync with scroll state.
 * - Call `stopWheelInertia()` to cancel any ongoing inertial scroll loop.
 *
 * This class is axis-agnostic: all methods work for both vertical (Y/height) and
 * horizontal (X/width) scrolling, depending on which dimension you configure.
 */
export class VirtualScroll {
  /**
   * Creates a new VirtualScroll instance.
   *
   * @param props - Object containing measurement callbacks and optional scroll callback.
   *
   * The measurement callbacks (`getViewportSize`, `getContentSize`, `getTrackSize`)
   * are invoked whenever VirtualScroll needs fresh values. The optional `onScroll`
   * is triggered only when actual scrolling occurs due to user-driven actions.
   */
  constructor(props: VirtualScrollProps) {
    this._getViewportSize = props.getViewportSize;
    this._getContentSize = props.getContentSize;
    this._getTrackSize = props.getTrackSize;
    this._onScroll = props.onScroll;
    this._getItemSize = props.getItemSize;
    this._getItemCount = props.getItemCount;

    this._minThumbSize = props.minThumbSize ?? 12;
    this._minVelocityPxStep = props.minVelocityPxStep ?? 10;
    this._maxVelocityPxStep = props.maxVelocityPxStep ?? 60;
    this._minVelocityItemStep = props.minVelocityItemStep ?? 1;
    this._maxVelocityItemStep = props.maxVelocityItemStep ?? 3;
    this._inertiaDecay = props.inertiaDecay ?? 0.7;
  }

  protected _getViewportSize;
  protected _getContentSize;
  protected _getTrackSize;
  protected _getItemSize;
  protected _getItemCount;
  protected _onScroll;

  protected _minThumbSize: number = 12;
  protected _minVelocityPxStep = 10;
  protected _maxVelocityPxStep = 60;
  protected _minVelocityItemStep = 1;
  protected _maxVelocityItemStep = 3;
  protected _inertiaDecay: number = 0.7;

  // state

  protected _scrollOffset: number = 0;

  protected _pxVelocity: number = 0;
  protected _itemVelocity: number = 0;

  protected _wheelAnimationFrame: number | null = null;

  /** Visible size of the scroll viewport (height or width in px). */
  get viewportSize(): number {
    return this._getViewportSize();
  }

  /** Total size of the scrollable content (height or width in px). */
  get contentSize(): number {
    return this._getContentSize();
  }

  /** Pixel size of the scrollbar track (height or width). */
  get trackSize(): number {
    return this._getTrackSize();
  }

  /**
   * Fixed size of each scrollable item.
   *
   * If a `getItemSize` callback was provided via props, its return value
   * is used. Otherwise, this falls back to a default of `1`.
   * This ensures VirtualScroll always has a valid item size even if
   * the host does not supply a measurement callback.
   */
  get itemSize(): number {
    return this._getItemSize?.() ?? 1;
  }

  /**
   * Total number of scrollable items.
   *
   * If a `getItemCount` callback was provided via props, its return value
   * is used. Otherwise, this falls back to a default of `0`.
   * This ensures VirtualScroll can operate safely even when the host
   * does not supply an item count callback.
   */
  get itemCount(): number {
    return this._getItemCount?.() ?? 0;
  }

  /** Minimum allowed thumb size in px for accessibility. */
  get minThumbSize(): number {
    return this._minThumbSize;
  }

  set minThumbSize(value: number) {
    this._minThumbSize = value;
  }

  /**
   * Minimum velocity step in pixels per frame.
   *
   * Used by inertia-based scrolling to ensure that pixel velocity
   * never decays below this threshold. Prevents the scroll from
   * becoming imperceptibly slow before stopping.
   */
  get minVelocityPxStep(): number {
    return this._minVelocityPxStep;
  }

  set minVelocityPxStep(value: number) {
    this._minVelocityPxStep = value;
  }

  /**
   * Maximum velocity step in pixels per frame.
   *
   * Used by inertia-based scrolling to cap pixel velocity so that
   * wheel or drag gestures cannot accelerate beyond a safe limit.
   */
  get maxVelocityPxStep(): number {
    return this._maxVelocityPxStep;
  }

  set maxVelocityPxStep(value: number) {
    this._maxVelocityPxStep = value;
  }

  /**
   * Minimum velocity step in items per frame.
   *
   * Used by item-velocity scrolling (row/column snapping) to ensure
   * that inertia always advances by at least this many items until
   * it comes to rest.
   */
  get minVelocityItemStep(): number {
    return this._minVelocityItemStep;
  }

  set minVelocityItemStep(value: number) {
    this._minVelocityItemStep = value;
  }

  /**
   * Maximum velocity step in items per frame.
   *
   * Used by item-velocity scrolling to cap how many items can be
   * advanced in a single frame during inertia. Prevents overshooting.
   */
  get maxVelocityItemStep(): number {
    return this._maxVelocityItemStep;
  }

  set maxVelocityItemStep(value: number) {
    this._maxVelocityItemStep = value;
  }

  /**
   * Inertia decay factor (0–1).
   *
   * Controls how quickly velocity diminishes during inertia loops.
   * A value near 1 means slow decay (longer glide), while a value
   * near 0 means rapid decay (shorter glide). Clamped between 0 and 1.
   */
  get inertiaDecay(): number {
    return this._inertiaDecay;
  }

  set inertiaDecay(value: number) {
    // clamp between 0 and 1 for safety
    this._inertiaDecay = Math.max(0, Math.min(1, value));
  }

  /**
   * Effective scrollable size.
   * If content fits, equals viewportSize.
   * Otherwise equals contentSize.
   */
  get scrollSize(): number {
    return Math.max(this.contentSize, this.viewportSize);
  }

  /**
   * Maximum scroll offset (distance you can scroll).
   */
  get maxScrollOffset(): number {
    return Math.max(0, this.contentSize - this.viewportSize);
  }

  /**
   * True if the content overflows and a scrollbar is needed, false otherwise.
   */
  get isScrollingNeeded(): boolean {
    return this.contentSize > this.viewportSize;
  }

  /**
   * Normalized scroll progress ratio between 0 and 1.
   * 0 → at start, 1 → at max scroll.
   */
  get scrollRatio(): number {
    if (!this.isScrollingNeeded) return 0;
    return this._scrollOffset / this.maxScrollOffset;
  }

  /** Current scroll offset in px (scrollTop/scrollLeft). */
  get scrollOffset(): number {
    return this._scrollOffset;
  }

  set scrollOffset(value: number) {
    this._scrollOffset = value;
  }

  /**
   * Sets the normalized scroll progress ratio between 0 and 1.
   *
   * The provided ratio is clamped to the valid range [0, 1] and then
   * converted back into an absolute scroll offset based on the current
   * `maxScrollOffset`. This allows external code to restore or adjust
   * scroll position in a resolution‑independent way.
   *
   * A common use case is scroll restoration: you can persist the ratio
   * (e.g. 0.5 for halfway down) and later restore it regardless of
   * content or viewport size changes.
   */
  set scrollRatio(ratio: number) {
    if (!this.isScrollingNeeded) {
      this._scrollOffset = 0;
      return;
    }
    const clampedRatio = Math.max(0, Math.min(ratio, 1));
    this._scrollOffset = clampedRatio * this.maxScrollOffset;
  }

  /** Scrollbar thumb size in pixels. Returns 0 if contentSize <= 0 or trackSize === 0. */
  get thumbSize(): number {
    if (this.contentSize <= 0 || this.trackSize === 0) return 0;
    const rawSize =
      Math.min(1, this.viewportSize / this.contentSize) * this.trackSize;
    return Math.max(rawSize, this._minThumbSize);
  }

  /**
   * Maximum distance the thumb can travel along the track (trackSize − thumbSize).
   */
  get thumbTravelSize(): number {
    return Math.max(0, this.trackSize - this.thumbSize);
  }

  /**
   * Thumb offset in pixels relative to the track.
   * 0 → at start, trackSize - thumbSize → at max scroll.
   */
  get thumbOffset(): number {
    if (!this.isScrollingNeeded) return 0;
    return this.scrollRatio * this.thumbTravelSize;
  }

  /** Percentage of the thumb offset relative to thumb size (0–100). */
  get thumbPercent(): number {
    if (!this.isScrollingNeeded) return 0;
    const size = this.thumbSize;
    if (size <= 0) return 0; // no track or zero-sized thumb → 0%
    return (this.thumbOffset / size) * 100;
  }

  /**
   * Conversion factor between track movement and scroll movement.
   * Tells how many track pixels correspond to one content pixel.
   */
  get trackToScrollFactor(): number {
    if (!this.isScrollingNeeded) return 0;
    return this.thumbTravelSize / this.maxScrollOffset;
  }

  /**
   * Returns true if the scroll is currently at the top.
   *
   * The check allows for a small tolerance near the top boundary
   * to account for floating‑point drift. In practice, this means
   * the scroll is considered "at top" if `scrollOffset` is very
   * close to zero.
   *
   * For a strict check without tolerance, compare
   * `scrollOffset === 0`.
   */
  get isScrollAtTop(): boolean {
    const range = this.maxScrollOffset;
    if (range <= 0) return true; // no scroll: treat as top
    return this._scrollOffset <= this.scrollPositionToleranceRange;
  }

  /**
   * Returns true if the scroll is currently at the bottom.
   *
   * The check allows for a small tolerance near the bottom boundary
   * to account for floating‑point drift in inertia math. In practice,
   * this means the scroll is considered "at bottom" if `scrollOffset`
   * is very close to `maxScrollOffset`.
   *
   * For a strict check without tolerance, compare
   * `scrollOffset === maxScrollOffset`.
   */
  get isScrollAtBottom(): boolean {
    const range = this.maxScrollOffset;
    if (range <= 0) return false; // no scroll: not bottom
    return (
      Math.abs(this._scrollOffset - range) <= this.scrollPositionToleranceRange
    );
  }

  /**
   * Internal tolerance range used when checking proximity to
   * scroll boundaries (top = 0, bottom = maxScrollOffset).
   * Scaled relative to the scrollable range to absorb
   * floating‑point drift.
   */
  protected get scrollPositionToleranceRange(): number {
    const range = this.maxScrollOffset;
    if (range <= 0) return 0;
    return range * 1e-6;
  }

  /**
   * Computes the index of the first fully visible item in the current viewport.
   *
   * A fully visible item is one whose top edge is at or below the viewport's top
   * and whose bottom edge is at or above the viewport's bottom.
   *
   * - If the item at the computed index is fully visible, that index is returned.
   * - If the item is only partially visible, the next index is returned instead.
   *
   * @returns {number} The index of the first fully visible item.
   */
  getFirstFullyVisibleIndex(): number {
    const viewportTop = this._scrollOffset;
    const viewportBottom = viewportTop + this.viewportSize;

    const firstIndex = Math.ceil(viewportTop / this.itemSize);
    const rowTop = firstIndex * this.itemSize;
    const rowBottom = rowTop + this.itemSize;

    if (rowBottom <= viewportBottom) {
      return firstIndex;
    }
    // If the computed index is only partially visible, move to the next one
    return firstIndex + 1;
  }

  /**
   * Computes the index of the last fully visible item in the current viewport.
   *
   * A fully visible item is one whose top edge is at or below the viewport's bottom
   * and whose bottom edge is at or above the viewport's top.
   *
   * - If the item at the computed index is fully visible, that index is returned.
   * - If the item is only partially visible, the previous index is returned instead.
   *
   * @returns {number} The index of the last fully visible item.
   */
  getLastFullyVisibleIndex(): number {
    const viewportTop = this._scrollOffset;
    const viewportBottom = viewportTop + this.viewportSize;

    const lastIndex = Math.floor((viewportBottom - 1) / this.itemSize);
    const rowTop = lastIndex * this.itemSize;
    const rowBottom = rowTop + this.itemSize;

    if (rowTop >= viewportTop && rowBottom <= viewportBottom) {
      return lastIndex;
    }
    // If the computed index is only partially visible, move up one
    return lastIndex - 1;
  }

  /**
   * Calculates the next PageUp focus index without mutating scroll state.
   *
   * - If focus is not yet at the first fully visible item, return that top item (no scroll).
   * - If focus is already at the first fully visible item, move one visible page up:
   *   the old top fully visible item becomes the new bottom fully visible item.
   *
   * @param {number} currentFocusedIndex - The index of the currently focused item.
   * @returns {number} The index that should be focused after a PageUp action.
   */
  getNextPageUpIndex(currentFocusedIndex: number): number {
    const firstVisible = this.getFirstFullyVisibleIndex();
    const lastVisible = this.getLastFullyVisibleIndex();
    const visibleCount = Math.max(1, lastVisible - firstVisible + 1);

    // Case 1: focus not yet at the top → just jump to top, no scroll
    if (currentFocusedIndex > firstVisible) {
      return firstVisible;
    }

    // Case 2: focus is at the top → move one visible page up
    // Ensure the old top becomes the new bottom
    const target = Math.max(0, firstVisible - visibleCount + 1);
    return target;
  }

  /**
   * Calculates the next PageDown focus index without mutating scroll state.
   *
   * Semantics:
   * - If the current focus is not yet at the last fully visible item,
   *   return that bottom item (no scroll).
   * - If the current focus is already at the last fully visible item,
   *   move one visible page down:
   *   the old bottom fully visible item becomes the new top fully visible item.
   *
   * @param {number} currentFocusedIndex - The index of the currently focused item.
   * @returns {number} The index that should be focused after a PageDown action.
   */
  getNextPageDownIndex(currentFocusedIndex: number): number {
    const firstVisible = this.getFirstFullyVisibleIndex();
    const lastVisible = this.getLastFullyVisibleIndex();
    const visibleCount = Math.max(1, lastVisible - firstVisible + 1);

    // Case 1: focus not yet at the bottom → just jump to bottom, no scroll
    if (currentFocusedIndex < lastVisible) {
      return lastVisible;
    }

    // Case 2: focus is at the bottom → move one visible page down
    // Ensure the old bottom becomes the new top
    const target = Math.min(this.itemCount - 1, lastVisible + visibleCount - 1);
    return target;
  }

  /**
   * Checks whether the item at the given index is visible in the current viewport.
   *
   * By default, this requires the item to be fully visible:
   * - Its top edge must be at or below the viewport's top.
   * - Its bottom edge must be at or above the viewport's bottom.
   *
   * If you want to allow partial visibility, pass `fully = false`.
   *
   * @param {number} itemIndex - The index of the item to check.
   * @param {boolean} [fully=true] - Whether to require full visibility (default true).
   * @returns {boolean} True if the item is visible according to the chosen mode.
   */
  isItemVisible(itemIndex: number, fully: boolean = true): boolean {
    const rowTop = itemIndex * this.itemSize;
    const rowBottom = rowTop + this.itemSize;
    const viewportTop = this._scrollOffset;
    const viewportBottom = viewportTop + this.viewportSize;

    if (fully) {
      // Fully visible: item entirely within viewport
      return rowTop >= viewportTop && rowBottom <= viewportBottom;
    }
    //
    else {
      // Partially visible: any overlap with viewport
      return rowBottom > viewportTop && rowTop < viewportBottom;
    }
  }

  /**
   * Adjusts the current scroll offset by applying a delta value expressed in track space.
   *
   * This method is typically used to process user interactions such as drag gestures,
   * mouse wheel events, or synthetic scroll updates. The delta is converted from track
   * coordinates into scroll offset units using `trackToScrollFactor`.
   *
   * Behavior:
   * - If scrolling is not needed (`isScrollingNeeded` is false), the method exits without changes.
   * - Otherwise, the new scroll offset is computed as:
   *   `currentOffset + delta / trackToScrollFactor`.
   * - The result is clamped between `0` and `maxScrollOffset` to ensure it stays within
   *   valid bounds.
   * - Finally, the scroll offset is updated via `setScrollOffset(newScrollOffset)`.
   *
   * @param {number} delta - The change in track space (e.g., pixels moved on the scrollbar track).
   * @returns {void} Updates the internal scroll offset state.
   */
  handleDelta(delta: number): void {
    if (!this.isScrollingNeeded) {
      return;
    }

    const newScrollOffset = Math.max(
      0,
      Math.min(
        this._scrollOffset + delta / this.trackToScrollFactor,
        this.maxScrollOffset
      )
    );

    this.setScrollOffset(newScrollOffset);
  }

  /**
   * Handles a track click by centering the thumb on the click position,
   * clamping within the track, and updating scrollOffset accordingly.
   *
   * @param clientCoord - Pointer coordinate in viewport space (clientY/clientX).
   * @param viewportTrackStart - Track's start coordinate in viewport space.
   */
  handleTrackClick(clientCoord: number, viewportTrackStart: number): void {
    if (!this.isScrollingNeeded) {
      return;
    }

    // Click position relative to track
    const clickPos = clientCoord - viewportTrackStart;

    // Desired thumb start (centered on click)
    const desiredThumbOffset = clickPos - this.thumbSize / 2;

    // Clamp thumb offset within travel size
    const clampedThumbOffset = Math.max(
      0,
      Math.min(desiredThumbOffset, this.thumbTravelSize)
    );

    // Map clamped thumb offset back to scrollOffset
    this.setScrollOffset(
      this.thumbTravelSize > 0
        ? (clampedThumbOffset / this.thumbTravelSize) * this.maxScrollOffset
        : 0
    );
  }

  /**
   * Applies a PageUp/PageDown jump to update scrollOffset.
   * Delegates to getPageScrollValues for the math.
   *
   * @param direction - "up" for PageUp, "down" for PageDown.
   */
  handlePageScroll(direction: "up" | "down"): void {
    if (!this.isScrollingNeeded) {
      return;
    }

    const scrollOffset = this.getPageScrollOffset(
      this._scrollOffset,
      direction
    );

    this.setScrollOffset(scrollOffset);
  }

  /**
   * Ensures the given row index is visible in the viewport,
   * with alignment options similar to native scrollIntoView.
   *
   * Alignment modes:
   * - "start"   → Scrolls so the item’s top edge aligns with the top of the viewport.
   * - "end"     → Scrolls so the item’s bottom edge aligns with the bottom of the viewport.
   * - "center"  → Scrolls so the item is centered vertically within the viewport.
   * - "nearest" → Scrolls the shortest distance needed to bring the item fully into view.
   *               If the item is already visible, no scrolling occurs. If it’s above the
   *               viewport, it snaps up; if below, it snaps down.
   *
   * @param itemIndex - The index of the row to bring into view.
   * @param align - Alignment mode (default: "start").
   */
  scrollItemIntoView(
    itemIndex: number,
    align: "nearest" | "start" | "end" | "center" = "start"
  ): void {
    if (!this.isScrollingNeeded) return;

    const rowTop = itemIndex * this.itemSize;
    const rowBottom = rowTop + this.itemSize;
    const viewportTop = this._scrollOffset;
    const viewportBottom = viewportTop + this.viewportSize;

    let newOffset = this._scrollOffset;

    switch (align) {
      case "start":
        newOffset = rowTop;
        break;
      case "end":
        newOffset = rowBottom - this.viewportSize;
        break;
      case "center":
        newOffset = rowTop - (this.viewportSize - this.itemSize) / 2;
        break;
      case "nearest":
      default:
        if (rowTop < viewportTop) {
          // snap up
          newOffset = rowTop;
        }
        //
        else if (rowBottom > viewportBottom) {
          // snap down
          newOffset = rowBottom - this.viewportSize;
        }
        break;
    }

    // Clamp to valid range
    newOffset = Math.max(0, Math.min(newOffset, this.maxScrollOffset));

    this.setScrollOffset(newOffset);
  }

  /**
   * Handle a wheel delta and feed it into the inertia system.
   *
   * @param deltaY - The wheel delta along the scroll axis.
   * @param deltaMode - WheelEvent.DOM_DELTA_PIXEL (0), LINE (1), or PAGE (2).
   *
   * How it works:
   * - Normalizes the wheel delta into pixel units (line/page → px).
   * - Converts that pixel delta into a discrete velocity step.
   * - Accumulates velocity into `_pxVelocity`.
   * - Starts the inertia loop if not already running.
   */
  handleWheelPx(deltaY: number, deltaMode: number): void {
    const deltaPx = this.getWheelPxDelta(deltaY, deltaMode);

    const step = this.getVelocityPxStep(deltaPx);
    this._pxVelocity += step;

    if (this._wheelAnimationFrame === null) {
      this.startWheelInertia("px", 0.5, this.getVelocityPxValues);
    }
  }

  /**
   * Handle a wheel delta in item units.
   *
   * @param deltaY - Wheel delta along scroll axis.
   * @param deltaMode - WheelEvent.DOM_DELTA_PIXEL (0), LINE (1), or PAGE (2).
   *
   * How it works:
   * - Normalizes wheel delta into item units.
   * - Converts into a discrete item step.
   * - Accumulates velocity into `_itemVelocity`.
   * - Starts inertia loop if not already running.
   */
  handleWheelItems(deltaY: number, deltaMode: number): void {
    const deltaItems = this.getWheelItemDelta(deltaY, deltaMode);

    const step = this.getVelocityItemStep(deltaItems);
    this._itemVelocity += step;

    if (this._wheelAnimationFrame === null) {
      this.startWheelInertia("item", 0.01, this.getVelocityItemValues);
    }
  }

  /**
   * Stops any active inertia-driven scrolling.
   *
   * Cancels the current `requestAnimationFrame` loop (if running) and
   * resets both pixel and item velocity fields to zero. After calling
   * this method, no further inertia updates will occur until new input
   * handlers are invoked.
   *
   * Typical usage is when you need to immediately halt momentum scrolling,
   * such as when the user performs a direct jump (e.g., track click) or
   * when unmounting a component. This method is idempotent: it is safe to
   * call multiple times without side effects.
   */
  stopInertia(): void {
    if (this._wheelAnimationFrame !== null) {
      cancelAnimationFrame(this._wheelAnimationFrame);
      this._wheelAnimationFrame = null;
    }

    this._pxVelocity = 0;
    this._itemVelocity = 0;
  }

  protected setScrollOffset(newScrollOffset: number) {
    if (newScrollOffset !== this._scrollOffset) {
      this._scrollOffset = newScrollOffset;
      this._onScroll?.();
    }
  }

  protected updateMeasurements(oldRatio: number): void {
    if (!this.isScrollingNeeded) {
      this._scrollOffset = 0;
    }
    //
    else {
      const clamped = Math.max(0, Math.min(oldRatio, 1));
      this._scrollOffset = clamped * this.maxScrollOffset;
    }
  }

  protected startWheelInertia(
    velocityRef: "px" | "item",
    threshold: number,
    getValues: (
      offset: number,
      velocity: number
    ) => { scrollOffset: number; velocity: number }
  ): void {
    const step = () => {
      const currentVelocity =
        velocityRef === "px" ? this._pxVelocity : this._itemVelocity;

      if (Math.abs(currentVelocity) < threshold) {
        if (velocityRef === "px") {
          this._pxVelocity = 0;
        }
        //
        else {
          this._itemVelocity = 0;
        }
        this._wheelAnimationFrame = null;
        return;
      }

      const values = getValues(this._scrollOffset, currentVelocity);

      if (velocityRef === "px") {
        this._pxVelocity = values.velocity;
      }
      //
      else {
        this._itemVelocity = values.velocity;
      }

      this.setScrollOffset(values.scrollOffset);

      this._wheelAnimationFrame = requestAnimationFrame(step);
    };

    if (this._wheelAnimationFrame !== null) {
      cancelAnimationFrame(this._wheelAnimationFrame);
    }
    this._wheelAnimationFrame = requestAnimationFrame(step);
  }

  protected getWheelPxDelta(delta: number, deltaMode: number): number {
    if (deltaMode === 1) {
      return delta * this.itemSize; // line units → px
    }
    //
    else if (deltaMode === 2) {
      return delta * this.viewportSize; // page units → px
    }
    return delta; // pixel mode
  }

  protected getVelocityPxStep(normalizedDeltaPx: number): number {
    const sign = Math.sign(normalizedDeltaPx);
    if (sign === 0) return 0;
    if (Math.abs(normalizedDeltaPx) <= this._minVelocityPxStep)
      return sign * this._minVelocityPxStep;
    const clamped = Math.min(
      Math.max(Math.abs(normalizedDeltaPx), this._minVelocityPxStep),
      this._maxVelocityPxStep
    );
    return sign * clamped;
  }

  protected getVelocityPxValues = (
    scrollOffset: number,
    velocityPx: number
  ): { scrollOffset: number; velocity: number } => {
    const scrollExtent = Math.max(this.contentSize, this.viewportSize);
    const maxScrollOffset = scrollExtent - this.viewportSize;

    let newScrollOffset = scrollOffset + velocityPx;
    newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

    const nextVelocity = velocityPx * this._inertiaDecay;

    return {
      scrollOffset: newScrollOffset,
      velocity: nextVelocity,
    };
  };

  protected getWheelItemDelta(delta: number, deltaMode: number): number {
    if (deltaMode === 1) {
      return delta; // line units
    }
    //
    else if (deltaMode === 2) {
      return delta * (this.viewportSize / this.itemSize); // page units → items
    }
    return Math.sign(delta); // pixel mode → ±1 item
  }

  protected getVelocityItemStep(normalizedDelta: number): number {
    const sign = Math.sign(normalizedDelta);
    if (sign === 0) return 0;
    if (Math.abs(normalizedDelta) === 1) return sign * 1;
    const clamped = Math.min(
      Math.max(Math.abs(normalizedDelta), this._minVelocityItemStep),
      this._maxVelocityItemStep
    );
    return sign * clamped;
  }

  protected getVelocityItemValues = (
    scrollOffset: number,
    itemVelocity: number
  ): { scrollOffset: number; velocity: number } => {
    const scrollExtent = Math.max(this.contentSize, this.viewportSize);
    const remainder = this.viewportSize % this.itemSize;
    const downOffset = remainder === 0 ? 0 : this.itemSize - remainder;

    let stepItems = Math.round(itemVelocity);
    const nextVelocity = itemVelocity * this._inertiaDecay;
    let newScrollOffset = scrollOffset;

    if (stepItems > 0) {
      const baseIndex = Math.floor((scrollOffset - downOffset) / this.itemSize);
      let newIndex = Math.floor(baseIndex + stepItems);
      const visibleItemsFloat = this.viewportSize / this.itemSize;
      const maxIndex = this.itemCount - Math.ceil(visibleItemsFloat);
      newIndex = Math.max(0, Math.min(maxIndex, newIndex));
      newScrollOffset = newIndex * this.itemSize + downOffset;
    }
    //
    else if (stepItems < 0) {
      const baseIndex = Math.ceil(scrollOffset / this.itemSize);
      let newIndex = Math.ceil(baseIndex + stepItems);
      const visibleItemsFloat = this.viewportSize / this.itemSize;
      const maxIndex = this.itemCount - Math.ceil(visibleItemsFloat);
      newIndex = Math.max(0, Math.min(maxIndex, newIndex));
      newScrollOffset = newIndex * this.itemSize;
    }

    const maxScrollOffset = scrollExtent - this.viewportSize;
    newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

    return {
      scrollOffset: newScrollOffset,
      velocity: nextVelocity,
    };
  };

  protected getPageScrollOffset(
    scrollOffset: number,
    direction: "up" | "down"
  ): number {
    const scrollExtent = Math.max(this.contentSize, this.viewportSize);
    const maxScrollOffset = scrollExtent - this.viewportSize;

    let newScrollOffset =
      direction === "down"
        ? scrollOffset + this.viewportSize
        : scrollOffset - this.viewportSize;

    newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

    return newScrollOffset;
  }
}
