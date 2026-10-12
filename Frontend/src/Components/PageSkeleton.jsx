import { skeletonFrame } from "./PageSkeleton.styles";
import { Block, TextLines } from "./SkeletonParts";
import { catalogue } from "../data/catalogue";
import { teams } from "../data/teams";
import { enrollmentFields, enrollmentFromPath } from "../utils/enrollment";
import { studentFields as membershipFields } from "../utils/studentDetails";

const frame = "mx-auto w-full max-w-[112rem] px-6 lg:w-[calc(100%_-_10rem)] 2xl:px-24";

function HomeHeroSkeleton() {
  return <div data-skeleton-section="hero" className="flex min-h-[100svh] bg-[#eef4ef] lg:min-h-[min(60rem,100svh)]">
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

function HeroSkeleton() {
  return <div data-skeleton-section="hero" className="flex min-h-[28rem] items-end bg-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]">
    <div className={`${frame} flex flex-col gap-7 pt-32 pb-10 lg:pt-40 lg:pb-12`}>
      <div className="flex max-w-2xl flex-col gap-4">
        <Block className="h-[clamp(2.4rem,5vw,4.5rem)] w-[70%]" />
        <Block className="h-[clamp(2.4rem,5vw,4.5rem)] w-[90%]" />
      </div>
      <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <TextLines className="w-full max-w-[38rem]" />
        <Block className="h-14 w-52 shrink-0 self-end rounded-full" />
      </div>
    </div>
  </div>;
}

function TeamRows() {
  return <div data-skeleton-section="teams" className={`${frame} pt-10 pb-14 lg:pt-14`}>
    {teams.map(({ id }) => <div key={id} data-skeleton-team={id} className="grid min-h-96 grid-cols-[3.5rem_minmax(0,1fr)] content-center gap-x-4 border-b border-[#173d2e]/10 px-5 py-8 sm:min-h-[19.75rem] sm:grid-cols-[30%_minmax(0,1fr)] sm:items-center sm:gap-12 lg:grid-cols-[40%_minmax(0,1fr)] lg:min-h-[20.75rem]">
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
    <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[#173d2e]/10 py-6">
      <div className="flex gap-5 sm:gap-8">{[0, 1, 2].map((key) => <Block key={key} className="h-6 w-16 sm:w-24" />)}</div>
      <Block className="h-12 w-full rounded-full lg:w-80" />
    </div>
    <div data-skeleton-section="events" className="py-12 sm:py-16 lg:py-20">
    <SectionHeading />
    <div className="overflow-hidden rounded-2xl bg-[#eef4ef] px-4 py-10 sm:px-6">
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

function WebinarSkeleton() {
  return <div data-skeleton-section="webinars" className="py-12 sm:py-16 lg:py-20">
    <SectionHeading />
    <div className="overflow-hidden rounded-3xl border-4 border-[#b9cfc0] bg-[#eef4ef] p-5 sm:p-8">
      <div className="relative mx-auto flex h-[33rem] w-full max-w-6xl flex-col justify-center sm:h-[41rem]">
        <div className="absolute inset-x-6 top-8 h-64 rounded-2xl bg-[#dbe6de]" /><div className="absolute inset-x-4 top-20 h-64 rounded-2xl bg-[#c9dacf]" /><div className="absolute inset-x-2 top-32 h-64 rounded-2xl bg-[#dbe6de]" />
        <div className="relative mt-24 grid gap-5 rounded-2xl bg-[#c4d6ca] p-5 sm:grid-cols-2 sm:p-8"><Block className="h-44 rounded-lg sm:h-64" /><div className="flex flex-col gap-5"><Block className="h-10 w-full" /><TextLines /><Block className="mt-auto h-5 w-32" /></div></div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-5 rounded-xl bg-white p-4"><Block className="h-4 w-[50%]" /><div className="flex gap-2"><Block className="size-11 rounded-full" /><Block className="size-11 rounded-full" /></div></div>
    </div>
  </div>;
}

function CourseSkeleton() {
  return <div data-skeleton-section="courses" className="py-12 sm:py-16 lg:py-20">
    <SectionHeading />
    <div className="rounded-3xl bg-[#eef4ef] px-3 py-8 sm:p-8">
      <div className="overflow-hidden rounded-t-2xl border-[10px] border-[#b6cabe] bg-white">
        <div className="flex min-h-16 items-center justify-between gap-5 border-b border-[#173d2e]/10 px-5"><div className="flex gap-2">{[0, 1, 2].map((key) => <Block key={key} className="size-3 rounded-full" />)}</div><Block className="h-5 w-32" /><Block className="h-8 w-16 rounded" /></div>
        <div className="flex min-h-112 flex-col justify-center gap-8 p-4 sm:min-h-[clamp(27rem,36vw,34rem)] sm:p-8">
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">{catalogue.courses.map(({ id }) => <div key={id} className="flex flex-col items-center gap-4"><Block className="h-24 w-full max-w-44 rounded-[1rem_1.5rem_1rem_1rem] sm:h-32" /><Block className="h-5 w-[85%]" /><Block className="h-3 w-[60%]" /></div>)}</div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-5 rounded-xl bg-[#eef4ef] p-4"><Block className="h-6 w-24" /><Block className="h-12 w-44 rounded-full" /></div>
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
      <div className="grid gap-4 @min-[65rem]:grid-cols-3">{[0, 1, 2].map((key) => <div key={key} className="flex min-h-48 flex-col justify-between gap-8 rounded-2xl bg-[#eef4ef] p-8 @min-[65rem]:h-[40rem]"><div className="flex items-center justify-between gap-5"><Block className="h-8 w-[65%]" /><Block className="size-11 shrink-0 rounded-full" /></div><TextLines /></div>)}</div>
    </div>
    <div data-skeleton-section="featured-events" className={`${frame} @container py-12 md:py-16`}>
      <Block className="mb-8 h-10 w-60" />
      <div className="grid gap-6 rounded-2xl bg-[#eef4ef] p-3 sm:p-4 @min-[64rem]:grid-cols-2"><Block className="aspect-square rounded-lg" /><div className="flex flex-col gap-6 p-3 sm:p-8"><Block className="h-10 w-[85%]" /><Block className="h-4 w-[65%]" /><TextLines /><div className="grid gap-4 border-y border-[#173d2e]/10 py-5 sm:grid-cols-3">{[0, 1, 2].map((key) => <div key={key} className="space-y-3"><Block className="h-4 w-16" /><Block className="h-6 w-full" /></div>)}</div><TextLines /><Block className="mt-auto h-15 w-full rounded-full" /></div></div>
      <Block className="mx-auto mt-6 h-13 w-64 rounded-full" />
    </div>
    <div data-skeleton-section="affiliations" className={`${frame} grid items-center gap-8 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]`}>
      <div className="space-y-6"><Block className="h-10 w-56" /><Block className="h-36 rounded-lg" /><TextLines /><TextLines /><Block className="h-14 rounded-full" /></div>
      <div className="rounded-3xl border-4 border-[#b6cabe] bg-[#eef4ef] p-6"><div className="grid h-[clamp(18rem,40vw,38rem)] grid-cols-[1.4fr_1fr] items-center gap-6"><div className="space-y-6">{[0, 1, 2].map((key) => <Block key={key} className="mx-auto size-20 rounded-full sm:size-28" />)}</div><div className="space-y-8">{[0, 1, 2, 3].map((key) => <Block key={key} className="h-7 w-full" />)}</div></div><Block className="mx-auto mt-6 h-13 w-48 rounded-full" /></div>
    </div>
  </>;
}

function EnrollmentSkeleton({ enrollment }) {
  const fields = enrollmentFields(enrollment.kind);
  const studentFields = fields.filter(({ name }) => name !== "email" && name !== "phone");
  const contactFields = fields.filter(({ name }) => name === "email" || name === "phone");
  return <div className="bg-[#eef4ef]">
    <div data-skeleton-section="hero" className="flex min-h-[28rem] items-end bg-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]"><div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}><div className="px-5 sm:px-8 lg:px-10"><Block className="mb-4 h-6 w-40" /><div className="flex max-w-4xl flex-col gap-4"><Block className="h-[clamp(2.8rem,5.5vw,5.5rem)] w-[90%]" /><Block className="h-[clamp(2.8rem,5.5vw,5.5rem)] w-[70%]" /></div><TextLines className="mt-5 max-w-[64ch]" /></div></div></div>
    <div data-skeleton-section="enrollment-form" className={`${frame} py-10 sm:py-14 lg:py-16`}><div className="rounded-2xl bg-white p-5 ring-1 ring-[#173d2e]/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
      <Block className="mb-6 h-11 w-52" />
      <div className="grid items-stretch gap-10 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-12">
        <div className="flex min-w-0 flex-col">
          <div className="mb-8 space-y-4 border-t-2 border-[#173d2e]/15 pt-6"><Block className="h-10 w-[85%]" /><Block className="h-4 w-full" /></div>
          <div className="flex flex-col xl:flex-1"><Block className="mb-5 h-8 w-52" />
          <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{studentFields.map(({ name }) => <div key={name} data-skeleton-field={name} className={`space-y-2 ${name === "fullName" ? "sm:col-span-2" : ""}`}><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          <div className="mt-8 border-t border-[#173d2e]/15 pt-7"><Block className="mb-5 h-8 w-52" /><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{contactFields.map(({ name }) => <div key={name} data-skeleton-field={name} className={`space-y-2 ${contactFields.length === 1 ? "sm:col-span-2" : ""}`}><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          <div className="mt-8 flex flex-col gap-5 border-t border-[#173d2e]/15 pt-6 sm:flex-row sm:items-center sm:justify-between"><Block className="h-4 w-full sm:w-[45%]" /><Block className="h-13 w-full shrink-0 rounded-full sm:w-60" /></div>
        </div>
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#eef4ef]">
          <Block className="aspect-[16/10] xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1" /><div className="shrink-0 space-y-3 bg-[#c4d6ca] px-6 py-4"><Block className="h-8 w-[85%]" /><Block className="h-4 w-[65%]" /></div>
          <div className="flex flex-1 flex-col px-6 pb-6"><div className="xl:grid xl:flex-1 xl:auto-rows-[minmax(min-content,1fr)]">{Array.from({ length: enrollment.kind === "courses" ? 4 : 3 }, (_, key) => <div key={key} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4 border-b border-[#173d2e]/10 py-4"><Block className="row-span-2 size-11 rounded-full" /><Block className="h-4 w-16" /><Block className="mt-2 h-6 w-[85%]" /></div>)}</div>{enrollment.item.takeaways?.length > 0 && <div className="mt-5 space-y-4"><Block className="h-7 w-40" /><Block className="h-4 w-[90%]" /><Block className="h-4 w-[80%]" /></div>}<TextLines className="mt-5" /></div>
        </div>
      </div>
    </div></div>
  </div>;
}

function AccountSkeleton({ register = false }) {
  return <div className={`grid min-h-svh ${register ? "lg:grid-cols-[2fr_3fr]" : "lg:grid-cols-[3fr_2fr]"}`}>
    <div className={`flex min-w-0 flex-col justify-center px-6 pt-18 pb-10 sm:px-10 lg:py-16 lg:px-10 xl:px-20 ${register ? "lg:order-2" : "2xl:px-25"}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-7">
        <div className="mb-3 flex items-center gap-4">
          <Block className="size-20 shrink-0 rounded-full sm:size-36" />
          <div className="flex min-w-0 flex-1 flex-col gap-4"><Block className="h-3 w-16" /><Block className="h-7 w-full" /></div>
        </div>
        <Block className="h-9 w-[85%]" />
        <Block className="h-3 w-[65%]" />
        <div className={`grid gap-6 ${register ? "sm:grid-cols-2" : ""}`}>{Array.from({ length: register ? 8 : 2 }, (_, key) => <div key={key} className="min-w-0 space-y-3">
          <Block className="h-3 w-24" />
          <Block className="h-12 w-full rounded-lg" />
        </div>)}</div>
        <Block className="h-14 rounded-full" />
        <Block className="h-3 w-32 self-center" /><Block className="h-12 rounded-lg" />
      </div>
    </div>
    <div className={`hidden items-center bg-[#eef4ef] px-12 lg:flex ${register ? "lg:order-1" : ""}`}><TextLines className="w-full" /></div>
  </div>;
}

function ProfileSkeleton() {
  return <div className={`${frame} py-12`}>
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-[#eef4ef] py-8">
      <Block className="size-44 rounded-full sm:size-[230px]" />
      <Block className="h-9 w-52" />
      <Block className="h-5 w-60 max-w-full" />
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((key) => <Block key={key} className="h-14 rounded-lg" />)}</div>
    <Block className="mt-4 h-13 rounded-lg" />
    <div data-skeleton-section="profile-information" className="mt-10 rounded-xl border border-[#173d2e]/10 p-6 sm:p-8"><div className="mb-7 flex flex-wrap items-center justify-between gap-5"><Block className="h-9 w-60" /><Block className="h-12 w-36 rounded-full" /></div><div className="space-y-4">{Array.from({ length: 6 }, (_, key) => <div key={key} className="flex items-center gap-8 border-b border-[#173d2e]/10 py-4"><Block className="h-5 w-24 shrink-0" /><Block className="h-5 w-[55%]" /></div>)}</div></div>
  </div>;
}

function JoinSkeleton() {
  return <div className="bg-[#eef4ef]">
    <div className="flex min-h-[28rem] items-end bg-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]">
      <div className={`${frame} pt-36 pb-10 lg:pt-40 lg:pb-12`}>
        <div className="px-5 sm:px-8 lg:px-10">
          <div className="flex max-w-4xl flex-col gap-4"><Block className="h-[clamp(3rem,6.5vw,6.5rem)] w-[45%]" /><Block className="h-[clamp(3rem,6.5vw,6.5rem)] w-[85%]" /></div>
          <TextLines className="mt-6 max-w-xl" />
        </div>
      </div>
    </div>
    <div className={`${frame} py-10 sm:py-14 lg:py-16`}>
      <div className="w-full rounded-2xl bg-white p-5 shadow-[0_12px_40px_-24px_rgba(23,61,46,0.28)] ring-1 ring-[#173d2e]/15 ring-inset sm:rounded-3xl sm:p-8 lg:p-10">
        <div className="grid items-stretch gap-y-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-x-12">
          <div className="flex min-w-0 flex-col">
            <div className="mb-8 space-y-4 border-t-2 border-[#173d2e]/15 pt-6"><Block className="h-10 w-[85%] sm:h-12" /><Block className="h-4 w-full" /></div>
            <div className="flex flex-col xl:flex-1"><Block className="mb-5 h-8 w-52" /><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 xl:flex-1 xl:content-between">{membershipFields.filter(({ name }) => name !== "email" && name !== "phone").map(({ name }) => <div key={name} data-skeleton-field={name} className={`space-y-2 ${name === "fullName" ? "sm:col-span-2" : ""}`}><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
            <div className="mt-8 border-t border-[#173d2e]/15 pt-7"><Block className="mb-5 h-8 w-52" /><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">{membershipFields.filter(({ name }) => name === "email" || name === "phone").map(({ name }) => <div key={name} data-skeleton-field={name} className="space-y-2"><Block className="h-5 w-28" /><Block className="h-13 rounded-lg" /></div>)}</div></div>
          </div>
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#eef4ef] @container/payment xl:row-span-2"><Block className="aspect-[16/10] xl:aspect-auto xl:h-40 xl:min-h-40 xl:flex-1" /><Block className="h-26 shrink-0" /><div className="flex min-h-[24rem] shrink-0 flex-col p-6 @max-[25rem]/payment:min-h-[27rem] @max-[18rem]/payment:min-h-[29rem]"><Block className="mb-3 h-6 w-36" /><div className="grid grid-cols-2 gap-2">{Array.from({ length: 5 }, (_, index) => <Block key={index} className={`h-14 rounded-lg ${index === 4 ? "col-span-2" : ""}`} />)}</div><TextLines className="mt-auto pt-4" /></div></div>
          <div className="min-w-0 border-t border-[#173d2e]/15 pt-6"><Block className="h-5 w-[85%] max-w-xl" /><div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Block className="h-4 w-full max-w-md" /><Block className="h-13 w-full shrink-0 rounded-full sm:w-60" /></div></div>
        </div>
      </div>
    </div>
  </div>;
}

export default function PageSkeleton({ pathname }) {
  const auth = pathname === "/login" || pathname === "/register";
  const enrollment = enrollmentFromPath(pathname);
  return <div data-page-skeleton={pathname} className={`${skeletonFrame} min-h-full bg-white`} aria-hidden="true">
    {enrollment ? <EnrollmentSkeleton enrollment={enrollment} /> : pathname.startsWith("/enroll/") ? <div className={`${frame} space-y-6 py-20`}><Block className="h-12 w-[75%] max-w-lg" /><TextLines className="max-w-xl" /><Block className="h-13 w-52 rounded-full" /></div> : pathname === "/join" ? <JoinSkeleton /> : auth ? <AccountSkeleton register={pathname === "/register"} /> : pathname === "/profile" ? <ProfileSkeleton /> : <>
      {pathname === "/" ? <HomeHeroSkeleton /> : <HeroSkeleton />}
      {pathname === "/" ? <HomeSections /> : pathname === "/team" ? <TeamRows /> : pathname === "/catalogue" ? <CatalogueCards /> : <div className={`${frame} py-12`}><Block className="h-10 w-52" /><TextLines className="mt-8 max-w-2xl" /></div>}
    </>}
  </div>;
}
