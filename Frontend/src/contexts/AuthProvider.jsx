import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { advanceAuthVersion } from '../utils/authEvents';
import { AuthContext } from './AuthContext';
import { api, post } from '../utils/api';
import { userMessage } from '../utils/userMessages';
import { isAdminSite } from '../utils/adminSite';
const signalKey='arpc-auth-change';
export default function AuthProvider({children}) {
 const [state,setState]=useState({profile:null,status:isAdminSite()?'checking':'guest',error:''});const request=useRef(null);const revision=useRef(0);const active=useRef(true);
 const signal=useCallback(()=>{try{localStorage.setItem(signalKey,`${Date.now()}-${Math.random()}`);}catch{/* Cross-tab sync is optional when storage is disabled. */}},[]);
 const refresh=useCallback(()=>{
  if(!isAdminSite())return Promise.resolve(null);
  if(request.current)return request.current;const version=revision.current;const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
  request.current=api('/auth/me',{signal:controller.signal}).then(result=>{if(!result?.profile||typeof result.profile!=='object')throw new Error('Invalid session response');const profile=result.profile;if(active.current&&version===revision.current)setState({profile,status:'authenticated',error:''});return profile;}).catch(error=>{if(active.current&&version===revision.current)setState(current=>error.status===401?{profile:null,status:'guest',error:''}:{...current,status:current.profile?'authenticated':'error',error:userMessage(error,'We couldn’t confirm your session. Please try again.')});return null;}).finally(()=>{clearTimeout(timeout);request.current=null;});return request.current;
 },[]);
 const acceptSession=useCallback(profile=>{revision.current++;advanceAuthVersion();setState({profile,status:'authenticated',error:''});signal();},[signal]);
 const signOut=useCallback(async(all=false)=>{await post(all?'/auth/logout-all':'/auth/logout');revision.current++;advanceAuthVersion();setState({profile:null,status:'guest',error:''});signal();},[signal]);
 useEffect(()=>{active.current=true;refresh();const onFocus=()=>{if(document.visibilityState!=='hidden')refresh();};const onStorage=e=>{if(e.key===signalKey){revision.current++;advanceAuthVersion();if(request.current)request.current.finally(refresh);else refresh();}};const onExpired=()=>{revision.current++;advanceAuthVersion();setState({profile:null,status:'guest',error:''});};window.addEventListener('focus',onFocus);window.addEventListener('storage',onStorage);window.addEventListener('arpc:auth-expired',onExpired);document.addEventListener('visibilitychange',onFocus);const timer=setInterval(onFocus,60000);return()=>{active.current=false;clearInterval(timer);window.removeEventListener('focus',onFocus);window.removeEventListener('storage',onStorage);window.removeEventListener('arpc:auth-expired',onExpired);document.removeEventListener('visibilitychange',onFocus);};},[refresh,signal]);
 const value=useMemo(()=>({...state,refresh,acceptSession,signOut}),[state,refresh,acceptSession,signOut]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
