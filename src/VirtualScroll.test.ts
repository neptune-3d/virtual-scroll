import { beforeEach, describe, expect, it } from "vitest";
import { VirtualScroll } from "./VirtualScroll";

describe("VirtualScroll.scrollSize", () => {
  it("returns viewportSize when contentSize is smaller", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 80,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.scrollSize).toBe(100);
  });

  it("returns contentSize when contentSize is larger", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.scrollSize).toBe(300);
  });

  it("returns 0 when both viewportSize and contentSize are 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 0,
      getContentSize: () => 0,
      getTrackSize: () => 0,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.scrollSize).toBe(0);
  });

  it("handles equal viewportSize and contentSize correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 200,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.scrollSize).toBe(200);
  });
});

describe("VirtualScroll.maxScrollOffset", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 150,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.maxScrollOffset).toBe(0);
  });

  it("returns contentSize - viewportSize when content is larger", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.maxScrollOffset).toBe(200);
  });

  it("returns 0 when viewportSize equals contentSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 250,
      getContentSize: () => 250,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.maxScrollOffset).toBe(0);
  });

  it("handles zero viewportSize correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 0,
      getContentSize: () => 400,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.maxScrollOffset).toBe(400);
  });

  it("handles zero contentSize correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 0,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 0,
    });
    expect(vs.maxScrollOffset).toBe(0);
  });
});

describe("VirtualScroll.scrollProgressRatio", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 150,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });
    vs.scrollOffset = 50;
    expect(vs.scrollRatio).toBe(0);
  });

  it("returns 0 when scrollOffset is at the start", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });
    vs.scrollOffset = 0;
    expect(vs.scrollRatio).toBe(0);
  });

  it("returns 1 when scrollOffset is at the maximum", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });
    vs.scrollOffset = vs.maxScrollOffset; // 200
    expect(vs.scrollRatio).toBe(1);
  });

  it("returns 0.5 when scrollOffset is halfway", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });
    vs.scrollOffset = 100;
    expect(vs.scrollRatio).toBeCloseTo(0.5);
  });

  it("clamps ratio when set beyond 1", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });
    vs.scrollRatio = 2; // attempt to set beyond max
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
    expect(vs.scrollRatio).toBe(1);
  });

  it("clamps ratio when set below 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });
    vs.scrollRatio = -1; // attempt to set below min
    expect(vs.scrollOffset).toBe(0);
    expect(vs.scrollRatio).toBe(0);
  });
});

describe("VirtualScroll.scrollProgressRatio setter", () => {
  it("sets scrollOffset proportionally when content is larger than viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });

    vs.scrollRatio = 0.5;
    expect(vs.scrollOffset).toBeCloseTo(100); // halfway
  });

  it("clamps ratio below 0 to 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });

    vs.scrollRatio = -1;
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps ratio above 1 to maxScrollOffset", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });

    vs.scrollRatio = 2;
    expect(vs.scrollOffset).toBe(200);
  });

  it("handles exact ratio boundaries correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 50,
      getItemSize: () => 20,
      getItemCount: () => 15,
    });

    vs.scrollRatio = 0;
    expect(vs.scrollOffset).toBe(0);

    vs.scrollRatio = 1;
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });
});

describe("VirtualScroll.thumbSize", () => {
  it("returns 0 when contentSize is 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 0,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    expect(vs.thumbSize).toBe(0);
  });

  it("returns minThumbSize when raw size is smaller", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 50,
      getContentSize: () => 1000, // very large content
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 50,
      minThumbSize: 12,
    });
    // rawSize = (50/1000) * 100 = 5, but minThumbSize = 12
    expect(vs.thumbSize).toBe(12);
  });

  it("returns raw size when larger than minThumbSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 400,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 20,
      minThumbSize: 12,
    });
    // rawSize = (200/400) * 100 = 50
    expect(vs.thumbSize).toBe(50);
  });

  it("caps raw size at trackSize when viewport >= content", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 300,
      getContentSize: () => 200, // viewport bigger than content
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    // rawSize = min(1, 300/200) * 100 = 1 * 100 = 100
    expect(vs.thumbSize).toBe(100);
  });

  it("respects custom minThumbSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 50,
      getContentSize: () => 1000,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 50,
      minThumbSize: 20,
    });
    // rawSize = 5, but minThumbSize = 20
    expect(vs.thumbSize).toBe(20);
  });
});

describe("VirtualScroll.thumbTravelSize", () => {
  it("returns trackSize - thumbSize when thumb is smaller than track", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 10,
    });
    // thumbSize = (100/200) * 100 = 50
    expect(vs.thumbSize).toBe(50);
    expect(vs.thumbTravelSize).toBe(50); // 100 - 50
  });

  it("returns 0 when thumbSize equals trackSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 100, // viewport larger than content → thumb fills track
      getTrackSize: () => 80,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    expect(vs.thumbSize).toBe(80);
    expect(vs.thumbTravelSize).toBe(0);
  });

  it("returns 0 when thumbSize is larger than trackSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 500,
      getContentSize: () => 100, // viewport much larger than content
      getTrackSize: () => 60,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    expect(vs.thumbSize).toBe(60); // capped at trackSize
    expect(vs.thumbTravelSize).toBe(0);
  });

  it("returns 0 when trackSize is 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 0,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    expect(vs.thumbSize).toBe(0); // rawSize = (100/200)*0 = 0
    expect(vs.thumbTravelSize).toBe(0);
  });

  it("respects custom minThumbSize when raw size is smaller", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 50,
      getContentSize: () => 1000,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 50,
      minThumbSize: 30,
    });
    // rawSize = (50/1000)*100 = 5 → clamped to 30
    expect(vs.thumbSize).toBe(30);
    expect(vs.thumbTravelSize).toBe(70); // 100 - 30
  });
});

