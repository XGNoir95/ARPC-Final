export const adminFocus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink';
export const adminAction = 'inline-flex min-h-11 min-w-0 max-w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-action px-5 py-3 text-center text-base font-semibold text-on-action transition-colors hover:bg-[#E9AD5E] hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none [&_svg]:shrink-0';
export const adminQuiet = 'inline-flex min-h-11 min-w-0 max-w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface px-4 py-2 text-center text-base font-medium text-ink transition-colors hover:border-ink/35 hover:bg-soft focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none [&_svg]:shrink-0';
export const adminDanger = 'inline-flex min-h-11 min-w-0 max-w-full cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2 text-center text-base font-medium text-danger transition-colors hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-danger disabled:opacity-40 motion-reduce:transition-none [&_svg]:shrink-0';
export const adminInput = 'block min-h-12 w-full min-w-0 rounded-xl border border-ink/20 bg-field px-4 py-3 text-base font-normal text-ink placeholder:text-muted/75 transition-colors focus:border-ink focus:bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-ink disabled:opacity-60 motion-reduce:transition-none';
export const adminPanel = 'min-w-0 rounded-2xl border border-ink/12 bg-surface';

export const adminPreviewSection = 'mt-6 grid min-w-0 gap-4 border-t border-ink/12 pt-6';
export const adminPreviewCardGrid = 'grid min-w-0 auto-rows-fr gap-4 @min-[36rem]/preview:grid-cols-2 @min-[60rem]/preview:grid-cols-3';

export const adminTypography = {
  pageTitle: 'font-garamond text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-5xl',
  sectionTitle: 'min-w-0 break-words font-garamond text-[1.75rem] leading-tight font-semibold sm:text-3xl',
  body: 'text-base leading-7',
  supporting: 'text-sm leading-6',
};

export const adminLayout = {
  shell: 'grid min-h-svh min-w-0 bg-field font-sans text-base leading-7 text-ink lg:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)]',
  sidebar: 'flex min-w-0 flex-col border-b border-ink/12 bg-soft px-4 py-4 lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-5 lg:py-7',
};
