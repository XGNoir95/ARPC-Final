import { skeletonFrame } from "./PageSkeleton.styles";

const frame = "mx-auto w-full max-w-[112rem] px-6 lg:w-[calc(100%_-_10rem)] 2xl:px-24";

function Block({ className = "" }) {
  return <div className={`bg-[#dbe6de] ${className}`} />;
}

function TextLines({ className = "" }) {
  return <div className={`flex flex-col gap-3 ${className}`}>
    <Block className="h-3 w-full" />
    <Block className="h-3 w-full" />
    <Block className="h-3 w-[78%]" />
  </div>;
}

function HomeHeroSkeleton() {
  return <div className="flex min-h-svh bg-[#eef4ef] lg:min-h-[max(60rem,100svh)]">
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
  return <div className="flex min-h-[28rem] items-end bg-[#eef4ef] sm:min-h-[25rem] lg:min-h-[28rem]">
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
  return <div className={`${frame} py-10 sm:py-14`}>
    {[0, 1, 2].map((key) => <div key={key} className="grid gap-8 border-b border-[#173d2e]/10 py-8 sm:min-h-80 sm:grid-cols-[38%_minmax(0,1fr)] sm:items-center sm:gap-12">
      <Block className="h-16 w-24 sm:h-44 sm:w-36" />
      <div className="min-w-0 space-y-7">
        <div className="flex items-center justify-between gap-8">
          <Block className="h-8 w-[70%]" />
          <Block className="size-11 shrink-0 rounded-full" />
        </div>
        <TextLines />
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
    <div className="flex items-center justify-between gap-8 pt-12 pb-8">
      <Block className="h-10 w-36" />
      <Block className="h-11 w-44 rounded-full" />
    </div>
    <div className="overflow-hidden rounded-2xl bg-[#eef4ef] px-4 py-10 sm:px-6">
      <div className="flex h-[23rem] min-w-max items-end justify-center gap-[3px] border-b border-[#E9AD5E]/80 sm:h-[clamp(24rem,40vw,34rem)]">
        {["h-[92%]", "h-full", "h-[94%]", "h-[97%]"].map((height) => <Block key={height} className={`${height} w-[clamp(5.3rem,15vw,13rem)] rounded-sm`} />)}
      </div>
    </div>
  </div>;
}

function AccountSkeleton({ register = false }) {
  return <div className={`grid min-h-svh ${register ? "lg:grid-cols-[2fr_3fr]" : "lg:grid-cols-[3fr_2fr]"}`}>
    <div className={`flex flex-col justify-center px-6 pt-18 pb-10 sm:px-10 lg:py-16 ${register ? "lg:order-2 lg:px-20" : "lg:px-25"}`}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-7">
        <div className="mb-3 flex items-center gap-4">
          <Block className="size-36 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-4"><Block className="h-3 w-16" /><Block className="h-7 w-full" /></div>
        </div>
        <Block className="h-9 w-[85%]" />
        <Block className="h-3 w-[65%]" />
        {Array.from({ length: register ? 5 : 2 }, (_, key) => <div key={key} className="space-y-3">
          <Block className="h-3 w-24" />
          <Block className="h-12 w-full rounded-lg" />
        </div>)}
        <Block className="h-14 rounded-full" />
      </div>
    </div>
    <div className={`hidden items-center bg-[#eef4ef] px-12 lg:flex ${register ? "lg:order-1" : ""}`}><TextLines className="w-full" /></div>
  </div>;
}

function ProfileSkeleton() {
  return <div className={`${frame} py-12`}>
    <div className="flex flex-col items-center gap-6 rounded-2xl bg-[#eef4ef] py-10">
      <Block className="size-48 rounded-full sm:size-56" />
      <Block className="h-9 w-52" />
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((key) => <Block key={key} className="h-14 rounded-lg" />)}</div>
    <TextLines className="mt-10 max-w-2xl" />
  </div>;
}

export default function PageSkeleton({ pathname }) {
  const auth = pathname === "/login" || pathname === "/register";
  return <div data-page-skeleton={pathname} className={`${skeletonFrame} min-h-full bg-white`} aria-hidden="true">
    {auth ? <AccountSkeleton register={pathname === "/register"} /> : pathname === "/profile" ? <ProfileSkeleton /> : <>
      {pathname === "/" ? <HomeHeroSkeleton /> : <HeroSkeleton />}
      {pathname === "/team" ? <TeamRows /> : pathname === "/catalogue" ? <CatalogueCards /> : <div className={`${frame} py-12`}><Block className="h-10 w-52" /><TextLines className="mt-8 max-w-2xl" /></div>}
    </>}
  </div>;
}