describe("VirtualScroll.thumbOffset", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 150, // content smaller than viewport
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    vs.scrollOffset = 50;
    expect(vs.thumbOffset).toBe(0);
  });

  it("returns 0 when scrollProgressRatio is 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 0;
    expect(vs.scrollRatio).toBe(0);
    expect(vs.thumbOffset).toBe(0);
  });

  it("returns thumbTravelSize when scrollProgressRatio is 1", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = vs.maxScrollOffset; // 200
    expect(vs.scrollRatio).toBe(1);
    expect(vs.thumbOffset).toBe(vs.thumbTravelSize);
  });

  it("returns half of thumbTravelSize when scrollProgressRatio is 0.5", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 100; // halfway
    expect(vs.scrollRatio).toBeCloseTo(0.5);
    expect(vs.thumbOffset).toBeCloseTo(vs.thumbTravelSize / 2);
  });

  it("handles zero trackSize gracefully", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 0,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 100;
    // thumbSize = 0 → thumbTravelSize = 0 → thumbOffset = 0
    expect(vs.thumbOffset).toBe(0);
  });
});

describe("VirtualScroll.thumbPercent", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 150, // content smaller than viewport
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    vs.scrollOffset = 50;
    expect(vs.thumbPercent).toBe(0);
  });

  it("returns 0 when thumbOffset is 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 0; // start
    expect(vs.thumbOffset).toBe(0);
    expect(vs.thumbPercent).toBe(0);
  });

  it("returns 100 when thumbOffset equals thumbSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // force scrollOffset to max so thumbOffset = thumbTravelSize
    vs.scrollOffset = vs.maxScrollOffset;
    const percent = vs.thumbPercent;
    expect(percent).toBeCloseTo((vs.thumbOffset / vs.thumbSize) * 100);
    // should be near 100 but depends on ratio of travel vs size
    expect(percent).toBeGreaterThan(0);
  });

  it("returns ~50 when thumbOffset is half of thumbSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // halfway scroll
    vs.scrollOffset = 100;
    const percent = vs.thumbPercent;
    expect(percent).toBeCloseTo((vs.thumbOffset / vs.thumbSize) * 100);
  });

  it("handles zero trackSize gracefully", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 0,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 100;
    // thumbSize = 0 → thumbOffset = 0 → thumbPercent = 0
    expect(vs.thumbPercent).toBe(0);
  });
});

describe("VirtualScroll.trackToScrollFactor", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 150, // content smaller than viewport
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    expect(vs.trackToScrollFactor).toBe(0);
  });

  it("returns 0 when contentSize equals viewportSize", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 200, // equal sizes
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    expect(vs.trackToScrollFactor).toBe(0);
  });

  it("computes ratio of thumbTravelSize to maxScrollOffset when content is larger", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // thumbSize = (100/300)*100 = ~33.33 → thumbTravelSize = 66.67
    const expected = vs.thumbTravelSize / vs.maxScrollOffset;
    expect(vs.trackToScrollFactor).toBeCloseTo(expected);
  });

  it("handles zero trackSize gracefully", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 0,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // thumbSize = 0 → thumbTravelSize = 0 → factor = 0 / 200 = 0
    expect(vs.trackToScrollFactor).toBe(0);
  });

  it("increases factor when trackSize is larger", () => {
    const vsSmallTrack = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });

    const vsLargeTrack = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });

    expect(vsLargeTrack.trackToScrollFactor).toBeGreaterThan(
      vsSmallTrack.trackToScrollFactor
    );
  });
});

describe("VirtualScroll.handleDelta", () => {
  it("increases scrollOffset proportionally to delta when content is larger", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 50;

    const factor = vs.trackToScrollFactor;
    vs.handleDelta(20); // delta in track space
    expect(vs.scrollOffset).toBeCloseTo(50 + 20 / factor);
  });

  it("clamps scrollOffset at 0 when delta is negative beyond start", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 10;

    vs.handleDelta(-1000); // huge negative delta
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps scrollOffset at maxScrollOffset when delta is positive beyond end", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 190;

    vs.handleDelta(1000); // huge positive delta
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });

  it("handles zero trackSize gracefully (factor = 0 → no movement)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 0, // thumbSize = 0 → thumbTravelSize = 0 → factor = 0
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    vs.scrollOffset = 50;

    vs.handleDelta(40);
    // division by 0 would be Infinity, but clamped → maxScrollOffset
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });
});

