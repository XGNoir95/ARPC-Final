import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { studentFields } from "../utils/studentDetails";
import { post } from "../utils/api";
import { useAuth } from '../AuthContext';
import GoogleSignIn from "./GoogleSignIn";
import HeroShade from './HeroShade';
import { Notice } from './StateView';
import { userMessage } from '../utils/userMessages';

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
const input = "block w-full min-w-0 rounded-lg border border-ink/20 bg-field px-4 text-base text-ink placeholder:text-muted/80 transition-[background-color,border-color,box-shadow] duration-200 hover:border-ink/40 focus:border-ink focus:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-ink focus:shadow-[0_0_0_4px_rgba(23,61,46,0.08)] aria-invalid:border-danger motion-reduce:transition-none";
const departments = studentFields.find(({ name }) => name === "department").options;
const registrationFields = [
  { name: "fullName", label: "Full name", autoComplete: "name", maxLength: 100, placeholder: "Your full name" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", placeholder: "+880 1XXXXXXXXX" },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", maxLength: 150, placeholder: "you@example.com" },
  { name: "studentId", label: "Student ID", autoComplete: "off", placeholder: "Your student ID" },
  { name: "department", label: "Department", options: departments },
  { name: "batch", label: "Batch / Year", autoComplete: "off", placeholder: "e.g. 22.1.1" },
];

function AccountField({ name, label, type = "text", error, options, compact = false, aside, ...attributes }) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  const id = `account-${name}`;
  const fieldInput = `${input} ${compact ? "min-h-12 py-2.5" : "min-h-13 py-3.5"}`;
  return <div className="min-w-0">
    <div className={compact ? "mb-1 flex min-h-6 items-center justify-between gap-3" : aside ? "mb-2 flex min-h-6 items-center justify-between gap-3" : "mb-2"}><label htmlFor={id} className="block text-base font-semibold text-ink">{label} <span aria-hidden="true" className="text-danger">*</span></label>{aside}</div>
    <div className="relative">
      {options ? <select id={id} name={name} required className={fieldInput} {...attributes}><option value="">Select your department</option>{options.map((option) => <option key={option}>{option}</option>)}</select>
        : <input id={id} name={name} type={password && visible ? "text" : type} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`${fieldInput} ${password ? "pr-14" : ""}`} {...attributes} />}
      {password && <button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible((value) => !value)} className={`absolute inset-y-1 right-1 flex min-w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink motion-reduce:transition-none ${focus}`}>
        {visible ? <FiEyeOff aria-hidden="true" className="size-5" /> : <FiEye aria-hidden="true" className="size-5" />}
      </button>}
    </div>
    {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm leading-relaxed text-danger">{error}</p>}
  </div>;
}

