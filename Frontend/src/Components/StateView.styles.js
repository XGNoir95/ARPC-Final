// One centered stack for empty, loading and recovery states in every workspace.
// Compact states change the surrounding space, never the type or icon scale.
export const stateViewStyles = {
  panel: '@container/state relative isolate flex min-w-0 flex-col justify-center rounded-3xl border border-ink/12 bg-field px-5 font-sans text-ink sm:px-8',
  content: 'mx-auto flex w-full min-w-0 max-w-2xl flex-col items-center text-center',
  icon: 'mb-5 flex size-16 shrink-0 items-center justify-center rounded-2xl border border-[#d7b078]/35 bg-warning-soft text-warning',
  title: 'max-w-[28ch] font-garamond text-[clamp(1.875rem,5cqi,2.25rem)] leading-[1.15] font-semibold tracking-[-0.015em] text-balance [overflow-wrap:anywhere]',
  description: 'mt-3 max-w-[54ch] text-base leading-7 text-pretty text-copy [overflow-wrap:anywhere]',
  actions: 'mt-6 flex w-full flex-wrap items-center justify-center gap-3',
};
