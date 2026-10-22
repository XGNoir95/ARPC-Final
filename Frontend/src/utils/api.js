import { authVersion } from './authEvents';
import { requestMessage } from './userMessages';
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/,'');
export async function api(path, options = {}) {
  const controller=new AbortController();
  const cancel=()=>controller.abort();
  if(options.signal?.aborted)cancel();
  options.signal?.addEventListener('abort',cancel,{once:true});
  const timeout=setTimeout(cancel,options.body instanceof FormData?60000:20000);
  try { return await request(path,{...options,signal:controller.signal}); }
  catch(error) {
    if(error?.name==='AbortError'&&!options.signal?.aborted) {
      const failure=new Error('This is taking longer than expected. Please try again.');
      failure.kind='timeout';failure.userFacing=true;throw failure;
    }
    throw error;
  } finally {clearTimeout(timeout);options.signal?.removeEventListener('abort',cancel);}
}
async function request(path, options = {}) {
  const requestVersion=authVersion();
  const multipart = options.body instanceof FormData;
  let response;
  try { response = await fetch(`${API_BASE}${path}`, { ...options, credentials:'include', headers:{ 'X-ARPC-Request':'1', ...(!multipart && options.body ? {'Content-Type':'application/json'} : {}), ...options.headers }, body: options.body && !multipart ? JSON.stringify(options.body) : options.body }); }
  catch (cause) {
    if (cause?.name === 'AbortError') throw cause;
    const error = new Error(requestMessage({kind:navigator.onLine === false ? 'offline' : 'network'}));
    error.userFacing = true; error.kind = 'network'; throw error;
  }
  let data=null;
  const retryValue=Number(response.headers?.get('Retry-After'));
  const retryAfter=Number.isFinite(retryValue)&&retryValue>0?Math.min(retryValue,86400):0;
  if(response.status!==204) {
    try { data=await response.json(); }
    catch {
      // Older servers/proxies may return plain text for HTTP 429.
      if(response.status===429) data={message:'Too many requests. Please wait before trying again.'};
      else { const error=new Error(requestMessage({kind:'response'})); error.status=response.status; error.kind='response'; error.userFacing=true; throw error; }
    }
  }
  if (!response.ok) {
    if(response.status===401&&requestVersion===authVersion()&&(path.startsWith('/admin/')||path.startsWith('/auth/sessions')))window.dispatchEvent(new Event('arpc:auth-expired'));
    const error=new Error(requestMessage({path,status:response.status,code:data?.code,retryAfterSeconds:retryAfter,serverMessage:data?.message})); error.status=response.status; error.retryAfterSeconds=retryAfter; error.userFacing=true; throw error;
  }
  return data;
}
export const post = (path, body) => api(path,{method:'POST',body});
