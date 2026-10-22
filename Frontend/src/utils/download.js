import { API_BASE } from './api';
import { authVersion } from './authEvents';
import { requestMessage } from './userMessages';

export async function downloadFile(path, suggestedName = '') {
  const version = authVersion();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers: { 'X-ARPC-Request': '1' }, signal: controller.signal });
    if (!response.ok) {
      if (response.status === 401 && path.startsWith('/admin/') && version === authVersion()) window.dispatchEvent(new Event('arpc:auth-expired'));
      const failure = new Error(requestMessage({ path, status: response.status }));
      failure.status = response.status; failure.userFacing = true; throw failure;
    }
    const type = response.headers.get('Content-Type') || '';
    if (type.includes('text/html') || type.includes('application/json')) throw new Error('Unexpected download response');
    const body = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(disposition);
    let name = suggestedName || match?.slice(1).find(Boolean) || (type.includes('pdf') ? 'arpc-resource.pdf' : 'arpc-resource');
    try { name = decodeURIComponent(name); } catch { /* Keep a safe literal filename. */ }
    name = Array.from(name).filter(character => character.charCodeAt(0) >= 32).join('').replace(/[\\/:*?"<>|]/g, '_').slice(0, 150);
    const url = URL.createObjectURL(body);
    const revoke = URL.revokeObjectURL.bind(URL);
    const link = document.createElement('a');
    link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
    setTimeout(() => revoke(url), 1000);
  } catch (error) {
    if (error.userFacing) throw error;
    const failure = new Error(error.name === 'AbortError' ? 'This download is taking longer than expected. Please try again.' : 'We couldn’t download this file. Please try again.');
    failure.userFacing = true; throw failure;
  } finally { clearTimeout(timer); }
}
