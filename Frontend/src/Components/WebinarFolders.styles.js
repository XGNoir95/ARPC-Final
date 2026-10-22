// Tailwind utilities for this component, grouped by element and state.
// Semantic classes remain as interaction/test hooks; they define no CSS.
// Keep complete utility strings here so Tailwind can discover every variant.
export const webinarStyles = {
  "webinar-folders": [
    "webinar-folders",
    "relative isolate [--folder-step:3rem] [--folder-inset:1rem] [--folder-cover-height:clamp(24rem,_33vw,_28rem)]",
    "[--folder-front-top:calc((var(--folder-count)_-_1)_*_var(--folder-step))] text-ink",
    // @media (width<=639px) .webinar-folders
    "[@media(width<=639px)]:[--folder-inset:0.5rem] [@media(width<=639px)]:[--folder-cover-height:26rem]",
    // @media (width>639px) and (width<=767px) .webinar-folders
    "[@media(width>639px)_and_(width<=767px)]:[--folder-cover-height:26rem]",
  ].join(" "),
  "webinar-folder-basket": [
    "webinar-folder-basket",
    "relative isolate [padding:4rem_clamp(1.25rem,_2.5vw,_2rem)] [border:3px_solid_var(--color-muted)] [border-radius:1.5rem_1.5rem_2.75rem_2.75rem]",
    "bg-raised [background-image:url(./assets/basket-weave.svg)] dark:[background-blend-mode:multiply] [background-size:32px_32px]",
    "[box-shadow:inset_0_0_0_3px_var(--color-chart-line),_0_8px_0_-3px_var(--color-chart-line),_0_16px_28px_-20px_rgb(23_61_46_/_35%)] overflow-hidden",
    // @media (width<=639px) .webinar-folder-basket
    "[@media(width<=639px)]:py-8",
    //  .webinar-folder-basket::before
    "[&::before]:content-[''] [&::before]:absolute [&::before]:[inset:8px] [&::before]:[border:3px_solid_var(--color-chart-line)]",
    "[&::before]:[border-radius:1rem_1rem_2.15rem_2.15rem] [&::before]:[box-shadow:inset_0_0_0_1px_var(--color-field)] [&::before]:pointer-events-none",
  ].join(" "),
  "webinar-folder-deck": [
    "webinar-folder-deck",
    "relative isolate max-w-336 [min-height:calc(var(--folder-cover-height)_+_var(--folder-front-top))] mx-auto",
    // @media (hover: hover) and (pointer: fine) .webinar-folder-deck[data-open="false"] .webinar-file:hover .webinar-folder-cover
    "[@media(hover:_hover)_and_(pointer:_fine)]:[&[data-open=false]_.webinar-file:hover_.webinar-folder-cover]:[transform:translateY(-3rem)_rotateX(6deg)]",
    //  .webinar-folder-deck[data-open="false"] .webinar-folder-cover:focus-visible
    "[&[data-open=false]_.webinar-folder-cover:focus-visible]:[transform:translateY(-3rem)]",
    // @media (width<=639px) .webinar-folder-deck[data-open="false"] .webinar-folder-cover:focus-visible
    "[@media(width<=639px)_and_(prefers-reduced-motion:no-preference)]:[&[data-open=false]_.webinar-folder-cover:focus-visible]:[transform:translateY(-1rem)]",
    //  .webinar-folder-deck[data-open="true"]
    "[&[data-open=true]]:[padding-top:calc(var(--folder-front-top)_+_var(--folder-cover-height)_*_0.117)]",
    //  .webinar-folder-deck[data-open="true"] .webinar-file:not(.webinar-file--open) .webinar-folder-cover__summary
    String.raw`[&[data-open=true]_.webinar-file:not(.webinar-file--open)_.webinar-folder-cover\_\_summary]:invisible`,
    // @media (width<=639px) .webinar-folder-deck[data-open="false"] .webinar-file:hover .webinar-folder-cover
    "[@media(width<=639px)_and_(prefers-reduced-motion:no-preference)]:[&[data-open=false]_.webinar-file:hover_.webinar-folder-cover]:[transform:translateY(-1rem)]",
    // @media (prefers-reduced-motion: reduce) .webinar-folder-deck[data-open="false"] .webinar-file:hover .webinar-folder-cover
    "[@media(prefers-reduced-motion:_reduce)]:[&[data-open=false]_.webinar-file:hover_.webinar-folder-cover]:[transform:none]",
    // @media (prefers-reduced-motion: reduce) .webinar-folder-deck[data-open="false"] .webinar-folder-cover:focus-visible
    "[@media(prefers-reduced-motion:_reduce)]:[&[data-open=false]_.webinar-folder-cover:focus-visible]:[transform:none]",
  ].join(" "),
  "webinar-file": [
    "webinar-file",
    "absolute [z-index:calc(var(--folder-count)_-_var(--folder-rank))] [top:calc(var(--folder-depth)_*_var(--folder-step))]",
    "[inset-inline:calc(var(--folder-rank)_*_var(--folder-inset))] [perspective:1400px]",
    "[transition:top_700ms_cubic-bezier(0.22,_1,_0.36,_1),_left_700ms_cubic-bezier(0.22,_1,_0.36,_1),_right_700ms_cubic-bezier(0.22,_1,_0.36,_1),_transform_350ms_ease,_opacity_350ms_ease]",
    //  .webinar-file > h3
    "[&_>_h3]:m-0",
    // @media (prefers-reduced-motion: reduce) .webinar-file
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "webinar-file--departing": [
    "webinar-file--departing",
    "[transform:translateY(1.25rem)_rotate(-2deg)_scale(0.97)] opacity-[0.45]",
  ].join(" "),
  "webinar-folder-cover": [
    "webinar-folder-cover",
    "relative block w-full h-[var(--folder-cover-height)] p-0 [border:0] [background:transparent] text-[var(--folder-ink)] cursor-pointer",
    "text-center [transform-origin:center_bottom] [transition:transform_650ms_cubic-bezier(0.22,_1,_0.36,_1),_opacity_300ms_ease]",
    //  .webinar-folder-cover:focus-visible
    "[&:focus-visible]:[outline:none]",
    //  .webinar-folder-cover:focus-visible .webinar-folder-shape path
    "[&:focus-visible_.webinar-folder-shape_path]:[stroke:var(--folder-ink)] [&:focus-visible_.webinar-folder-shape_path]:[stroke-width:3px]",
    "[&:focus-visible_.webinar-folder-shape_path]:[vector-effect:non-scaling-stroke]",
    // @media (prefers-reduced-motion: reduce) .webinar-folder-cover
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "webinar-folder-shape": [
    "webinar-folder-shape",
    "absolute [inset:0] w-full h-full overflow-visible [filter:drop-shadow(0_8px_12px_rgb(23_61_46_/_16%))] pointer-events-none",
    //  .webinar-folder-shape path
    "[&_path]:[stroke:var(--color-muted)] [&_path]:[stroke-width:1.25px] [&_path]:[vector-effect:non-scaling-stroke]",
  ].join(" "),
  "webinar-folder-cover__tab": [
    "webinar-folder-cover__tab",
    "absolute top-[2.7%] [left:calc(var(--folder-tab-left)_+_2.5%)] flex items-center h-[6%] w-[var(--folder-tab-width)]",
    "[font-size:clamp(0.75rem,_1.2vw,_0.95rem)] font-semibold text-left whitespace-nowrap",
    // @media (width<=639px) .webinar-folder-cover__tab
    "[@media(width<=639px)]:[font-size:0.75rem]",
  ].join(" "),
  "webinar-folder-cover__format": [
    "webinar-folder-cover__format",
    "overflow-hidden text-ellipsis",
    // @media (width<=639px) .webinar-folder-cover__format
    "[@media(width<=639px)]:hidden",
  ].join(" "),
  "webinar-folder-cover__short-date": [
    "webinar-folder-cover__short-date",
    "hidden",
    // @media (width<=639px) .webinar-folder-cover__short-date
    "[@media(width<=639px)]:[display:inline]",
  ].join(" "),
  "webinar-folder-cover__summary": [
    "webinar-folder-cover__summary",
    "absolute [inset:20%_clamp(1.25rem,_4vw,_3rem)_1.5rem] grid [grid-template-columns:minmax(0,_0.9fr)_minmax(0,_1.1fr)]",
    "[grid-template-rows:1fr_auto] [column-gap:clamp(1.25rem,_3vw,_2.5rem)] gap-y-5 text-left",
    // @media (width<=767px) .webinar-folder-cover__summary
    "[@media(width<=767px)]:[inset:19%_1.25rem_1.25rem] [@media(width<=767px)]:[grid-template-columns:1fr]",
    "[@media(width<=767px)]:[grid-template-rows:8rem_1fr_auto] [@media(width<=767px)]:gap-3.5",
  ].join(" "),
  "webinar-folder-cover__visual": [
    "webinar-folder-cover__visual",
    "relative [grid-row:1_/_-1] min-h-0 overflow-hidden p-[0.4rem] [border:1px_solid_var(--folder-ink)] [border-radius:3px] [background:var(--color-soft)]",
    "[box-shadow:6px_6px_0_color-mix(in_srgb,_var(--folder-ink)_18%,_transparent)]",
    // @media (width<=767px) .webinar-folder-cover__visual
    "[@media(width<=767px)]:[grid-row:auto]",
    //  .webinar-folder-cover__visual img
    "[&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:[object-position:center_40%] [&_img]:[filter:saturate(0.65)]",
  ].join(" "),
  "webinar-folder-cover__video": [
    "webinar-folder-cover__video",
    "absolute right-4 bottom-4 grid place-items-center w-11 h-11 rounded-[50%] [background:var(--color-soft)] text-ink",
    // @media (width<=767px) .webinar-folder-cover__video
    "[@media(width<=767px)]:right-3.5 [@media(width<=767px)]:bottom-3.5 [@media(width<=767px)]:w-9 [@media(width<=767px)]:h-9",
    //  .webinar-folder-cover__video svg
    "[&_svg]:w-5 [&_svg]:h-5",
  ].join(" "),
  "webinar-folder-cover__copy": [
    "webinar-folder-cover__copy",
    "flex flex-col justify-center min-w-0 gap-4",
  ].join(" "),
  "webinar-folder-cover__title": [
    "webinar-folder-cover__title",
    "block max-w-[24ch] font-editorial [font-size:clamp(1.75rem,_3.2vw,_3rem)] font-semibold [line-height:1.08] [letter-spacing:-0.025em]",
    "text-balance",
    // @media (width<=639px) .webinar-folder-cover__title
    "[@media(width<=639px)]:[font-size:1.6rem]",
    // @media (width>639px) and (width<=767px) .webinar-folder-cover__title
    "[@media(width>639px)_and_(width<=767px)]:[font-size:1.75rem]",
  ].join(" "),
  "webinar-folder-cover__description": [
    "webinar-folder-cover__description",
    "block max-w-[42ch] font-sans [font-size:clamp(0.875rem,_1.15vw,_1rem)] font-normal [line-height:1.65] text-justify",
    // @media (width<=1023px) .webinar-folder-cover__description
    "[@media(width<=1023px)]:hidden",
  ].join(" "),
  "webinar-folder-cover__footer": [
    "webinar-folder-cover__footer",
    "flex items-center justify-between flex-wrap gap-3 w-full pt-4 [border-top:1px_solid_color-mix(in_srgb,_var(--folder-ink)_35%,_transparent)]",
    "font-sans [font-size:0.875rem] font-normal [line-height:1.5]",
    // @media (width<=767px) .webinar-folder-cover__footer
    "[@media(width<=767px)]:pt-3 [@media(width<=767px)]:[font-size:0.75rem]",
    //  .webinar-folder-cover__footer .webinar-folder-status
    "[&_.webinar-folder-status]:[padding:0.3rem_0.6rem] [&_.webinar-folder-status]:rounded-[999px]",
    "[&_.webinar-folder-status]:[background:var(--color-soft)] [&_.webinar-folder-status]:text-ink",
  ].join(" "),
  "webinar-file--open": [
    "webinar-file--open",
    "[&.webinar-file--open]:[z-index:10] [&.webinar-file--open]:top-[var(--folder-front-top)] [&.webinar-file--open]:[inset-inline:0] [&.webinar-file--open]:pointer-events-none",
    //  .webinar-file--open .webinar-folder-cover
    "[&_.webinar-folder-cover]:[transform:translateY(1rem)_rotateX(-88deg)] [&_.webinar-folder-cover]:opacity-[0]",
  ].join(" "),
  "webinar-folder-status": [
    "webinar-folder-status",
    "inline-flex items-center gap-[0.4rem] [font-size:0.8rem] font-medium [line-height:1.4]",
    //  .webinar-folder-status > span
    "[&_>_span]:flex-none [&_>_span]:w-[6px] [&_>_span]:h-[6px] [&_>_span]:rounded-[50%] [&_>_span]:[box-shadow:0_0_0_1px_rgb(255_255_255_/_60%)]",
    //  .webinar-folder-status[data-status="upcoming"] > span
    "[&[data-status=upcoming]_>_span]:[background:#E9AD5E] [&[data-status=upcoming]_>_span]:text-brand",
    //  .webinar-folder-status[data-status="finished"] > span
    "[&[data-status=finished]_>_span]:[background:#64748b]",
  ].join(" "),
  "webinar-folder-panel": [
    "webinar-folder-panel",
    "relative [z-index:5] [border:1px_solid_var(--color-chart-line)] [border-radius:0_12px_12px_12px] [background:var(--color-field)]",
    "[box-shadow:0_5px_0_-2px_var(--color-raised),_0_12px_24px_-12px_rgb(23_61_46_/_16%)]",
    //  .webinar-folder-panel:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#E9AD5E] [&:focus-visible]:[outline-offset:4px]",
  ].join(" "),
  "webinar-folder-open-tab": [
    "webinar-folder-open-tab",
    "absolute bottom-full left-0 flex items-center justify-center min-h-11 [padding:0.75rem_1.5rem] [border:1px_solid_var(--color-chart-line)] [border-bottom:0]",
    "[border-radius:12px_24px_0_0] [background:var(--color-field)] [font-size:0.875rem] font-semibold",
  ].join(" "),
  "webinar-folder-close": [
    "webinar-folder-close",
    "absolute [z-index:1] top-4 right-4 grid place-items-center w-11 h-11 rounded-[50%] [background:var(--color-soft)] text-ink cursor-pointer",
    //  .webinar-folder-close svg
    "[&_svg]:w-5 [&_svg]:h-5",
    //  .webinar-folder-close:hover
    "[&:hover]:[background:#E9AD5E] [&:hover]:text-brand",
    //  .webinar-folder-close:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#E9AD5E] [&:focus-visible]:[outline-offset:3px]",
  ].join(" "),
  "webinar-folder-content": [
    "webinar-folder-content",
    "grid [grid-template-columns:minmax(0,_0.8fr)_minmax(0,_1.2fr)] [padding:clamp(1rem,_2vw,_1.5rem)] [gap:clamp(1.5rem,_3vw,_3rem)]",
    "[animation:webinar-folder-reveal_400ms_180ms_ease-out_both]",
    // @media (width<=639px) .webinar-folder-content
    "[@media(width<=639px)]:[grid-template-columns:1fr] [@media(width<=639px)]:[padding:4rem_1rem_1rem] [@media(width<=639px)]:gap-5",
    "[@media(width<=639px)]:pt-17",
    // @media (width>639px) and (width<=1023px) .webinar-folder-content
    "[@media(width>639px)_and_(width<=1023px)]:[grid-template-columns:1fr] [@media(width>639px)_and_(width<=1023px)]:pt-17",
    // @media (prefers-reduced-motion: reduce) .webinar-folder-content
    "[@media(prefers-reduced-motion:_reduce)]:[animation:none]",
  ].join(" "),
  "webinar-folder-image": [
    "webinar-folder-image",
    "relative min-h-96 overflow-hidden [border-radius:6px] [background:var(--color-raised)]",
    // @media (width<=639px) .webinar-folder-image
    "[@media(width<=639px)]:min-h-0 [@media(width<=639px)]:[aspect-ratio:4_/_3]",
    "[@media(width<=479px)]:min-h-48",
    // @media (width>639px) and (width<=1023px) .webinar-folder-image
    "[@media(width>639px)_and_(width<=1023px)]:min-h-0 [@media(width>639px)_and_(width<=1023px)]:[aspect-ratio:16_/_7]",
    //  .webinar-folder-image > img
    "[&_>_img]:absolute [&_>_img]:[inset:0] [&_>_img]:w-full [&_>_img]:h-full [&_>_img]:object-cover",
  ].join(" "),
  "webinar-folder-image__caption": [
    "webinar-folder-image__caption",
    "absolute [z-index:1] [inset:auto_0_0] flex items-center gap-4 p-5 bg-action text-on-action",
    // @media (width<=639px) .webinar-folder-image__caption
    "[@media(width<=639px)]:gap-3 [@media(width<=639px)]:p-4",
    "[@media(width<=479px)]:[&_>_span]:hidden",
    "[&_p]:min-w-0 [&_p]:[overflow-wrap:anywhere]",
    //  .webinar-folder-image__caption > span
    "[&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:flex-none [&_>_span]:w-12 [&_>_span]:h-12",
    "[&_>_span]:[border:1px_solid_rgb(255_255_255_/_50%)] [&_>_span]:rounded-[50%]",
    //  .webinar-folder-image__caption svg
    "[&_svg]:w-[1.3rem] [&_svg]:h-[1.3rem]",
    //  .webinar-folder-image__caption p
    "[&_p]:font-editorial [&_p]:[font-size:1.65rem] [&_p]:font-semibold [&_p]:[line-height:1.15]",
    // @media (width<=639px) .webinar-folder-image__caption p
    "[@media(width<=639px)]:[&_p]:[font-size:1.4rem]",
    //  .webinar-folder-image__caption p > span
    "[&_p_>_span]:block [&_p_>_span]:mt-2 [&_p_>_span]:font-sans [&_p_>_span]:[font-size:0.875rem] [&_p_>_span]:font-normal",
  ].join(" "),
  "webinar-folder-details": [
    "webinar-folder-details",
    "flex flex-col min-w-0 [padding:2.5rem_0.5rem_0.5rem_0]",
    // @media (width<=1023px) .webinar-folder-details
    "[@media(width<=1023px)]:[padding:0_0.25rem_0.5rem]",
    //  .webinar-folder-details h3
    "[&_h3]:font-editorial [&_h3]:[font-size:clamp(2rem,_3vw,_3rem)] [&_h3]:font-semibold [&_h3]:[line-height:1.08]",
    "[&_h3]:[letter-spacing:-0.02em]",
    // @media (width<=639px) .webinar-folder-details h3
    "[@media(width<=639px)]:[&_h3]:[font-size:clamp(1.5rem,_5vw,_2rem)]",
    "[&_h3]:[overflow-wrap:anywhere]",
  ].join(" "),
  "webinar-folder-metadata": [
    "webinar-folder-metadata",
    "grid [grid-template-columns:minmax(0,_1.3fr)_repeat(2,_minmax(0,_1fr))] gap-4 mt-6 py-[1.1rem] [border-block:1px_solid_var(--color-raised)]",
    // @media (width<=639px) .webinar-folder-metadata
    "[@media(width<=639px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]",
    //  .webinar-folder-metadata dt
    "[&_dt]:flex [&_dt]:items-center [&_dt]:gap-2 [&_dt]:text-muted [&_dt]:[font-size:0.875rem] [&_dt]:[line-height:1.5]",
    //  .webinar-folder-metadata dt svg
    "[&_dt_svg]:flex-none [&_dt_svg]:w-[1.1rem] [&_dt_svg]:h-[1.1rem]",
    //  .webinar-folder-metadata dd
    "[&_dd]:mt-2 [&_dd]:[font-size:1rem] [&_dd]:font-semibold [&_dd]:[line-height:1.5]",
    //  .webinar-folder-metadata dd > span
    "[&_dd_>_span]:block [&_dd_>_span]:[font-size:0.8rem] [&_dd_>_span]:font-normal [&_dd_>_span]:text-muted",
    // @media (width<=639px) .webinar-folder-metadata > div:last-child
    "[@media(width<=639px)]:[&_>_div:last-child]:[grid-column:1_/_-1]",
  ].join(" "),
  "webinar-folder-description": [
    "webinar-folder-description",
    "mt-5 [font-size:1rem] [line-height:1.75] text-justify max-sm:text-left",
  ].join(" "),
  "webinar-folder-takeaways": [
    "webinar-folder-takeaways",
    "flex flex-col gap-[0.6rem] mt-[1.1rem] [font-size:0.95rem] [line-height:1.5]",
    //  .webinar-folder-takeaways li
    "[&_li]:flex [&_li]:gap-[0.65rem] [&_li]:[align-items:flex-start]",
    //  .webinar-folder-takeaways svg
    "[&_svg]:flex-none [&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem] [&_svg]:mt-[0.15rem]",
  ].join(" "),
  "webinar-folder-actions": [
    "webinar-folder-actions",
    "flex [align-items:end] justify-between flex-wrap gap-5 mt-auto pt-7",
    // @media (width<=639px) .webinar-folder-actions
    "[@media(width<=639px)]:pt-5",
    //  .webinar-folder-actions > p
    "[&_>_p]:[flex:1_1_14rem] [&_>_p]:max-w-[40ch] [&_>_p]:text-muted [&_>_p]:[font-size:0.8rem] [&_>_p]:[line-height:1.6]",
  ].join(" "),
  "webinar-folder-register": [
    "webinar-folder-register",
    "inline-flex items-center justify-center gap-5 min-h-13 ml-auto [padding:0.65rem_0.65rem_0.65rem_1.5rem] rounded-[999px] bg-action",
    "text-on-action [font-size:1.05rem] font-semibold [line-height:1.25] no-underline [transition:background-color_200ms_ease,_color_200ms_ease]",
    //  .webinar-folder-register > span
    "[&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:flex-none [&_>_span]:w-8 [&_>_span]:h-8",
    "[&_>_span]:[border:1px_solid_rgb(255_255_255_/_30%)] [&_>_span]:rounded-[50%]",
    //  .webinar-folder-register svg
    "[&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem]",
    //  .webinar-folder-register:hover
    "[&:hover:not(:disabled)]:[background:#E9AD5E] [&:hover:not(:disabled)]:text-brand",
    //  .webinar-folder-register:hover > span
    "[&:hover_>_span]:[border-color:rgb(16_44_33_/_30%)]",
    //  .webinar-folder-register:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#E9AD5E] [&:focus-visible]:[outline-offset:4px]",
    //  .webinar-folder-register:disabled
    "[&:disabled]:px-5 [&:disabled]:[background:var(--color-soft)] [&:disabled]:text-muted",
    // @media (prefers-reduced-motion: reduce) .webinar-folder-register
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "webinar-folder-toolbar": [
    "webinar-folder-toolbar",
    "relative flex flex-col items-center gap-3 mt-6",
    //  .webinar-folder-toolbar > p
    "[&_>_p]:flex [&_>_p]:items-center [&_>_p]:justify-center [&_>_p]:gap-[0.65rem] [&_>_p]:[font-size:0.875rem] [&_>_p]:[line-height:1.5]",
    "[&_>_p]:text-center",
    // @media (width<=639px) .webinar-folder-toolbar > p
    "[@media(width<=639px)]:[&_>_p]:[font-size:0.8rem] [@media(width<=639px)]:[&_>_p]:w-full",
    //  .webinar-folder-toolbar > p svg
    "[&_>_p_svg]:flex-none [&_>_p_svg]:w-[1.1rem] [&_>_p_svg]:h-[1.1rem] [&_>_p_svg]:text-muted",
  ].join(" "),
  "webinar-folder-controls": [
    "webinar-folder-controls",
    "flex items-center gap-3 p-[0.4rem] [border:1px_solid_var(--color-chart-line)] rounded-[999px] [background:var(--color-soft)]",
    // @media (width<=639px) .webinar-folder-controls
    "[@media(width<=639px)]:mx-auto",
    //  .webinar-folder-controls button
    "[&_button]:grid [&_button]:place-items-center [&_button]:w-11 [&_button]:h-11 [&_button]:[border:1px_solid_var(--color-chart-line)] [&_button]:rounded-[50%]",
    "[&_button]:[background:var(--color-surface)] [&_button]:text-ink [&_button]:cursor-pointer [&_button]:[transition:background-color_180ms_ease]",
    //  .webinar-folder-controls button svg
    "[&_button_svg]:w-[1.1rem] [&_button_svg]:h-[1.1rem]",
    //  .webinar-folder-controls button:hover:not(:disabled)
    "[&_button:hover:not(:disabled)]:[background:#E9AD5E] [&_button:hover:not(:disabled)]:text-brand",
    //  .webinar-folder-controls button:focus-visible
    "[&_button:focus-visible]:[outline:2px_solid_var(--color-ink)] [&_button:focus-visible]:[outline-offset:3px]",
    //  .webinar-folder-controls button:disabled
    "[&_button:disabled]:opacity-[0.4] [&_button:disabled]:cursor-default",
    // @media (prefers-reduced-motion: reduce) .webinar-folder-controls button
    "[@media(prefers-reduced-motion:_reduce)]:[&_button]:[transition:none]",
  ].join(" "),
  "webinar-folder-position": [
    "webinar-folder-position",
    "min-w-16 text-center [font-size:0.875rem] font-semibold tabular-nums",
    //  .webinar-folder-position > span
    "[&_>_span]:text-muted [&_>_span]:font-normal",
  ].join(" "),
};

export function webinarStylesClasses(names) {
  return names.split(/\s+/).filter(Boolean).map(name => webinarStyles[name] ?? name).join(" ");
}