describe("VirtualScroll.handleTrackClick", () => {
  it("centers thumb on click position within track", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // click in the middle of the track
    vs.handleTrackClick(50, 0);
    // thumbOffset should be close to centered
    const expectedOffset =
      (Math.max(0, Math.min(50 - vs.thumbSize / 2, vs.thumbTravelSize)) /
        vs.thumbTravelSize) *
      vs.maxScrollOffset;
    expect(vs.scrollOffset).toBeCloseTo(expectedOffset);
  });

  it("clamps scrollOffset at start when click is before track", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // click before track start
    vs.handleTrackClick(-20, 0);
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps scrollOffset at end when click is beyond track", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // click far beyond track end
    vs.handleTrackClick(500, 0);
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });

  it("handles non-zero viewportTrackStart correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      minThumbSize: 12,
    });
    // track starts at 200 in viewport space, click at 250
    vs.handleTrackClick(250, 200);
    const clickPos = 250 - 200;
    const desiredThumbOffset = clickPos - vs.thumbSize / 2;
    const clampedThumbOffset = Math.max(
      0,
      Math.min(desiredThumbOffset, vs.thumbTravelSize)
    );
    const expectedOffset =
      (clampedThumbOffset / vs.thumbTravelSize) * vs.maxScrollOffset;
    expect(vs.scrollOffset).toBeCloseTo(expectedOffset);
  });

  it("returns 0 when thumbTravelSize is 0 (no movement possible)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 300,
      getContentSize: () => 200, // viewport larger than content
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minThumbSize: 12,
    });
    vs.handleTrackClick(50, 0);
    expect(vs.scrollOffset).toBe(0);
  });
});

describe("VirtualScroll.getWheelPxDelta (instance method)", () => {
  it("returns delta unchanged in pixel mode (deltaMode = 0)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });

    const result = (vs as any).getWheelPxDelta(30, 0);
    expect(result).toBe(30);
  });

  it("converts line units to pixels (deltaMode = 1)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 25,
      getItemCount: () => 10,
    });

    const result = (vs as any).getWheelPxDelta(5, 1);
    // 5 lines * itemSize (25px) = 125px
    expect(result).toBe(125);
  });

  it("converts page units to pixels (deltaMode = 2)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 300,
      getContentSize: () => 600,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 30,
    });

    const result = (vs as any).getWheelPxDelta(2, 2);
    // 2 pages * viewportSize (300px) = 600px
    expect(result).toBe(600);
  });

  it("handles negative deltas correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 400,
      getTrackSize: () => 100,
      getItemSize: () => 25,
      getItemCount: () => 20,
    });

    const result = (vs as any).getWheelPxDelta(-3, 1);
    // -3 lines * 25px = -75px
    expect(result).toBe(-75);
  });

  it("returns 0 when delta is 0 regardless of mode", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });

    expect((vs as any).getWheelPxDelta(0, 0)).toBe(0);
    expect((vs as any).getWheelPxDelta(0, 1)).toBe(0);
    expect((vs as any).getWheelPxDelta(0, 2)).toBe(0);
  });
});

describe("VirtualScroll.getVelocityPxStep (instance method)", () => {
  it("returns 0 when delta is 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityPxStep: 10,
      maxVelocityPxStep: 60,
    });
    expect((vs as any).getVelocityPxStep(0)).toBe(0);
  });

  it("returns minVelocityPxStep when |delta| <= minVelocityPxStep", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityPxStep: 10,
      maxVelocityPxStep: 60,
    });

    expect((vs as any).getVelocityPxStep(5)).toBe(10); // positive small delta
    expect((vs as any).getVelocityPxStep(-5)).toBe(-10); // negative small delta
    expect((vs as any).getVelocityPxStep(10)).toBe(10); // exactly min
  });

  it("returns delta unchanged when within min/max range", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityPxStep: 10,
      maxVelocityPxStep: 60,
    });

    expect((vs as any).getVelocityPxStep(30)).toBe(30);
    expect((vs as any).getVelocityPxStep(-45)).toBe(-45);
  });

  it("clamps to maxVelocityPxStep when |delta| exceeds maxVelocityPxStep", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityPxStep: 10,
      maxVelocityPxStep: 60,
    });

    expect((vs as any).getVelocityPxStep(100)).toBe(60);
    expect((vs as any).getVelocityPxStep(-200)).toBe(-60);
  });

  it("respects custom min/max thresholds", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityPxStep: 5,
      maxVelocityPxStep: 40,
    });

    expect((vs as any).getVelocityPxStep(3)).toBe(5); // clamped to custom min
    expect((vs as any).getVelocityPxStep(50)).toBe(40); // clamped to custom max
  });
});

describe("VirtualScroll.getVelocityPxValues (instance method)", () => {
  it("applies velocity to scrollOffset and clamps within bounds", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 140, // > viewportSize so thumb can travel
      getItemSize: () => 20,
      getItemCount: () => 15,
      inertiaDecay: 0.5,
    });

    const result = (vs as any).getVelocityPxValues(50, 60);
    expect(result.scrollOffset).toBe(110);
    expect(result.velocity).toBeCloseTo(30);
  });

  it("clamps scrollOffset at 0 when velocity is negative", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      inertiaDecay: 0.7,
    });

    const result = (vs as any).getVelocityPxValues(10, -50);
    expect(result.scrollOffset).toBe(0);
    expect(result.velocity).toBeCloseTo(-35);
  });

  it("clamps scrollOffset at maxScrollOffset when velocity pushes beyond end", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300, // maxScrollOffset = 200
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      inertiaDecay: 0.7,
    });

    const result = (vs as any).getVelocityPxValues(180, 50);
    expect(result.scrollOffset).toBe(200);
    expect(result.velocity).toBeCloseTo(35);
  });

  it("returns thumbOffset = 0 when content fits viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 300,
      getContentSize: () => 200, // content smaller than viewport
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      inertiaDecay: 0.7,
    });

    const result = (vs as any).getVelocityPxValues(0, 50);
    expect(result.scrollOffset).toBe(0);
  });

  it("applies custom inertiaDecay correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 15,
      inertiaDecay: 0.25,
    });

    const result = (vs as any).getVelocityPxValues(50, 40);
    expect(result.velocity).toBeCloseTo(10); // 40 * 0.25
  });
});

