// Viewport overlay only; pages and loaders must not reserve space for this stack.
export const floatingControlStyles = {
  stack: 'fixed right-6 bottom-6 z-[80] flex flex-col items-center gap-3 md:right-8 md:bottom-8',
  button: 'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border shadow-lg shadow-black/15 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#E9AD5E] motion-reduce:transition-none md:size-15',
  icon: 'size-5 md:size-7',
};
