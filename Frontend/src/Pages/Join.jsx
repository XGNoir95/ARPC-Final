import { post } from "../utils/api";
import { userMessage } from '../utils/userMessages';
import { Notice } from '../Components/StateView';
import { membershipPayload } from "../utils/applicationPayload";
import ApplicationField from "../Components/ApplicationField";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion, useIsPresent, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiArrowLeft, FiCheck, FiDownload } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { paymentInstructions, paymentMethods, paymentRecipient, recruitmentPayment } from "../data/recruitment";
import { applicationFields, formatApplication, initialApplication, paymentFields, paymentSummary, validateApplication } from "../utils/membershipApplication";
import { publicPageFrame as frame } from "../Components/PublicLayout.styles";
import HeroShade from "../Components/HeroShade";

const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
const actionStyle = `inline-flex min-h-13 cursor-pointer items-center justify-center gap-4 rounded-full bg-action px-6 py-3 text-base font-semibold text-on-action transition-colors duration-200 hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none sm:text-lg ${focusStyle}`;
const studentFields = applicationFields.filter(({ name }) => name !== "email" && name !== "phone");
const contactFields = applicationFields.filter(({ name }) => name === "email" || name === "phone");

function PaymentView({ method, values, errors, onMethodChange, onChange }) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  const focusRef = useRef(null);
  const hasErrors = paymentFields(method).some(({ name }) => errors[name]);
  return <Motion.div
    inert={!present}
    aria-hidden={!present || undefined}
    initial={{ opacity: 0, x: reducedMotion ? 0 : 12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: reducedMotion ? 0 : -8 }}
    transition={{ duration: reducedMotion ? 0 : present ? 0.22 : 0.12, ease: [0.22, 0.68, 0.18, 1] }}
    onAnimationComplete={() => { if (present && document.activeElement === document.body) focusRef.current?.focus(); }}
    className="flex min-w-0 flex-col p-6 [grid-area:1/1]"
  >
    {method ? <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 ref={focusRef} tabIndex={-1} className="font-garamond text-2xl font-semibold outline-none">{method} details</h4>
        <button id="join-paymentMethod" type="button" onClick={() => onMethodChange("")} className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded px-1 text-sm font-semibold ${focusStyle}`}><FiArrowLeft aria-hidden="true" /> Change method</button>
      </div>
      <p className={`mb-4 text-sm leading-relaxed ${hasErrors ? "text-danger" : "text-copy"}`}>{hasErrors ? "Check the highlighted fields. Details are listed in the error summary above." : paymentRecipient(method) || paymentInstructions(method)}</p>
      <div className="space-y-5">{paymentFields(method).map((field) => <ApplicationField key={field.name} variant="enrollment" field={field} value={values[field.name]} error={errors[field.name]} onChange={onChange} compactError />)}</div>
    </> : <>
      <h4 id="join-payment-choice-heading" className="mb-3 text-base font-semibold">Payment method <span aria-hidden="true" className="text-danger">*</span></h4>
      <div role="group" aria-labelledby="join-payment-choice-heading" className="grid grid-cols-2 gap-2">{paymentMethods.map((option, index) => <button
        key={option} ref={index === 0 ? focusRef : undefined} id={index === 0 ? "join-paymentMethod" : undefined}
        type="button" aria-label={option} aria-controls="join-payment-content" onClick={() => onMethodChange(option)} aria-describedby={errors.paymentMethod ? "join-paymentMethod-error" : undefined}
        className={`flex min-h-14 cursor-pointer items-center justify-between gap-2 rounded-lg border border-ink/20 bg-field px-4 py-3 text-left text-base font-semibold transition-colors duration-200 hover:border-ink/40 hover:bg-surface motion-reduce:transition-none ${option === "Cash" ? "col-span-2" : ""} ${focusStyle}`}
      >{option === "Bank transfer" ? "Bank" : option}<FiArrowRight aria-hidden="true" className="shrink-0 text-muted" /></button>)}</div>
      {errors.paymentMethod && <p id="join-paymentMethod-error" className="mt-2 text-sm text-danger">{errors.paymentMethod}</p>}
      <p className="mt-auto border-t border-ink/15 pt-4 text-sm leading-relaxed text-copy">Your payment will be checked before membership is confirmed.</p>
    </>}
  </Motion.div>;
}

function PaymentPanel({ values, errors, onMethodChange, onChange }) {
  return <section aria-label="Registration payment" className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-soft ring-1 ring-ink/15 ring-inset @container/payment xl:row-span-2">
    <img src={publicAsset("/images/about/community.jpg")} alt="" aria-hidden="true" loading="lazy" className="aspect-[16/10] w-full object-cover object-[center_60%] xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1" />
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-4 bg-brand px-6 py-4 text-white">
      <div><p className="text-sm text-[#E9AD5E]">New membership</p><h3 className="mt-2 font-garamond text-3xl leading-tight font-semibold">Registration fee</h3></div>
      <p className="shrink-0 font-garamond text-5xl leading-none font-semibold text-[#E9AD5E]">৳{recruitmentPayment.amount}</p>
    </div>
    {/* Shared grid area keeps the transition steady, with room for enlarged text. */}
    <div id="join-payment-content" className="relative grid min-h-[24rem] shrink-0 @max-[25rem]/payment:min-h-[27rem] @max-[18rem]/payment:min-h-[29rem]">
      <AnimatePresence initial={false} mode="wait"><PaymentView key={values.paymentMethod || "methods"} method={values.paymentMethod} values={values} errors={errors} onMethodChange={onMethodChange} onChange={onChange} /></AnimatePresence>
    </div>
  </section>;
}

export default function Join() {
  const [values, setValues] = useState(initialApplication);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form");
  const [receipt, setReceipt] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const submitApplication = async () => { setSending(true); setSendError(""); try { const result=await post("/applications", membershipPayload(values)); if(typeof result?.id!=='string'||!result.id)throw new Error('Invalid application receipt');setReceipt(result); } catch (error) { setSendError(userMessage(error,'We couldn’t confirm your application. Your details are still here. Check your email for confirmation before trying again.')); } finally { setSending(false); } };
  const [attempt, setAttempt] = useState(0);
  const errorRef = useRef(null);
  const reviewRef = useRef(null);
  const formHeadingRef = useRef(null);

  useEffect(() => {
    if (step === "review") reviewRef.current?.focus();
    else if (attempt) (errorRef.current ?? formHeadingRef.current)?.focus();
  }, [step, attempt]);

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      // Method-specific errors must not remain after switching payment methods.
      if (name === "paymentMethod") paymentMethods.flatMap(paymentFields).forEach(({ name: fieldName }) => delete next[fieldName]);
      return next;
    });
  };

  const change = (event) => {
    const { name, value, checked, type } = event.target;
    updateValue(name, type === "checkbox" ? checked : value);
  };

  const review = (event) => {
    event.preventDefault();
    const nextErrors = validateApplication(values);
    setErrors(nextErrors);
    setAttempt((current) => current + 1);
    if (!Object.keys(nextErrors).length) setStep("review");
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([formatApplication(values)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "arpc-membership-application.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section aria-labelledby="join-heading" className="bg-soft text-ink">
    <header className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-[#252d29] sm:min-h-[25rem] lg:min-h-[28rem]">
      {/* Local placeholder photography, shared with the club's community section. */}
      <img src={publicAsset("/images/about/community.jpg")} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover object-[center_60%]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
      <HeroShade />
      <div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}>
        <div>
          <h1 id="join-heading" className="max-w-4xl [overflow-wrap:anywhere] font-garamond text-[clamp(2.5rem,8vw,3rem)] leading-[0.98] font-semibold tracking-[-0.025em] text-[#f6f8f3] sm:text-[clamp(3rem,6.5vw,6.5rem)]">Join the<br /><span className="text-[#E9AD5E]">ARPC</span> community.</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">A place to learn, contribute and grow together. Take your first step by becoming a member.</p>
        </div>
      </div>
    </header>

    <div className={`${frame} py-10 sm:py-14 lg:py-16`}>
      <div className="w-full rounded-2xl bg-surface p-5 shadow-[0_12px_40px_-24px_rgba(23,61,46,0.28)] ring-1 ring-ink/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
        {step === "form" ? <form noValidate onSubmit={review} aria-labelledby="application-heading" className="grid items-stretch gap-y-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-x-12">
          <div className="flex min-w-0 flex-col">
          <div className="mb-8 border-t-2 border-[#E9AD5E] pt-6">
            <h2 id="application-heading" ref={formHeadingRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Membership application</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">Complete your details and payment information. Fields marked <span className="text-danger">*</span> are required.</p>
          </div>

          {Object.keys(errors).length > 0 && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger-soft p-4 text-danger focus:outline-2 focus:outline-offset-2 focus:outline-danger">
            <p className="font-semibold">Please check your application.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{Object.entries(errors).map(([name, message]) => <li key={name}><a href={`#join-${name}`} onClick={(event) => { event.preventDefault(); document.getElementById(`join-${name}`)?.focus(); }} className="underline underline-offset-2">{message}</a></li>)}</ul>
          </div>}

            <fieldset className="flex min-w-0 flex-col xl:flex-1">
              <legend className="mb-5 font-garamond text-2xl font-semibold sm:text-3xl">Student information</legend>
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{studentFields.map((field) => <ApplicationField key={field.name} variant="enrollment" field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
            </fieldset>
            <div className="mt-8 border-t border-ink/15 pt-7">
              <fieldset className="min-w-0">
                <legend className="mb-5 font-garamond text-2xl font-semibold sm:text-3xl">Contact information</legend>
                <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{contactFields.map((field) => <ApplicationField key={field.name} variant="enrollment" field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
              </fieldset>
            </div>
          </div>

          <PaymentPanel values={values} errors={errors} onMethodChange={(method) => updateValue("paymentMethod", method)} onChange={change} />

          <div className="min-w-0 border-t border-ink/15 pt-6">
            <label htmlFor="join-consent" className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed sm:text-base">
              <input id="join-consent" name="consent" type="checkbox" required checked={values.consent} onChange={change} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "join-consent-error" : undefined} className="mt-1 size-5 shrink-0 cursor-pointer accent-action focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink" />
              <span>I agree to be contacted about my membership application. <span aria-hidden="true" className="text-danger">*</span></span>
            </label>
            {errors.consent && <p id="join-consent-error" className="mt-2 text-sm text-danger">{errors.consent}</p>}
            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-relaxed text-muted">You’ll review your details before submitting your application to the club.</p>
              <button type="submit" className={`${actionStyle} w-full shrink-0 sm:w-auto`}>Review application <FiArrowRight aria-hidden="true" /></button>
            </div>
          </div>
        </form> : <div className="max-w-4xl border-t-2 border-[#E9AD5E] pt-6">
          <h2 ref={reviewRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Review your application</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">Check your details, then submit your application to the club for review.</p>
          <dl className="mt-7 grid gap-x-8 sm:grid-cols-2">{applicationFields.map(({ name, label }) => <div key={name} className="min-w-0 border-t border-ink/15 py-4"><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 break-words text-base font-medium">{values[name].trim()}</dd></div>)}</dl>
          <div className="mt-5 rounded-xl bg-soft p-5 sm:p-6">
            <h3 className="font-garamond text-2xl font-semibold">Transaction information</h3>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">{paymentSummary(values).map(([label, value]) => <div key={label} className="min-w-0 border-t border-ink/15 py-3"><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 break-words text-base font-medium">{value}</dd></div>)}</dl>
          </div>
          <div className="mt-7 border-t border-ink/15 pt-6">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-copy"><FiCheck aria-hidden="true" className="mt-1 shrink-0" />Your application will be saved securely and reviewed by the club. Payment is verified manually.</p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep("form")} className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded text-base font-semibold ${focusStyle}`}><FiArrowLeft aria-hidden="true" /> Edit details</button>
              <button type="button" disabled={sending || Boolean(receipt)} onClick={submitApplication} className={actionStyle}>{receipt ? "Application submitted" : sending ? "Submitting..." : "Submit application"}</button>
            </div>
          </div>
          {receipt && <p role="status" className="mt-5 rounded-lg bg-soft p-4 text-sm leading-relaxed">Application received. The club will review your details. Watch your inbox for confirmation. Reference: {receipt.id}</p>}
          {sendError && <div className="mt-5"><Notice title="We couldn’t confirm your application.">{sendError}</Notice></div>}
          <button type="button" onClick={download} className={`mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded text-sm font-semibold underline underline-offset-4 ${focusStyle}`}><FiDownload aria-hidden="true" /> Download a copy</button>
        </div>}
      </div>
    </div>
  </section>;
}
