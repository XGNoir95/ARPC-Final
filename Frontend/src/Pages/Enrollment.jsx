import SafeImage from '../Components/SafeImage';
import { useContent } from "../contexts/ContentContext";
import { post } from "../utils/api";
import { studentPayload } from "../utils/applicationPayload";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCalendar, FiCheck, FiClock, FiCreditCard, FiDownload, FiLayers, FiMapPin } from "react-icons/fi";
import ApplicationField from "../Components/ApplicationField";
import { publicAsset } from "../utils/publicAsset";
import { enrollmentFacts, enrollmentFields, formatEnrollment, getEnrollment } from "../utils/enrollment";
import { validateStudentDetails } from "../utils/studentDetails";
import { Notice, StatePage } from '../Components/StateView';
import { ContentNotice } from '../Components/ContentFeedback';
import { userMessage } from '../utils/userMessages';
import { publicPageFrame as frame } from "../Components/PublicLayout.styles";
import HeroShade from "../Components/HeroShade";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
const action = `inline-flex min-h-13 cursor-pointer items-center justify-center gap-4 rounded-full bg-action px-6 py-3 text-base font-semibold text-on-action transition-colors duration-200 hover:bg-[#E9AD5E] hover:text-brand motion-reduce:transition-none sm:text-lg ${focus}`;
const factIcons = { Date: FiCalendar, Time: FiClock, Duration: FiClock, Place: FiMapPin, "Learning format": FiLayers, "Course fee": FiCreditCard };

