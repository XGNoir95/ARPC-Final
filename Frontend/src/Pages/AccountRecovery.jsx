import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { post } from '../utils/api';
import { userMessage } from '../utils/userMessages';
import { Notice, StatePage, stateFocus, statePrimary } from '../Components/StateView';

const input='mt-2 block min-h-13 w-full rounded-lg border border-ink/20 bg-surface px-4 py-3 text-base focus:outline-2 focus:outline-offset-2 focus:outline-ink';
export default function AccountRecovery({verify=false}) {
  const location=useLocation();
  const token=new URLSearchParams(location.search).get('token');
  const reset=location.pathname==='/reset-password'||Boolean(token&&!verify);
  const verification=useRef(null);
  const [attempt,setAttempt]=useState(0);
  const [phase,setPhase]=useState(verify&&token?'verifying':'ready');
  const [error,setError]=useState(null);
  const [busy,setBusy]=useState(false);
  const [email,setEmail]=useState('');
  useEffect(()=>{
    if(!verify||!token)return;
    let active=true;
    if(!verification.current)verification.current=post('/auth/verify',{token});
    verification.current.then(()=>{if(active){setPhase('verified');setError(null);}}).catch(failure=>{if(active){setError({status:failure.status,userFacing:true,message:userMessage(failure,'We couldn’t verify this link. Please request a new one.')});setPhase('failed');}});
    return()=>{active=false;};
  },[verify,token,attempt]);
  const retry=()=>{verification.current=null;setError(null);setPhase('verifying');setAttempt(value=>value+1);};
  const submit=async event=>{
    event.preventDefault();const form=event.currentTarget;const values=Object.fromEntries(new FormData(form));
    if(reset&&values.password!==values.confirmPassword){setError({userFacing:true,message:'Your passwords do not match.'});form.elements.confirmPassword.focus();return;}
    setBusy(true);setError(null);
    try{await post(reset?'/auth/reset-password':'/auth/forgot-password',reset?{token,password:values.password}:{email:values.email});setPhase('success');}
    catch(failure){setError({status:failure.status,userFacing:true,message:userMessage(failure,'We couldn’t send your request. Please try again.')});if(reset&&[400,401,404,410].includes(failure.status))setPhase('failed');}
    finally{setBusy(false);}
  };
  if((verify||reset)&&!token)return <StatePage standalone kind="missing" title={verify?'This verification link is incomplete.':'This reset link is incomplete.'} description="Open the complete link from your email, or request a new one to continue." actions={[{label:verify?'Back to sign in':'Request a new reset link',to:verify?'/login':'/forgot-password'}]}/>;
  if(phase==='verifying')return <StatePage standalone kind="loading" title="Verifying your email…" description="Please wait while we confirm your email address."/>;
  if(phase==='verified')return <StatePage standalone kind="success" title="Your email is verified." description="You can now sign in to check your administrator access. The club will review your request before you can open the workspace." actions={[{label:'Back to sign in',to:'/login'}]}/>;
  if(phase==='failed')return <StatePage standalone kind="locked" title={verify?'We couldn’t verify this link.':'This reset link is no longer available.'} description={userMessage(error,'The link may have expired or already been used. Please request a new one.')} actions={verify?[...(![400,401,404,410].includes(error?.status)?[{label:'Try again',onClick:retry}]:[]),{label:'Back to sign in',to:'/login',secondary:true}]:[{label:'Request a new reset link',to:'/forgot-password'}]}/>;
  if(phase==='success')return <StatePage standalone kind="success" title={reset?'Your password has been updated.':'Check your inbox.'} description={reset?'You can now sign in with your new password.':'If an account uses that email, you’ll receive a password reset link. Check your spam folder too.'} actions={[{label:'Back to sign in',to:'/login'},...(!reset?[{label:'Use another email',onClick:()=>setPhase('ready'),secondary:true}]:[])]}/>;
  return <StatePage standalone kind={reset?'locked':'access'} title={reset?'Choose a new password':'Reset your password'} description={reset?'Use at least 12 characters for your new password.':'Enter your account email and we’ll send you a link to choose a new password.'}>
    <form onSubmit={submit} className="mx-auto mt-7 max-w-lg space-y-5">
      {error&&<Notice>{userMessage(error,'We couldn’t send your request. Please try again.')}</Notice>}
      {reset?<><label className="block text-base font-semibold">New password<input required type="password" name="password" minLength={12} maxLength={128} autoComplete="new-password" className={input}/></label><label className="block text-base font-semibold">Confirm new password<input required type="password" name="confirmPassword" minLength={12} maxLength={128} autoComplete="new-password" className={input}/></label></>:<label className="block text-base font-semibold">Email address<input required type="email" name="email" maxLength={150} autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} className={input}/></label>}
      <button disabled={busy} aria-busy={busy} className={`${statePrimary} w-full`}>{busy?'Please wait…':reset?'Change password':'Send reset link'}</button>
      <Link to="/login" className={`inline-flex min-h-11 items-center rounded text-sm font-semibold underline underline-offset-4 ${stateFocus}`}>Back to sign in</Link>
    </form>
  </StatePage>;
}
