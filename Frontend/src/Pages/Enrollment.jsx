import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCalendar, FiCheck, FiClock, FiCreditCard, FiDownload, FiLayers, FiMail, FiMapPin } from "react-icons/fi";
import ApplicationField from "../Components/ApplicationField";
import { publicAsset } from "../utils/publicAsset";
import { enrollmentEmail, enrollmentFacts, enrollmentFields, formatEnrollment, getEnrollment } from "../utils/enrollment";
import { validateStudentDetails } from "../utils/studentDetails";

const frame = "mx-auto w-full max-w-[112rem] px-6 lg:w-[calc(100%_-_10rem)] 2xl:px-24";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173d2e]";
const action = `inline-flex min-h-13 cursor-pointer items-center justify-center gap-4 rounded-full bg-[#173d2e] px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#E9AD5E] hover:text-[#173d2e] motion-reduce:transition-none sm:text-lg ${focus}`;
const factIcons = { Date: FiCalendar, Time: FiClock, Duration: FiClock, Place: FiMapPin, "Learning format": FiLayers, "Course fee": FiCreditCard };

function EnrollmentForm({ enrollment }) {
  const { kind, item, label } = enrollment;
  const fields = enrollmentFields(kind);
  const studentFields = fields.filter(({ name }) => name !== "email" && name !== "phone");
  const contactFields = fields.filter(({ name }) => name === "email" || name === "phone");
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(({ name }) => [name, ""])));
  const [errors, setErrors] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const headingRef = useRef(null);
  const errorRef = useRef(null);
  const reviewRef = useRef(null);

  useEffect(() => {
    if (reviewing) reviewRef.current?.focus();
    else if (attempt) (errorRef.current ?? headingRef.current)?.focus();
  }, [reviewing, attempt]);

  const change = ({ target: { name, value } }) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => { const next = { ...current }; delete next[name]; return next; });
  };
  const review = (event) => {
    event.preventDefault();
    const next = validateStudentDetails(values, fields);
    setErrors(next);
    setAttempt((current) => current + 1);
    if (!Object.keys(next).length) setReviewing(true);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([formatEnrollment(enrollment, values)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `arpc-${kind}-${item.id}-enrollment.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section aria-labelledby="enrollment-title" className="bg-[#eef4ef] text-[#173d2e]">
    <header className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-neutral-900 sm:min-h-[25rem] lg:min-h-[28rem]">
      <img src={publicAsset(item.heroImage || item.image)} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}><div className="px-5 sm:px-8 lg:px-10">
        <p className="mb-4 text-base font-semibold text-[#E9AD5E]">{label} enrollment</p>
        <h1 id="enrollment-title" className="max-w-[24ch] [overflow-wrap:anywhere] font-garamond text-[clamp(2.3rem,8vw,2.8rem)] leading-[1.03] font-semibold tracking-[-0.025em] text-[#f6f8f3] sm:text-[clamp(2.8rem,5.5vw,5.5rem)]">{item.title}</h1>
        <p className="mt-5 max-w-[64ch] text-base leading-[1.75] text-white/90 sm:text-lg">{item.description}</p>
      </div></div>
    </header>
    <div className={`${frame} py-10 sm:py-14 lg:py-16`}>
      <div className="rounded-2xl bg-white p-5 shadow-[0_12px_40px_-24px_rgba(23,61,46,0.28)] ring-1 ring-[#173d2e]/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
        <Link to="/catalogue" className={`mb-6 inline-flex min-h-11 items-center gap-3 rounded text-lg font-semibold sm:text-xl ${focus}`}><FiArrowLeft aria-hidden="true" className="size-5 shrink-0" /> Back to catalogue</Link>
        <div className="grid items-stretch gap-10 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-12">
          {reviewing ? <div className="flex min-w-0 flex-col">
            <h2 ref={reviewRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Review your enrollment</h2>
            <p className="mt-3 text-base leading-relaxed text-[#547366]">Your request has not been sent yet. Check your details, then email the club to request your place.</p>
            <dl className="mt-6 grid gap-x-6 sm:grid-cols-2 xl:flex-1 xl:auto-rows-[minmax(min-content,1fr)]">{fields.map(({ name, label: fieldLabel }) => <div key={name} className="min-w-0 border-t border-[#173d2e]/15 py-4"><dt className="text-sm text-[#547366]">{fieldLabel}</dt><dd className="mt-1 break-words font-medium">{values[name].trim()}</dd></div>)}</dl>
            <p className="mt-5 rounded-lg bg-[#eef4ef] p-4 text-sm leading-relaxed text-[#426454]">Enrollment is pending club confirmation. Sending this request does not reserve a place or collect any payment.</p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button type="button" onClick={() => setReviewing(false)} className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded font-semibold ${focus}`}><FiArrowLeft aria-hidden="true" /> Edit details</button>
              <a href={enrollmentEmail(enrollment, values)} className={action}><FiMail aria-hidden="true" /> Open email to send</a>
            </div>
            <button type="button" onClick={download} className={`mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded text-sm font-semibold underline underline-offset-4 ${focus}`}><FiDownload aria-hidden="true" /> Download a copy</button>
          </div> : <form noValidate onSubmit={review} aria-labelledby="enrollment-form-title" className="flex min-w-0 flex-col">
            <div className="mb-8 border-t-2 border-[#E9AD5E] pt-6">
              <h2 id="enrollment-form-title" ref={headingRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Your enrollment details</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#547366] sm:text-base">Complete your details, then review your request. Fields marked <span className="text-[#b42318]">*</span> are required.</p>
            </div>
            {Object.keys(errors).length > 0 && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-6 rounded-lg border border-[#a33a32]/30 bg-[#fff6f5] p-4 text-[#862f29] focus:outline-2 focus:outline-offset-2 focus:outline-[#a33a32]">
              <p className="font-semibold">Please check your enrollment details.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{Object.entries(errors).map(([name, message]) => <li key={name}><a href={`#enrollment-${name}`} onClick={(event) => { event.preventDefault(); document.getElementById(`enrollment-${name}`)?.focus(); }} className="underline underline-offset-2">{message}</a></li>)}</ul>
            </div>}
            <fieldset className="flex min-w-0 flex-col xl:flex-1">
              <legend className="mb-5 font-garamond text-2xl font-semibold sm:text-3xl">Student information</legend>
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{studentFields.map((field) => <ApplicationField key={field.name} prefix="enrollment" variant="enrollment" field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
            </fieldset>
            <div className="mt-8 border-t border-[#173d2e]/15 pt-7">
              <fieldset className="min-w-0">
                <legend className="mb-5 font-garamond text-2xl font-semibold sm:text-3xl">Contact information</legend>
                <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{contactFields.map((field) => <ApplicationField key={field.name} prefix="enrollment" variant="enrollment" className={contactFields.length === 1 ? "sm:col-span-2" : ""} field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
              </fieldset>
            </div>
            <div className="mt-8 flex flex-col gap-5 border-t border-[#173d2e]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-[#547366]">You’ll review your details before opening an email to the club.</p>
              <button type="submit" className={`${action} w-full shrink-0 sm:w-auto`}>Review enrollment <FiArrowRight aria-hidden="true" /></button>
            </div>
          </form>}
          <aside aria-label="Selected programme" className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#eef4ef] ring-1 ring-[#173d2e]/15 ring-inset">
            {!reviewing && <img src={publicAsset(item.image)} alt={item.imageAlt || `${item.title} poster`} className={`aspect-[16/10] w-full xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1 ${item.isPoster ? "object-contain" : "object-cover"}`} />}
            <div className="shrink-0 bg-[#173d2e] px-6 py-4 text-white">
              <h3 className="font-garamond text-3xl leading-tight font-semibold">Programme details</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#E9AD5E] sm:text-base">{item.format}</p>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-6">
              <dl className="xl:grid xl:flex-1 xl:auto-rows-[minmax(min-content,1fr)]">{enrollmentFacts(enrollment).map(([fact, value]) => {
                const Icon = factIcons[fact];
                return <div key={fact} className="relative flex flex-col justify-center border-b border-[#173d2e]/15 py-4 pl-15">
                  <dt className="text-sm leading-relaxed text-[#547366]"><span aria-hidden="true" className="absolute top-1/2 left-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#dbe6de] text-[#173d2e]"><Icon className="size-5" /></span>{fact}</dt><dd className="mt-1 text-lg leading-snug font-semibold sm:text-xl">{value}</dd>
                </div>;
              })}</dl>
              {!reviewing && item.takeaways?.length > 0 && <div className="mt-5">
                <h4 className="font-garamond text-2xl font-semibold">What to expect</h4>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#426454]">{item.takeaways.slice(0, 2).map((point) => <li key={point} className="flex items-start gap-3"><FiCheck aria-hidden="true" className="mt-1 size-4 shrink-0" />{point}</li>)}</ul>
              </div>}
              <p className="mt-5 text-sm leading-relaxed text-[#426454]">Preview programme. Dates, fees and availability need club confirmation.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>;
}

export default function Enrollment() {
  const { kind, id } = useParams();
  const enrollment = getEnrollment(kind, id);
  if (!enrollment) return <section className="mx-auto max-w-3xl px-6 py-20 text-[#173d2e]"><h1 className="font-garamond text-5xl font-semibold">Programme not found</h1><p className="mt-4 text-base leading-relaxed">This enrollment link is unavailable. Choose a programme from the catalogue.</p><Link to="/catalogue" className={`${action} mt-7`}>Browse the catalogue <FiArrowRight aria-hidden="true" /></Link></section>;
  return <EnrollmentForm key={`${kind}:${id}`} enrollment={enrollment} />;
}
