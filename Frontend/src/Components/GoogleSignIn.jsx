import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FcGoogle } from 'react-icons/fc';
import { FiX } from 'react-icons/fi';
import { api } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
let scriptPromise;
const loadGoogle=()=>{
 if(window.google?.accounts?.id)return Promise.resolve();
 if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{let script=document.getElementById('google-identity');if(!script){script=document.createElement('script');script.id='google-identity';script.src='https://accounts.google.com/gsi/client?hl=en';script.async=true;document.head.append(script);}script.addEventListener('load',resolve,{once:true});script.addEventListener('error',()=>{scriptPromise=null;script.remove();reject(new Error('Google sign-in could not load.'));},{once:true});});
 return scriptPromise;
};
export default function GoogleSignIn({fullWidth=false,...props}) {
 return fullWidth ? <GoogleSignInDialog {...props}/> : <GoogleProviderSignIn {...props}/>;
}

function GoogleSignInDialog({onCredential,register=false,disabled=false,compact=false,separator=false,linkAccount=false}) {
 const [open,setOpen]=useState(false);
 const dialog=useRef(null);
 const titleId=useId();
 const descriptionId=useId();
 useEffect(()=>{
  if(!open)return;
  const element=dialog.current;
  const trigger=document.activeElement;
  element.showModal();
  return()=>{
   if(element.open)element.close();
   if(trigger?.isConnected)trigger.focus();
  };
 },[open]);
 return <section aria-label="Google account access" className={`w-full ${compact?'mt-6':'mt-8'}`}>
  {separator&&<div aria-hidden="true" className="mb-5 flex items-center gap-3"><span className="h-px flex-1 bg-ink/15"/><span className="shrink-0 text-sm leading-6 text-muted">Or continue with</span><span className="h-px flex-1 bg-ink/15"/></div>}
  <button type="button" disabled={disabled} aria-haspopup="dialog" onClick={()=>setOpen(true)} className="relative inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#747775] bg-surface px-12 py-2.5 text-base font-medium text-ink transition-colors hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none">
   <FcGoogle aria-hidden="true" className="absolute left-4 size-5 shrink-0"/>
   <span>{linkAccount?'Link Google account':register?'Sign up with Google':'Sign in with Google'}</span>
  </button>
  {open&&createPortal(<dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event=>{event.preventDefault();setOpen(false);}} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[28rem] overflow-y-auto rounded-2xl border border-ink/15 bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/45">
   <div className="mb-4 flex items-start justify-between gap-3">
    <h2 id={titleId} className="pt-1 font-garamond text-3xl leading-tight font-semibold">{linkAccount?'Link Google sign-in':'Continue with Google'}</h2>
    <button type="button" aria-label="Close Google sign-in" onClick={()=>setOpen(false)} className="-mt-2 -mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none"><FiX aria-hidden="true" className="size-5"/></button>
   </div>
   <p id={descriptionId} className="text-base leading-7 text-muted">{linkAccount?'Choose the Google account with the same email address as your administrator account.':'Use the button below to choose your Google account and continue to ARPC.'}</p>
   <GoogleProviderSignIn compact register={register} disabled={disabled} onCredential={async credential=>{setOpen(false);await onCredential(credential);}}/>
  </dialog>,document.body)}
 </section>;
}

function GoogleProviderSignIn({onCredential,register=false,disabled=false,compact=false,separator=false}) {
 const {theme}=useTheme();
 const host=useRef(null);const callback=useRef(onCredential);const [message,setMessage]=useState('Preparing secure Google sign-in…');const [retry,setRetry]=useState(0);const [available,setAvailable]=useState(false);
 useEffect(()=>{callback.current=onCredential;},[onCredential]);
 useEffect(()=>{const element=host.current;let active=true;let resize;let nonce;let scheduled;let ready=false;let renderedWidth=null;
  const buttonWidth=()=>Math.max(160,Math.min(400,Math.floor(element?.getBoundingClientRect().width || 280)));
  const failed=()=>{if(!active)return;ready=false;cancelAnimationFrame(scheduled);setAvailable(false);host.current?.replaceChildren();setMessage('Google sign-in is unavailable right now. Try again or use email and password.');};
  const render=(width=buttonWidth())=>{
   if(!active||!ready||!element||host.current!==element||width===renderedWidth)return;
   // Google changes its own iframe height after rendering. Replacing it for those
   // notifications creates a ResizeObserver feedback loop and moves the form.
   renderedWidth=width;
   element.replaceChildren();
   window.google.accounts.id.renderButton(element,{theme:theme==='dark'?'filled_black':'outline',size:'large',text:register?'signup_with':'signin_with',shape:'rectangular',logo_alignment:'left',locale:'en',width});
  };
  const prepare=async()=>{const result=await api('/auth/google-challenge');if(!active)return;nonce=result.nonce;window.google.accounts.id.initialize({client_id:config.googleClientId,nonce,auto_select:false,callback:async({credential})=>{if(!active)return;try{await callback.current(credential);}finally{if(active)prepare().catch(failed);}}});ready=true;renderedWidth=null;render();setMessage('');setAvailable(true);};
  let config;
  api('/config').then(async result=>{config=result;if(!active)return;if(!config.googleClientId){setAvailable(false);setMessage('Google sign-in is unavailable right now. You can use email and password.');return;}await loadGoogle();if(!active)return;await prepare();if(!active)return;if(typeof ResizeObserver!=='undefined'){resize=new ResizeObserver(()=>{cancelAnimationFrame(scheduled);const width=buttonWidth();if(!ready||width===renderedWidth)return;scheduled=requestAnimationFrame(()=>render(width));});resize.observe(element);}}).catch(failed);
  return()=>{active=false;resize?.disconnect();cancelAnimationFrame(scheduled);element?.replaceChildren();};
 },[register,retry,theme]);
 return <section aria-label="Google account access" className={`w-full ${compact?'mt-6':'mt-8'}`}>
  {separator&&<div aria-hidden="true" className="mb-5 flex items-center gap-3"><span className="h-px flex-1 bg-ink/15"/><span className="shrink-0 text-sm leading-6 text-muted">Or continue with</span><span className="h-px flex-1 bg-ink/15"/></div>}
  <div inert={disabled?true:undefined} aria-busy={disabled} ref={host} className={`flex h-11 min-h-11 w-full min-w-0 shrink-0 items-center justify-center overflow-hidden ${disabled?'opacity-60':''}`}/>
  {message&&<p role="status" className="mt-3 text-sm leading-6 text-muted">{message}</p>}
  {message.includes('unavailable')&&<button type="button" onClick={()=>{setMessage('Preparing secure Google sign-in\u2026');setRetry(v=>v+1);}} className="mt-3 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-ink/20 px-4 text-sm font-semibold text-ink transition-colors hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-reduce:transition-none">Try Google again</button>}
  {!compact&&<p className="mt-3 text-sm leading-6 text-muted">{available?'Google verifies your identity. Administrator access still requires club approval.':'You can also continue using email and password.'}</p>}
 </section>;
}
