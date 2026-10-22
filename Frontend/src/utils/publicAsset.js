// Public files must follow Vite's deployment base, including repository Pages URLs.
export const publicAsset = (path = '') => {
  if(typeof path!=='string'||!path.trim())return '';
  if (/^https:\/\//.test(path)) return path;
  if (path.startsWith('/api/')) return `${(import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/,'')}${path}`;
  const cdn=(import.meta.env.VITE_ASSET_CDN_URL || '').replace(/\/$/,'');
  if(cdn&&/^https:\/\//.test(cdn))return `${cdn}/${path.replace(/^\/+/, '')}`;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
};
