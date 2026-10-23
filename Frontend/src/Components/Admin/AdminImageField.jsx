import { userMessage } from '../../utils/userMessages';
import SafeImage from '../SafeImage';
import { useState } from 'react';
import { FiUploadCloud, FiImage } from 'react-icons/fi';
import { post } from '../../utils/api';
import { publicAsset } from '../../utils/publicAsset';
import { adminInput } from './AdminUI.styles.js';

export default function AdminImageField({label='Image',value='',onChange,disabled=false,onBusyChange,fill=false}) {
 const [dragging,setDragging]=useState(false);const [uploading,setUploading]=useState(false);const [error,setError]=useState('');
 const upload=async file=>{
  if(!file||disabled||uploading)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){setError('Choose a PNG, JPEG or WebP image.');return;}
  if(file.size>10*1024*1024){setError('Choose an image smaller than 10 MB.');return;}
  setError('');setUploading(true);onBusyChange?.(true);
  try{const body=new FormData();body.set('file',file);body.set('purpose','image');const result=await post('/admin/files',body);onChange(result.url);}
  catch(e){setError(userMessage(e));}
  finally{setUploading(false);onBusyChange?.(false);}
 };
 return <fieldset className={fill?'flex min-w-0 flex-1 flex-col':'min-w-0'}><legend className="mb-3 text-base font-semibold">{label}</legend><label onDragOver={e=>{e.preventDefault();if(!disabled)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);upload(e.dataTransfer.files?.[0]);}} className={`flex min-h-40 items-center justify-center gap-5 rounded-xl border-2 border-dashed p-5 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-ink motion-reduce:transition-none ${fill?'flex-1 flex-col':'flex-wrap'} ${disabled?'cursor-wait opacity-60':'cursor-pointer'} ${dragging?'border-ink bg-raised':'border-ink/25 bg-field'}`}>
 {value?<SafeImage src={publicAsset(value)} alt={`${label} preview`} className={fill?'h-36 w-full rounded-xl bg-surface object-cover':'size-24 rounded-xl bg-surface object-contain'}/>:<span className="flex size-16 items-center justify-center rounded-2xl bg-surface text-muted"><FiImage aria-hidden="true" className="size-7"/></span>}
 <span className="min-w-0"><FiUploadCloud aria-hidden="true" className="mx-auto mb-2 size-5 text-muted"/><span className="block text-base font-semibold">{uploading?'Uploading image...':'Drop a photo or choose from your device'}</span><span className="mt-2 block text-sm leading-relaxed text-muted">PNG, JPEG or WebP · up to 10 MB</span></span>
 <input aria-label={`Upload ${label.toLowerCase()}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled||uploading} className="sr-only" onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/>
 </label>{error&&<p role="alert" className="mt-3 text-base text-danger">{error}</p>}
 {/* Keep the former two collapsed options' 7rem footprint, while allowing wrapped text to grow. */}
 <div className="mt-3 flex min-h-25 shrink-0 flex-col justify-center gap-3">
  <div aria-hidden="true" className="flex items-center gap-3 text-center text-sm text-muted"><span className="h-px flex-1 bg-ink/15"/><span>OR use an online image link</span><span className="h-px flex-1 bg-ink/15"/></div>
  <label><span className="sr-only">{label} online image link</span><input type="url" pattern="https://.*" title="Use a full HTTPS image link." value={value.startsWith('/')?'':value} onChange={e=>{setError('');onChange(e.target.value);}} disabled={disabled||uploading} placeholder="https://example.com/image.jpg" className={adminInput}/></label>
 </div></fieldset>;
}
