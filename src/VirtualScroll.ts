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
   * @param onScroll - Optional callback invoked only when actual scrolling occurs.
   *                   This is triggered by user-driven scroll actions:
   *                   - `handleDelta`
   *                   - `handleTrackClick`
   *                   - `handleWheelPx`
   *                   - `handleWheelItems`
   *                   - `handlePageScroll`
   *
   *                   It is **not** called during measurement changes (e.g. resize,
   *                   viewport/content/track setters). The host application can use
   *                   this callback to update its UI (e.g., reposition a thumb,
   *                   redraw visible items) whenever the scrollOffset changes due
   *                   to a scroll action.
   *
   * @param itemSize - The fixed size of each scrollable item in pixels (or logical units).
   *                   Defaults to `1`. This value is used to calculate scroll offsets,
   *                   velocity steps, and snapping behavior.
   *
   * The constructor initializes the scroll model with the given item size and registers
   * an optional scroll callback.
   */
  constructor(onScroll?: () => void, itemSize: number = 1) {
    this._itemSize = itemSize;
    this._onScroll = onScroll;
  }

  protected _viewportSize: number = 0;
  protected _contentSize: number = 0;
  protected _trackSize: number = 0;
  protected _scrollOffset: number = 0;
  protected _itemSize: number;
  protected _itemCount: number = 0;
  protected _onScroll?: () => void;

  protected _minThumbSize: number = 12;
  protected _minVelocityPxStep = 10;
  protected _maxVelocityPxStep = 60;
  protected _minVelocityItemStep = 1;
  protected _maxVelocityItemStep = 3;
  protected _inertiaDecay: number = 0.7;

  protected _pxVelocity: number = 0;
  protected _itemVelocity: number = 0;
  protected _wheelAnimationFrame: number | null = null;

  /** Visible size of the scroll viewport (height or width in px). */
  get viewportSize(): number {
    return this._viewportSize;
  }

  /**
   * Sets the visible size of the scroll viewport.
   *
   * ⚠️ Side effect: This will trigger a reconciliation of scroll state
   * using the previous scrollProgressRatio. The scrollOffset will be
   * adjusted to preserve the old ratio relative to the new maxScrollOffset
   */
  set viewportSize(value: number) {
    const oldRatio = this.scrollProgressRatio;
    this._viewportSize = value;
    this.updateMeasurements(oldRatio);
  }

  /** Total size of the scrollable content (height or width in px). */
  get contentSize(): number {
    return this._contentSize;
  }

  /**
   * Sets the total size of the scrollable content.
   *
   * ⚠️ Side effect: This will trigger a reconciliation of scroll state
   * using the previous scrollProgressRatio. The scrollOffset will be
   * adjusted to preserve the old ratio relative to the new maxScrollOffset.
   */
  set contentSize(value: number) {
    const oldRatio = this.scrollProgressRatio;
    this._contentSize = value;
    this.updateMeasurements(oldRatio);
  }

  /** Pixel size of the scrollbar track (height or width). */
  get trackSize(): number {
    return this._trackSize;
  }

  set trackSize(value: number) {
    this._trackSize = value;
  }

  /** Current scroll offset in px (scrollTop/scrollLeft). */
  get scrollOffset(): number {
    return this._scrollOffset;
  }

  set scrollOffset(value: number) {
    this._scrollOffset = value;
  }

  /** Minimum allowed thumb size in px for accessibility. */
  get minThumbSize(): number {
    return this._minThumbSize;
  }

  set minThumbSize(value: number) {
    this._minThumbSize = value;
  }

  /**
   * Size of one item in px (row height or column width).
   *
   * Note: This value is not used in measurement reconciliation
   * (viewport/content sizes). It is consumed by the
   * item-velocity scrolling logic to determine how far to
   * advance when applying wheel/item-based inertia.
   */
  get itemSize(): number {
    return this._itemSize;
  }

  set itemSize(value: number) {
    this._itemSize = value;
  }

  /**
   * Total number of items in the scrollable content.
   *
   * Note: This count is not part of the measurement setters
   * that trigger scrollOffset reconciliation. It is used by
   * item-velocity scrolling to calculate how many discrete
   * steps are available when applying momentum or snapping.
   */
  get itemCount(): number {
    return this._itemCount;
  }

  set itemCount(value: number) {
    this._itemCount = value;
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
    return Math.max(this._contentSize, this._viewportSize);
  }

  /**
   * Maximum scroll offset (distance you can scroll).
   */
  get maxScrollOffset(): number {
    return Math.max(0, this._contentSize - this._viewportSize);
  }

  /**
   * True if the content overflows and a scrollbar is needed, false otherwise.
   */
  get isScrollingNeeded(): boolean {
    return this._contentSize > this._viewportSize;
  }

  /**
   * Normalized scroll progress ratio between 0 and 1.
   * 0 → at start, 1 → at max scroll.
   */
  get scrollProgressRatio(): number {
    if (!this.isScrollingNeeded) return 0;
    return this._scrollOffset / this.maxScrollOffset;
  }

  set scrollProgressRatio(ratio: number) {
    if (!this.isScrollingNeeded) {
      this._scrollOffset = 0;
      return;
    }
    const clampedRatio = Math.max(0, Math.min(ratio, 1));
    this._scrollOffset = clampedRatio * this.maxScrollOffset;
  }

  /** Scrollbar thumb size in pixels. Returns 0 if contentSize <= 0 or trackSize === 0. */
  get thumbSize(): number {
    if (this._contentSize <= 0 || this._trackSize === 0) return 0;
    const rawSize =
      Math.min(1, this._viewportSize / this._contentSize) * this._trackSize;
    return Math.max(rawSize, this._minThumbSize);
  }

  /**
   * Maximum distance the thumb can travel along the track (trackSize − thumbSize).
   */
  get thumbTravelSize(): number {
    return Math.max(0, this._trackSize - this.thumbSize);
  }

  /**
   * Thumb offset in pixels relative to the track.
   * 0 → at start, trackSize - thumbSize → at max scroll.
   */
  get thumbOffset(): number {
    if (!this.isScrollingNeeded) return 0;
    return this.scrollProgressRatio * this.thumbTravelSize;
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
   * Applies a delta in track space to update scrollOffset.
   * Useful for drag, wheel, or synthetic scroll updates.
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

    this._scrollOffset = newScrollOffset;

    this._onScroll?.();
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
    this._scrollOffset =
      this.thumbTravelSize > 0
        ? (clampedThumbOffset / this.thumbTravelSize) * this.maxScrollOffset
        : 0;

    this._onScroll?.();
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

    const { scrollOffset } = this.getPageScrollValues(
      this._scrollOffset,
      direction
    );

    this._scrollOffset = scrollOffset;

    this._onScroll?.();
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
        } else {
          this._itemVelocity = 0;
        }
        this._wheelAnimationFrame = null;
        return;
      }

      const values = getValues(this._scrollOffset, currentVelocity);
      this._scrollOffset = values.scrollOffset;

      if (velocityRef === "px") {
        this._pxVelocity = values.velocity;
      } else {
        this._itemVelocity = values.velocity;
      }

      this._onScroll?.();
      this._wheelAnimationFrame = requestAnimationFrame(step);
    };

    if (this._wheelAnimationFrame !== null) {
      cancelAnimationFrame(this._wheelAnimationFrame);
    }
    this._wheelAnimationFrame = requestAnimationFrame(step);
  }

  protected getWheelPxDelta(delta: number, deltaMode: number): number {
    if (deltaMode === 1) {
      return delta * this._itemSize; // line units → px
    } else if (deltaMode === 2) {
      return delta * this._viewportSize; // page units → px
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
  ): { scrollOffset: number; velocity: number; thumbOffset: number } => {
    const scrollExtent = Math.max(this._contentSize, this._viewportSize);
    const maxScrollOffset = scrollExtent - this._viewportSize;

    let newScrollOffset = scrollOffset + velocityPx;
    newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

    const nextVelocity = velocityPx * this._inertiaDecay;

    const thumbOffset =
      maxScrollOffset > 0
        ? (newScrollOffset / maxScrollOffset) * this.thumbTravelSize
        : 0;

    return {
      scrollOffset: newScrollOffset,
      velocity: nextVelocity,
      thumbOffset,
    };
  };

  protected getWheelItemDelta(delta: number, deltaMode: number): number {
    if (deltaMode === 1) {
      return delta; // line units
    } else if (deltaMode === 2) {
      return delta * (this._viewportSize / this._itemSize); // page units → items
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
  ): { scrollOffset: number; velocity: number; thumbOffset: number } => {
    const scrollExtent = Math.max(this._contentSize, this._viewportSize);
    const remainder = this._viewportSize % this._itemSize;
    const downOffset = remainder === 0 ? 0 : this._itemSize - remainder;

    let stepItems = Math.round(itemVelocity);
    const nextVelocity = itemVelocity * this._inertiaDecay;
    let newScrollOffset = scrollOffset;

    if (stepItems > 0) {
      const baseIndex = Math.floor(
        (scrollOffset - downOffset) / this._itemSize
      );
      let newIndex = Math.floor(baseIndex + stepItems);
      const visibleItemsFloat = this._viewportSize / this._itemSize;
      const maxIndex = this._itemCount - Math.ceil(visibleItemsFloat);
      newIndex = Math.max(0, Math.min(maxIndex, newIndex));
      newScrollOffset = newIndex * this._itemSize + downOffset;
    }
    //
    else if (stepItems < 0) {
      const baseIndex = Math.ceil(scrollOffset / this._itemSize);
      let newIndex = Math.ceil(baseIndex + stepItems);
      const visibleItemsFloat = this._viewportSize / this._itemSize;
      const maxIndex = this._itemCount - Math.ceil(visibleItemsFloat);
      newIndex = Math.max(0, Math.min(maxIndex, newIndex));
      newScrollOffset = newIndex * this._itemSize;
    }

    const maxScrollOffset = scrollExtent - this._viewportSize;
    newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

    const thumbOffset =
      maxScrollOffset > 0
        ? (newScrollOffset / maxScrollOffset) *
          (this._trackSize - Math.max(1, this._itemSize))
        : 0;

    return {
      scrollOffset: newScrollOffset,
      velocity: nextVelocity,
      thumbOffset,
    };
  };

  protected getPageScrollValues(
    scrollOffset: number,
    direction: "up" | "down"
  ): { scrollOffset: number; thumbOffset: number } {
    const scrollExtent = Math.max(this._contentSize, this._viewportSize);
    const maxScrollOffset = scrollExtent - this._viewportSize;

    let newScrollOffset =
      direction === "down"
        ? scrollOffset + this._viewportSize
        : scrollOffset - this._viewportSize;

    newScrollOffset = Math.max(0, Math.min(maxScrollOffset, newScrollOffset));

    const thumbOffset =
      maxScrollOffset > 0
        ? (newScrollOffset / maxScrollOffset) * this.thumbTravelSize
        : 0;

    return { scrollOffset: newScrollOffset, thumbOffset };
  }
}
