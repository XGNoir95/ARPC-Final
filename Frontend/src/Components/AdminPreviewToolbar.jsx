import AdminPreviewSize from './AdminPreviewSize';

export default function AdminPreviewToolbar({ device, onChange, disabled, title = 'Website preview', description = 'Review the draft at the website’s desktop or mobile size.', children }) {
  return <div data-preview-toolbar className="min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted">{description}</p></div>
      <AdminPreviewSize device={device} onChange={onChange} disabled={disabled}/>
    </div>
    {children}
  </div>;
}