export default function AccountAccess({ register = false }) {
  const navigate = useNavigate();
  const {acceptSession}=useAuth();
  const location = useLocation();
  const invitation = new URLSearchParams(location.search);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (register && form.elements.password.value !== form.elements.confirmPassword.value) {
      setPasswordError("Your passwords do not match.");
      setMessage("");
      form.elements.confirmPassword.focus();
      return;
    }
    setPasswordError("");
    const values = Object.fromEntries(new FormData(form));
    if (register && !values.fullName.trim()) { setMessage("Enter your full name."); return; }
    setBusy(true);
    try {
      const result=await post(register ? '/auth/register' : '/auth/login', { ...values, inviteToken: invitation.get('invite') || undefined });
      if(!result?.profile||typeof result.profile!=='object')throw new Error('Invalid account response');
      acceptSession(result.profile);
      navigate('/admin', { replace: true });
    } catch (error) { setMessage(userMessage(error,register?'We couldn’t request your account. Your details are still here; please try again.':'We couldn’t sign you in. Please try again.')); } finally { setBusy(false); }

  };

  return <section data-account-access="" aria-labelledby="account-heading" className="relative min-h-dvh bg-surface text-ink">
    <div className="flex min-h-dvh w-full flex-col">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12 xl:px-16">
        {/* Offset the larger logo so its text starts at the shared field inset. */}
        <Link to="/" aria-label="ARPC home" className={`flex min-w-0 items-center gap-3 rounded-lg sm:-ml-[15px] sm:gap-4 xl:-ml-[23px] ${focus}`}>
          <img src={publicAsset("/logo.jpg")} alt="ARPC Logo" width="112" height="112" className="size-18 shrink-0 rounded-full object-contain sm:size-24 xl:size-28" />
          <div className="min-w-0"><p className="font-garamond text-[2.5rem] leading-none font-semibold sm:text-5xl">ARPC</p><p className="mt-1 max-w-[25ch] text-[15px] leading-relaxed text-muted sm:max-w-none sm:text-base">Ahsanullah Roh. Peace Club</p></div>
        </Link>
        <Link to="/" aria-label="Back to home" className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-ink/20 bg-surface/95 px-3 text-sm font-medium transition-colors hover:border-[#E9AD5E] hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none sm:px-4 ${focus}`}><FiArrowLeft aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Back to home</span></Link>
      </header>
      <div className="grid min-h-dvh flex-1 lg:grid-cols-2">
        <div className="flex min-w-0 items-stretch px-6 pt-28 pb-6 sm:px-10 sm:pt-32 lg:px-12 xl:px-16">
          {/* Inset the outline vertically without moving the content. */}
          <div className="relative mx-auto flex w-full flex-col justify-center rounded-2xl border border-transparent bg-surface p-6 before:pointer-events-none before:absolute before:-inset-x-px before:inset-y-4 before:rounded-2xl before:border before:border-ink/20 sm:p-8 xl:px-10 xl:py-16">
            <div className="w-full">
            <div className="@container w-full min-[400px]:px-4 sm:px-16">
            <h1 id="account-heading" className="font-garamond text-4xl leading-tight font-semibold tracking-[-0.02em] sm:text-5xl">{register ? "Create your account." : "Welcome back."}</h1>
            <p className="mt-3 text-base leading-7 text-muted">{register ? "Request administrator access to the club workspace. Verify your email after signup; a superadmin will review your request." : "Sign in to manage your club workspace."}</p>

            <form onSubmit={submit} onChange={() => { setMessage(""); setPasswordError(""); }} className="mt-7">
              {register ? <>
                <fieldset className="min-w-0"><legend className="mb-5 font-garamond text-2xl font-semibold">Your details</legend><div className="grid gap-x-5 gap-y-5 @min-[24rem]:grid-cols-2">{registrationFields.map((field) => <AccountField key={field.name} {...field} defaultValue={field.name === "email" ? invitation.get("email") || "" : undefined} />)}</div></fieldset>
                <fieldset className="mt-7 min-w-0 border-t border-ink/15 pt-5"><legend className="float-left mb-5 w-full font-garamond text-2xl font-semibold">Account password</legend><div className="clear-both grid gap-5 @min-[24rem]:grid-cols-2"><AccountField name="password" label="Password" type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="Create a password" /><AccountField name="confirmPassword" label="Confirm password" type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="Re-enter your password" error={passwordError} /></div></fieldset>
              </> : <div className="space-y-5"><AccountField name="email" label="Email address" type="email" maxLength={150} autoComplete="username" placeholder="you@example.com" /><AccountField name="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" aside={<Link to="/forgot-password" className={`inline-flex min-h-11 items-center rounded text-sm font-semibold underline ${focus}`}>Forgot password?</Link>} /></div>}
              {message && <div className="mt-6"><Notice title={register ? 'Your account request needs attention.' : 'We couldn’t sign you in.'}>{message}</Notice></div>}
              <button type="submit" disabled={busy} aria-busy={busy} className={`mt-6 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-action px-5 py-3 text-base font-semibold text-on-action transition-colors duration-200 hover:bg-[#E9AD5E] hover:text-brand disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${focus}`}>{busy ? "Please wait..." : register ? "Request account" : "Sign in"}</button>
            </form>
            <GoogleSignIn fullWidth separator compact register={register} disabled={busy} onCredential={async credential => { setBusy(true); try { const result=await post('/auth/google', { credential }); if(!result?.profile||typeof result.profile!=='object')throw new Error('Invalid account response');acceptSession(result.profile); navigate('/admin', { replace:true }); } catch (error) { setMessage(userMessage(error)); } finally { setBusy(false); } }} />
            </div>
            <div className="mt-6 text-center text-sm leading-6 text-muted"><p>{register ? "Already have an account?" : "Need an administrator account?"} <Link to={register ? "/login" : "/register"} className={`inline-flex min-h-11 items-center rounded font-semibold text-ink underline decoration-[#E9AD5E] underline-offset-4 ${focus}`}>{register ? "Sign in" : "Create account"}</Link></p><a href="mailto:info@arpc.club" className={`mx-auto mt-1 flex min-h-11 w-fit items-center rounded text-muted underline underline-offset-3 ${focus}`}>Need help?</a></div>
            </div>
          </div>
        </div>
        <aside aria-label="About ARPC" className="relative isolate hidden min-w-0 flex-col justify-end overflow-hidden bg-brand text-[#f6f8f3] lg:flex">
          <img src={publicAsset("/heroBanner.jpg")} alt="AUST campus in the evening sunlight" width="2048" height="1536" className="absolute inset-0 -z-20 h-full w-full object-cover object-[48%_center]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
          <HeroShade />
          <div className="px-8 pt-32 pb-10 xl:px-12 xl:pb-12">
            <p className="mb-5 text-sm font-medium text-[#E9AD5E]">Our home at AUST</p>
            <h2 className="max-w-[18ch] font-garamond text-4xl leading-[1.1] font-semibold xl:text-5xl">Carry the club forward.</h2>
            <p className="mt-4 max-w-[44ch] text-sm leading-[1.8] text-white/85">Learning, reflection and service begin with the people who make time for one another.</p>
            <div aria-hidden="true" className="mt-6 h-1 w-14 rounded-full bg-[#E9AD5E]" />
          </div>
        </aside>
      </div>
    </div>
  </section>;
}
