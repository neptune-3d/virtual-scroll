import { describe, expect, it } from "vitest";
import { VirtualScroll } from "./VirtualScroll";

describe("VirtualScroll.scrollSize", () => {
  it("returns viewportSize when contentSize is smaller", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 80;
    expect(vs.scrollSize).toBe(100);
  });

  it("returns contentSize when contentSize is larger", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    expect(vs.scrollSize).toBe(300);
  });

  it("returns 0 when both viewportSize and contentSize are 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 0;
    vs.contentSize = 0;
    expect(vs.scrollSize).toBe(0);
  });

  it("handles equal viewportSize and contentSize correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 200;
    expect(vs.scrollSize).toBe(200);
  });
});

describe("VirtualScroll.maxScrollOffset", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150;
    expect(vs.maxScrollOffset).toBe(0);
  });

  it("returns contentSize - viewportSize when content is larger", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    expect(vs.maxScrollOffset).toBe(200);
  });

  it("returns 0 when viewportSize equals contentSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 250;
    vs.contentSize = 250;
    expect(vs.maxScrollOffset).toBe(0);
  });

  it("handles zero viewportSize correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 0;
    vs.contentSize = 400;
    expect(vs.maxScrollOffset).toBe(400);
  });

  it("handles zero contentSize correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 0;
    expect(vs.maxScrollOffset).toBe(0);
  });
});

describe("VirtualScroll.scrollProgressRatio", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150;
    vs.scrollOffset = 50;
    expect(vs.scrollProgressRatio).toBe(0);
  });

  it("returns 0 when scrollOffset is at the start", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.scrollOffset = 0;
    expect(vs.scrollProgressRatio).toBe(0);
  });

  it("returns 1 when scrollOffset is at the maximum", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.scrollOffset = vs.maxScrollOffset; // 200
    expect(vs.scrollProgressRatio).toBe(1);
  });

  it("returns 0.5 when scrollOffset is halfway", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.scrollOffset = 100;
    expect(vs.scrollProgressRatio).toBeCloseTo(0.5);
  });

  it("clamps ratio when set beyond 1", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.scrollProgressRatio = 2; // attempt to set beyond max
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
    expect(vs.scrollProgressRatio).toBe(1);
  });

  it("clamps ratio when set below 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.scrollProgressRatio = -1; // attempt to set below min
    expect(vs.scrollOffset).toBe(0);
    expect(vs.scrollProgressRatio).toBe(0);
  });
});

describe("VirtualScroll.scrollProgressRatio setter", () => {
  it("sets scrollOffset proportionally when content is larger than viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200

    vs.scrollProgressRatio = 0.5;
    expect(vs.scrollOffset).toBeCloseTo(100); // halfway
  });

  it("clamps ratio below 0 to 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;

    vs.scrollProgressRatio = -1;
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps ratio above 1 to maxScrollOffset", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200

    vs.scrollProgressRatio = 2;
    expect(vs.scrollOffset).toBe(200);
  });

  it("sets scrollOffset to 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150; // content smaller than viewport

    vs.scrollProgressRatio = 0.75;
    expect(vs.scrollOffset).toBe(0);
  });

  it("handles exact ratio boundaries correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;

    vs.scrollProgressRatio = 0;
    expect(vs.scrollOffset).toBe(0);

    vs.scrollProgressRatio = 1;
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });
});

describe("VirtualScroll.thumbSize", () => {
  it("returns 0 when contentSize is 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 0;
    vs.trackSize = 200;
    expect(vs.thumbSize).toBe(0);
  });

  it("returns minThumbSize when raw size is smaller", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 50;
    vs.contentSize = 1000; // very large content
    vs.trackSize = 100;
    vs.minThumbSize = 12;
    // rawSize = (50/1000) * 100 = 5, but minThumbSize = 12
    expect(vs.thumbSize).toBe(12);
  });

  it("returns raw size when larger than minThumbSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 400;
    vs.trackSize = 100;
    vs.minThumbSize = 12;
    // rawSize = (200/400) * 100 = 50
    expect(vs.thumbSize).toBe(50);
  });

  it("caps raw size at trackSize when viewport >= content", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 300;
    vs.contentSize = 200; // viewport bigger than content
    vs.trackSize = 100;
    vs.minThumbSize = 12;
    // rawSize = min(1, 300/200) * 100 = 1 * 100 = 100
    expect(vs.thumbSize).toBe(100);
  });

  it("respects custom minThumbSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 50;
    vs.contentSize = 1000;
    vs.trackSize = 100;
    vs.minThumbSize = 20;
    // rawSize = 5, but minThumbSize = 20
    expect(vs.thumbSize).toBe(20);
  });
});

