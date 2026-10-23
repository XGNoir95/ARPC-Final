export default function AdminPreviewStage({ device, children, className = '' }) {
  return <div data-preview-stage data-preview-device={device} className={`grid h-[clamp(34rem,230cqw,58rem)] w-full min-w-0 grid-cols-1 grid-rows-[minmax(0,1fr)_1.25rem] gap-3 rounded-2xl border border-ink/12 bg-soft p-3 sm:p-6 ${className}`}>
    {children}
  </div>;
}
