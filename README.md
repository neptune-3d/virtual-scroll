# @neptune3d/virtual-scroll

Math and helpers for implementing a virtual scrollbar.

[![NPM Version](https://img.shields.io/npm/v/%40neptune3d%2Fvirtual-scroll)](https://www.npmjs.com/package/@neptune3d/virtual-scroll)

```bash
npm install neptune3d/virtual-scroll
```

## Basic example:

```ts
const scroll = new VirtualScroll({
  getViewportSize: () => 800, // or something like scrollContainer.clientHeight
  getContentSize: () => 1200,
  getTrackSize: () => 800,
  onScroll: () => {
    // thumbOffset is a getter that uses the newest scrollOffset value
    thumb.style.transform = `translateY(${scroll.thumbOffset}px)`;

    // also update the list position etc...
  },
});

const track = document.createElement("div");

track.style.height = 800;
track.style.position = "relative";
// other track styles

// or even better if you can calculate this without reading from the DOM
const trackRect = track.getBoundingClientRect();

track.addEventListener("click", (e) => {
  // updates scrollOffset and calls onScroll
  scroll.handleTrackClick(e.clientY, trackRect.top); 
});

const thumb = document.createElement("div");

thumb.style.position = "absolute";
// other thumb styles

track.append(thumb);
```
