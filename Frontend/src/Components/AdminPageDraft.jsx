import { useId, useRef, useState } from 'react';
import { api } from '../utils/api';
import { userMessage } from '../utils/userMessages';
import { sameValues } from '../utils/adminChanges';
import { AdminDialog } from './AdminUI';
import { adminAction, adminInput, adminQuiet } from './AdminUI.styles';

export function DraftField({ label, value = '', onChange, multiline = false, help, children, ...props }) {
  const id = useId();
  const attributes = { id, 'aria-describedby': help ? `${id}-help` : undefined, ...props };
  return <div className="min-w-0"><label htmlFor={id} className="block text-base font-semibold">{label}</label>{children ? <select value={value} onChange={event => onChange(event.target.value)} className={`${adminInput} mt-2`} {...attributes}>{children}</select> : multiline ? <textarea value={value} onChange={event => onChange(event.target.value)} rows={props.rows || 4} className={`${adminInput} mt-2 resize-y`} {...attributes}/> : <input value={value} onChange={event => onChange(event.target.value)} className={`${adminInput} mt-2`} {...attributes}/>} {help && <p id={`${id}-help`} className="mt-2 text-sm leading-6 text-muted">{help}</p>}</div>;
}

export default function AdminPageDraft({ title, resource, item, initial, value, onClose, onSaved, onCommitted, closeOnSave = true, validate, children, preview, layout = 'split' }) {
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [failure, setFailure] = useState(null);
  const lock = useRef(false);
  const draftKey = `${resource}:${item?._id || value.id}`;
  const error = failure?.key === draftKey ? failure.message : '';
  const changed = !item?._id || !sameValues(initial, value);
  const disabled = busy || uploading;
  const close = event => { if (disabled || lock.current) { event?.preventDefault?.(); return; } onClose(); };
  const save = async event => {
    event.preventDefault();
    if (lock.current || disabled || !changed) return;
    const invalid = validate?.(value);
    if (invalid) { setFailure({ key: draftKey, message: invalid }); return; }
    lock.current = true; setBusy(true); setFailure(null);
    try {
      const saved = await api(`/admin/content/${resource}${item?._id ? `/${item._id}` : ''}`, { method: item?._id ? 'PATCH' : 'POST', body: { data: value, revision: item?.revision } });
      onCommitted?.(saved);
      await onSaved('Draft saved. Publish it when ready.');
      if (closeOnSave) onClose();
    } catch (failure) { setFailure({ key: draftKey, message: userMessage(failure) }); }
    finally { lock.current = false; setBusy(false); }
  };
  const previewContent = typeof preview === 'function' ? preview({ disabled }) : preview;
  const fields = <fieldset disabled={disabled} className="min-w-0 space-y-7 p-5 sm:p-8">{children({ disabled, onUploadBusy: setUploading })}</fieldset>;
  return <AdminDialog title={title} onClose={close} wide="preview">
    <form onSubmit={save}>
      {layout === 'canvas' ? <>
        <div aria-label="Draft preview" className="min-w-0 border-b border-ink/12 bg-soft p-5 sm:px-8 sm:py-6">{previewContent}</div>
        {fields}
      </> : <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {fields}
        <aside aria-label="Draft preview" className="min-w-0 border-t border-ink/12 bg-soft p-5 sm:p-8 lg:border-t-0 lg:border-l">
          <div className="lg:sticky lg:top-24"><h3 className="mb-5 text-base font-semibold">Draft preview</h3>{previewContent}<p className="mt-5 text-sm leading-6 text-muted">Saving updates the draft. Publish from the page when you’re ready to show it on the website.</p></div>
        </aside>
      </div>}
      <footer className="sticky bottom-0 z-10 border-t border-ink/15 bg-surface/95 p-5 backdrop-blur-sm sm:px-8">
        {error && <p role="alert" className="mb-4 rounded-lg bg-danger-soft p-4 text-base text-danger">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p id="page-draft-save-state" className="text-sm leading-6 text-muted">{!changed ? 'This draft is up to date. Make a change before saving.' : item?.live ? 'The published version stays visible until you publish your changes.' : 'This draft is not visible on the website.'}</p>
          <div className="flex gap-3"><button type="button" onClick={close} disabled={disabled} className={adminQuiet}>Cancel</button><button type="submit" disabled={disabled || !changed} aria-busy={busy} aria-describedby="page-draft-save-state" className={adminAction}>{uploading ? 'Uploading…' : busy ? 'Saving…' : 'Save draft'}</button></div>
        </div>
      </footer>
    </form>
  </AdminDialog>;
}
