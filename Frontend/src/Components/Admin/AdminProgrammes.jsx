import AdminProgrammeSection from './AdminProgrammeSection';
import { adminFocus } from './AdminUI.styles.js';

export default function AdminProgrammes(props) {
  return <div className="space-y-8">
    <nav aria-label="Programme sections" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/12 pb-4">{['events', 'webinars'].map(kind => <a key={kind} href={`#manage-${kind}`} onClick={event => { event.preventDefault(); document.getElementById(`manage-${kind}`)?.scrollIntoView?.({ block: 'start' }); }} className={`inline-flex min-h-11 items-center rounded text-base font-semibold underline decoration-ink/20 underline-offset-8 hover:decoration-ink ${adminFocus}`}>{kind === 'events' ? 'Events' : 'Webinars'}</a>)}</nav>
    <AdminProgrammeSection {...props} kind="events"/>
    <AdminProgrammeSection {...props} kind="webinars"/>
  </div>;
}