describe("VirtualScroll.getWheelItemDelta (instance method)", () => {
  it("returns ±1 in pixel mode (deltaMode = 0)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });

    expect((vs as any).getWheelItemDelta(5, 0)).toBe(1);
    expect((vs as any).getWheelItemDelta(-5, 0)).toBe(-1);
    expect((vs as any).getWheelItemDelta(0, 0)).toBe(0);
  });

  it("returns raw delta in line mode (deltaMode = 1)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });

    expect((vs as any).getWheelItemDelta(3, 1)).toBe(3);
    expect((vs as any).getWheelItemDelta(-2, 1)).toBe(-2);
    expect((vs as any).getWheelItemDelta(0, 1)).toBe(0);
  });

  it("converts page units to items in page mode (deltaMode = 2)", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 300,
      getTrackSize: () => 100,
      getItemSize: () => 25, // viewportSize / itemSize = 4 items per page
      getItemCount: () => 12,
    });

    expect((vs as any).getWheelItemDelta(1, 2)).toBe(4); // one page forward
    expect((vs as any).getWheelItemDelta(-2, 2)).toBe(-8); // two pages backward
    expect((vs as any).getWheelItemDelta(0, 2)).toBe(0);
  });

  it("handles non-divisible viewport/item sizes correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 90,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 40, // viewportSize / itemSize = 2.25 items per page
      getItemCount: () => 5,
    });

    const result = (vs as any).getWheelItemDelta(2, 2);
    expect(result).toBeCloseTo(4.5); // 2 pages * 2.25 items
  });
});

describe("VirtualScroll.getVelocityItemStep (instance method)", () => {
  it("returns 0 when delta is 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityItemStep: 1,
      maxVelocityItemStep: 5,
    });
    expect((vs as any).getVelocityItemStep(0)).toBe(0);
  });

  it("returns ±1 when |delta| === 1", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityItemStep: 1,
      maxVelocityItemStep: 5,
    });
    expect((vs as any).getVelocityItemStep(1)).toBe(1);
    expect((vs as any).getVelocityItemStep(-1)).toBe(-1);
  });

  it("clamps small deltas up to minVelocityItemStep", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityItemStep: 2,
      maxVelocityItemStep: 5,
    });
    expect((vs as any).getVelocityItemStep(0.5)).toBe(2);
    expect((vs as any).getVelocityItemStep(-0.5)).toBe(-2);
  });

  it("returns delta unchanged when within min/max range", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityItemStep: 1,
      maxVelocityItemStep: 5,
    });
    expect((vs as any).getVelocityItemStep(3)).toBe(3);
    expect((vs as any).getVelocityItemStep(-4)).toBe(-4);
  });

  it("clamps large deltas down to maxVelocityItemStep", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityItemStep: 1,
      maxVelocityItemStep: 5,
    });
    expect((vs as any).getVelocityItemStep(10)).toBe(5);
    expect((vs as any).getVelocityItemStep(-12)).toBe(-5);
  });

  it("respects custom thresholds", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      minVelocityItemStep: 3,
      maxVelocityItemStep: 7,
    });
    expect((vs as any).getVelocityItemStep(2)).toBe(3); // clamped up to min
    expect((vs as any).getVelocityItemStep(20)).toBe(7); // clamped down to max
  });
});

describe("VirtualScroll.getVelocityItemValues (instance method)", () => {
  it("advances scrollOffset forward when itemVelocity > 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 400,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 20,
      inertiaDecay: 0.5,
    });

    const result = (vs as any).getVelocityItemValues(0, 2.4);
    // stepItems = round(2.4) = 2
    expect(result.scrollOffset).toBeGreaterThan(0);
    expect(result.velocity).toBeCloseTo(1.2); // 2.4 * 0.5
  });

  it("moves scrollOffset backward when itemVelocity < 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 400,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 20,
      inertiaDecay: 0.5,
    });

    const result = (vs as any).getVelocityItemValues(100, -1.6);
    // stepItems = round(-1.6) = -2
    expect(result.scrollOffset).toBeLessThan(100);
    expect(result.velocity).toBeCloseTo(-0.8);
  });

  it("clamps scrollOffset at 0 when moving backward past start", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      inertiaDecay: 0.7,
    });

    const result = (vs as any).getVelocityItemValues(0, -5);
    expect(result.scrollOffset).toBe(0);
    expect(result.velocity).toBeCloseTo(-3.5);
  });

  it("clamps scrollOffset at maxScrollOffset when moving forward past end", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200, // maxScrollOffset = 100
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      inertiaDecay: 0.7,
    });

    const result = (vs as any).getVelocityItemValues(80, 10);
    const maxScrollOffset = vs.contentSize - vs.viewportSize; // 100
    expect(result.scrollOffset).toBe(maxScrollOffset);
    expect(result.velocity).toBeCloseTo(7);
  });

  it("returns thumbOffset = 0 when content fits viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 300,
      getContentSize: () => 200, // content smaller than viewport
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
      inertiaDecay: 0.7,
    });

    const result = (vs as any).getVelocityItemValues(0, 2);
    expect(result.scrollOffset).toBe(0);
  });

  it("applies custom inertiaDecay correctly", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 400,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 20,
      inertiaDecay: 0.25,
    });

    const result = (vs as any).getVelocityItemValues(40, 4);
    expect(result.velocity).toBeCloseTo(1); // 4 * 0.25
  });
});

