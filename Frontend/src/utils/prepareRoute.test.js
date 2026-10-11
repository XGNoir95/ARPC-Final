import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prepareRoute } from "./prepareRoute";

let images;
beforeEach(() => {
  vi.useFakeTimers();
  images = [];
  vi.stubEnv("BASE_URL", "/ARPC-Final/");
  vi.stubGlobal("Image", class {
    complete = false;
    constructor() { images.push(this); }
  });
});
afterEach(() => vi.useRealTimers());

describe("Route preparation", () => {
  it("keeps the skeleton visible for 2.5 seconds even when assets are ready", async () => {
    const ready = vi.fn();
    const preparation = prepareRoute("/team", { signal: new AbortController().signal }).then(ready);
    expect(images.map((image) => image.src)).toEqual([
      "/ARPC-Final/images/team/meeting-planning.jpg",
      "/ARPC-Final/images/team/meeting-discussion.jpg",
    ]);
    images.forEach((image) => image.onload());
    await vi.advanceTimersByTimeAsync(2499);
    expect(ready).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await preparation;
    expect(ready).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps placeholders until the incoming hero has decoded", async () => {
    const ready = vi.fn();
    const preparation = prepareRoute("/catalogue", { signal: new AbortController().signal }).then(ready);
    let finishDecoding;
    images[0].decode = () => new Promise((resolve) => { finishDecoding = resolve; });
    images[0].onload();
    await vi.advanceTimersByTimeAsync(2600);
    expect(ready).not.toHaveBeenCalled();
    finishDecoding();
    await preparation;
    expect(ready).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the same minimum display for routes without hero images", async () => {
    vi.stubGlobal("Image", class { complete = true; });
    const ready = vi.fn();
    const preparation = prepareRoute("/register", { signal: new AbortController().signal }).then(ready);
    await vi.advanceTimersByTimeAsync(2499);
    expect(ready).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await preparation;
    expect(ready).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("continues after failed images without extending the minimum display", async () => {
    const preparation = prepareRoute("/team", { signal: new AbortController().signal });
    images.forEach((image) => image.onerror());
    await vi.advanceTimersByTimeAsync(2500);
    await preparation;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("never traps navigation when an image request stalls", async () => {
    const ready = vi.fn();
    const preparation = prepareRoute("/", { signal: new AbortController().signal }).then(ready);
    await vi.advanceTimersByTimeAsync(2999);
    expect(ready).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await preparation;
    expect(ready).toHaveBeenCalledOnce();
    expect(images[0].onload).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up image callbacks and timers when a newer navigation interrupts", async () => {
    const controller = new AbortController();
    const preparation = prepareRoute("/team", { signal: controller.signal });
    controller.abort();
    await preparation;
    expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not start work for an already cancelled route", async () => {
    const controller = new AbortController();
    controller.abort();
    await prepareRoute("/team", { signal: controller.signal });
    expect(images).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
