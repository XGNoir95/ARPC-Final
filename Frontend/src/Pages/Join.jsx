import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion, useIsPresent, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiArrowLeft, FiCheck, FiDownload, FiMail } from "react-icons/fi";
import { publicAsset } from "../utils/publicAsset";
import { paymentInstructions, paymentMethods, paymentRecipient, recruitmentPayment } from "../data/recruitment";
import { applicationEmail, applicationFields, formatApplication, initialApplication, paymentFields, paymentSummary, validateApplication } from "../utils/membershipApplication";

const frame = "mx-auto w-full max-w-[112rem] px-6 lg:w-[calc(100%_-_10rem)] 2xl:px-24";
const inputStyle = "block min-h-12 w-full rounded-lg border border-[#173d2e]/25 bg-white px-4 py-3 text-base text-[#173d2e] placeholder:text-[#547366] transition-colors focus:border-[#173d2e] focus:outline-2 focus:outline-offset-2 focus:outline-[#173d2e] aria-invalid:border-[#a33a32] aria-invalid:focus:outline-[#a33a32] motion-reduce:transition-none";
const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173d2e]";
const actionStyle = `inline-flex min-h-13 cursor-pointer items-center justify-center gap-4 rounded-full bg-[#173d2e] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#E9AD5E] hover:text-[#173d2e] motion-reduce:transition-none sm:text-lg ${focusStyle}`;

function ApplicationField({ field, value, error, onChange, compactError = false }) {
  const { name, label, type = "text", options, required = true, ...attributes } = field;
  const props = { id: `join-${name}`, name, required, value, onChange, "aria-invalid": Boolean(error), "aria-describedby": error ? `join-${name}-error` : undefined, className: inputStyle, ...attributes };
  return <div className={name === "fullName" ? "sm:col-span-2" : "min-w-0"}>
    <label htmlFor={props.id} className="mb-2 block text-sm font-semibold sm:text-base">{label} {required ? <span aria-hidden="true" className="text-[#b42318]">*</span> : <span className="font-normal text-[#547366]">(optional)</span>}</label>
    {options ? <select {...props}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input {...props} type={type} />}
    {error && <p id={`join-${name}-error`} className={compactError ? "sr-only" : "mt-2 text-sm text-[#862f29]"}>{error}</p>}
  </div>;
}

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
    className="absolute inset-0 flex flex-col p-5"
  >
    {method ? <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 ref={focusRef} tabIndex={-1} className="font-garamond text-2xl font-semibold outline-none">{method} details</h4>
        <button id="join-paymentMethod" type="button" onClick={() => onMethodChange("")} className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded px-1 text-sm font-semibold ${focusStyle}`}><FiArrowLeft aria-hidden="true" /> Change method</button>
      </div>
      <p className={`mb-4 text-sm leading-relaxed ${hasErrors ? "text-[#862f29]" : "text-[#426454]"}`}>{hasErrors ? "Check the highlighted fields. Details are listed in the error summary above." : paymentRecipient(method) || paymentInstructions(method)}</p>
      <div className="space-y-4">{paymentFields(method).map((field) => <ApplicationField key={field.name} field={field} value={values[field.name]} error={errors[field.name]} onChange={onChange} compactError />)}</div>
    </> : <>
      <h4 id="join-payment-choice-heading" className="mb-3 text-base font-semibold">Payment method <span aria-hidden="true" className="text-[#b42318]">*</span></h4>
      <div role="group" aria-labelledby="join-payment-choice-heading" className="grid grid-cols-2 gap-2">{paymentMethods.map((option, index) => <button
        key={option} ref={index === 0 ? focusRef : undefined} id={index === 0 ? "join-paymentMethod" : undefined}
        type="button" aria-label={option} aria-controls="join-payment-content" onClick={() => onMethodChange(option)} aria-describedby={errors.paymentMethod ? "join-paymentMethod-error" : undefined}
        className={`flex min-h-14 cursor-pointer items-center justify-between gap-2 rounded-lg border border-[#173d2e]/25 bg-white px-4 py-3 text-left text-base font-semibold transition-colors hover:border-[#173d2e] hover:bg-[#dce8df] motion-reduce:transition-none ${option === "Cash" ? "col-span-2" : ""} ${focusStyle}`}
      >{option === "Bank transfer" ? "Bank" : option}<FiArrowRight aria-hidden="true" className="shrink-0 text-[#547366]" /></button>)}</div>
      {errors.paymentMethod && <p id="join-paymentMethod-error" className="mt-2 text-sm text-[#862f29]">{errors.paymentMethod}</p>}
      <p className="mt-auto border-t border-[#173d2e]/15 pt-4 text-sm leading-relaxed text-[#426454]">Your payment will be checked before membership is confirmed.</p>
    </>}
  </Motion.div>;
}