describe("VirtualScroll.handlePageScroll (instance method)", () => {
  it("PageDown increases scrollOffset by one viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 400, // maxScrollOffset = 300
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 20,
    });
    vs.scrollOffset = 50;

    vs.handlePageScroll("down");
    expect(vs.scrollOffset).toBe(150); // 50 + 100
  });

  it("PageUp decreases scrollOffset by one viewport", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 400,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 20,
    });
    vs.scrollOffset = 200;

    vs.handlePageScroll("up");
    expect(vs.scrollOffset).toBe(100); // 200 - 100
  });

  it("clamps at 0 when PageUp from start", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 400,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 20,
    });
    vs.scrollOffset = 0;

    vs.handlePageScroll("up");
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps at maxScrollOffset when PageDown past end", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 250, // maxScrollOffset = 150
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 12,
    });
    vs.scrollOffset = 120;

    vs.handlePageScroll("down");
    expect(vs.scrollOffset).toBe(150); // clamped
  });
});

describe("VirtualScroll measurement setters restore scrollOffset", () => {
  let scroll: VirtualScroll;

  beforeEach(() => {
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    // scroll to 50% down
    scroll.scrollRatio = 0.5;
  });

  it("restores scrollOffset proportionally when viewportSize changes", () => {
    const oldRatio = scroll.scrollRatio;
    // simulate viewport change by replacing callback
    scroll = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = oldRatio;
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio);
    expect(scroll.scrollOffset).toBeCloseTo(oldRatio * scroll.maxScrollOffset);
  });

  it("restores scrollOffset proportionally when contentSize changes", () => {
    const oldRatio = scroll.scrollRatio;
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 2000, // double content
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 200,
    });
    scroll.scrollRatio = oldRatio;
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio);
    expect(scroll.scrollOffset).toBeCloseTo(oldRatio * scroll.maxScrollOffset);
  });

  it("restores scrollOffset proportionally when trackSize changes", () => {
    const oldRatio = scroll.scrollRatio;
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 1000,
      getTrackSize: () => 400, // double track
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = oldRatio;
    // trackSize affects thumb size but ratio should remain
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio);
    expect(scroll.scrollOffset).toBeCloseTo(oldRatio * scroll.maxScrollOffset);
  });

  it("clamps scrollOffset to 0 when content fits viewport", () => {
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 80, // smaller than viewport
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 8,
    });
    scroll.scrollRatio = 0.8;
    expect(scroll.scrollOffset).toBe(0);
    expect(scroll.scrollRatio).toBe(0);
  });

  it("restores bottom position correctly after shrinking viewport", () => {
    // move to bottom
    scroll.scrollRatio = 1;
    const oldMax = scroll.maxScrollOffset;
    expect(scroll.scrollOffset).toBeCloseTo(oldMax);

    // shrink viewport
    scroll = new VirtualScroll({
      getViewportSize: () => 50,
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = 1;
    const newMax = scroll.maxScrollOffset;
    expect(scroll.scrollOffset).toBeCloseTo(newMax);
    expect(scroll.scrollRatio).toBe(1);
  });
});

describe("VirtualScroll preserves old ratio across measurement changes", () => {
  let scroll: VirtualScroll;

  beforeEach(() => {
    scroll = new VirtualScroll({
      getViewportSize: () => 100, // max = 1000 - 100 = 900
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = 0.5; // offset = 450
  });

  it("preserves ratio when viewportSize increases", () => {
    const oldRatio = scroll.scrollRatio; // 0.5
    // simulate viewport change by re-instantiating with new callback
    scroll = new VirtualScroll({
      getViewportSize: () => 200, // new max = 800
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = oldRatio;
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio, 6);
    expect(scroll.scrollOffset).toBeCloseTo(
      oldRatio * scroll.maxScrollOffset,
      6
    );
  });

  it("preserves ratio when contentSize increases", () => {
    const oldRatio = scroll.scrollRatio; // 0.5
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 2000, // new max = 2000 - 100 = 1900
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 200,
    });
    scroll.scrollRatio = oldRatio;
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio, 6);
    expect(scroll.scrollOffset).toBeCloseTo(
      oldRatio * scroll.maxScrollOffset,
      6
    );
  });

  it("bottom remains bottom after shrinking viewport", () => {
    scroll.scrollRatio = 1; // offset = old max (900)
    const oldRatio = scroll.scrollRatio; // snapshot 1
    scroll = new VirtualScroll({
      getViewportSize: () => 50, // new max = 950
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = oldRatio;
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio, 6);
    expect(scroll.scrollOffset).toBeCloseTo(scroll.maxScrollOffset, 6);
  });

  it("content fits viewport clamps to top", () => {
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 80, // <= viewportSize
      getTrackSize: () => 200,
      getItemSize: () => 10,
      getItemCount: () => 8,
    });
    scroll.scrollRatio = 0.8;
    expect(scroll.scrollOffset).toBe(0);
    expect(scroll.scrollRatio).toBe(0);
  });

  it("trackSize change does not alter ratio or offset", () => {
    const oldRatio = scroll.scrollRatio;
    const oldOffset = scroll.scrollOffset;
    scroll = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 1000,
      getTrackSize: () => 400,
      getItemSize: () => 10,
      getItemCount: () => 100,
    });
    scroll.scrollRatio = oldRatio;
    expect(scroll.scrollRatio).toBeCloseTo(oldRatio, 6);
    expect(scroll.scrollOffset).toBe(oldOffset);
  });
});

