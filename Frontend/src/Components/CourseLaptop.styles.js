// Tailwind utilities for this component, grouped by element and state.
// Semantic classes remain as interaction/test hooks; they define no CSS.
// Keep complete utility strings here so Tailwind can discover every variant.
export const courseStyles = {
  "course-study-desk": [
    "course-study-desk",
    "[padding:clamp(1.25rem,_2.5vw,_2.25rem)] [border:1px_solid_#a9bfb0] [border-radius:1.5rem] [background:#eef4ef]",
    "[box-shadow:inset_0_-7px_0_#dce8df]",
    // @media (width<=639px) .course-study-desk
    "[@media(width<=639px)]:[padding:1rem_0.5rem] [@media(width<=639px)]:[border-radius:1rem]",
  ].join(" "),
  "course-laptop": [
    "course-laptop",
    "w-full mx-auto px-5 text-[#173d2e]",
    // @media (width<=639px) .course-laptop
    "[@media(width<=639px)]:px-2",
  ].join(" "),
  "course-laptop-lid": [
    "course-laptop-lid",
    "relative [border:10px_solid_#20392d] [border-top-width:22px] [border-bottom-width:22px] [border-radius:24px_24px_8px_8px]",
    "[background:#20392d] [box-shadow:0_15px_30px_-20px_rgb(23_61_46_/_35%)]",
    // @media (width<=639px) .course-laptop-lid
    "[@media(width<=639px)]:[border-top-width:18px] [@media(width<=639px)]:[border-bottom-width:14px]",
    "[@media(width<=639px)]:[border-radius:16px_16px_5px_5px] [@media(width<=639px)]:[border-inline-width:5px]",
    //  .course-laptop-lid::before
    "[&::before]:content-[''] [&::before]:absolute [&::before]:top-[-15px] [&::before]:[left:calc(50%_-_3px)] [&::before]:w-[6px]",
    "[&::before]:h-[6px] [&::before]:rounded-[50%] [&::before]:[background:#758b7e] [&::before]:[box-shadow:inset_0_0_0_2px_#304c3d]",
    // @media (width<=639px) .course-laptop-lid::before
    "[@media(width<=639px)]:[&::before]:top-[-12px] [@media(width<=639px)]:[&::before]:w-[5px] [@media(width<=639px)]:[&::before]:h-[5px]",
  ].join(" "),
  "course-laptop-screen": [
    "course-laptop-screen",
    "overflow-hidden [border-radius:7px] [background:#eef4ef]",
  ].join(" "),
  "course-desktop-bar": [
    "course-desktop-bar",
    "grid [grid-template-columns:minmax(0,_1fr)_auto_minmax(0,_1fr)] items-center gap-4 min-h-16 [padding:0.65rem_1.25rem]",
    "[border-bottom:1px_solid_#b9cdbd] [background:#e6ede8] [box-shadow:inset_0_1px_0_#f7faf5] [font-size:0.875rem] [line-height:1.5]",
    // @media (width<=639px) .course-desktop-bar
    "[@media(width<=639px)]:[grid-template-columns:1fr_auto] [@media(width<=639px)]:[padding:0.5rem_0.75rem]",
    "[@media(width<=639px)]:[font-size:0.75rem]",
  ].join(" "),
  "course-desktop-app": [
    "course-desktop-app",
    "flex items-center gap-5 min-w-0",
    // @media (width<=639px) .course-desktop-app
    "[@media(width<=639px)]:gap-3",
  ].join(" "),
  "course-window-dots": [
    "course-window-dots",
    "flex flex-none gap-[0.45rem]",
    //  .course-window-dots > span
    "[&_>_span]:w-[11px] [&_>_span]:h-[11px] [&_>_span]:[border:1px_solid_rgb(23_61_46_/_15%)] [&_>_span]:rounded-[50%]",
    "[&_>_span]:[background:#ce6b61] [&_>_span]:[box-shadow:inset_0_1px_0_rgb(255_255_255_/_25%)]",
    //  .course-window-dots > span:nth-child(2)
    "[&_>_span:nth-child(2)]:[background:#E9AD5E]",
    //  .course-window-dots > span:nth-child(3)
    "[&_>_span:nth-child(3)]:[background:#6f9e80]",
  ].join(" "),
  "course-desktop-brand": [
    "course-desktop-brand",
    "flex items-center min-w-0 gap-[0.6rem] font-semibold",
    //  .course-desktop-brand img
    "[&_img]:flex-none [&_img]:w-[44px] [&_img]:h-[44px] [&_img]:rounded-[50%]",
    //  .course-desktop-brand > span
    "[&_>_span]:overflow-hidden [&_>_span]:text-ellipsis [&_>_span]:whitespace-nowrap",
    // @media (width<=639px) .course-desktop-brand > span
    "[@media(width<=639px)]:[&_>_span]:hidden",
  ].join(" "),
  "course-desktop-location": [
    "course-desktop-location",
    "text-[#173d2e] font-semibold text-center",
    // @media (width<=639px) .course-desktop-location
    "[@media(width<=639px)]:hidden",
  ].join(" "),
  "course-view-controls": [
    "course-view-controls",
    "flex [justify-self:end] gap-1 p-[0.2rem] [border:1px_solid_#b9cdbd] [border-radius:9px] [background:#dce8df]",
    //  .course-view-controls button
    "[&_button]:grid [&_button]:place-items-center [&_button]:w-11 [&_button]:h-10 [&_button]:[border-radius:6px]",
    "[&_button]:[background:transparent] [&_button]:text-[#577262] [&_button]:cursor-pointer",
    //  .course-view-controls button[aria-pressed="true"]
    "[&_button[aria-pressed=true]]:[background:#f7faf5] [&_button[aria-pressed=true]]:text-[#173d2e]",
    "[&_button[aria-pressed=true]]:[box-shadow:0_1px_3px_rgb(23_61_46_/_12%)]",
    //  .course-view-controls button:hover:not(:disabled)
    "[&_button:hover:not(:disabled)]:text-[#173d2e] [&_button:hover:not(:disabled)]:[background:#f7faf5]",
    //  .course-view-controls button:focus-visible
    "[&_button:focus-visible]:[outline:2px_solid_#173d2e] [&_button:focus-visible]:[outline-offset:2px]",
    //  .course-view-controls button:disabled
    "[&_button:disabled]:opacity-[0.5] [&_button:disabled]:cursor-default",
    //  .course-view-controls svg
    "[&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem]",
  ].join(" "),
  "course-workspace": [
    "course-workspace",
    "[min-height:clamp(27rem,_36vw,_34rem)] flex flex-col justify-center gap-8 [padding:clamp(1.5rem,_4vw,_3rem)]",
    "[background:#eef4ef_url(./assets/courses/desktop-wave.svg)_center_/_cover]",
    // @media (width<=639px) .course-workspace
    "[@media(width<=639px)]:min-h-112 [@media(width<=639px)]:gap-6 [@media(width<=639px)]:[padding:1.5rem_0.75rem]",
    //  .course-workspace[data-open="false"] .course-folder-grid
    "[&[data-open=false]_.course-folder-grid]:my-auto",
    //  .course-workspace[data-open="false"][data-view="list"] .course-folder-grid
    "[&[data-open=false][data-view=list]_.course-folder-grid]:[grid-template-columns:1fr]",
    "[&[data-open=false][data-view=list]_.course-folder-grid]:gap-3 [&[data-open=false][data-view=list]_.course-folder-grid]:max-w-208",
    //  .course-workspace[data-open="false"][data-view="list"] .course-folder
    "[&[data-open=false][data-view=list]_.course-folder]:w-full [&[data-open=false][data-view=list]_.course-folder]:[grid-column:auto]",
    //  .course-workspace[data-open="false"][data-view="list"] .course-folder-button
    "[&[data-open=false][data-view=list]_.course-folder-button]:flex-row [&[data-open=false][data-view=list]_.course-folder-button]:gap-5",
    "[&[data-open=false][data-view=list]_.course-folder-button]:max-w-[none]",
    "[&[data-open=false][data-view=list]_.course-folder-button]:[padding:0.75rem_1rem]",
    "[&[data-open=false][data-view=list]_.course-folder-button]:[border-color:#cad9cf]",
    "[&[data-open=false][data-view=list]_.course-folder-button]:[background:#f7faf5]",
    "[&[data-open=false][data-view=list]_.course-folder-button]:text-left",
    //  .course-workspace[data-open="false"][data-view="list"] .course-folder-art
    "[&[data-open=false][data-view=list]_.course-folder-art]:flex-none [&[data-open=false][data-view=list]_.course-folder-art]:w-20",
    "[&[data-open=false][data-view=list]_.course-folder-art]:m-0 [&[data-open=false][data-view=list]_.course-folder-art]:[filter:none]",
    //  .course-workspace[data-open="false"][data-view="list"] .course-folder-art::before
    "[&[data-open=false][data-view=list]_.course-folder-art::before]:[transform:rotate(-4deg)_translateY(-3px)]",
    //  .course-workspace[data-open="true"]
    "[&[data-open=true]]:grid [&[data-open=true]]:[grid-template-columns:minmax(10rem,_0.28fr)_minmax(0,_1fr)]",
    "[&[data-open=true]]:[align-items:start] [&[data-open=true]]:gap-6 [&[data-open=true]]:p-6",
    // @media (width<=639px) .course-workspace[data-open="true"]
    "[@media(width<=639px)]:[&[data-open=true]]:[grid-template-columns:1fr] [@media(width<=639px)]:[&[data-open=true]]:gap-4",
    "[@media(width<=639px)]:[&[data-open=true]]:p-3",
    // @media (width>639px) and (width<=1023px) .course-workspace[data-open="true"]
    "[@media(width>639px)_and_(width<=1023px)]:[&[data-open=true]]:[grid-template-columns:1fr]",
    //  .course-workspace[data-open="true"] .course-folder-grid
    "[&[data-open=true]_.course-folder-grid]:[grid-template-columns:1fr] [&[data-open=true]_.course-folder-grid]:gap-3",
    // @media (width<=639px) .course-workspace[data-open="true"] .course-folder-grid
    "[@media(width<=639px)]:[&[data-open=true]_.course-folder-grid]:gap-2",
    // @media (width>639px) and (width<=1023px) .course-workspace[data-open="true"] .course-folder-grid
    "[@media(width>639px)_and_(width<=1023px)]:[&[data-open=true]_.course-folder-grid]:[grid-template-columns:repeat(var(--course-columns),_minmax(0,_1fr))]",
    "[@media(width>639px)_and_(width<=1023px)]:[&[data-open=true]_.course-folder-grid]:gap-2",
    //  .course-workspace[data-open="true"] .course-folder-button
    "[&[data-open=true]_.course-folder-button]:flex-row [&[data-open=true]_.course-folder-button]:items-center",
    "[&[data-open=true]_.course-folder-button]:gap-3 [&[data-open=true]_.course-folder-button]:p-3",
    "[&[data-open=true]_.course-folder-button]:text-left",
    // @media (width<=639px) .course-workspace[data-open="true"] .course-folder-button
    "[@media(width<=639px)]:[&[data-open=true]_.course-folder-button]:h-full",
    // @media (width>639px) and (width<=1023px) .course-workspace[data-open="true"] .course-folder-button
    "[@media(width>639px)_and_(width<=1023px)]:[&[data-open=true]_.course-folder-button]:flex-col",
    "[@media(width>639px)_and_(width<=1023px)]:[&[data-open=true]_.course-folder-button]:text-center",
    "[@media(width>639px)_and_(width<=1023px)]:[&[data-open=true]_.course-folder-button]:h-full",
    //  .course-workspace[data-open="true"] .course-folder-art
    "[&[data-open=true]_.course-folder-art]:flex-none [&[data-open=true]_.course-folder-art]:w-15",
    "[&[data-open=true]_.course-folder-art]:m-0 [&[data-open=true]_.course-folder-art]:[filter:none]",
    // @media (width<=639px) .course-workspace[data-open="true"] .course-folder-art
    "[@media(width<=639px)]:[&[data-open=true]_.course-folder-art]:w-10",
    //  .course-workspace[data-open="true"] .course-folder-art::before
    "[&[data-open=true]_.course-folder-art::before]:[transform:rotate(-4deg)_translateY(-3px)]",
    //  .course-workspace[data-open="true"] .course-folder-title
    "[&[data-open=true]_.course-folder-title]:[font-size:1.2rem] [&[data-open=true]_.course-folder-title]:[text-wrap:initial]",
    // @media (width<=1023px) .course-workspace[data-open="true"] .course-folder-title
    "[@media(width<=1023px)]:[&[data-open=true]_.course-folder-title]:[font-size:1.05rem]",
    //  .course-workspace[data-open="true"] .course-folder-summary
    "[&[data-open=true]_.course-folder-summary]:[font-size:0.75rem] [&[data-open=true]_.course-folder-summary]:mt-[0.4rem]",
    // @media (width<=639px) .course-workspace[data-open="true"] .course-folder-summary
    "[@media(width<=639px)]:[&[data-open=true]_.course-folder-summary]:mt-1",
    // @media (width<=1023px) .course-workspace[data-open="true"] .course-folder
    "[@media(width<=1023px)]:[&[data-open=true]_.course-folder]:self-stretch",
    // @media (width<=639px) .course-workspace[data-open="false"][data-view="grid"] .course-folder:last-child:nth-child(odd)
    "[@media(width<=639px)]:[&[data-open=false][data-view=grid]_.course-folder:last-child:nth-child(odd)]:[grid-column:1_/_-1]",
    "[@media(width<=639px)]:[&[data-open=false][data-view=grid]_.course-folder:last-child:nth-child(odd)]:w-[50%]",
    "[@media(width<=639px)]:[&[data-open=false][data-view=grid]_.course-folder:last-child:nth-child(odd)]:justify-self-center",
  ].join(" "),
  "course-folder-grid": [
    "course-folder-grid",
    "grid [grid-template-columns:repeat(var(--course-columns),_minmax(0,_1fr))] [align-items:start] [gap:clamp(1rem,_3vw,_3rem)] w-full max-w-264 mx-auto",
    // @media (width<=639px) .course-folder-grid
    "[@media(width<=639px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] [@media(width<=639px)]:[gap:1.25rem_0.25rem]",
  ].join(" "),
  "course-folder": [
    "course-folder",
    "min-w-0",
    //  .course-folder > h3
    "[&_>_h3]:m-0",
  ].join(" "),
  "course-folder-button": [
    "course-folder-button",
    "flex flex-col items-center w-full max-w-84 mx-auto p-3 [border:1px_solid_transparent] [border-radius:12px] [background:transparent]",
    "text-[#173d2e] text-center cursor-pointer [transition:background-color_200ms_ease,_border-color_200ms_ease]",
    // @media (width<=639px) .course-folder-button
    "[@media(width<=639px)]:p-2",
    //  .course-folder-button:hover
    "[&:hover]:[background:#dce8df]",
    //  .course-folder-button:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#173d2e] [&:focus-visible]:[outline-offset:3px] [&:focus-visible]:[background:#dce8df]",
    //  .course-folder-button:hover .course-folder-art
    "[&:hover_.course-folder-art]:[transform:translateY(-4px)]",
    //  .course-folder-button[aria-expanded="true"]
    "[&[aria-expanded=true]]:[background:#fff] [&[aria-expanded=true]]:[border-color:#a9bfb0]",
    // @media (prefers-reduced-motion: reduce) .course-folder-button
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
    // @media (prefers-reduced-motion: reduce) .course-folder-button:hover .course-folder-art
    "[@media(prefers-reduced-motion:_reduce)]:[&:hover_.course-folder-art]:[transform:none]",
  ].join(" "),
  "course-folder-art": [
    "course-folder-art",
    "relative isolate block [width:min(100%,_16rem)] [aspect-ratio:180_/_140] mb-5 text-[var(--course-folder-ink)]",
    "[filter:drop-shadow(0_8px_5px_rgb(23_61_46_/_14%))] [transition:transform_280ms_cubic-bezier(0.22,_1,_0.36,_1)]",
    // @media (width<=639px) .course-folder-art
    "[@media(width<=639px)]:mb-3",
    //  .course-folder-art::before
    "[&::before]:content-[''] [&::before]:absolute [&::before]:[z-index:-1] [&::before]:[inset:22%_10%_9%] [&::before]:[border:1px_solid_#b9cdbd]",
    "[&::before]:[border-radius:3px] [&::before]:[background:#f7faf5] [&::before]:[transform:rotate(-4deg)_translateY(-9px)]",
    //  .course-folder-art > svg:first-child
    "[&_>_svg:first-child]:block [&_>_svg:first-child]:w-full [&_>_svg:first-child]:h-full",
    // @media (prefers-reduced-motion: reduce) .course-folder-art
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "course-folder-illustration": [
    "course-folder-illustration",
    "absolute top-[33%] left-[7%] w-[86%] h-[57%] object-cover [border-radius:3px]",
    "[border:1px_solid_color-mix(in_srgb,_var(--course-folder-ink)_25%,_transparent)]",
  ].join(" "),
  "course-folder-label": [
    "course-folder-label",
    "block min-w-0",
  ].join(" "),
  "course-folder-title": [
    "course-folder-title",
    "block font-editorial [font-size:clamp(1.25rem,_2vw,_1.7rem)] font-semibold [line-height:1.15] text-balance",
    // @media (width<=639px) .course-folder-title
    "[@media(width<=639px)]:[font-size:1.2rem]",
  ].join(" "),
  "course-folder-summary": [
    "course-folder-summary",
    "block mt-[0.6rem] text-[#577262] [font-size:0.8rem] font-normal [line-height:1.5]",
    // @media (width<=639px) .course-folder-summary
    "[@media(width<=639px)]:[font-size:0.75rem]",
  ].join(" "),
  "course-library-dock": [
    "course-library-dock",
    "grid [grid-template-columns:auto_minmax(0,_1fr)_auto] items-center gap-6 w-full max-w-264 [margin:auto_auto_0] [padding:1rem_1.25rem]",
    "[border:1px_solid_#a9bfb0] [border-radius:1rem] [background:#f7faf5] [box-shadow:0_4px_0_#cad9cf,_0_10px_18px_-14px_rgb(23_61_46_/_30%)]",
    // @media (width<=767px) .course-library-dock
    "[@media(width<=767px)]:[grid-template-columns:1fr] [@media(width<=767px)]:gap-3 [@media(width<=767px)]:p-4",
    "[@media(width<=767px)]:[justify-items:center] [@media(width<=767px)]:text-center",
  ].join(" "),
  "course-library-count": [
    "course-library-count",
    //  .course-library-count strong
    "[&_strong]:block [&_strong]:font-editorial [&_strong]:[font-size:1.65rem] [&_strong]:font-semibold [&_strong]:[line-height:1.1]",
    //  .course-library-count > span
    "[&_>_span]:block [&_>_span]:mt-[0.4rem] [&_>_span]:text-[#577262] [&_>_span]:[font-size:0.8rem] [&_>_span]:[line-height:1.5]",
  ].join(" "),
  "course-desktop-hint": [
    "course-desktop-hint",
    "max-w-[30ch] justify-self-center text-[#577262] [font-size:0.875rem] [line-height:1.6]",
    // @media (width<=639px) .course-desktop-hint
    "[@media(width<=639px)]:[font-size:0.8rem]",
  ].join(" "),
  "course-library-open": [
    "course-library-open",
    "inline-flex items-center justify-center gap-4 min-h-12 [padding:0.75rem_1.25rem] rounded-[999px] [background:#173d2e] text-[#fff]",
    "[font-size:0.95rem] font-semibold cursor-pointer [transition:background-color_200ms_ease,_color_200ms_ease]",
    // @media (width<=767px) .course-library-open
    "[@media(width<=767px)]:w-full [@media(width<=767px)]:max-w-64",
    //  .course-library-open svg
    "[&_svg]:flex-none [&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem]",
    //  .course-library-open:hover
    "[&:hover]:[background:#E9AD5E] [&:hover]:text-[#173d2e]",
    //  .course-library-open:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#173d2e] [&:focus-visible]:[outline-offset:3px]",
    // @media (prefers-reduced-motion: reduce) .course-library-open
    "[@media(prefers-reduced-motion:_reduce)]:[transition:none]",
  ].join(" "),
  "course-detail-window": [
    "course-detail-window",
    "relative min-w-0 [align-self:start]",
  ].join(" "),
  "course-detail-transition-layer": [
    "course-detail-transition-layer",
    "absolute [z-index:1] [inset:0] pointer-events-none",
  ].join(" "),
  "course-screen-details": [
    "course-screen-details",
    "min-w-0 [scroll-margin-top:6rem] [padding:clamp(1.25rem,_2.5vw,_2rem)] [border:1px_solid_#cad9cf] [border-radius:12px] [background:#fff]",
    "[animation:course-window-open_360ms_cubic-bezier(0.22,_1,_0.36,_1)_both]",
    // @media (width<=639px) .course-screen-details
    "[@media(width<=639px)]:p-4",
    //  .course-screen-details[data-native-motion="true"]
    "[&[data-native-motion=true]]:[animation:none]",
    //  .course-screen-details:focus
    "[&:focus]:[outline:none]",
    //  .course-screen-details:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#E9AD5E] [&:focus-visible]:[outline-offset:3px]",
    // @media (prefers-reduced-motion: reduce) .course-screen-details
    "[@media(prefers-reduced-motion:_reduce)]:[animation:none]",
  ].join(" "),
  "course-screen-details--outgoing": [
    "course-screen-details--outgoing",
    "[animation:none] [outline:none]",
  ].join(" "),
  "course-detail-toolbar": [
    "course-detail-toolbar",
    "flex items-center justify-between flex-wrap gap-3 mb-6",
  ].join(" "),
  "course-detail-status": [
    "course-detail-status",
    "[padding:0.35rem_0.75rem] rounded-[999px] [background:#eef4ef] [font-size:0.8rem] font-semibold",
  ].join(" "),
  "course-detail-back": [
    "course-detail-back",
    "inline-flex items-center justify-center gap-2 min-h-11 [padding:0.5rem_0.75rem] rounded-[999px] [background:#eef4ef] text-[#173d2e]",
    "[font-size:0.875rem] font-semibold cursor-pointer",
    //  .course-detail-back:hover
    "[&:hover]:[background:#E9AD5E]",
    //  .course-detail-back:focus-visible
    "[&:focus-visible]:[outline:2px_solid_#173d2e] [&:focus-visible]:[outline-offset:3px]",
  ].join(" "),
  "course-detail-intro": [
    "course-detail-intro",
    "grid [grid-template-columns:minmax(0,_1fr)_minmax(8rem,_0.45fr)] items-center gap-6",
    // @media (width<=639px) .course-detail-intro
    "[@media(width<=639px)]:[grid-template-columns:1fr] [@media(width<=639px)]:gap-4",
    //  .course-detail-intro h3
    "[&_h3]:font-editorial [&_h3]:[font-size:clamp(2rem,_3vw,_3rem)] [&_h3]:font-semibold [&_h3]:[line-height:1.08]",
    "[&_h3]:[letter-spacing:-0.025em] [&_h3]:text-balance",
    // @media (width<=639px) .course-detail-intro h3
    "[@media(width<=639px)]:[&_h3]:[font-size:2rem]",
    //  .course-detail-intro img
    "[&_img]:w-full [&_img]:[aspect-ratio:4_/_3] [&_img]:object-cover [&_img]:[border-radius:5px]",
    // @media (width<=639px) .course-detail-intro img
    "[@media(width<=639px)]:[&_img]:[aspect-ratio:16_/_7]",
  ].join(" "),
  "course-detail-metadata": [
    "course-detail-metadata",
    "grid [grid-template-columns:repeat(4,_minmax(0,_1fr))] gap-4 my-6 py-4 [border-block:1px_solid_#dce8df]",
    // @media (width<=639px) .course-detail-metadata
    "[@media(width<=639px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))]",
    //  .course-detail-metadata dt
    "[&_dt]:flex [&_dt]:items-center [&_dt]:gap-[0.4rem] [&_dt]:text-[#577262] [&_dt]:[font-size:0.8rem] [&_dt]:[line-height:1.5]",
    //  .course-detail-metadata svg
    "[&_svg]:flex-none [&_svg]:w-4 [&_svg]:h-4",
    //  .course-detail-metadata dd
    "[&_dd]:mt-2 [&_dd]:[font-size:0.95rem] [&_dd]:font-semibold [&_dd]:[line-height:1.5]",
  ].join(" "),
  "course-detail-description": [
    "course-detail-description",
    "max-w-[75ch] [font-size:1rem] [line-height:1.75] text-justify",
    // @media (width<=639px) .course-detail-description
    "[@media(width<=639px)]:[font-size:0.95rem]",
  ].join(" "),
  "course-detail-subheading": [
    "course-detail-subheading",
    "mt-6 font-editorial [font-size:1.6rem] font-semibold [line-height:1.2]",
  ].join(" "),
  "course-detail-takeaways": [
    "course-detail-takeaways",
    "flex flex-col gap-3 mt-4 [font-size:0.95rem] [line-height:1.6]",
    //  .course-detail-takeaways li
    "[&_li]:flex [&_li]:[align-items:start] [&_li]:gap-[0.65rem]",
    //  .course-detail-takeaways svg
    "[&_svg]:flex-none [&_svg]:mt-[0.2rem] [&_svg]:w-[1.1rem] [&_svg]:h-[1.1rem]",
  ].join(" "),
  "course-detail-actions": [
    "course-detail-actions",
    "flex items-center justify-between flex-wrap gap-4 mt-7 pt-5 [border-top:1px_solid_#dce8df]",
    //  .course-detail-actions p
    "[&_p]:max-w-[42ch] [&_p]:[flex:1_1_15rem] [&_p]:text-[#577262] [&_p]:[font-size:0.8rem] [&_p]:[line-height:1.6]",
    //  .course-detail-actions button
    "[&_button]:inline-flex [&_button]:items-center [&_button]:justify-center [&_button]:gap-[0.6rem] [&_button]:min-h-12",
    "[&_button]:[padding:0.75rem_1.25rem] [&_button]:rounded-[999px] [&_button]:[background:#eef4ef] [&_button]:text-[#577262]",
    "[&_button]:[font-size:0.875rem] [&_button]:font-semibold [&_button]:[line-height:1.4]",
  ].join(" "),
  "course-laptop-base": [
    "course-laptop-base",
    "relative left-[-1.25rem] [width:calc(100%_+_2.5rem)] h-5 [background:#c3cec7] [border-top:2px_solid_#e6ede8]",
    "[clip-path:polygon(0_0,_100%_0,_97%_75%,_94%_100%,_6%_100%,_3%_75%)]",
    // @media (width<=639px) .course-laptop-base
    "[@media(width<=639px)]:left-[-0.5rem] [@media(width<=639px)]:[width:calc(100%_+_1rem)] [@media(width<=639px)]:h-3.5",
    //  .course-laptop-base::before
    "[&::before]:content-[''] [&::before]:absolute [&::before]:top-0 [&::before]:left-[42%] [&::before]:w-[16%] [&::before]:h-[0.45rem]",
    "[&::before]:[border-radius:0_0_6px_6px] [&::before]:[background:#91a69a]",
  ].join(" "),
};

export function courseStylesClasses(names) {
  return names.split(/\s+/).filter(Boolean).map(name => courseStyles[name] ?? name).join(" ");
}