function PaymentPanel({ values, errors, onMethodChange, onChange }) {
  return <section aria-label="Registration payment" className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[#eef4ef]">
    <div className="flex items-end justify-between gap-4 bg-[#173d2e] px-5 py-6 text-white">
      <div><p className="text-sm text-white/80">New membership</p><h3 className="mt-1 font-garamond text-2xl font-semibold">Registration fee</h3></div>
      <p className="shrink-0 font-garamond text-5xl leading-none font-semibold text-[#E9AD5E]">৳{recruitmentPayment.amount}</p>
    </div>
    {/* Both views occupy the same area; desktop height comes from the member fields. */}
    <div id="join-payment-content" className="relative min-h-[24rem] flex-1 lg:min-h-0">
      <AnimatePresence initial={false} mode="wait"><PaymentView key={values.paymentMethod || "methods"} method={values.paymentMethod} values={values} errors={errors} onMethodChange={onMethodChange} onChange={onChange} /></AnimatePresence>
    </div>
  </section>;
}

export default function Join() {
  const [values, setValues] = useState(initialApplication);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form");
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

  return <section aria-labelledby="join-heading" className="bg-[#eef4ef] text-[#173d2e]">
    <header className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-[#252d29] sm:min-h-[25rem] lg:min-h-[28rem]">
      {/* Local placeholder photography, shared with the club's community section. */}
      <img src={publicAsset("/images/about/community.jpg")} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover object-[center_60%]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/55" />
      <div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}>
        <div className="px-5 sm:px-8 lg:px-10">
          <h1 id="join-heading" className="max-w-4xl font-garamond text-[clamp(3rem,6.5vw,6.5rem)] leading-[0.98] font-semibold tracking-[-0.025em] text-[#f6f8f3]">Join the<br /><span className="text-[#E9AD5E]">ARPC</span> community.</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">A place to learn, contribute and grow together. Take your first step by becoming a member.</p>
        </div>
      </div>
    </header>

    <div className={`${frame} py-10 sm:py-14 lg:py-16`}>
      <div className="w-full rounded-2xl bg-white p-5 shadow-[0_12px_40px_-24px_rgba(23,61,46,0.28)] ring-1 ring-[#173d2e]/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
        {step === "form" ? <form noValidate onSubmit={review} aria-labelledby="application-heading">
          <div className="mb-8 border-b border-[#173d2e]/15 pb-6 sm:mb-10">
            <h2 id="application-heading" ref={formHeadingRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Membership application</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#547366] sm:text-base">Fill in your details and payment information, then review your application. Fields marked <span className="text-[#b42318]">*</span> are required.</p>
          </div>

          {Object.keys(errors).length > 0 && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-8 rounded-lg border border-[#a33a32]/30 bg-[#fff6f5] p-4 text-[#862f29] focus:outline-2 focus:outline-offset-2 focus:outline-[#a33a32]">
            <p className="font-semibold">Please check your application.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{Object.entries(errors).map(([name, message]) => <li key={name}><a href={`#join-${name}`} onClick={(event) => { event.preventDefault(); document.getElementById(`join-${name}`)?.focus(); }} className="underline underline-offset-2">{message}</a></li>)}</ul>
          </div>}

          <div className="grid items-stretch gap-9 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <fieldset className="min-w-0">
              <legend className="mb-6 font-garamond text-3xl font-semibold">Your details</legend>
              <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">{applicationFields.map((field) => <ApplicationField key={field.name} field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
            </fieldset>

            <PaymentPanel values={values} errors={errors} onMethodChange={(method) => updateValue("paymentMethod", method)} onChange={change} />
          </div>

          <div className="mt-9 border-t border-[#173d2e]/15 pt-6 sm:mt-10">
            <label htmlFor="join-consent" className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed sm:text-base">
              <input id="join-consent" name="consent" type="checkbox" required checked={values.consent} onChange={change} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "join-consent-error" : undefined} className="mt-1 size-5 shrink-0 cursor-pointer accent-[#173d2e] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#173d2e]" />
              <span>I agree to be contacted about my membership application. <span aria-hidden="true" className="text-[#b42318]">*</span></span>
            </label>
            {errors.consent && <p id="join-consent-error" className="mt-2 text-sm text-[#862f29]">{errors.consent}</p>}
            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-relaxed text-[#547366]">You’ll review your details before opening an email to the club.</p>
              <button type="submit" className={`${actionStyle} shrink-0`}>Review application <FiArrowRight aria-hidden="true" /></button>
            </div>
          </div>
        </form> : <div className="max-w-4xl">
          <h2 ref={reviewRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Review your application</h2>
          <p className="mt-3 text-base leading-relaxed text-[#547366]">Check your details, then open your email app to send them to info@arpc.club. Your application has not been sent yet.</p>
          <dl className="mt-7 grid gap-x-8 sm:grid-cols-2">{applicationFields.map(({ name, label }) => <div key={name} className="min-w-0 border-t border-[#173d2e]/15 py-4"><dt className="text-sm text-[#547366]">{label}</dt><dd className="mt-1 break-words text-base font-medium">{values[name].trim()}</dd></div>)}</dl>
          <div className="mt-5 rounded-xl bg-[#eef4ef] p-5 sm:p-6">
            <h3 className="font-garamond text-2xl font-semibold">Transaction information</h3>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">{paymentSummary(values).map(([label, value]) => <div key={label} className="min-w-0 border-t border-[#173d2e]/15 py-3"><dt className="text-sm text-[#547366]">{label}</dt><dd className="mt-1 break-words text-base font-medium">{value}</dd></div>)}</dl>
          </div>
          <div className="mt-7 border-t border-[#173d2e]/15 pt-6">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-[#426454]"><FiCheck aria-hidden="true" className="mt-1 shrink-0" />Send the draft in your email app to complete your application. You can also download a copy and email it to the club.</p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button type="button" onClick={() => setStep("form")} className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded text-base font-semibold ${focusStyle}`}><FiArrowLeft aria-hidden="true" /> Edit details</button>
              <a href={applicationEmail(values)} className={actionStyle}><FiMail aria-hidden="true" /> Open email to send</a>
            </div>
          </div>
          <button type="button" onClick={download} className={`mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded text-sm font-semibold underline underline-offset-4 ${focusStyle}`}><FiDownload aria-hidden="true" /> Download a copy</button>
        </div>}
      </div>
    </div>
  </section>;
}