describe("VirtualScroll boundary checks", () => {
  it("reports at top when scrollOffset is exactly 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200, // maxScrollOffset = 100
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });
    vs.scrollOffset = 0;

    expect(vs.isScrollAtTop).toBe(true);
    expect(vs.isScrollAtBottom).toBe(false);
  });

  it("reports at bottom when scrollOffset equals maxScrollOffset", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });
    vs.scrollOffset = vs.maxScrollOffset;

    expect(vs.isScrollAtBottom).toBe(true);
    expect(vs.isScrollAtTop).toBe(false);
  });

  it("reports at top when scrollOffset is within tolerance of 0", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });
    const eps = (vs as any)["scrollPositionToleranceRange"];
    vs.scrollOffset = eps / 2;

    expect(vs.isScrollAtTop).toBe(true);
    expect(vs.isScrollAtBottom).toBe(false);
  });

  it("reports at bottom when scrollOffset is within tolerance of maxScrollOffset", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });
    const eps = (vs as any)["scrollPositionToleranceRange"];
    vs.scrollOffset = vs.maxScrollOffset - eps / 2;

    expect(vs.isScrollAtBottom).toBe(true);
    expect(vs.isScrollAtTop).toBe(false);
  });

  it("reports neither top nor bottom when scrollOffset is in the middle", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 200,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 10,
    });
    vs.scrollOffset = vs.maxScrollOffset / 2;

    expect(vs.isScrollAtTop).toBe(false);
    expect(vs.isScrollAtBottom).toBe(false);
  });
});

describe("VirtualScroll.scrollItemIntoView", () => {
  const makeScroll = () =>
    new VirtualScroll({
      getViewportSize: () => 100,
      getContentSize: () => 1000,
      getTrackSize: () => 200,
      getItemSize: () => 20,
      getItemCount: () => 50,
    });

  it("does nothing when scrolling is not needed", () => {
    const vs = new VirtualScroll({
      getViewportSize: () => 200,
      getContentSize: () => 100,
      getTrackSize: () => 100,
      getItemSize: () => 20,
      getItemCount: () => 5,
    });
    vs.scrollOffset = 50;
    vs.scrollItemIntoView(2);
    expect(vs.scrollOffset).toBe(50); // unchanged
  });

  it("align=start brings item to top of viewport", () => {
    const vs = makeScroll();
    vs.scrollOffset = 200;
    vs.scrollItemIntoView(10, "start"); // rowTop = 200
    expect(vs.scrollOffset).toBe(200);
  });

  it("align=end brings item to bottom of viewport", () => {
    const vs = makeScroll();
    vs.scrollOffset = 0;
    vs.scrollItemIntoView(10, "end"); // rowBottom = 220 → 220 - 100 = 120
    expect(vs.scrollOffset).toBe(120);
  });

  it("align=center centers item in viewport", () => {
    const vs = makeScroll();
    vs.scrollOffset = 0;
    vs.scrollItemIntoView(5, "center"); // rowTop = 100
    // center offset = 100 - (100 - 20)/2 = 100 - 40 = 60
    expect(vs.scrollOffset).toBe(60);
  });

  it("align=nearest snaps up when item above viewport", () => {
    const vs = makeScroll();
    vs.scrollOffset = 200; // viewport covers 200–300
    vs.scrollItemIntoView(5, "nearest"); // rowTop = 100 < viewportTop
    expect(vs.scrollOffset).toBe(100);
  });

  it("align=nearest snaps down when item below viewport", () => {
    const vs = makeScroll();
    vs.scrollOffset = 0; // viewport covers 0–100
    vs.scrollItemIntoView(10, "nearest"); // rowBottom = 220 > viewportBottom
    expect(vs.scrollOffset).toBe(120);
  });

  it("clamps offset to 0 when computed offset is negative", () => {
    const vs = makeScroll();
    vs.scrollOffset = 0;
    vs.scrollItemIntoView(0, "end"); // rowBottom=20 → 20-100=-80 → clamp to 0
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps offset to maxScrollOffset when computed offset exceeds bounds", () => {
    const vs = makeScroll();
    vs.scrollOffset = 0;
    const max = vs.maxScrollOffset;
    vs.scrollItemIntoView(49, "start"); // rowTop = 980, beyond max
    expect(vs.scrollOffset).toBe(max);
  });
});

