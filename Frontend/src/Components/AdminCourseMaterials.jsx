import { useRef, useState } from 'react';
import { FiDownload, FiFileText, FiTrash2, FiUpload } from 'react-icons/fi';
import { api, post } from '../utils/api';
import { downloadFile } from '../utils/download';
import { fileSize } from '../utils/adminPresentation';
import { userMessage } from '../utils/userMessages';
import { AdminSearch } from './AdminUI';
import { adminAction, adminDanger, adminPanel, adminQuiet, adminTypography } from './AdminUI.styles';

export default function AdminCourseMaterials({ files = [], busy, run, reloadFiles }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const upload = useRef(null);
  const materials = files.filter(file => file.purpose === 'material');
  const items = materials.filter(file => file.name.toLowerCase().includes(query.trim().toLowerCase()));
  const choose = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || busy) return;
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Choose a PDF, PNG, JPEG or WebP file up to 10 MB.'); return; }
    setError('');
    await run(async () => { const data = new FormData(); data.set('file', file); data.set('purpose', 'material'); await post('/admin/files', data); await reloadFiles(); }, 'Course material uploaded.');
  };
  return <section id="course-materials" aria-labelledby="course-materials-heading" className={`${adminPanel} scroll-mt-6 overflow-hidden`}>
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/12 p-5 sm:p-6"><div><h2 id="course-materials-heading" className={adminTypography.sectionTitle}>Course materials</h2><p className="mt-2 max-w-[70ch] text-sm leading-6 text-muted">Private PDFs and images for your lessons. Upload here, then select a file in the lesson editor. Files used by saved or published lessons stay protected.</p></div><button type="button" disabled={busy} onClick={() => upload.current?.click()} className={adminAction}><FiUpload aria-hidden="true"/>Upload material</button><input ref={upload} type="file" aria-label="Upload course material" accept="application/pdf,image/png,image/jpeg,image/webp" disabled={busy} className="sr-only" onChange={choose}/></header>
    <div className="space-y-4 p-5 sm:p-6">{error && <p role="alert" className="text-sm leading-6 text-danger">{error}</p>}<div className="max-w-md"><AdminSearch label="Search course materials" placeholder="Find a file by name" value={query} onChange={setQuery}/></div>
      <ul className="divide-y divide-ink/12">{items.map(file => <li key={file._id} className="flex flex-wrap items-center gap-3 py-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-soft"><FiFileText aria-hidden="true" className="size-5 text-muted"/></span><span className="min-w-0 flex-1 basis-32"><span className="block break-words text-base font-semibold">{file.name}</span><span className="mt-1 block text-sm text-muted">{fileSize(file.size)} · {file.type === 'application/pdf' ? 'PDF' : 'Image'}</span></span><div className="ml-auto flex flex-wrap gap-2"><button type="button" disabled={busy} className={adminQuiet} aria-label={`Download material ${file.name}`} onClick={async () => { setError(''); try { await downloadFile(`/admin/files/${file._id}/download`, file.name); } catch (failure) { setError(userMessage(failure)); } }}><FiDownload aria-hidden="true"/>Download</button><button type="button" disabled={busy} className={adminDanger} aria-label={`Delete material ${file.name}`} onClick={() => { if (window.confirm(`Delete “${file.name}”? Files used by a saved or published lesson cannot be deleted.`)) run(async () => { await api(`/admin/files/${file._id}`, { method: 'DELETE' }); await reloadFiles(); }, 'Course material deleted.'); }}><FiTrash2 aria-hidden="true"/>Delete</button></div></li>)}</ul>
      {!items.length && <p className="rounded-xl border border-ink/15 bg-soft p-5 text-sm leading-6 text-muted">{materials.length ? 'No course materials match this filename.' : 'No course materials uploaded yet. Upload a PDF or image to use in a lesson.'}</p>}
    </div>
  </section>;
}