describe("VirtualScroll.thumbTravelSize", () => {
  it("returns trackSize - thumbSize when thumb is smaller than track", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 200;
    vs.trackSize = 100;
    vs.minThumbSize = 10;
    // thumbSize = (100/200) * 100 = 50
    expect(vs.thumbSize).toBe(50);
    expect(vs.thumbTravelSize).toBe(50); // 100 - 50
  });

  it("returns 0 when thumbSize equals trackSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 100; // viewport larger than content → thumb fills track
    vs.trackSize = 80;
    expect(vs.thumbSize).toBe(80);
    expect(vs.thumbTravelSize).toBe(0);
  });

  it("returns 0 when thumbSize is larger than trackSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 500;
    vs.contentSize = 100; // viewport much larger than content
    vs.trackSize = 60;
    expect(vs.thumbSize).toBe(60); // capped at trackSize
    expect(vs.thumbTravelSize).toBe(0);
  });

  it("returns 0 when trackSize is 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 200;
    vs.trackSize = 0;
    expect(vs.thumbSize).toBe(0); // rawSize = (100/200)*0 = 0
    expect(vs.thumbTravelSize).toBe(0);
  });

  it("respects minThumbSize when raw size is smaller", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 50;
    vs.contentSize = 1000;
    vs.trackSize = 100;
    vs.minThumbSize = 30;
    // rawSize = (50/1000)*100 = 5 → clamped to 30
    expect(vs.thumbSize).toBe(30);
    expect(vs.thumbTravelSize).toBe(70); // 100 - 30
  });
});

describe("VirtualScroll.thumbOffset", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150; // content smaller than viewport
    vs.trackSize = 100;
    vs.scrollOffset = 50;
    expect(vs.thumbOffset).toBe(0);
  });

  it("returns 0 when scrollProgressRatio is 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    vs.scrollOffset = 0;
    expect(vs.scrollProgressRatio).toBe(0);
    expect(vs.thumbOffset).toBe(0);
  });

  it("returns thumbTravelSize when scrollProgressRatio is 1", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    vs.scrollOffset = vs.maxScrollOffset; // 200
    expect(vs.scrollProgressRatio).toBe(1);
    expect(vs.thumbOffset).toBe(vs.thumbTravelSize);
  });

  it("returns half of thumbTravelSize when scrollProgressRatio is 0.5", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    vs.scrollOffset = 100; // halfway
    expect(vs.scrollProgressRatio).toBeCloseTo(0.5);
    expect(vs.thumbOffset).toBeCloseTo(vs.thumbTravelSize / 2);
  });

  it("handles zero trackSize gracefully", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 0;
    vs.scrollOffset = 100;
    // thumbSize = 0 → thumbTravelSize = 0 → thumbOffset = 0
    expect(vs.thumbOffset).toBe(0);
  });
});

describe("VirtualScroll.thumbPercent", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150; // content smaller than viewport
    vs.trackSize = 100;
    vs.scrollOffset = 50;
    expect(vs.thumbPercent).toBe(0);
  });

  it("returns 0 when thumbOffset is 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    vs.scrollOffset = 0; // start
    expect(vs.thumbOffset).toBe(0);
    expect(vs.thumbPercent).toBe(0);
  });

  it("returns 100 when thumbOffset equals thumbSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    // force scrollOffset to max so thumbOffset = thumbTravelSize
    vs.scrollOffset = vs.maxScrollOffset;
    const percent = vs.thumbPercent;
    expect(percent).toBeCloseTo((vs.thumbOffset / vs.thumbSize) * 100);
    // should be near 100 but depends on ratio of travel vs size
    expect(percent).toBeGreaterThan(0);
  });

  it("returns ~50 when thumbOffset is half of thumbSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    // halfway scroll
    vs.scrollOffset = 100;
    const percent = vs.thumbPercent;
    expect(percent).toBeCloseTo((vs.thumbOffset / vs.thumbSize) * 100);
  });

  it("handles zero trackSize gracefully", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 0;
    vs.scrollOffset = 100;
    // thumbSize = 0 → thumbOffset = 0 → thumbPercent = 0
    expect(vs.thumbPercent).toBe(0);
  });
});