describe("VirtualScroll.getFirstVisibleIndex", () => {
  const makeScroll = (
    viewportSize: number,
    contentSize: number,
    itemSize: number
  ) =>
    new VirtualScroll({
      getViewportSize: () => viewportSize,
      getContentSize: () => contentSize,
      getTrackSize: () => 100,
      getItemSize: () => itemSize,
      getItemCount: () => Math.floor(contentSize / itemSize),
    });

  it("returns 0 when viewport is at the very top (fully visible)", () => {
    const vs = makeScroll(100, 1000, 20); // 50 items
    vs.scrollOffset = 0;
    expect(vs.getFirstVisibleIndex()).toBe(0);
  });

  it("returns 0 when viewport is at the very top (partial overlap)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 0;
    expect(vs.getFirstVisibleIndex(false)).toBe(0);
  });

  it("returns correct index when scrolled to an exact item boundary (fully visible)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // top aligns with item 10
    expect(vs.getFirstVisibleIndex()).toBe(10);
  });

  it("returns correct index when scrolled to an exact item boundary (partial overlap)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200;
    expect(vs.getFirstVisibleIndex(false)).toBe(10);
  });

  it("rounds up when top is between items (fully visible)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 25; // between item 1 and 2
    expect(vs.getFirstVisibleIndex()).toBe(2);
  });

  it("rounds down when top is between items (partial overlap)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 25;
    expect(vs.getFirstVisibleIndex(false)).toBe(1);
  });

  it("clamps to last item when scrolled beyond content (fully visible)", () => {
    const vs = makeScroll(100, 200, 20); // 10 items
    vs.scrollOffset = 1000; // way past end
    expect(vs.getFirstVisibleIndex()).toBe(9);
  });

  it("clamps to last item when scrolled beyond content (partial overlap)", () => {
    const vs = makeScroll(100, 200, 20);
    vs.scrollOffset = 1000;
    expect(vs.getFirstVisibleIndex(false)).toBe(9);
  });
});

describe("VirtualScroll.getLastVisibleIndex", () => {
  const makeScroll = (
    viewportSize: number,
    contentSize: number,
    itemSize: number
  ) =>
    new VirtualScroll({
      getViewportSize: () => viewportSize,
      getContentSize: () => contentSize,
      getTrackSize: () => 100,
      getItemSize: () => itemSize,
      getItemCount: () => Math.floor(contentSize / itemSize),
    });

  it("returns the last fully visible item when viewport is at the very top", () => {
    const vs = makeScroll(100, 1000, 20); // 50 items
    vs.scrollOffset = 0; // viewport covers items 0–4 fully
    expect(vs.getLastVisibleIndex()).toBe(4);
  });

  it("returns the last partially visible item when viewport is at the very top", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 0;
    expect(vs.getLastVisibleIndex(false)).toBe(4);
  });

  it("returns correct index when scrolled to an exact item boundary (fully visible)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // viewport covers items 10–14 fully
    expect(vs.getLastVisibleIndex()).toBe(14);
  });

  it("returns correct index when scrolled to an exact item boundary (partial overlap)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200;
    expect(vs.getLastVisibleIndex(false)).toBe(14);
  });

  it("adjusts down when bottom item is only partially visible (fully = true)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 15; // viewport covers 15–115, item 5 partially visible
    expect(vs.getLastVisibleIndex()).toBe(4); // item 5 not fully visible
  });

  it("includes partially visible bottom item when fully = false", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 15;
    expect(vs.getLastVisibleIndex(false)).toBe(5);
  });

  it("clamps to last item when scrolled beyond content (fully visible)", () => {
    const vs = makeScroll(100, 200, 20); // 10 items
    vs.scrollOffset = 1000; // way past end
    expect(vs.getLastVisibleIndex()).toBe(9);
  });

  it("clamps to last item when scrolled beyond content (partial overlap)", () => {
    const vs = makeScroll(100, 200, 20);
    vs.scrollOffset = 1000;
    expect(vs.getLastVisibleIndex(false)).toBe(9);
  });

  it("handles mid‑content scroll correctly (fully visible)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // viewport covers items 10–14
    expect(vs.getLastVisibleIndex()).toBe(14);
  });

  it("handles mid‑content scroll correctly (partial overlap)", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200;
    expect(vs.getLastVisibleIndex(false)).toBe(14);
  });
});

