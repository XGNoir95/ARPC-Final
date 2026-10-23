import { createElement } from 'react';
import { FiMonitor, FiSmartphone } from 'react-icons/fi';
import { adminFocus } from './AdminUI.styles.js';

export default function AdminPreviewSize({ device, onChange, disabled = false }) {
  return <div role="group" aria-label="Preview size" className="flex max-w-full gap-1 rounded-full border border-ink/15 bg-surface p-1">
    {[[ 'desktop', 'Desktop', FiMonitor ], [ 'mobile', 'Mobile', FiSmartphone ]].map(([id, label, Icon]) => <button key={id} type="button" disabled={disabled} aria-label={`${label} preview`} aria-pressed={device === id} onClick={() => onChange(id)} className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${adminFocus} ${device === id ? 'bg-action text-on-action' : 'text-muted hover:bg-soft'}`}>{createElement(Icon, { 'aria-hidden': true })}<span>{label}</span></button>)}
  </div>;
}