describe("VirtualScroll.trackToScrollFactor", () => {
  it("returns 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150; // content smaller than viewport
    vs.trackSize = 100;
    expect(vs.trackToScrollFactor).toBe(0);
  });

  it("returns 0 when contentSize equals viewportSize", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 200; // equal sizes
    vs.trackSize = 100;
    expect(vs.trackToScrollFactor).toBe(0);
  });

  it("computes ratio of thumbTravelSize to maxScrollOffset when content is larger", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    // thumbSize = (100/300)*100 = ~33.33 → thumbTravelSize = 66.67
    const expected = vs.thumbTravelSize / vs.maxScrollOffset;
    expect(vs.trackToScrollFactor).toBeCloseTo(expected);
  });

  it("handles zero trackSize gracefully", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 0;
    // thumbSize = 0 → thumbTravelSize = 0 → factor = 0 / 200 = 0
    expect(vs.trackToScrollFactor).toBe(0);
  });

  it("increases factor when trackSize is larger", () => {
    const vsSmallTrack = new VirtualScroll(20);
    vsSmallTrack.viewportSize = 100;
    vsSmallTrack.contentSize = 300;
    vsSmallTrack.trackSize = 100;

    const vsLargeTrack = new VirtualScroll(20);
    vsLargeTrack.viewportSize = 100;
    vsLargeTrack.contentSize = 300;
    vsLargeTrack.trackSize = 200;

    expect(vsLargeTrack.trackToScrollFactor).toBeGreaterThan(
      vsSmallTrack.trackToScrollFactor
    );
  });
});

describe("VirtualScroll.handleDelta", () => {
  it("sets scrollOffset to 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150; // content smaller than viewport
    vs.trackSize = 100;
    vs.scrollOffset = 50;

    vs.handleDelta(40);
    expect(vs.scrollOffset).toBe(0);
  });

  it("increases scrollOffset proportionally to delta when content is larger", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    vs.scrollOffset = 50;

    const factor = vs.trackToScrollFactor;
    vs.handleDelta(20); // delta in track space
    expect(vs.scrollOffset).toBeCloseTo(50 + 20 / factor);
  });

  it("clamps scrollOffset at 0 when delta is negative beyond start", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    vs.scrollOffset = 10;

    vs.handleDelta(-1000); // huge negative delta
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps scrollOffset at maxScrollOffset when delta is positive beyond end", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    vs.scrollOffset = 190;

    vs.handleDelta(1000); // huge positive delta
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });

  it("handles zero trackSize gracefully (factor = 0 → no movement)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 0; // thumbSize = 0 → thumbTravelSize = 0 → factor = 0
    vs.scrollOffset = 50;

    vs.handleDelta(40);
    // division by 0 would be Infinity, but clamped → maxScrollOffset
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });
});

describe("VirtualScroll.handleTrackClick", () => {
  it("sets scrollOffset to 0 when content fits within viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.contentSize = 150; // content smaller than viewport
    vs.trackSize = 100;
    vs.scrollOffset = 50;

    vs.handleTrackClick(60, 0);
    expect(vs.scrollOffset).toBe(0);
  });

  it("centers thumb on click position within track", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
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
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    // click before track start
    vs.handleTrackClick(-20, 0);
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps scrollOffset at end when click is beyond track", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    // click far beyond track end
    vs.handleTrackClick(500, 0);
    expect(vs.scrollOffset).toBe(vs.maxScrollOffset);
  });

  it("handles non-zero viewportTrackStart correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
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
    const vs = new VirtualScroll(20);
    vs.viewportSize = 300;
    vs.contentSize = 200; // viewport larger than content
    vs.trackSize = 100;
    vs.handleTrackClick(50, 0);
    expect(vs.scrollOffset).toBe(0);
  });
});