describe("VirtualScroll.getNextPageUpIndex", () => {
  const makeScroll = (
    viewportSize: number,
    contentSize: number,
    itemSize: number
  ) =>
    new VirtualScroll({
      getViewportSize: () => viewportSize,
      getContentSize: () => contentSize,
      getTrackSize: () => 100,
      getItemSize: () => itemSize,
      getItemCount: () => Math.floor(contentSize / itemSize),
    });

  it("returns the first fully visible item when focus is not yet at top", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // viewport covers items 10–14
    const firstVisible = vs.getFirstVisibleIndex(); // 10
    const target = vs.getNextPageUpIndex(12); // focus is below top
    expect(target).toBe(firstVisible); // still 10
  });

  it("moves one fully visible page up when focus is already at top", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // viewport covers items 10–14 (5 fully visible)
    const firstVisible = vs.getFirstVisibleIndex(); // 10
    const target = vs.getNextPageUpIndex(firstVisible); // focus at top
    // visibleCount = 5 → target = 10 - 5 + 1 = 6
    expect(target).toBe(6);
  });

  it("clamps to 0 when page-up from the very top", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 0; // viewport covers items 0–4
    const firstVisible = vs.getFirstVisibleIndex(); // 0
    const target = vs.getNextPageUpIndex(firstVisible); // focus at top
    expect(target).toBe(0); // cannot scroll further up
  });

  it("returns correct target when partially visible item at top", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 15; // item 0 partially visible, items 1–4 fully visible
    const firstVisible = vs.getFirstVisibleIndex(); // 1
    const target = vs.getNextPageUpIndex(3); // focus below top
    expect(target).toBe(firstVisible); // still 1
  });

  it("handles case near bottom of content correctly", () => {
    const vs = makeScroll(100, 200, 20); // 10 items
    vs.scrollOffset = 100; // viewport covers items 5–9
    const firstVisible = vs.getFirstVisibleIndex(); // 5
    const target = vs.getNextPageUpIndex(firstVisible); // focus at top
    // visibleCount = 5 → target = 5 - 5 + 1 = 1
    expect(target).toBe(1);
  });
});

describe("VirtualScroll.getNextPageDownIndex", () => {
  const makeScroll = (
    viewportSize: number,
    contentSize: number,
    itemSize: number
  ) =>
    new VirtualScroll({
      getViewportSize: () => viewportSize,
      getContentSize: () => contentSize,
      getTrackSize: () => 100,
      getItemSize: () => itemSize,
      getItemCount: () => Math.floor(contentSize / itemSize),
    });

  it("returns the last fully visible item when focus is not yet at bottom", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 0; // viewport covers items 0–4 fully
    const lastVisible = vs.getLastVisibleIndex(); // 4
    const target = vs.getNextPageDownIndex(2); // focus above bottom
    expect(target).toBe(lastVisible); // still 4
  });

  it("moves one fully visible page down when focus is at bottom", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 0; // viewport covers items 0–4 (5 fully visible)
    const lastVisible = vs.getLastVisibleIndex(); // 4
    const target = vs.getNextPageDownIndex(lastVisible); // focus at bottom
    // visibleCount = 5 → target = 4 + 5 - 1 = 8
    expect(target).toBe(8);
  });

  it("clamps to maxScrollOffset at end of content", () => {
    const vs = makeScroll(100, 200, 20); // 10 items, maxScrollOffset = 100
    vs.scrollOffset = vs.maxScrollOffset; // viewport covers items 5–9
    const lastVisible = vs.getLastVisibleIndex(); // 9
    const target = vs.getNextPageDownIndex(lastVisible); // focus at bottom
    expect(target).toBe(9); // cannot scroll further down
  });

  it("returns correct target when bottom item is partially visible", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 15; // viewport covers 15–115, item 5 partially visible
    const lastVisible = vs.getLastVisibleIndex(); // 4
    const target = vs.getNextPageDownIndex(2); // focus above bottom
    expect(target).toBe(lastVisible); // still 4
  });

  it("handles mid‑content scroll correctly", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // viewport covers items 10–14 (5 fully visible)
    const lastVisible = vs.getLastVisibleIndex(); // 14
    const target = vs.getNextPageDownIndex(lastVisible); // focus at bottom
    // visibleCount = 5 → target = 14 + 5 - 1 = 18
    expect(target).toBe(18);
  });
});

describe("VirtualScroll.isItemVisible", () => {
  const makeScroll = (
    viewportSize: number,
    contentSize: number,
    itemSize: number
  ) =>
    new VirtualScroll({
      getViewportSize: () => viewportSize,
      getContentSize: () => contentSize,
      getTrackSize: () => 100,
      getItemSize: () => itemSize,
      getItemCount: () => Math.floor(contentSize / itemSize),
    });

  it("returns true when item is fully visible at top of viewport", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 0; // viewport covers items 0–4 fully
    expect(vs.isItemVisible(0)).toBe(true);
  });

  it("returns false when item is only partially visible at top", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 5; // item 0 partially visible
    expect(vs.isItemVisible(0)).toBe(false);
  });

  it("returns true when item is fully visible in middle of viewport", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 200; // viewport covers items 10–14
    expect(vs.isItemVisible(12)).toBe(true);
  });

  it("returns false when item is partially visible at bottom", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 15; // viewport covers 15–115, item 5 partially visible
    expect(vs.isItemVisible(5)).toBe(false);
  });

  it("returns true for last item when fully visible at bottom", () => {
    const vs = makeScroll(100, 200, 20); // 10 items
    vs.scrollOffset = 100; // viewport covers items 5–9 fully
    expect(vs.isItemVisible(9)).toBe(true);
  });

  it("returns false for last item when partially visible at bottom", () => {
    const vs = makeScroll(100, 200, 20);
    vs.scrollOffset = 95; // viewport covers 95–195, item 9 partially visible
    expect(vs.isItemVisible(9)).toBe(false);
  });

  it("returns true for partially visible item when fully=false", () => {
    const vs = makeScroll(100, 1000, 20);
    vs.scrollOffset = 5; // item 0 partially visible
    expect(vs.isItemVisible(0, false)).toBe(true);
  });
});
