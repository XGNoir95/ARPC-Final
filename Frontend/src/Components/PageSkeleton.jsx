import { skeletonFrame } from "./PageSkeleton.styles";
import { Block, TextLines } from "./SkeletonParts";
import { catalogue } from "../data/catalogue";
import { teams } from "../data/teams";
import { enrollmentFields, enrollmentFromPath } from "../utils/enrollment";
import { studentFields as membershipFields } from "../utils/studentDetails";
import { galleryPhotos, journalOffset, journalPosition } from "../data/gallery";
import { publicPageFrame as frame } from "./PublicLayout.styles";
import { adminLayout, adminPreviewCardGrid } from "./AdminUI.styles";

function HomeHeroSkeleton() {
  return <div data-skeleton-section="hero" className="flex min-h-[100svh] bg-soft lg:min-h-[min(60rem,100svh)]">
    <div className={`${frame} flex flex-col justify-center pt-36 pb-28 sm:pt-40 sm:pb-36 lg:pt-48 lg:pb-48`}>
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_5rem] lg:gap-x-16">
        <div className="flex min-w-0 flex-col items-center gap-8 lg:items-start">
          <Block className="h-3 w-64 max-w-full lg:h-4 lg:w-80" />
          <div className="flex w-full max-w-3xl flex-col items-center gap-4 lg:max-w-[59.375rem] lg:items-start">
            <Block className="h-[clamp(2.3rem,6.4vw,5rem)] w-[86%]" />
            <Block className="h-[clamp(2.3rem,6.4vw,5rem)] w-full" />
          </div>
          <Block className="h-7 w-[65%] max-w-md sm:h-9" />
          <TextLines className="w-full max-w-[30rem]" />
          <Block className="h-14 w-52 rounded-full" />
        </div>
        <div className="flex flex-col items-center gap-6 lg:self-start">
          <Block className="h-3 w-28" />
          <div className="flex gap-3 lg:mt-12 lg:w-full lg:flex-col lg:items-end">
            {[0, 1, 2].map((key) => <Block key={key} className="h-11 w-14 lg:h-12" />)}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function HeroSkeleton({ gallery = false }) {
  return <div data-skeleton-section="hero" className="flex min-h-[28rem] items-end bg-soft sm:min-h-[25rem] lg:min-h-[28rem]">
    <div className={`${frame} flex flex-col gap-7 pt-32 pb-10 lg:pt-40 lg:pb-12`}>
      <div className="flex max-w-2xl flex-col gap-4">
        <Block className={gallery ? "h-[clamp(2.4rem,5vw,4.5rem)] w-[40%] max-w-64" : "h-[clamp(2.4rem,5vw,4.5rem)] w-[70%]"} />
        <Block className={gallery ? "h-[clamp(2.4rem,5vw,4.5rem)] w-[50%] max-w-72" : "h-[clamp(2.4rem,5vw,4.5rem)] w-[90%]"} />
      </div>
      <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <TextLines className="w-full max-w-[38rem]" />
        <Block className={gallery ? "size-14 shrink-0 self-end rounded-full sm:size-16" : "h-14 w-52 shrink-0 self-end rounded-full"} />
      </div>
    </div>
  </div>;
}

function TeamRows() {
  return <div data-skeleton-section="teams" className={`${frame} pt-10 pb-14 lg:pt-14`}>
    {teams.map(({ id }) => <div key={id} data-skeleton-team={id} className="grid min-h-96 grid-cols-[3.5rem_minmax(0,1fr)] content-center gap-x-4 border-b border-ink/10 px-5 py-8 sm:min-h-[19.75rem] sm:grid-cols-[30%_minmax(0,1fr)] sm:items-center sm:gap-12 lg:grid-cols-[40%_minmax(0,1fr)] lg:min-h-[20.75rem]">
      <Block className="h-16 w-12 sm:h-44 sm:w-36" />
      <div className="min-w-0 space-y-7">
        <div className="flex items-center justify-between gap-8">
          <Block className="h-8 w-[70%]" />
          <Block className="size-11 shrink-0 rounded-full" />
        </div>
        <TextLines /><TextLines />
      </div>
    </div>)}
  </div>;
}

