import { publicAsset } from "./publicAsset";
import { enrollmentFromPath } from "./enrollment";

const heroImages = {
  "/": ["/heroBanner.jpg"],
  "/team": ["/images/team/meeting-planning.jpg", "/images/team/meeting-discussion.jpg"],
  "/catalogue": ["/images/team/meeting-discussion.jpg"],
  "/join": ["/images/about/community.jpg"],
};

// Budget the fade-out as part of the two-second maximum, even for stalled images.
export const ROUTE_FADE_SECONDS = 0.2;
const MIN_SKELETON_MS = 1600;
const MAX_PREPARATION_MS = 2000 - ROUTE_FADE_SECONDS * 1000;

export function prepareRoute(pathname, { signal }) {
  return new Promise((resolve) => {
    if (signal.aborted) { resolve(); return; }
    const images = [];
    const enrollment = enrollmentFromPath(pathname);
    const routeImages = heroImages[pathname] ?? (enrollment ? [enrollment.item.heroImage || enrollment.item.image] : []);
    let minimumElapsed = false;
    let pending = routeImages.length;
    let settled = false;
    let minimumTimer;
    let deadlineTimer;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(minimumTimer);
      clearTimeout(deadlineTimer);
      signal.removeEventListener("abort", finish);
      images.forEach((image) => { image.onload = null; image.onerror = null; });
      resolve();
    };
    const maybeFinish = () => { if (minimumElapsed && pending === 0) finish(); };
    signal.addEventListener("abort", finish, { once: true });
    deadlineTimer = setTimeout(finish, MAX_PREPARATION_MS);
    minimumTimer = setTimeout(() => {
      minimumElapsed = true;
      maybeFinish();
    }, MIN_SKELETON_MS);

    routeImages.forEach((src) => {
      const image = new Image();
      images.push(image);
      let completed = false;
      let decoding = false;
      const complete = () => {
        if (completed || settled) return;
        completed = true;
        pending -= 1;
        maybeFinish();
      };
      const decode = () => {
        if (decoding || completed || settled) return;
        decoding = true;
        if (typeof image.decode === "function") image.decode().catch(() => {}).then(complete);
        else complete();
      };
      image.onload = decode;
      image.onerror = complete;
      image.src = publicAsset(src);
      if (image.complete) decode();
    });
    maybeFinish();
  });
}
