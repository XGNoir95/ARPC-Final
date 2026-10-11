// Tailwind utilities for this component, grouped by element and state.
// Semantic classes remain as interaction/test hooks; they define no CSS.
// Keep complete utility strings here so Tailwind can discover every variant.
export const bookStyles = {
  "event-shelf": [
    "event-shelf",
    "[--shelf-height:clamp(24rem,_40vw,_34rem)] [--reader-width:clamp(40rem,_calc(100vw_-_24rem),_58rem)]",
    "[--spine-width:clamp(5.3rem,_15vw,_13rem)] [--spine-title-size:clamp(1.7rem,_3.3vw,_3.1rem)] [--neighbor-title-size:1.35rem]",
    "[--open-title-size:clamp(2.25rem,_3.7vw,_3.4rem)] [border-radius:1.25rem] [background:#eef4ef] overflow-hidden",
    // @media (width<=639px) .event-shelf
    "[@media(width<=639px)]:[--shelf-height:23rem] [@media(width<=639px)]:[--reader-width:calc(100vw_-_5rem)]",
    "[@media(width<=639px)]:[--spine-title-size:clamp(1.25rem,_4.5vw,_1.5rem)] [@media(width<=639px)]:[--neighbor-title-size:1.1rem]",
    "[@media(width<=639px)]:[--open-title-size:1.85rem]",
    // @media (width>639px) and (width<640px) .event-shelf
    "[@media(width>639px)_and_(width<640px)]:[--spine-title-size:clamp(1.4rem,_2.6vw,_1.75rem)]",
    "[@media(width>639px)_and_(width<640px)]:[--neighbor-title-size:1.2rem]",
    "[@media(width>639px)_and_(width<640px)]:[--open-title-size:clamp(1.9rem,_3.5vw,_2.5rem)]",
    // @media (width>=640px) and (width<=1023px) .event-shelf
    "[@media(width>=640px)_and_(width<=1023px)]:[--reader-width:calc(100vw_-_6rem)]",
    "[@media(width>=640px)_and_(width<=1023px)]:[--spine-title-size:clamp(1.4rem,_2.6vw,_1.75rem)]",
    "[@media(width>=640px)_and_(width<=1023px)]:[--neighbor-title-size:1.2rem]",
    "[@media(width>=640px)_and_(width<=1023px)]:[--open-title-size:clamp(1.9rem,_3.5vw,_2.5rem)]",
  ].join(" "),
  "event-shelf__scroll": [
    "event-shelf__scroll",
    "overflow-x-auto [padding:2.5rem_1.5rem_1.75rem] [scrollbar-width:thin] [scrollbar-color:#577262_#eef4ef]",
    // @media (width<=639px) .event-shelf__scroll
    "[@media(width<=639px)]:[padding:1.75rem_1rem_1.25rem] [@media(width<=639px)]:[scroll-snap-type:x_proximity]",
  ].join(" "),
  "event-shelf__row": [
    "event-shelf__row",
    "relative flex [align-items:flex-end] justify-center gap-[3px] min-w-max min-h-[var(--shelf-height)] pb-[0.65rem]",
    // @media (width<=639px) .event-shelf__row
    "[@media(width<=639px)]:[justify-content:flex-start]",
    //  .event-shelf__row::after
    "[&::after]:content-[''] [&::after]:absolute [&::after]:[inset:auto_0_0] [&::after]:h-[0.65rem] [&::after]:[border-top:2px_solid_#E9AD5E]",
    "[&::after]:[border-radius:0_0_3px_3px] [&::after]:[background:#fff] [&::after]:[box-shadow:0_6px_12px_rgb(23_61_46_/_12%)]",
    "[&::after]:pointer-events-none",
  ].join(" "),
  "event-volume": [
    "event-volume",
    "relative flex-none w-[var(--spine-width)] [height:calc(var(--shelf-height)_*_var(--book-height))]",
    "[min-height:calc(var(--shelf-height)_*_var(--book-height))] [scroll-snap-align:center]",
    "[transition:width_420ms_cubic-bezier(0.45,_0,_0.2,_1)]",
    // @media (prefers-reduced-motion: reduce) .event-volume
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "event-volume__heading": [
    "event-volume__heading",
    "absolute [inset:0] w-full h-full m-0",
  ].join(" "),
  "event-volume--open": [
    "event-volume--open",
    "[&:not(.event-volume--collapsing)]:w-[var(--reader-width)] [&.event-volume--open]:h-auto",
    //  .event-volume--open .event-volume__heading
    String.raw`[&_.event-volume\_\_heading]:invisible [&_.event-volume\_\_heading]:pointer-events-none`,
  ].join(" "),
  "event-volume--collapsing": [
    "event-volume--collapsing",
    "w-[var(--spine-width)] [border-radius:4px_7px_1px_1px] [background:var(--book-cloth)]",
  ].join(" "),
  "event-shelf--reading": [
    "event-shelf--reading",
    //  .event-shelf--reading .event-volume:not(.event-volume--open)
    "[&_.event-volume:not(.event-volume--open)]:w-[3.6rem]",
    //  .event-shelf--reading .event-volume:not(.event-volume--open) .event-spine
    "[&_.event-volume:not(.event-volume--open)_.event-spine]:px-[0.35rem]",
    //  .event-shelf--reading .event-volume:not(.event-volume--open) .event-spine__title
    String.raw`[&_.event-volume:not(.event-volume--open)_.event-spine\_\_title]:[font-size:var(--neighbor-title-size)]`,
    //  .event-shelf--reading .event-volume:not(.event-volume--open) .event-spine__status
    String.raw`[&_.event-volume:not(.event-volume--open)_.event-spine\_\_status]:hidden`,
    //  .event-shelf--reading .event-volume:not(.event-volume--open) .event-spine__date
    String.raw`[&_.event-volume:not(.event-volume--open)_.event-spine\_\_date]:[font-size:0.65rem]`,
    //  .event-shelf--reading .event-spine__wordmark
    String.raw`[&_.event-spine\_\_wordmark]:hidden`,
    //  .event-shelf--reading .event-spine__round-logo
    String.raw`[&_.event-spine\_\_round-logo]:block`,
  ].join(" "),
  "event-book-holder": [
    "event-book-holder",
    "overflow-hidden p-[0.4rem]",
  ].join(" "),
  "event-book-pages": [
    "event-book-pages",
    "relative isolate [width:calc(var(--reader-width)_-_0.8rem)] [perspective:1800px] [outline:none] text-[#173d2e]",
  ].join(" "),
  "event-spine": [
    "event-spine",
    "relative flex flex-col items-center w-full h-full [padding:1.5rem_0.75rem_1rem] [border:0] [border-radius:4px_7px_1px_1px]",
    "bg-[var(--book-cloth)]",
    "[background-image:linear-gradient(90deg,_rgb(0_0_0_/_15%),_transparent_10%,_rgb(255_255_255_/_7%)_48%,_transparent_82%,_rgb(0_0_0_/_16%)),_repeating-linear-gradient(0deg,_transparent,_transparent_2px,_rgb(255_255_255_/_3%)_3px)]",
    "text-[var(--book-ink)] [box-shadow:inset_2px_0_rgb(255_255_255_/_18%),_inset_-4px_0_rgb(0_0_0_/_12%),_0_12px_14px_-10px_rgb(16_44_33_/_45%)]",
    "overflow-hidden cursor-pointer [outline-offset:5px] [transition:transform_280ms_cubic-bezier(0.22,_1,_0.36,_1),_box-shadow_280ms_ease]",
    // @media (width<=639px) .event-spine
    "[@media(width<=639px)]:pt-[1.1rem]",
    //  .event-spine:hover
    "[&:hover]:[transform:translateY(-0.75rem)]",
    "[&:hover]:[box-shadow:inset_2px_0_rgb(255_255_255_/_18%),_inset_-4px_0_rgb(0_0_0_/_12%),_0_20px_20px_-12px_rgb(16_44_33_/_40%)]",
    //  .event-spine:focus-visible
    "[&:focus-visible]:[transform:translateY(-0.75rem)]",
    "[&:focus-visible]:[box-shadow:inset_2px_0_rgb(255_255_255_/_18%),_inset_-4px_0_rgb(0_0_0_/_12%),_0_20px_20px_-12px_rgb(16_44_33_/_40%)]",
    "[&:focus-visible]:[outline:3px_solid_#E9AD5E]",
    // @media (prefers-reduced-motion: reduce) .event-spine
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
    // @media (prefers-reduced-motion: reduce) .event-spine:hover
    "[@media(prefers-reduced-motion:_reduce)]:[&:hover]:[transform:none]",
    // @media (prefers-reduced-motion: reduce) .event-spine:focus-visible
    "[@media(prefers-reduced-motion:_reduce)]:[&:focus-visible]:[transform:none]",
  ].join(" "),
  "event-spine__date": [
    "event-spine__date",
    "flex flex-col items-center gap-[0.2rem] [font-size:0.875rem] [line-height:1.4]",
    //  .event-spine__date > span
    "[&_>_span]:opacity-[0.7] [&_>_span]:[font-size:0.75rem]",
  ].join(" "),
  "event-spine__title": [
    "event-spine__title",
    "[flex:1] min-h-0 max-w-full [margin:1.25rem_0] [writing-mode:vertical-rl] [text-orientation:mixed] text-left text-balance font-editorial",
    "[font-size:var(--spine-title-size)] font-semibold [line-height:1.04] overflow-hidden",
    "[transition:font-size_420ms_cubic-bezier(0.45,_0,_0.2,_1)]",
    // @media (prefers-reduced-motion: reduce) .event-spine__title
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "event-spine__status": [
    "event-spine__status",
    "flex items-center gap-[0.35rem] [font-size:0.8rem] font-medium [line-height:1.4] whitespace-nowrap",
    //  .event-spine__status > span
    "[&_>_span]:flex-none [&_>_span]:w-[6px] [&_>_span]:h-[6px] [&_>_span]:rounded-[50%] [&_>_span]:[box-shadow:0_0_0_1px_rgb(255_255_255_/_60%)]",
    //  .event-spine__status[data-status="upcoming"] > span
    "[&[data-status=upcoming]_>_span]:[background:#E9AD5E]",
    //  .event-spine__status[data-status="finished"] > span
    "[&[data-status=finished]_>_span]:[background:#64748b]",
  ].join(" "),
  "event-book-status": [
    "event-book-status",
    //  .event-book-status[data-status="upcoming"] > span
    "[&[data-status=upcoming]_>_span]:[background:#E9AD5E]",
    //  .event-book-status[data-status="finished"] > span
    "[&[data-status=finished]_>_span]:[background:#64748b]",
    "inline-flex items-center gap-2 [font-size:0.8rem] font-semibold",
    //  .event-book-status > span
    "[&_>_span]:flex-none [&_>_span]:w-[6px] [&_>_span]:h-[6px] [&_>_span]:rounded-[50%]",
  ].join(" "),
  "event-spine__publisher": [
    "event-spine__publisher",
    "grid place-items-center flex-none w-full h-13 mt-4 pt-3 [border-top:1px_solid_currentColor]",
    // @media (width<=1023px) .event-spine__publisher .event-spine__wordmark
    String.raw`[@media(width<=1023px)]:[&_.event-spine\_\_wordmark]:hidden`,
    // @media (width<=1023px) .event-spine__publisher .event-spine__round-logo
    String.raw`[@media(width<=1023px)]:[&_.event-spine\_\_round-logo]:block`,
  ].join(" "),
  "event-spine__round-logo": [
    "event-spine__round-logo",
    "hidden w-9 h-9 object-contain",
  ].join(" "),
  "event-spine__wordmark": [
    "event-spine__wordmark",
    "relative block w-full h-9 overflow-hidden",
    //  .event-spine__wordmark img
    "[&_img]:absolute [&_img]:top-[50%] [&_img]:left-[50%] [&_img]:w-[122%] [&_img]:max-w-[none] [&_img]:h-auto",
    "[&_img]:[transform:translate(-50%,_-50%)] [&_img]:[filter:brightness(0)_invert(1)]",
    //  .event-spine__wordmark .event-spine__wordmark-letters
    String.raw`[&_.event-spine\_\_wordmark-letters]:[clip-path:inset(43.2%_12%_44.4%_12%)]`,
    String.raw`[&_.event-spine\_\_wordmark-letters]:[filter:brightness(0)_invert(1)_drop-shadow(0.5px_0_0_#000)_drop-shadow(-0.5px_0_0_#000)_drop-shadow(0_0.5px_0_#000)_drop-shadow(0_-0.5px_0_#000)]`,
  ].join(" "),
  "event-shelf__hint": [
    "event-shelf__hint",
    "flex items-center justify-center gap-[0.65rem] m-0 [padding:1rem_1.5rem_1.5rem] text-[#173d2e] text-center [font-size:0.875rem]",
    "[line-height:1.5]",
    // @media (width<=639px) .event-shelf__hint
    "[@media(width<=639px)]:gap-2 [@media(width<=639px)]:[font-size:0.8125rem] [@media(width<=639px)]:px-5",
    //  .event-shelf__hint > span
    "[&_>_span]:min-w-0",
    //  .event-shelf__hint svg
    "[&_svg]:flex-none [&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem] [&_svg]:text-[#577262]",
  ].join(" "),
  "event-book-spread": [
    "event-book-spread",
    "relative grid [grid-template-columns:repeat(2,_minmax(0,_1fr))] [border:1px_solid_#577262] [border-radius:4px_10px_10px_4px]",
    "[background:#fff] [box-shadow:0_2px_0_#dbe6de,_0_4px_0_#577262,_0_5px_0_rgb(23_61_46_/_25%)] [transform-style:preserve-3d]",
    // @media (width<=767px) .event-book-spread
    "[@media(width<=767px)]:flex [@media(width<=767px)]:flex-col",
    //  .event-book-spread::after
    "[&::after]:content-[''] [&::after]:absolute [&::after]:[left:calc(50%_-_1rem)] [&::after]:top-0 [&::after]:bottom-0 [&::after]:w-8",
    "[&::after]:[background:linear-gradient(90deg,_transparent,_rgb(16_44_33_/_10%)_50%,_rgb(16_44_33_/_3%)_65%,_transparent)]",
    "[&::after]:pointer-events-none",
    // @media (width<=767px) .event-book-spread::after
    "[@media(width<=767px)]:[&::after]:hidden",
  ].join(" "),
  "event-book-left": [
    "event-book-left",
    "flex flex-col gap-6 min-w-0 [padding:clamp(1.5rem,_3vw,_3rem)] [border-radius:4px_0_0_4px] [background:#f7faf5]",
    // @media (width<=639px) .event-book-left
    "[@media(width<=639px)]:gap-4 [@media(width<=639px)]:p-6 [@media(width<=639px)]:[border-radius:4px_4px_0_0]",
    //  .event-book-left > *
    "[&_>_*]:[transition:opacity_220ms_ease]",
    // @media (prefers-reduced-motion: reduce) .event-book-left > *
    "[@media(prefers-reduced-motion:_reduce)]:[&_>_*]:[transition:none]",
  ].join(" "),
  "event-book-details": [
    "event-book-details",
    "[transition:opacity_220ms_ease] relative flex flex-col min-w-0 [container-type:inline-size] [padding:3.25rem_clamp(1.5rem,_3vw,_3rem)_2rem]",
    // @media (width<=639px) .event-book-details
    "[@media(width<=639px)]:p-6",
    // @media (prefers-reduced-motion: reduce) .event-book-details
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "event-book-pages--expanding": [
    "event-book-pages--expanding",
    //  .event-book-pages--expanding .event-book-left > *
    "[&_.event-book-left_>_*]:opacity-[0]",
    //  .event-book-pages--expanding .event-book-details
    "[&_.event-book-details]:opacity-[0]",
    //  .event-book-pages--expanding .event-book-cover__front > *
    String.raw`[&_.event-book-cover\_\_front_>_*]:invisible`,
  ].join(" "),
  "event-book-pages--closing": [
    "event-book-pages--closing",
    //  .event-book-pages--closing .event-book-left > *
    "[&_.event-book-left_>_*]:opacity-[0]",
  ].join(" "),
  "event-book-pages--collapsing": [
    "event-book-pages--collapsing",
    //  .event-book-pages--collapsing .event-book-left > *
    "[&_.event-book-left_>_*]:opacity-[0]",
  ].join(" "),
  "event-book-pages--opening": [
    "event-book-pages--opening",
    //  .event-book-pages--opening .event-book-left > *
    "[&_.event-book-left_>_*]:[transition-delay:460ms]",
    //  .event-book-pages--opening .event-book-details
    "[&_.event-book-details]:[transition-delay:140ms]",
  ].join(" "),
  "event-book-format": [
    "event-book-format",
    "font-editorial [font-size:1.6rem] [line-height:1.15] [font-style:italic]",
    // @media (width<=639px) .event-book-format
    "[@media(width<=639px)]:[font-size:1.25rem]",
    // @media (width>639px) and (width<=1023px) .event-book-format
    "[@media(width>639px)_and_(width<=1023px)]:[font-size:1.4rem]",
  ].join(" "),
  "event-book-image": [
    "event-book-image",
    "w-full [aspect-ratio:4_/_3] object-cover [border-radius:2px]",
    // @media (width<=639px) .event-book-image
    "[@media(width<=639px)]:max-h-52",
  ].join(" "),
  "event-book-introduction": [
    "event-book-introduction",
    "font-editorial [font-size:clamp(1.5rem,_2.4vw,_2rem)] [line-height:1.35] text-justify",
    // @media (width<=639px) .event-book-introduction
    "[@media(width<=639px)]:[font-size:1.25rem]",
    // @media (width>639px) and (width<=1023px) .event-book-introduction
    "[@media(width>639px)_and_(width<=1023px)]:[font-size:clamp(1.35rem,_2.5vw,_1.6rem)]",
  ].join(" "),
  "event-book-imprint": [
    "event-book-imprint",
    "mt-auto pt-4 [font-size:0.8rem] [line-height:1.5] opacity-[0.7]",
    // @media (width<=639px) .event-book-imprint
    "[@media(width<=639px)]:hidden",
  ].join(" "),
  "event-book-close": [
    "event-book-close",
    "absolute top-7 right-7 [z-index:2] grid place-items-center w-11 h-11 [border:0] rounded-[50%] [background:#eef4ef] text-[#173d2e]",
    "cursor-pointer [transition:background-color_180ms_ease]",
    // @media (width<=639px) .event-book-close
    "[@media(width<=639px)]:top-4 [@media(width<=639px)]:right-4 [@media(width<=639px)]:[box-shadow:0_2px_8px_rgb(16_44_33_/_12%)]",
    //  .event-book-close svg
    "[&_svg]:w-5 [&_svg]:h-5",
    //  .event-book-close:hover
    "[&:hover]:[background:#E9AD5E]",
    //  .event-book-close:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#E9AD5E] [&:focus-visible]:[outline-offset:4px]",
    // @media (prefers-reduced-motion: reduce) .event-book-close
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "event-book-title": [
    "event-book-title",
    "mt-4 font-editorial [font-size:var(--open-title-size)] [line-height:1.05] font-semibold [letter-spacing:-0.02em] [overflow-wrap:anywhere]",
    "[hyphens:auto]",
  ].join(" "),
  "event-book-metadata": [
    "event-book-metadata",
    "grid [grid-template-columns:repeat(3,_minmax(0,_1fr))] [align-items:start] [justify-items:stretch] gap-3 mt-5 [padding:1.1rem_0]",
    "[border-top:1px_solid_rgb(23_61_46_/_15%)] [border-bottom:1px_solid_rgb(23_61_46_/_15%)] text-center",
    //  .event-book-metadata > div
    "[&_>_div]:min-w-0",
    //  .event-book-metadata dt
    "[&_dt]:flex [&_dt]:items-center [&_dt]:justify-center [&_dt]:gap-[0.45rem] [&_dt]:min-h-6 [&_dt]:whitespace-nowrap",
    "[&_dt]:[font-size:0.85rem] [&_dt]:[line-height:1.5] [&_dt]:text-[#577262]",
    //  .event-book-metadata dt svg
    "[&_dt_svg]:flex-none [&_dt_svg]:w-[1.1rem] [&_dt_svg]:h-[1.1rem]",
    //  .event-book-metadata dd
    "[&_dd]:mt-2 [&_dd]:[font-size:1rem] [&_dd]:font-semibold [&_dd]:[line-height:1.5]",
    // @container (max-width: 20rem) .event-book-metadata
    "[@container(max-width:_20rem)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] [@container(max-width:_20rem)]:gap-y-4",
    // @container (max-width: 20rem) .event-book-metadata > div:last-child
    "[@container(max-width:_20rem)]:[&_>_div:last-child]:[grid-column:1_/_-1]",
  ].join(" "),
  "event-book-metadata__year": [
    "event-book-metadata__year",
    "block mt-[0.15rem] text-[#577262] [font-size:0.85rem] font-normal",
  ].join(" "),
  "event-book-description": [
    "event-book-description",
    "mt-5 [font-size:1rem] [line-height:1.75] text-justify",
  ].join(" "),
  "event-book-takeaways": [
    "event-book-takeaways",
    "flex flex-col gap-2 mt-4 [font-size:0.95rem] [line-height:1.6]",
    //  .event-book-takeaways li
    "[&_li]:flex [&_li]:[align-items:flex-start] [&_li]:gap-[0.65rem]",
    //  .event-book-takeaways svg
    "[&_svg]:flex-none [&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem] [&_svg]:mt-[0.2rem]",
  ].join(" "),
  "event-book-preview": [
    "event-book-preview",
    "mt-5 text-[#577262] [font-size:0.8rem] [line-height:1.6]",
  ].join(" "),
  "event-book-actions": [
    "event-book-actions",
    "flex [justify-content:flex-end] mt-auto pt-6",
  ].join(" "),
  "event-book-register": [
    "event-book-register",
    "inline-flex items-center justify-center gap-5 min-h-13 [padding:0.6rem_0.65rem_0.6rem_1.5rem] [border:0] rounded-[999px]",
    "[background:#173d2e] text-[#fff] no-underline [font-size:1.05rem] font-semibold [line-height:1.25] cursor-pointer",
    "[transition:background-color_180ms_ease,_color_180ms_ease]",
    //  .event-book-register svg
    "[&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem]",
    //  .event-book-register:hover
    "[&:hover:not(:disabled)]:[background:#E9AD5E] [&:hover:not(:disabled)]:text-[#102c21]",
    //  .event-book-register:hover .event-book-register__arrow
    String.raw`[&:hover_.event-book-register\_\_arrow]:[border-color:rgb(16_44_33_/_30%)]`,
    //  .event-book-register:disabled
    "[&:disabled]:px-5 [&:disabled]:[background:#eef4ef] [&:disabled]:text-[#577262] [&:disabled]:cursor-default",
    //  .event-book-register:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#E9AD5E] [&:focus-visible]:[outline-offset:4px]",
    // @media (prefers-reduced-motion: reduce) .event-book-register
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "event-book-register__arrow": [
    "event-book-register__arrow",
    "grid place-items-center w-8 h-8 flex-none [border:1px_solid_rgb(255_255_255_/_30%)] rounded-[50%]",
  ].join(" "),
  "event-book-cover": [
    "event-book-cover",
    "absolute [z-index:1] [inset:0_0_0_50%] pointer-events-none [transform-origin:left_center] [transform-style:preserve-3d]",
    // @media (width<=767px) .event-book-cover
    "[@media(width<=767px)]:[inset:0]",
    // @media (prefers-reduced-motion: reduce) .event-book-cover
    "[@media(prefers-reduced-motion:_reduce)]:hidden",
  ].join(" "),
  "event-book-cover__front": [
    "event-book-cover__front",
    "absolute [inset:0] flex flex-col justify-between gap-6 [padding:clamp(1.5rem,_3vw,_3rem)] [border:1px_solid_rgb(16_44_33_/_28%)]",
    "[border-radius:0_9px_9px_0] backface-hidden overflow-hidden bg-[var(--book-cloth)]",
    "[background-image:linear-gradient(90deg,_rgb(0_0_0_/_18%),_transparent_8%,_rgb(255_255_255_/_6%)_60%,_transparent)] text-[var(--book-ink)]",
    "[transform:translateZ(1px)]",
    // @media (width<=639px) .event-book-cover__front
    "[@media(width<=639px)]:p-8",
  ].join(" "),
  "event-book-cover__back": [
    "event-book-cover__back",
    "absolute [inset:0] flex flex-col justify-center gap-4 [padding:clamp(1.5rem,_3vw,_3rem)] [border:1px_solid_rgb(16_44_33_/_28%)]",
    "[border-radius:0_9px_9px_0] backface-hidden overflow-hidden items-center [background:#f7faf5] text-[#577262]",
    "[transform:rotateY(180deg)_translateZ(1px)] [box-shadow:inset_10px_0_20px_-10px_rgb(23_61_46_/_20%)]",
    // @media (width<=639px) .event-book-cover__back
    "[@media(width<=639px)]:p-8",
    //  .event-book-cover__back img
    "[&_img]:[width:clamp(5rem,_8vw,_7rem)] [&_img]:h-auto [&_img]:object-contain",
    //  .event-book-cover__back span
    "[&_span]:font-editorial [&_span]:[font-size:1.25rem] [&_span]:text-center",
  ].join(" "),
  "event-book-pages--open": [
    "event-book-pages--open",
    //  .event-book-pages--open .event-book-cover
    "[&_.event-book-cover]:opacity-[0] [&_.event-book-cover]:[transition:opacity_160ms_ease]",
  ].join(" "),
  "event-book-cover__publisher": [
    "event-book-cover__publisher",
    "[font-size:1rem]",
  ].join(" "),
  "event-book-cover__title": [
    "event-book-cover__title",
    "font-editorial [font-size:var(--open-title-size)] font-semibold [line-height:1.1] [overflow-wrap:anywhere]",
  ].join(" "),
  "event-book-cover__date": [
    "event-book-cover__date",
    "[font-size:1rem]",
  ].join(" "),
};

export function bookStylesClasses(names) {
  return names.split(/\s+/).filter(Boolean).map(name => bookStyles[name] ?? name).join(" ");
}