function CatalogueCards() {
  return <div className={frame}>
    <div className="flex flex-wrap items-center justify-between gap-6 border-b border-ink/10 py-6">
      <div className="flex gap-5 sm:gap-8">{[0, 1, 2].map((key) => <Block key={key} className="h-6 w-16 sm:w-24" />)}</div>
      <Block className="h-12 w-full rounded-full lg:w-80" />
    </div>
    <div data-skeleton-section="events" className="py-12 sm:py-16 lg:py-20">
    <SectionHeading />
    <div className="overflow-hidden rounded-2xl bg-soft px-4 py-10 sm:px-6">
      <div className="flex h-[23rem] min-w-max items-end justify-center gap-[3px] border-b border-[#E9AD5E]/80 sm:h-[clamp(24rem,40vw,34rem)]">
        {["h-[92%]", "h-full", "h-[94%]", "h-[97%]"].map((height) => <Block key={height} className={`${height} w-[clamp(5.3rem,15vw,13rem)] rounded-sm`} />)}
      </div>
    </div>
    <Block className="mx-auto mt-6 h-5 w-64 max-w-full" />
    </div>
    <WebinarSkeleton />
    <CourseSkeleton />
  </div>;
}

function SectionHeading() {
  return <div className="mb-8 flex flex-wrap items-center justify-between gap-6 sm:mb-10"><Block className="h-10 w-44 sm:h-12" /><Block className="h-11 w-60 max-w-full rounded-full" /></div>;
}

function GallerySkeleton() {
  return <div data-skeleton-section="gallery" className={`${frame} pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pb-20`}>
    <div className="mb-5 flex flex-col gap-2 sm:mb-6 md:flex-row md:items-end md:justify-between md:gap-8"><Block className="h-9 w-60 max-w-full sm:h-11 sm:w-72" /><Block className="h-5 w-60 max-w-full" /></div>
    <div className="relative isolate h-[clamp(18rem,82vw,34rem)] overflow-hidden rounded-[1.5rem] bg-soft sm:h-[clamp(24rem,56vw,46rem)] sm:rounded-[2rem]">
      {galleryPhotos.map(({ id }, index) => {
        const offset = journalOffset(index, 0, galleryPhotos.length);
        return <div key={id} data-skeleton-photo={id} style={{ "--page-position": journalPosition(offset), "--page-depth": Math.abs(offset) }} className="absolute top-1/2 left-1/2 w-[78%] max-w-[46rem] -translate-x-1/2 -translate-y-1/2 [z-index:calc(20_-_var(--page-depth))] sm:w-[64%]"><Block className="aspect-[5/4] w-full translate-x-[calc(var(--page-position)_*_1%)] translate-y-[calc(var(--page-depth)_*_3px)] rounded-2xl border-2 border-white [scale:calc(1_-_var(--page-depth)_*_0.045)]" /></div>;
      })}
    </div>
    <div className="relative -mt-3 flex justify-center sm:-mt-4"><div className="flex items-center gap-2 rounded-full border border-ink/10 bg-surface p-2"><Block className="size-11 rounded-full" /><Block className="h-4 w-16" /><Block className="size-11 rounded-full" /><Block className="size-11 rounded-full" /></div></div>
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 pt-5 sm:pt-6"><Block className="h-7 w-[80%] max-w-sm sm:h-8" /><Block className="h-4 w-44" /></div>
  </div>;
}

function WebinarSkeleton() {
  return <div data-skeleton-section="webinars" className="py-12 sm:py-16 lg:py-20">
    <SectionHeading />
    <div className="overflow-hidden rounded-3xl border-4 border-ink bg-soft p-5 sm:p-8">
      <div className="relative mx-auto flex h-[33rem] w-full max-w-6xl flex-col justify-center sm:h-[41rem]">
        <div className="absolute inset-x-6 top-8 h-64 rounded-2xl bg-raised" /><div className="absolute inset-x-4 top-20 h-64 rounded-2xl bg-raised" /><div className="absolute inset-x-2 top-32 h-64 rounded-2xl bg-raised" />
        <div className="relative mt-24 grid gap-5 rounded-2xl bg-raised p-5 sm:grid-cols-2 sm:p-8"><Block className="h-44 rounded-lg sm:h-64" /><div className="flex flex-col gap-5"><Block className="h-10 w-full" /><TextLines /><Block className="mt-auto h-5 w-32" /></div></div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-5 rounded-xl bg-surface p-4"><Block className="h-4 w-[50%]" /><div className="flex gap-2"><Block className="size-11 rounded-full" /><Block className="size-11 rounded-full" /></div></div>
    </div>
  </div>;
}

