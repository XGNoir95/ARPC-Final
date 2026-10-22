import { useEffect, useRef, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { api, post } from '../utils/api';
import { userMessage } from '../utils/userMessages';
import { Notice, stateFocus, statePrimary, stateSecondary } from './StateView';

const secondsUntil = (date, now) => Math.max(0, Math.ceil((Date.parse(date) - now) / 1000)) || 0;
const duration = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const withServerClock = status => {
  const serverTime = Date.parse(status.serverTime);
  return { ...status, clockOffset: Number.isFinite(serverTime) ? serverTime - Date.now() : 0 };
};

export default function EmailVerification({ email, busy = false, onVerified, onBusyChange }) {
  const [status, setStatus] = useState(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [pending, setPending] = useState('');
  const [retry, setRetry] = useState(0);
  const [now, setNow] = useState(Date.now);
  const operationLock = useRef(false);
  const statusVersion = useRef(0);
  const input = useRef(null);
  const focusAfterResend = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!pending && focusAfterResend.current) {
      input.current?.focus();
      focusAfterResend.current = false;
    }
  }, [pending]);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    const refresh = async () => {
      if (operationLock.current) return;
      const version = statusVersion.current;
      try {
        const result = await api('/auth/verification-status', { signal: controller.signal });
        if (!controller.signal.aborted && !operationLock.current && version === statusVersion.current) {
          setStatus(withServerClock(result));
          setNow(Date.now());
          setStatusError('');
        }
      } catch (failure) {
        if (controller.signal.aborted || version !== statusVersion.current) return;
        if (failure.status === 401) window.dispatchEvent(new Event('arpc:auth-expired'));
        setStatusError(userMessage(failure, 'We couldn’t check your verification code. Please try again.'));
      }
    };
    refresh();
    window.addEventListener('focus', refresh);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted.current = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [email, retry]);

  const serverNow = now + (status?.clockOffset || 0);
  const resendWait = secondsUntil(status?.resendAvailableAt, serverNow);
  const lockedWait = secondsUntil(status?.lockedUntil, serverNow);
  const expiresIn = secondsUntil(status?.expiresAt, serverNow);
  const expired = Boolean(status?.expiresAt) && !expiresIn;
  const disabled = busy || Boolean(pending) || !status;

  const perform = async action => {
    if (operationLock.current || busy || !status) return;
    if (action === 'verify' && (!/^\d{6}$/.test(code) || expired || lockedWait || !status.expiresAt)) return;
    if (action === 'resend' && (resendWait || lockedWait)) return;
    operationLock.current = true;
    statusVersion.current += 1;
    setPending(action);
    setFeedback(null);
    onBusyChange?.(true);
    try {
      if (action === 'verify') {
        const result = await post('/auth/verify-code', { code });
        setCode('');
        await onVerified(result.profile);
      } else {
        const result = await post('/auth/resend-verification');
        if (mounted.current) {
          setStatus(withServerClock(result));
          setNow(Date.now());
          setCode('');
          setFeedback({ message: 'A new verification code has been requested. Check your inbox and spam folder.', error: false });
          focusAfterResend.current = true;
        }
      }
    } catch (failure) {
      if (!mounted.current) return;
      if (failure.status === 401) window.dispatchEvent(new Event('arpc:auth-expired'));
      setFeedback({ message: userMessage(failure, 'We couldn’t confirm your code. Please try again.'), error: true });
      if (failure.status === 429 && failure.retryAfterSeconds) {
        const until = new Date(Date.now() + (status.clockOffset || 0) + failure.retryAfterSeconds * 1000).toISOString();
        setStatus(current => ({ ...current, [action === 'verify' ? 'lockedUntil' : 'resendAvailableAt']: until }));
      }
      try {
        const result = await api('/auth/verification-status');
        if (mounted.current) { setStatus(withServerClock(result)); setNow(Date.now()); }
      } catch { /* Keep the previous server status if a follow-up request fails. */ }
    } finally {
      operationLock.current = false;
      if (mounted.current) setPending('');
      onBusyChange?.(false);
    }
  };

  return <div className="mt-7 rounded-2xl border border-ink/15 bg-surface p-5 sm:p-6">
    <h2 className="font-garamond text-2xl font-semibold">Confirm your email address</h2>
    <p className="mt-2 text-base leading-7 text-copy">{status?.expiresAt && !expired ? 'Enter the 6-digit code sent to ' : 'Use a 6-digit code to confirm '}<span className="font-semibold text-ink [overflow-wrap:anywhere]">{email}</span>.</p>
    {statusError && <div className="mt-4"><Notice action={{ label: 'Check again', onClick: () => setRetry(value => value + 1) }}>{statusError}</Notice></div>}
    <form onSubmit={event => { event.preventDefault(); perform('verify'); }} className="mt-5">
      <label htmlFor="email-verification-code" className="block text-base font-semibold">Verification code</label>
      <input ref={input} id="email-verification-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setFeedback(null); }} disabled={disabled || Boolean(lockedWait) || expired || !status?.expiresAt} aria-describedby="email-verification-help" aria-invalid={feedback?.error || undefined} className="mt-2 block min-h-14 w-full min-w-0 rounded-lg border border-ink/20 bg-field px-4 py-3 text-center text-2xl font-semibold tracking-[0.3em] text-ink tabular-nums focus:outline-2 focus:outline-offset-2 focus:outline-ink aria-invalid:border-danger disabled:opacity-60"/>
      <p id="email-verification-help" className="mt-2 text-sm leading-6 text-muted">{!status ? 'Checking your verification code…' : lockedWait ? `Too many attempts. Try again in ${duration(lockedWait)}.` : expired ? 'This code has expired. Request a new code below.' : status.expiresAt ? `Code expires in ${duration(expiresIn)}. Only the latest code will work.` : 'Request a verification code to continue.'}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={disabled || code.length !== 6 || expired || Boolean(lockedWait) || !status?.expiresAt} aria-busy={pending === 'verify'} className={`${statePrimary} flex-1`}>{pending === 'verify' && <FiLoader aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none"/>}{pending === 'verify' ? 'Verifying…' : 'Verify email'}</button>
        <button type="button" disabled={disabled || Boolean(resendWait) || Boolean(lockedWait)} aria-busy={pending === 'resend'} onClick={() => perform('resend')} className={`${stateSecondary} flex-1`}>{pending === 'resend' ? 'Requesting code…' : resendWait ? `Resend code in ${resendWait}s` : status?.expiresAt ? 'Resend code' : 'Send verification code'}</button>
      </div>
      {!status && !statusError && <span role="status" className="sr-only">Loading verification status</span>}
    </form>
    {feedback && <div className="mt-4"><Notice tone={feedback.error ? 'error' : 'success'}>{feedback.message}</Notice></div>}
    <p className="mt-4 text-sm leading-6 text-muted">Keep this code private. Club approval is a separate step.</p>
    <a href="mailto:info@arpc.club" className={`mt-1 inline-flex min-h-11 items-center rounded text-sm font-semibold underline underline-offset-4 ${stateFocus}`}>Trouble receiving your code?</a>
  </div>;
}