function EnrollmentForm({ enrollment }) {
  const content=useContent();
  const { kind, item, label } = enrollment;
  const fields = enrollmentFields(kind);
  const studentFields = fields.filter(({ name }) => name !== "email" && name !== "phone");
  const contactFields = fields.filter(({ name }) => name === "email" || name === "phone");
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(({ name }) => [name, ""])));
  const [errors, setErrors] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const submitEnrollment = async () => { setSending(true); setSendError(""); try { const result=await post("/applications", { type: kind, programmeId: item.id, details: studentPayload(values) });if(typeof result?.id!=='string'||!result.id)throw new Error('Invalid enrollment receipt');setReceipt(result); } catch (error) { setSendError(userMessage(error,'We couldn’t confirm your enrollment. Your details are still here. Check your email for confirmation before trying again.')); } finally { setSending(false); } };
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

  return <section aria-labelledby="enrollment-title" className="bg-soft text-ink">
    <header className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-neutral-900 sm:min-h-[25rem] lg:min-h-[28rem]">
      <SafeImage fallback="hide" src={publicAsset(item.heroImage || item.image)} alt="" aria-hidden="true" fetchPriority="high" className="absolute inset-0 -z-20 size-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
      <HeroShade />
      <div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}><div>
        <p className="mb-4 text-base font-semibold text-[#E9AD5E]">{label} enrollment</p>
        <h1 id="enrollment-title" className="max-w-[24ch] [overflow-wrap:anywhere] font-garamond text-[clamp(2.3rem,8vw,2.8rem)] leading-[1.03] font-semibold tracking-[-0.025em] text-[#f6f8f3] sm:text-[clamp(2.8rem,5.5vw,5.5rem)]">{item.title}</h1>
        <p className="mt-5 max-w-[64ch] text-base leading-[1.75] text-white/90 sm:text-lg">{item.description}</p>
      </div></div>
    </header>
    <div className={`${frame} py-10 sm:py-14 lg:py-16`}>
      <ContentNotice content={content}/>
      <div className="rounded-2xl bg-surface p-5 shadow-[0_12px_40px_-24px_rgba(23,61,46,0.28)] ring-1 ring-ink/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
        <Link to="/catalogue" className={`mb-6 inline-flex min-h-11 items-center gap-3 rounded text-lg font-semibold sm:text-xl ${focus}`}><FiArrowLeft aria-hidden="true" className="size-5 shrink-0" /> Back to catalogue</Link>
        <div className="grid items-stretch gap-10 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-12">
          {reviewing ? <div className="flex min-w-0 flex-col">
            <h2 ref={reviewRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Review your enrollment</h2>
            <p className="mt-3 text-base leading-relaxed text-muted">Check your details, then submit your enrollment for club approval.</p>
            <dl className="mt-6 grid gap-x-6 sm:grid-cols-2 xl:flex-1 xl:auto-rows-[minmax(min-content,1fr)]">{fields.map(({ name, label: fieldLabel }) => <div key={name} className="min-w-0 border-t border-ink/15 py-4"><dt className="text-sm text-muted">{fieldLabel}</dt><dd className="mt-1 break-words font-medium">{values[name].trim()}</dd></div>)}</dl>
            <p className="mt-5 rounded-lg bg-soft p-4 text-sm leading-relaxed text-copy">Enrollment is pending club confirmation. Submitting this request does not collect any payment.</p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <button type="button" onClick={() => setReviewing(false)} className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded font-semibold ${focus}`}><FiArrowLeft aria-hidden="true" /> Edit details</button>
              <button type="button" disabled={sending || Boolean(receipt)} onClick={submitEnrollment} className={action}>{receipt ? "Enrollment submitted" : sending ? "Submitting..." : "Submit enrollment"}</button>
            </div>
            {receipt && <p role="status" className="mt-5 rounded-lg bg-soft p-4 text-sm leading-relaxed">Enrollment received. The club will review your request and email you with an update. Reference: {receipt.id}</p>}
            {sendError && <div className="mt-5"><Notice title="We couldn’t confirm your enrollment.">{sendError}</Notice></div>}
            <button type="button" onClick={download} className={`mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded text-sm font-semibold underline underline-offset-4 ${focus}`}><FiDownload aria-hidden="true" /> Download a copy</button>
          </div> : <form noValidate onSubmit={review} aria-labelledby="enrollment-form-title" className="flex min-w-0 flex-col">
            <div className="mb-8 border-t-2 border-[#E9AD5E] pt-6">
              <h2 id="enrollment-form-title" ref={headingRef} tabIndex={-1} className="font-garamond text-4xl font-semibold outline-none sm:text-5xl">Your enrollment details</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">Complete your details, then review your request. Fields marked <span className="text-danger">*</span> are required.</p>
            </div>
            {Object.keys(errors).length > 0 && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger-soft p-4 text-danger focus:outline-2 focus:outline-offset-2 focus:outline-danger">
              <p className="font-semibold">Please check your enrollment details.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{Object.entries(errors).map(([name, message]) => <li key={name}><a href={`#enrollment-${name}`} onClick={(event) => { event.preventDefault(); document.getElementById(`enrollment-${name}`)?.focus(); }} className="underline underline-offset-2">{message}</a></li>)}</ul>
            </div>}
            <fieldset className="flex min-w-0 flex-col xl:flex-1">
              <legend className="mb-5 font-garamond text-2xl font-semibold sm:text-3xl">Student information</legend>
              <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{studentFields.map((field) => <ApplicationField key={field.name} prefix="enrollment" variant="enrollment" field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
            </fieldset>
            <div className="mt-8 border-t border-ink/15 pt-7">
              <fieldset className="min-w-0">
                <legend className="mb-5 font-garamond text-2xl font-semibold sm:text-3xl">Contact information</legend>
                <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{contactFields.map((field) => <ApplicationField key={field.name} prefix="enrollment" variant="enrollment" className={contactFields.length === 1 ? "sm:col-span-2" : ""} field={field} value={values[field.name]} error={errors[field.name]} onChange={change} />)}</div>
              </fieldset>
            </div>
            <div className="mt-8 flex flex-col gap-5 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted">You’ll review your details before submitting your request to the club.</p>
              <button type="submit" className={`${action} w-full shrink-0 sm:w-auto`}>Review enrollment <FiArrowRight aria-hidden="true" /></button>
            </div>
          </form>}
          <aside aria-label="Selected programme" className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-soft ring-1 ring-ink/15 ring-inset">
            {!reviewing && <SafeImage src={publicAsset(item.image)} alt={item.imageAlt || `${item.title} poster`} className={`aspect-[16/10] w-full xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1 ${item.isPoster ? "object-contain" : "object-cover"}`} />}
            <div className="shrink-0 bg-brand px-6 py-4 text-white">
              <h3 className="font-garamond text-3xl leading-tight font-semibold">Programme details</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#E9AD5E] sm:text-base">{item.format}</p>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-6">
              <dl className="xl:grid xl:flex-1 xl:auto-rows-[minmax(min-content,1fr)]">{enrollmentFacts(enrollment).map(([fact, value]) => {
                const Icon = factIcons[fact];
                return <div key={fact} className="relative flex flex-col justify-center border-b border-ink/15 py-4 pl-15">
                  <dt className="text-sm leading-relaxed text-muted"><span aria-hidden="true" className="absolute top-1/2 left-0 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-raised text-ink"><Icon className="size-5" /></span>{fact}</dt><dd className="mt-1 text-lg leading-snug font-semibold sm:text-xl">{value}</dd>
                </div>;
              })}</dl>
              {!reviewing && item.takeaways?.length > 0 && <div className="mt-5">
                <h4 className="font-garamond text-2xl font-semibold">What to expect</h4>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-copy">{item.takeaways.slice(0, 2).map((point) => <li key={point} className="flex items-start gap-3"><FiCheck aria-hidden="true" className="mt-1 size-4 shrink-0" />{point}</li>)}</ul>
              </div>}
              <p className="mt-5 text-sm leading-relaxed text-copy">Enrollment is subject to club approval. Contact the club if you need help.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>;
}

export default function Enrollment() {
  const { kind, id } = useParams();
  const content = useContent();
  const published = content?.programmes.find(p => p.kind === kind && p.id === id);
  const enrollment = content ? (published ? { kind, item:published, label:({events:"Event",webinars:"Webinar",courses:"Course"})[kind] } : null) : getEnrollment(kind, id);
  if (content?.loading) return <StatePage kind="loading" title="Loading programme details…" description="We’re getting the information for your enrollment."/>;
  if (content?.error && (!content?.hasData || !enrollment)) return <StatePage kind="error" title="We couldn’t load this programme." description="Please try again before completing your enrollment." actions={[{label:'Try again',onClick:content.retry,busy:content.refreshing}, {label:'Browse the catalogue',to:'/catalogue',secondary:true}]}/>;
  if (!enrollment) return <StatePage kind="missing" title="Programme not found" description="This programme may have been removed or the link may have changed. Choose another programme from the catalogue." actions={[{label:'Browse the catalogue',to:'/catalogue'}]}/>;
  if (enrollment.item.registrationOpen === false) return <StatePage kind="locked" title="Enrollment is currently closed." description="This programme isn’t accepting new enrollments. Explore the catalogue to find another event, webinar or course." actions={[{label:'Browse the catalogue',to:'/catalogue'}, {label:'Contact the club',href:'mailto:info@arpc.club',secondary:true}]}/>;
  return <EnrollmentForm key={`${kind}:${id}`} enrollment={enrollment} />;
}
