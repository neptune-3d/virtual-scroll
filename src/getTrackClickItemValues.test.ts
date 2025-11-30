import { describe, expect, it } from "vitest";
import { getTrackClickItemValues } from "./getTrackClickItemValues";

describe("getTrackClickItemValues", () => {
  const viewportSize = 100; // visible height
  const contentSize = 500; // total content height
  const trackSize = 100; // track height
  const itemSize = 20; // row height
  const itemCount = 25; // total rows
  const viewportTrackStart = 0; // track starts at 0 for simplicity

  it("click near the top should snap to first item", () => {
    const { scrollOffset, thumbOffset } = getTrackClickItemValues(
      5,
      viewportTrackStart,
      viewportSize,
      contentSize,
      trackSize,
      itemSize,
      itemCount
    );
    expect(scrollOffset).toBe(0); // snapped to row 0
    expect(thumbOffset).toBe(0); // thumb at top
  });

  it("click near the middle should snap to a mid item", () => {
    const { scrollOffset } = getTrackClickItemValues(
      50,
      viewportTrackStart,
      viewportSize,
      contentSize,
      trackSize,
      itemSize,
      itemCount
    );
    // Should snap to nearest multiple of 20
    expect(scrollOffset % itemSize).toBe(0);
    expect(scrollOffset).toBeGreaterThan(0);
    expect(scrollOffset).toBeLessThan(contentSize);
  });

  it("click near the bottom should snap to last visible item", () => {
    const { scrollOffset } = getTrackClickItemValues(
      95,
      viewportTrackStart,
      viewportSize,
      contentSize,
      trackSize,
      itemSize,
      itemCount
    );
    const maxIndex = itemCount - Math.ceil(viewportSize / itemSize);
    expect(scrollOffset).toBe(maxIndex * itemSize);
  });

  it("click exactly at half track should snap to mid index", () => {
    const { scrollOffset } = getTrackClickItemValues(
      viewportTrackStart + trackSize / 2,
      viewportTrackStart,
      viewportSize,
      contentSize,
      trackSize,
      itemSize,
      itemCount
    );
    const snappedIndex = Math.round(scrollOffset / itemSize);
    expect(scrollOffset).toBe(snappedIndex * itemSize);
  });

  it("handles small content (no scroll needed)", () => {
    const { scrollOffset, thumbOffset } = getTrackClickItemValues(
      50,
      viewportTrackStart,
      200,
      150,
      200,
      30,
      5
    );
    expect(scrollOffset).toBe(0); // no scrolling possible
    expect(thumbOffset).toBe(0);
  });
});
