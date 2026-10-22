import { afterEach, expect, it, vi } from 'vitest';
import { api, post } from './api';
afterEach(()=>vi.unstubAllGlobals());
it('uses HttpOnly-cookie requests and the application header without browser tokens',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,status:201,json:async()=>({id:'saved'})});vi.stubGlobal('fetch',fetch);
  expect(await post('/applications',{type:'membership'})).toEqual({id:'saved'});
  expect(fetch).toHaveBeenCalledWith('/api/applications',expect.objectContaining({credentials:'include',headers:{'X-ARPC-Request':'1','Content-Type':'application/json'},body:JSON.stringify({type:'membership'})}));
});
it('keeps multipart boundaries browser-managed and supports empty deletion responses',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:true,status:204});vi.stubGlobal('fetch',fetch);const body=new FormData();body.set('purpose','image');
  expect(await api('/admin/files',{method:'POST',body})).toBeNull();expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Content-Type');
});
it('reports authorization failures and unavailable servers for retry',async()=>{
  const fetch=vi.fn().mockResolvedValue({ok:false,status:403,json:async()=>({message:'Administrator approval is required to open this workspace.'})});vi.stubGlobal('fetch',fetch);
  await expect(api('/admin/workspace')).rejects.toMatchObject({status:403,message:'You don’t have permission to do this. Contact the club administrator if you need access.'});
  fetch.mockRejectedValue(new Error('Offline'));await expect(api('/auth/me')).rejects.toThrow('connect right now');
});
it('rejects a static-host HTML response instead of treating it as API data',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,status:200,json:async()=>{throw new SyntaxError();}}));
  await expect(api('/public/content')).rejects.toThrow('connect right now');
});
it.each([true,false])('reports throttling with a retry time even for non-JSON responses (JSON: %s)',async(json)=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:429,headers:{get:()=> '21'},json:async()=>{if(!json)throw new SyntaxError();return {message:'Too many unsuccessful sign-in attempts.'};}}));
  await expect(api('/auth/login')).rejects.toMatchObject({status:429,retryAfterSeconds:21,message:expect.stringContaining('Try again in 21 seconds.')});
});

it('suppresses server internals in error responses',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:500,json:async()=>({message:'MongoServerError stack at /private/db token=secret'})}));
  await expect(api('/applications')).rejects.toMatchObject({userFacing:true,message:'Something went wrong on our side. Please try again in a moment.'});
});
it('bounds requests that never finish without retrying a mutation',async()=>{
  vi.useFakeTimers();const fetch=vi.fn((url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true})));vi.stubGlobal('fetch',fetch);
  try{
    const pending=post('/applications',{type:'membership'});
    const check=expect(pending).rejects.toMatchObject({kind:'timeout',userFacing:true});
    await vi.advanceTimersByTimeAsync(20000);await check;expect(fetch).toHaveBeenCalledTimes(1);
  }finally{vi.useRealTimers();}
});