function CourseSkeleton() {
  return <div data-skeleton-section="courses" className="py-12 sm:py-16 lg:py-20">
    <SectionHeading />
    <div className="rounded-3xl bg-soft px-3 py-8 sm:p-8">
      <div className="overflow-hidden rounded-t-2xl border-[10px] border-ink bg-surface">
        <div className="flex min-h-16 items-center justify-between gap-5 border-b border-ink/10 px-5"><div className="flex gap-2">{[0, 1, 2].map((key) => <Block key={key} className="size-3 rounded-full" />)}</div><Block className="h-5 w-32" /><Block className="h-8 w-16 rounded" /></div>
        <div className="flex min-h-112 flex-col justify-center gap-8 p-4 sm:min-h-[clamp(27rem,36vw,34rem)] sm:p-8">
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">{catalogue.courses.map(({ id }) => <div key={id} className="flex flex-col items-center gap-4"><Block className="h-24 w-full max-w-44 rounded-[1rem_1.5rem_1rem_1rem] sm:h-32" /><Block className="h-5 w-[85%]" /><Block className="h-3 w-[60%]" /></div>)}</div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-5 rounded-xl bg-soft p-4"><Block className="h-6 w-24" /><Block className="h-12 w-44 rounded-full" /></div>
        </div>
      </div>
      <Block className="h-5 rounded-b-[50%]" />
    </div>
  </div>;
}

function HomeSections() {
  return <>
    <div data-skeleton-section="about" className={`${frame} @container py-12 md:py-16`}>
      <Block className="mb-8 h-10 w-40" />
      <div className="grid gap-4 @min-[65rem]:grid-cols-3">{[0, 1, 2].map((key) => <div key={key} className="flex min-h-48 flex-col justify-between gap-8 rounded-2xl bg-soft p-8 @min-[65rem]:h-[40rem]"><div className="flex items-center justify-between gap-5"><Block className="h-8 w-[65%]" /><Block className="size-11 shrink-0 rounded-full" /></div><TextLines /></div>)}</div>
    </div>
    <div data-skeleton-section="featured-events" className={`${frame} @container py-12 md:py-16`}>
      <Block className="mb-8 h-10 w-60" />
      <div className="grid gap-6 rounded-2xl bg-soft p-3 sm:p-4 @min-[64rem]:grid-cols-2"><Block className="aspect-square rounded-lg" /><div className="flex flex-col gap-6 p-3 sm:p-8"><Block className="h-10 w-[85%]" /><Block className="h-4 w-[65%]" /><TextLines /><div className="grid gap-4 border-y border-ink/10 py-5 sm:grid-cols-3">{[0, 1, 2].map((key) => <div key={key} className="space-y-3"><Block className="h-4 w-16" /><Block className="h-6 w-full" /></div>)}</div><TextLines /><Block className="mt-auto h-15 w-full rounded-full" /></div></div>
      <Block className="mx-auto mt-6 h-13 w-64 rounded-full" />
    </div>
    <div data-skeleton-section="affiliations" className={`${frame} grid items-center gap-8 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]`}>
      <div className="space-y-6"><Block className="h-10 w-56" /><Block className="h-36 rounded-lg" /><TextLines /><TextLines /><Block className="h-14 rounded-full" /></div>
      <div className="rounded-3xl border-4 border-ink bg-soft p-6"><div className="grid h-[clamp(18rem,40vw,38rem)] grid-cols-[1.4fr_1fr] items-center gap-6"><div className="space-y-6">{[0, 1, 2].map((key) => <Block key={key} className="mx-auto size-20 rounded-full sm:size-28" />)}</div><div className="space-y-8">{[0, 1, 2, 3].map((key) => <Block key={key} className="h-7 w-full" />)}</div></div><Block className="mx-auto mt-6 h-13 w-48 rounded-full" /></div>
    </div>
  </>;
}

