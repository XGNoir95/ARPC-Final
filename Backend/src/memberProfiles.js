// Accept a handle or a profile URL, but never turn a different host or a script
// into a public member link. Keep this normalization in sync with the API.
export function memberProfileUrl(service, value = '') {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text) return '';
  const host = service === 'linkedin' ? 'linkedin.com' : 'github.com';
  const prefix = service === 'linkedin' ? '/in/' : '/';
  let url;
  try {
    const address = /^(?:www\.)?(?:linkedin|github)\.com\//i.test(text) ? `https://${text}` : text;
    url = new URL(address);
  } catch {
    const handle = text.replace(/^@/, '').replace(service === 'linkedin' ? /^in\// : /$^/, '').replace(/\/$/, '');
    if (!/^[\p{L}\p{N}._-]+$/u.test(handle)) return null;
    return `https://www.${host}${prefix}${encodeURIComponent(handle)}`.replace('www.github.com', 'github.com');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || ![host, `www.${host}`].includes(url.hostname.toLowerCase())) return null;
  const path = url.pathname.replace(/\/$/, '');
  const handle = path.startsWith(prefix) ? path.slice(prefix.length) : '';
  try { if (!/^[\p{L}\p{N}._-]+$/u.test(decodeURIComponent(handle))) return null; } catch { return null; }
  return `https://${service === 'linkedin' ? 'www.' : ''}${host}${prefix}${handle}`;
}
