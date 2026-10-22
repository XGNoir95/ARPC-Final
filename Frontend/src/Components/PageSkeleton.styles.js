export const skeletonFrame = [
  "route-skeleton relative overflow-hidden",
  "after:pointer-events-none after:absolute after:inset-0 after:content-['']",
  "after:bg-[linear-gradient(105deg,transparent_35%,rgb(255_255_255_/_35%)_50%,transparent_65%)]",
  "after:[transform:translateX(-100%)] after:animate-skeleton-sweep dark:after:opacity-30",
  "motion-reduce:after:hidden motion-reduce:after:animate-none",
].join(" ");