function EnrollmentSkeleton({ enrollment }) {
  const fields = enrollmentFields(enrollment.kind);
  const studentFields = fields.filter(({ name }) => name !== "email" && name !== "phone");
  const contactFields = fields.filter(({ name }) => name === "email" || name === "phone");
  return <div className="bg-soft">
    <div data-skeleton-section="hero" className="flex min-h-[28rem] items-end bg-soft sm:min-h-[25rem] lg:min-h-[28rem]"><div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}><div><Block className="mb-4 h-6 w-40" /><div className="flex max-w-4xl flex-col gap-4"><Block className="h-[clamp(2.8rem,5.5vw,5.5rem)] w-[90%]" /><Block className="h-[clamp(2.8rem,5.5vw,5.5rem)] w-[70%]" /></div><TextLines className="mt-5 max-w-[64ch]" /></div></div></div>
    <div data-skeleton-section="enrollment-form" className={`${frame} py-10 sm:py-14 lg:py-16`}><div className="rounded-2xl bg-surface p-5 ring-1 ring-ink/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
      <Block className="mb-6 h-11 w-52" />
      <div className="grid items-stretch gap-10 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-12">
        <div className="flex min-w-0 flex-col">
          <div className="mb-8 space-y-4 border-t-2 border-ink/15 pt-6"><Block className="h-10 w-[85%]" /><Block className="h-4 w-full" /></div>
          <div className="flex flex-col xl:flex-1"><Block className="mb-5 h-8 w-52" />
          <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{studentFields.map(({ name }) => <div key={name} data-skeleton-field={name} className={`space-y-2 ${name === "fullName" ? "sm:col-span-2" : ""}`}><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          <div className="mt-8 border-t border-ink/15 pt-7"><Block className="mb-5 h-8 w-52" /><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{contactFields.map(({ name }) => <div key={name} data-skeleton-field={name} className={`space-y-2 ${contactFields.length === 1 ? "sm:col-span-2" : ""}`}><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          <div className="mt-8 flex flex-col gap-5 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between"><Block className="h-4 w-full sm:w-[45%]" /><Block className="h-13 w-full shrink-0 rounded-full sm:w-60" /></div>
        </div>
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-soft">
          <Block className="aspect-[16/10] xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1" /><div className="shrink-0 space-y-3 bg-raised px-6 py-4"><Block className="h-8 w-[85%]" /><Block className="h-4 w-[65%]" /></div>
          <div className="flex flex-1 flex-col px-6 pb-6"><div className="xl:grid xl:flex-1 xl:auto-rows-[minmax(min-content,1fr)]">{Array.from({ length: enrollment.kind === "courses" ? 4 : 3 }, (_, key) => <div key={key} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4 border-b border-ink/10 py-4"><Block className="row-span-2 size-11 rounded-full" /><Block className="h-4 w-16" /><Block className="mt-2 h-6 w-[85%]" /></div>)}</div>{enrollment.item.takeaways?.length > 0 && <div className="mt-5 space-y-4"><Block className="h-7 w-40" /><Block className="h-4 w-[90%]" /><Block className="h-4 w-[80%]" /></div>}<TextLines className="mt-5" /></div>
        </div>
      </div>
    </div></div>
  </div>;
}

function ProgrammeAdminSkeleton({ courses = false }) {
  return <div className="space-y-8">{(courses ? ['courses'] : ['events','webinars']).map(kind => <div key={kind} data-skeleton-programme-section={kind} className="overflow-hidden rounded-2xl border border-ink/12 bg-surface">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/12 p-5"><Block className="h-9 w-40"/><Block className="h-11 w-32 rounded-full"/></div>
    <div className="space-y-6 p-5"><div className="flex items-center justify-between gap-4"><Block className="h-6 w-40"/><Block className="h-11 w-48 rounded-full"/></div><Block className="aspect-[16/9] w-full rounded-xl"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{catalogue[kind].map(item => <div key={item.id} data-skeleton-programme={item.id} className="overflow-hidden rounded-xl border border-ink/12"><Block className="aspect-[16/8] rounded-none"/><div className="space-y-4 p-4"><Block className="h-7 w-[85%]"/><TextLines/><Block className="h-11 w-full rounded-full"/></div></div>)}</div></div>
  </div>)}</div>;
}

function VisualLibrarySkeleton({ resource }) {
  const gallery = resource === 'gallery';
  const cards = gallery ? galleryPhotos : teams;
  return <div data-skeleton-library={resource} className="@container/preview overflow-hidden rounded-2xl border border-ink/12 bg-surface">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/12 p-5"><Block className="h-9 w-44"/><Block className="h-11 w-32 rounded-full"/></div>
    <div className="space-y-6 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><Block className="h-6 w-40"/><Block className="h-11 w-48 rounded-full"/></div><Block className="aspect-[16/9] w-full rounded-xl"/><div className="space-y-3 border-t border-ink/12 pt-6"><Block className="h-6 w-40"/><Block className="h-24 rounded-xl"/></div><div className={adminPreviewCardGrid}>{cards.map(item => <div key={item.id} className="overflow-hidden rounded-xl border border-ink/12">{gallery ? <Block className="aspect-[16/10] rounded-none"/> : <div className="flex justify-between p-4"><Block className="h-6 w-24"/><Block className="size-11 rounded-full"/></div>}<div className="space-y-4 p-4"><Block className="h-8 w-[85%]"/><TextLines/>{!gallery && <div className="space-y-3 border-t border-ink/12 pt-4">{[0,1,2].map(index => <div key={index} className="flex items-center gap-3"><Block className="size-10 shrink-0 rounded-full"/><div className="w-full space-y-2"><Block className="h-4 w-[80%]"/><Block className="h-3 w-[60%]"/></div></div>)}</div>}<Block className="h-11 w-full rounded-full"/></div></div>)}</div></div>
  </div>;
}

function AdminSkeleton({ pathname }) {
  const view = pathname.split("/")[2] || "overview";
  const programmes = Object.entries(catalogue).flatMap(([kind,items])=>items.map(item=>({...item,kind})));
  const library=["programmes","gallery","teams","sponsors","home"].includes(view);
  const cards=view==="programmes"?programmes:view==="gallery"?galleryPhotos:Array.from({length:view==="home"?4:6},(_,id)=>({id}));
  return <div data-skeleton-section="admin" className={adminLayout.shell}>
    <div className={adminLayout.sidebar}><div className="flex items-center gap-3 sm:gap-4"><Block className="size-14 shrink-0 rounded-full sm:size-16"/><div className="space-y-2"><Block className="h-9 w-24 sm:h-10"/><Block className="h-5 w-32"/></div></div><div className="mt-7 hidden space-y-5 lg:block">{[3,6,2].map((count,index)=><div key={index}><Block className="mb-3 h-3 w-20"/><div className="space-y-2">{Array.from({length:count},(_,key)=><Block key={key} className="h-11 rounded-xl"/>)}</div></div>)}</div><Block className="mt-auto hidden h-16 rounded-lg lg:block"/></div>
    <div className="min-w-0"><div className="flex items-center justify-between gap-4 border-b border-ink/10 bg-surface px-4 py-3 sm:px-7 xl:px-10"><Block className="h-4 w-36"/><div className="flex gap-2"><Block className="size-11 rounded-full sm:w-32"/><Block className="size-11 rounded-full"/></div></div><div className="p-4 sm:p-7 xl:p-10"><Block className="h-11 w-[85%] max-w-md sm:h-14"/><TextLines className="mt-4 mb-7 max-w-xl"/>
      {view==="overview"?<><div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]"><Block className="h-72 rounded-3xl"/><Block className="h-72 rounded-2xl"/></div><div className="my-6 grid grid-cols-2 gap-3 xl:grid-cols-4">{[0,1,2,3].map(k=><Block key={k} className="h-28 rounded-2xl"/>)}</div><div className="grid gap-5 2xl:grid-cols-[1.6fr_1fr]"><Block className="h-96 rounded-2xl"/><Block className="h-96 rounded-2xl"/></div><div className="mt-5 grid gap-5 xl:grid-cols-2"><Block className="h-72 rounded-2xl"/><Block className="h-72 rounded-2xl"/></div></>:["programmes","courses","learning"].includes(view)?<ProgrammeAdminSkeleton courses={view!=="programmes"}/>:["gallery","teams"].includes(view)?<VisualLibrarySkeleton resource={view}/>:library?<><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Block className="h-12 w-full max-w-sm rounded-xl"/><Block className="h-11 w-32 rounded-full"/></div><Block className="mb-6 h-12 w-[80%] max-w-lg rounded-xl"/><div className={`grid gap-5 sm:grid-cols-2 ${view==='home'||view==='teams'?'':'2xl:grid-cols-3'}`}>{cards.map(item=><div key={`${item.kind || view}-${item.id}`} data-skeleton-programme={view==='programmes'?item.id:undefined} className="overflow-hidden rounded-2xl border border-ink/12 bg-surface">{view==='teams'?<div className="p-5"><Block className="size-12 rounded-2xl"/><Block className="mt-5 h-8 w-[80%]"/><TextLines className="mt-4"/><Block className="mt-5 h-11 w-44 rounded-full"/></div>:<><Block className="aspect-[16/10] rounded-none"/><div className="space-y-4 p-5"><Block className="h-3 w-24"/><Block className="h-8 w-[80%]"/><Block className="h-4 w-[65%]"/><div className="flex flex-wrap gap-2 border-t border-ink/10 pt-4"><Block className="h-11 w-24 rounded-full"/><Block className="h-11 w-28 rounded-full"/></div></div></>}</div>)}</div></>:view==='members'||view==='enrollments'||view==='learning'?<><Block className="mb-6 h-14 max-w-xl rounded-xl"/><div className="grid gap-5 xl:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.5fr)]"><div className="space-y-5 rounded-2xl border border-ink/12 bg-surface p-5"><Block className="h-12 rounded-xl"/>{[0,1,2,3].map(k=><div key={k} className="flex gap-3 border-t border-ink/10 pt-4"><Block className="size-11 shrink-0 rounded-full"/><div className="w-full space-y-3"><Block className="h-5 w-[85%]"/><Block className="h-4 w-[70%]"/></div></div>)}</div><div className="space-y-7 rounded-2xl border border-ink/12 bg-surface p-5 sm:p-7"><Block className="h-14 w-[80%]"/><div className="grid gap-5 sm:grid-cols-2">{[0,1,2,3,4,5].map(k=><div key={k} className="space-y-3"><Block className="h-3 w-24"/><Block className="h-12 rounded-xl"/></div>)}</div><Block className="h-28 rounded-xl"/><Block className="h-11 w-40 rounded-full"/></div></div></>:<div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><div className="space-y-6 rounded-2xl border border-ink/12 bg-surface p-6"><Block className="size-16 rounded-full"/><Block className="h-9 w-[80%]"/><Block className="h-12 rounded-xl"/><Block className="h-12 rounded-xl"/><Block className="h-11 w-40 rounded-full"/></div><div className="space-y-5 rounded-2xl border border-ink/12 bg-surface p-6"><Block className="h-9 w-[75%]"/><TextLines/><Block className="h-12 rounded-full"/><Block className="h-12 rounded-full"/></div></div>}
    </div></div>
  </div>;
}

function AccountSkeleton({ register = false }) {
  return <div className="relative min-h-svh bg-surface">
    <div className="flex min-h-svh w-full flex-col">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-6 py-5 sm:px-10 sm:py-6 lg:px-12 xl:px-16"><div className="flex min-w-0 items-center gap-3 sm:gap-4"><Block className="size-12 shrink-0 rounded-full sm:size-16" /><div className="min-w-0 space-y-2"><Block className="h-7 w-24 max-w-full sm:h-9" /><Block className="h-4 w-36 max-w-full sm:w-52" /></div></div><Block className="size-11 shrink-0 rounded-full sm:w-36" /></div>
      <div className={`grid min-h-svh flex-1 ${register ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]" : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"}`}>
        <div className="flex min-w-0 items-center px-6 pt-32 pb-10 sm:px-10 sm:pt-36 sm:pb-12 lg:px-12 lg:pt-32 xl:px-16"><div className={`mx-auto w-full rounded-2xl border border-ink/20 bg-surface p-5 sm:p-8 xl:p-10 ${register ? "max-w-[48rem]" : "max-w-[34rem]"}`}>
          <Block className="mb-3 h-5 w-32" /><Block className="h-11 w-[90%] sm:h-13" /><TextLines className="mt-4" />
          <div className="mt-8">{register && <Block className="mb-5 h-7 w-40" />}<div className={`grid gap-5 ${register ? "sm:grid-cols-2" : ""}`}>{Array.from({ length: register ? 6 : 2 }, (_, key) => <div key={key} className="space-y-2"><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          {register && <div className="mt-7 border-t border-ink/15 pt-5"><Block className="mb-5 h-7 w-44" /><div className="grid gap-5 sm:grid-cols-2">{[0, 1].map((key) => <div key={key} className="space-y-2"><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>}
          <Block className="mt-7 h-14 rounded-full" /><Block className="mt-6 h-11 w-[80%] max-w-sm" /><Block className="mt-3 h-4 w-[75%] max-w-xs" />
        </div></div>
        <div className="relative hidden min-w-0 flex-col justify-end bg-raised px-8 pt-32 pb-10 lg:flex xl:px-12 xl:pb-12"><Block className="absolute inset-0 rounded-none" /><div className="relative space-y-4"><Block className="h-5 w-36" /><Block className="h-22 w-[90%]" /><TextLines /><Block className="mt-6 h-1 w-14 rounded-full" /></div></div>
      </div>
    </div>
  </div>;
}

function ProfileSkeleton() {
  return <div className={`${frame} py-12`}>
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-soft py-8">
      <Block className="size-44 rounded-full sm:size-[230px]" />
      <Block className="h-9 w-52" />
      <Block className="h-5 w-60 max-w-full" />
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((key) => <Block key={key} className="h-14 rounded-lg" />)}</div>
    <Block className="mt-4 h-13 rounded-lg" />
    <div data-skeleton-section="profile-information" className="mt-10 rounded-xl border border-ink/10 p-6 sm:p-8"><div className="mb-7 flex flex-wrap items-center justify-between gap-5"><Block className="h-9 w-60" /><Block className="h-12 w-36 rounded-full" /></div><div className="space-y-4">{Array.from({ length: 6 }, (_, key) => <div key={key} className="flex items-center gap-8 border-b border-ink/10 py-4"><Block className="h-5 w-24 shrink-0" /><Block className="h-5 w-[55%]" /></div>)}</div></div>
  </div>;
}

function JoinSkeleton() {
  return <div className="bg-soft">
    <div className="flex min-h-[28rem] items-end bg-soft sm:min-h-[25rem] lg:min-h-[28rem]">
      <div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}>
        <div>
          <div className="flex max-w-4xl flex-col gap-4"><Block className="h-[clamp(3rem,6.5vw,6.5rem)] w-[45%]" /><Block className="h-[clamp(3rem,6.5vw,6.5rem)] w-[85%]" /></div>
          <TextLines className="mt-6 max-w-xl" />
        </div>
      </div>
    </div>
    <div className={`${frame} py-10 sm:py-14 lg:py-16`}>
      <div className="w-full rounded-2xl bg-surface p-5 shadow-[0_12px_40px_-24px_rgba(23,61,46,0.28)] ring-1 ring-ink/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
        <div className="grid items-stretch gap-y-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-x-12">
          <div className="flex min-w-0 flex-col">
            <div className="mb-8 space-y-4 border-t-2 border-ink/15 pt-6"><Block className="h-10 w-[85%] sm:h-12" /><Block className="h-4 w-full" /></div>
            <div className="flex flex-col xl:flex-1"><Block className="mb-5 h-8 w-52" /><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{membershipFields.filter(({ name }) => name !== "email" && name !== "phone").map(({ name }) => <div key={name} data-skeleton-field={name} className={`space-y-2 ${name === "fullName" ? "sm:col-span-2" : ""}`}><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
            <div className="mt-8 border-t border-ink/15 pt-7"><Block className="mb-5 h-8 w-52" /><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{membershipFields.filter(({ name }) => name === "email" || name === "phone").map(({ name }) => <div key={name} data-skeleton-field={name} className="space-y-2"><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-soft @container/payment xl:row-span-2"><Block className="aspect-[16/10] xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1" /><Block className="h-26 shrink-0" /><div className="flex min-h-[24rem] shrink-0 flex-col p-6 @max-[25rem]/payment:min-h-[27rem] @max-[18rem]/payment:min-h-[29rem]"><Block className="mb-3 h-6 w-36" /><div className="grid grid-cols-2 gap-2">{Array.from({ length: 5 }, (_, index) => <Block key={index} className={`h-14 rounded-lg ${index === 4 ? "col-span-2" : ""}`} />)}</div><TextLines className="mt-auto pt-4" /></div></div>
          <div className="min-w-0 border-t border-ink/15 pt-6"><Block className="h-5 w-[85%] max-w-xl" /><div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Block className="h-4 w-full max-w-md" /><Block className="h-13 w-full shrink-0 rounded-full sm:w-60" /></div></div>
        </div>
      </div>
    </div>
  </div>;
}

function RecoverySkeleton() {
  return <div data-skeleton-section="account-recovery" className="flex min-h-svh items-center justify-center bg-soft p-5"><div className="w-full max-w-lg space-y-6 rounded-2xl border border-ink/15 bg-surface p-8"><Block className="h-12 w-[85%]"/><TextLines/><Block className="h-12 rounded-lg"/><Block className="h-12 rounded-full"/><Block className="h-5 w-40"/></div></div>;
}
function LearningSkeleton() {
  return <div data-skeleton-section="learning" className="min-h-svh bg-soft p-5 sm:p-10"><div className="mx-auto max-w-7xl"><div className="flex justify-between border-b border-ink/15 pb-5"><Block className="h-10 w-52"/><Block className="h-11 w-24 rounded-full"/></div><Block className="mt-9 h-12 w-[80%] max-w-xl"/><TextLines className="mt-4 max-w-lg"/><div className="mt-8 flex gap-3"><Block className="h-12 w-48 rounded-full"/><Block className="h-12 w-48 rounded-full"/></div><div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]"><div className="space-y-5 rounded-2xl bg-surface p-5"><Block className="h-8 w-40"/><Block className="h-2"/>{[0,1,2,3].map(k=><Block key={k} className="h-12 rounded-lg"/>)}</div><div className="space-y-7 rounded-2xl bg-surface p-6 sm:p-10"><Block className="h-12 w-[80%]"/>{[0,1,2,3].map(k=><TextLines key={k}/>)}<Block className="h-12 w-48 rounded-full"/></div></div></div></div>;
}

export default function PageSkeleton({ pathname }) {
  const auth = pathname === "/login" || pathname === "/register";
  const enrollment = enrollmentFromPath(pathname);
  return <div data-page-skeleton={pathname} className={`${skeletonFrame} min-h-full bg-surface`} aria-hidden="true">
    {pathname === "/learn" ? <LearningSkeleton/> : ["/forgot-password","/reset-password","/verify-email"].includes(pathname) ? <RecoverySkeleton/> : pathname === "/admin" || pathname.startsWith("/admin/") ? <AdminSkeleton pathname={pathname} /> : enrollment ? <EnrollmentSkeleton enrollment={enrollment} /> : pathname.startsWith("/enroll/") ? <div className={`${frame} space-y-6 py-20`}><Block className="h-12 w-[75%] max-w-lg" /><TextLines className="max-w-xl" /><Block className="h-13 w-52 rounded-full" /></div> : pathname === "/join" ? <JoinSkeleton /> : auth ? <AccountSkeleton register={pathname === "/register"} /> : pathname === "/profile" ? <ProfileSkeleton /> : <>
      {pathname === "/" ? <HomeHeroSkeleton /> : <HeroSkeleton gallery={pathname === "/gallery"} />}
      {pathname === "/" ? <HomeSections /> : pathname === "/team" ? <TeamRows /> : pathname === "/catalogue" ? <CatalogueCards /> : pathname === "/gallery" ? <GallerySkeleton /> : <div className={`${frame} py-12`}><Block className="h-10 w-52" /><TextLines className="mt-8 max-w-2xl" /></div>}
    </>}
  </div>;
}