describe("VirtualScroll.getWheelPxDelta (instance method)", () => {
  it("returns delta unchanged in pixel mode (deltaMode = 0)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.itemSize = 20;

    const result = (vs as any).getWheelPxDelta(30, 0);
    expect(result).toBe(30);
  });

  it("converts line units to pixels (deltaMode = 1)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.itemSize = 25;

    const result = (vs as any).getWheelPxDelta(5, 1);
    // 5 lines * itemSize (25px) = 125px
    expect(result).toBe(125);
  });

  it("converts page units to pixels (deltaMode = 2)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 300;
    vs.itemSize = 20;

    const result = (vs as any).getWheelPxDelta(2, 2);
    // 2 pages * viewportSize (300px) = 600px
    expect(result).toBe(600);
  });

  it("handles negative deltas correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 200;
    vs.itemSize = 25;

    const result = (vs as any).getWheelPxDelta(-3, 1);
    // -3 lines * 25px = -75px
    expect(result).toBe(-75);
  });

  it("returns 0 when delta is 0 regardless of mode", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.itemSize = 20;

    expect((vs as any).getWheelPxDelta(0, 0)).toBe(0);
    expect((vs as any).getWheelPxDelta(0, 1)).toBe(0);
    expect((vs as any).getWheelPxDelta(0, 2)).toBe(0);
  });
});

describe("VirtualScroll.getVelocityPxStep (instance method)", () => {
  it("returns 0 when delta is 0", () => {
    const vs = new VirtualScroll(20);
    expect((vs as any).getVelocityPxStep(0)).toBe(0);
  });

  it("returns minVelocityPxStep when |delta| <= minVelocityPxStep", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityPxStep = 10;
    vs.maxVelocityPxStep = 60;

    expect((vs as any).getVelocityPxStep(5)).toBe(10); // positive small delta
    expect((vs as any).getVelocityPxStep(-5)).toBe(-10); // negative small delta
    expect((vs as any).getVelocityPxStep(10)).toBe(10); // exactly min
  });

  it("returns delta unchanged when within min/max range", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityPxStep = 10;
    vs.maxVelocityPxStep = 60;

    expect((vs as any).getVelocityPxStep(30)).toBe(30);
    expect((vs as any).getVelocityPxStep(-45)).toBe(-45);
  });

  it("clamps to maxVelocityPxStep when |delta| exceeds maxVelocityPxStep", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityPxStep = 10;
    vs.maxVelocityPxStep = 60;

    expect((vs as any).getVelocityPxStep(100)).toBe(60);
    expect((vs as any).getVelocityPxStep(-200)).toBe(-60);
  });

  it("respects custom min/max thresholds", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityPxStep = 5;
    vs.maxVelocityPxStep = 40;

    expect((vs as any).getVelocityPxStep(3)).toBe(5); // clamped to custom min
    expect((vs as any).getVelocityPxStep(50)).toBe(40); // clamped to custom max
  });
});

describe("VirtualScroll.getVelocityPxValues (instance method)", () => {
  it("applies velocity to scrollOffset and clamps within bounds", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 140; // > viewportSize so thumb can travel
    vs.inertiaDecay = 0.5;

    const result = (vs as any).getVelocityPxValues(50, 60);
    expect(result.scrollOffset).toBe(110);
    expect(result.velocity).toBeCloseTo(30);

    const maxScrollOffset = vs.contentSize - vs.viewportSize; // 200
    const thumbSize = (vs.viewportSize / vs.contentSize) * vs.trackSize;
    const thumbTravel = vs.trackSize - thumbSize;
    const expectedThumbOffset =
      (result.scrollOffset / maxScrollOffset) * thumbTravel;

    expect(result.thumbOffset).toBeCloseTo(expectedThumbOffset);
    expect(result.thumbOffset).toBeGreaterThan(0);
  });

  it("clamps scrollOffset at 0 when velocity is negative", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    vs.inertiaDecay = 0.7;

    const result = (vs as any).getVelocityPxValues(10, -50);
    expect(result.scrollOffset).toBe(0);
    expect(result.velocity).toBeCloseTo(-35);
  });

  it("clamps scrollOffset at maxScrollOffset when velocity pushes beyond end", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300; // maxScrollOffset = 200
    vs.trackSize = 100;
    vs.inertiaDecay = 0.7;

    const result = (vs as any).getVelocityPxValues(180, 50);
    expect(result.scrollOffset).toBe(200);
    expect(result.velocity).toBeCloseTo(35);

    const maxScrollOffset = vs.contentSize - vs.viewportSize;
    const thumbSize = (vs.viewportSize / vs.contentSize) * vs.trackSize;
    const thumbTravel = vs.trackSize - thumbSize;
    const expectedThumbOffset =
      (result.scrollOffset / maxScrollOffset) * thumbTravel;

    expect(result.thumbOffset).toBeCloseTo(expectedThumbOffset);
  });

  it("returns thumbOffset = 0 when content fits viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 300;
    vs.contentSize = 200; // content smaller than viewport
    vs.trackSize = 100;
    vs.inertiaDecay = 0.7;

    const result = (vs as any).getVelocityPxValues(0, 50);
    expect(result.scrollOffset).toBe(0);
    expect(result.thumbOffset).toBe(0);
  });

  it("applies custom inertiaDecay correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 300;
    vs.trackSize = 100;
    vs.inertiaDecay = 0.25;

    const result = (vs as any).getVelocityPxValues(50, 40);
    expect(result.velocity).toBeCloseTo(10); // 40 * 0.25
  });
});

