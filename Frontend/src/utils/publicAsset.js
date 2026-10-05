// Public files must follow Vite's deployment base, including repository Pages URLs.
export const publicAsset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
