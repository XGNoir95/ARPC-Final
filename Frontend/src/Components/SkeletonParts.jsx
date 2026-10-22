import { skeletonFrame } from "./PageSkeleton.styles";
import { publicPageFrame } from "./PublicLayout.styles";

export function Block({ className = "" }) {
  return <div className={`max-w-full bg-raised ${className}`} />;
}

export function TextLines({ className = "" }) {
  return <div className={`flex flex-col gap-3 ${className}`}><Block className="h-3 w-full" /><Block className="h-3 w-full" /><Block className="h-3 w-[78%]" /></div>;
}

export function FooterSkeleton() {
  return <div data-skeleton-section="footer" className={`${skeletonFrame} flex min-h-full flex-col bg-soft`} aria-hidden="true">
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="flex min-h-[30rem] flex-col gap-8 px-6 py-12 sm:py-14 lg:py-16 lg:pr-12 lg:pl-26 2xl:pr-16 2xl:pl-44">
        <div className="flex items-center gap-4"><Block className="size-16 shrink-0 rounded-full sm:size-32" /><div className="flex-1 space-y-3"><Block className="h-8 w-full" /><Block className="h-3 w-[85%]" /></div></div>
        <div className="my-auto space-y-4 py-8">{[0, 1, 2, 3].map((key) => <Block key={key} className="h-8 w-[90%] sm:h-10" />)}</div>
        <Block className="h-12 w-52 rounded-full" />
      </div>
      <div className="flex flex-col gap-7 bg-raised px-6 py-12 sm:py-14 lg:py-16 lg:pr-26 lg:pl-12 2xl:pr-44 2xl:pl-16">
        <div className="flex items-center gap-4"><Block className="size-18 shrink-0 rounded-full sm:size-32" /><div className="flex-1 space-y-3"><Block className="h-12 w-36" /><Block className="h-3 w-full" /></div></div>
        <TextLines /><div className="grid grid-cols-3 gap-4 border-y border-ink/10 py-5">{[0, 1, 2, 3].map((key) => <Block key={key} className="h-5 w-full" />)}<Block className="col-span-2 h-12 rounded-full" /></div>
        <Block className="h-8 w-48" /><Block className="h-3 w-56 max-w-full" /><Block className="mt-auto h-14 rounded-xl" />
      </div>
    </div>
    <div className={`${publicPageFrame} flex flex-col gap-4 border-t border-ink/10 py-6 md:flex-row md:justify-between`}><Block className="h-4 w-64 max-w-full" /><Block className="h-4 w-48" /></div>
  </div>;
}