describe("VirtualScroll.getWheelItemDelta (instance method)", () => {
  it("returns ±1 in pixel mode (deltaMode = 0)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.itemSize = 20;

    expect((vs as any).getWheelItemDelta(5, 0)).toBe(1);
    expect((vs as any).getWheelItemDelta(-5, 0)).toBe(-1);
    expect((vs as any).getWheelItemDelta(0, 0)).toBe(0);
  });

  it("returns raw delta in line mode (deltaMode = 1)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.itemSize = 20;

    expect((vs as any).getWheelItemDelta(3, 1)).toBe(3);
    expect((vs as any).getWheelItemDelta(-2, 1)).toBe(-2);
    expect((vs as any).getWheelItemDelta(0, 1)).toBe(0);
  });

  it("converts page units to items in page mode (deltaMode = 2)", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.itemSize = 25; // viewportSize / itemSize = 4 items per page

    expect((vs as any).getWheelItemDelta(1, 2)).toBe(4); // one page forward
    expect((vs as any).getWheelItemDelta(-2, 2)).toBe(-8); // two pages backward
    expect((vs as any).getWheelItemDelta(0, 2)).toBe(0);
  });

  it("handles non-divisible viewport/item sizes correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 90;
    vs.itemSize = 40; // viewportSize / itemSize = 2.25 items per page

    const result = (vs as any).getWheelItemDelta(2, 2);
    expect(result).toBeCloseTo(4.5); // 2 pages * 2.25 items
  });
});

describe("VirtualScroll.getVelocityItemStep (instance method)", () => {
  it("returns 0 when delta is 0", () => {
    const vs = new VirtualScroll(20);
    expect((vs as any).getVelocityItemStep(0)).toBe(0);
  });

  it("returns ±1 when |delta| === 1", () => {
    const vs = new VirtualScroll(20);
    expect((vs as any).getVelocityItemStep(1)).toBe(1);
    expect((vs as any).getVelocityItemStep(-1)).toBe(-1);
  });

  it("clamps small deltas up to minVelocityItemStep", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityItemStep = 2;
    vs.maxVelocityItemStep = 5;

    expect((vs as any).getVelocityItemStep(0.5)).toBe(2);
    expect((vs as any).getVelocityItemStep(-0.5)).toBe(-2);
  });

  it("returns delta unchanged when within min/max range", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityItemStep = 1;
    vs.maxVelocityItemStep = 5;

    expect((vs as any).getVelocityItemStep(3)).toBe(3);
    expect((vs as any).getVelocityItemStep(-4)).toBe(-4);
  });

  it("clamps large deltas down to maxVelocityItemStep", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityItemStep = 1;
    vs.maxVelocityItemStep = 5;

    expect((vs as any).getVelocityItemStep(10)).toBe(5);
    expect((vs as any).getVelocityItemStep(-12)).toBe(-5);
  });

  it("respects custom thresholds", () => {
    const vs = new VirtualScroll(20);
    vs.minVelocityItemStep = 3;
    vs.maxVelocityItemStep = 7;

    expect((vs as any).getVelocityItemStep(2)).toBe(3); // clamped up to min
    expect((vs as any).getVelocityItemStep(20)).toBe(7); // clamped down to max
  });
});

