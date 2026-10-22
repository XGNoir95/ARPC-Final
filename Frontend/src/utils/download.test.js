import { afterEach, expect, it, vi } from 'vitest';
import { downloadFile } from './download';

vi.mock('./api',()=>({API_BASE:'/api'}));
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
it('downloads a protected file with cookies and releases its temporary URL',async()=>{
  vi.useFakeTimers();const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
  const create=vi.fn().mockReturnValue('blob:download');const revoke=vi.fn();vi.stubGlobal('URL',{createObjectURL:create,revokeObjectURL:revoke});
  const body=new Blob(['document'],{type:'application/pdf'});const fetch=vi.fn().mockResolvedValue({ok:true,status:200,headers:new Headers({'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="course-notes.pdf"'}),blob:async()=>body});vi.stubGlobal('fetch',fetch);
  await downloadFile('/learning/course/materials/file');
  expect(fetch).toHaveBeenCalledWith('/api/learning/course/materials/file',expect.objectContaining({credentials:'include',headers:{'X-ARPC-Request':'1'}}));
  expect(create).toHaveBeenCalledWith(body);expect(click).toHaveBeenCalledOnce();
  await vi.advanceTimersByTimeAsync(1000);expect(revoke).toHaveBeenCalledWith('blob:download');
});
it('reports an expired download without showing server JSON or navigating away',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:401,json:async()=>({message:'internal token debug'})}));
  await expect(downloadFile('/learning/course/certificate')).rejects.toMatchObject({status:401,userFacing:true,message:'Your learning session has ended. Request a new access link to continue.'});
});
it('rejects a static-host HTML page instead of downloading it as a certificate',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,status:200,headers:new Headers({'Content-Type':'text/html'})}));
  await expect(downloadFile('/learning/course/certificate')).rejects.toMatchObject({userFacing:true,message:'We couldn’t download this file. Please try again.'});
});