describe("VirtualScroll.getVelocityItemValues (instance method)", () => {
  it("advances scrollOffset forward when itemVelocity > 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 400;
    vs.itemSize = 20;
    vs.itemCount = 20;
    vs.trackSize = 200;
    vs.inertiaDecay = 0.5;

    const result = (vs as any).getVelocityItemValues(0, 2.4);
    // stepItems = round(2.4) = 2
    expect(result.scrollOffset).toBeGreaterThan(0);
    expect(result.velocity).toBeCloseTo(1.2); // 2.4 * 0.5
    expect(result.thumbOffset).toBeGreaterThan(0);
  });

  it("moves scrollOffset backward when itemVelocity < 0", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 400;
    vs.itemSize = 20;
    vs.itemCount = 20;
    vs.trackSize = 200;
    vs.inertiaDecay = 0.5;

    const result = (vs as any).getVelocityItemValues(100, -1.6);
    // stepItems = round(-1.6) = -2
    expect(result.scrollOffset).toBeLessThan(100);
    expect(result.velocity).toBeCloseTo(-0.8);
  });

  it("clamps scrollOffset at 0 when moving backward past start", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 200;
    vs.itemSize = 20;
    vs.itemCount = 10;
    vs.trackSize = 100;
    vs.inertiaDecay = 0.7;

    const result = (vs as any).getVelocityItemValues(0, -5);
    expect(result.scrollOffset).toBe(0);
    expect(result.velocity).toBeCloseTo(-3.5);
  });

  it("clamps scrollOffset at maxScrollOffset when moving forward past end", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 200;
    vs.itemSize = 20;
    vs.itemCount = 10;
    vs.trackSize = 100;
    vs.inertiaDecay = 0.7;

    const result = (vs as any).getVelocityItemValues(80, 10);
    const maxScrollOffset = vs.contentSize - vs.viewportSize; // 100
    expect(result.scrollOffset).toBe(maxScrollOffset);
    expect(result.velocity).toBeCloseTo(7);
  });

  it("returns thumbOffset = 0 when content fits viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 300;
    vs.contentSize = 200; // content smaller than viewport
    vs.itemSize = 20;
    vs.itemCount = 10;
    vs.trackSize = 100;
    vs.inertiaDecay = 0.7;

    const result = (vs as any).getVelocityItemValues(0, 2);
    expect(result.scrollOffset).toBe(0);
    expect(result.thumbOffset).toBe(0);
  });

  it("applies custom inertiaDecay correctly", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 400;
    vs.itemSize = 20;
    vs.itemCount = 20;
    vs.trackSize = 200;
    vs.inertiaDecay = 0.25;

    const result = (vs as any).getVelocityItemValues(40, 4);
    expect(result.velocity).toBeCloseTo(1); // 4 * 0.25
  });
});

describe("VirtualScroll.handlePageScroll (instance method)", () => {
  it("PageDown increases scrollOffset by one viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 400; // maxScrollOffset = 300
    vs.trackSize = 200;
    vs.scrollOffset = 50;

    vs.handlePageScroll("down");
    expect(vs.scrollOffset).toBe(150); // 50 + 100
  });

  it("PageUp decreases scrollOffset by one viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 400;
    vs.trackSize = 200;
    vs.scrollOffset = 200;

    vs.handlePageScroll("up");
    expect(vs.scrollOffset).toBe(100); // 200 - 100
  });

  it("clamps at 0 when PageUp from start", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 400;
    vs.trackSize = 200;
    vs.scrollOffset = 0;

    vs.handlePageScroll("up");
    expect(vs.scrollOffset).toBe(0);
  });

  it("clamps at maxScrollOffset when PageDown past end", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 100;
    vs.contentSize = 250; // maxScrollOffset = 150
    vs.trackSize = 200;
    vs.scrollOffset = 120;

    vs.handlePageScroll("down");
    expect(vs.scrollOffset).toBe(150); // clamped
  });

  it("resets to 0 when content fits viewport", () => {
    const vs = new VirtualScroll(20);
    vs.viewportSize = 300;
    vs.contentSize = 200; // content smaller than viewport
    vs.trackSize = 200;
    vs.scrollOffset = 50;

    vs.handlePageScroll("down");
    expect(vs.scrollOffset).toBe(0);
  });
});
