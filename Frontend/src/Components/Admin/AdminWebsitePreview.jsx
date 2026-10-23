import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { useTheme } from '../../contexts/ThemeContext';
import { heroPreviewViewports } from '../../utils/heroPreview';
import { previewContent, websitePreviewMessages as messages } from '../../utils/websitePreview';
import AdminPreviewToolbar from './AdminPreviewToolbar';
import AdminPreviewCards from './AdminPreviewCards';
import AdminPreviewFrame from './AdminPreviewFrame';
import { previewCards } from '../../utils/previewCards';
import { adminInput } from './AdminUI.styles.js';

export default function AdminWebsitePreview({ resource, entry: draft, content, programmeKind, disabled = false, index, onSelect, onDeviceChange, showCards = true, cardSection, title = 'Website preview', description = 'Review the draft at the website’s desktop or mobile size.' }) {
  const publicContent = useContent();
  const entry = useMemo(() => draft?.id ? draft : { ...draft, id: draft?._id || (draft ? 'draft' : 'collection'), ...(programmeKind ? { kind: programmeKind } : {}) }, [draft, programmeKind]);
  const includeDraft = Boolean(draft);
  const published = useMemo(() => previewContent({ ...publicContent, ...content }), [publicContent, content]);
  const { theme } = useTheme();
  const [device, setDevice] = useState('desktop');
  const [selectedView, setView] = useState('catalogue');
  const view = includeDraft ? selectedView : 'catalogue';
  const [ready, setReady] = useState(false);
  const [sectionHeights, setSectionHeights] = useState({});
  const [selection, setSelection] = useState(null);
  const frame = useRef(null);
  const viewport = heroPreviewViewports[device];
  const items = useMemo(() => previewCards(resource, includeDraft ? entry : null, published), [resource, entry, includeDraft, published]);
  const selectedId = selection?.scene === `${resource}:${entry.id}` && items.some(item => (item.id || item._id) === selection.id) ? selection.id : resource === 'lessons' ? entry._id || entry.id : entry.id;
  const selectedIndex = index ?? Math.max(0, items.findIndex(item => (item.id || item._id) === selectedId));
  const select = (id, nextIndex) => { setSelection({ scene: `${resource}:${entry.id}`, id }); onSelect?.(nextIndex); };
  const heightKey = `${resource}:${entry.id}:${view}:${viewport.width}`;
  const height = sectionHeights[heightKey] || viewport.height;
  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: messages.update, resource, entry, includeDraft, content: published, theme, disabled, view, index: selectedIndex, selection: selectedId }, window.location.origin);
  }, [resource, entry, includeDraft, published, theme, disabled, view, selectedIndex, selectedId]);
  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === messages.ready) { send(); setReady(true); }
      if (event.data?.type === messages.select && resource === 'home' && entry.id === 'featured' && !disabled) {
        const count = items.length;
        if (Number.isInteger(event.data.index) && event.data.index >= 0 && event.data.index < count) {
          setSelection({ scene: `${resource}:${entry.id}`, id: items[event.data.index].id });
          onSelect?.(event.data.index);
        }
      }
      if (event.data?.type === messages.resize && event.data.resource === resource && event.data.id === entry.id && event.data.view === view) {
        const { width, height } = event.data;
        if (![1440, 390].includes(width) || !Number.isFinite(height) || height <= 0 || height > 100000) return;
        const rounded = Math.ceil(height);
        const key = `${resource}:${entry.id}:${view}:${width}`;
        setSectionHeights(current => current[key] === rounded ? current : { ...current, [key]: rounded });
      }
    };
    window.addEventListener('message', receive);
    send();
    return () => window.removeEventListener('message', receive);
  }, [send, resource, entry, view, disabled, onSelect, items]);

  return <div className="@container/preview min-w-0">
    <div className="grid gap-4">
    <AdminPreviewToolbar title={title} description={description} device={device} onChange={next => { setDevice(next); onDeviceChange?.(next); }} disabled={disabled}>
    {resource === 'programmes' && <label className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold">Preview location<span className="w-full sm:w-64"><select aria-label="Preview location" disabled={disabled} value={includeDraft ? view : 'catalogue'} onChange={event => setView(event.target.value)} className={`${adminInput} text-sm`}><option value="catalogue">Catalogue</option><option value="programme" disabled={!includeDraft}>Programme page</option></select></span></label>}
    </AdminPreviewToolbar>
    <AdminPreviewFrame device={device} height={height} frame={frame} label={title} ready={ready} disabled={disabled} title={`${device === 'mobile' ? 'Mobile' : 'Desktop'} ${resource} website preview`} src={`${import.meta.env.BASE_URL}index.html?arpc-website-preview=1`} onLoad={send}/>
    <p className="text-sm leading-6 text-muted">Previewing does not publish changes.</p>
    </div>
    {cardSection || showCards && <AdminPreviewCards resource={resource} entry={entry} items={items} selected={resource === 'home' && entry.id === 'featured' ? items[selectedIndex]?.id : selectedId} onSelect={select} disabled={disabled}/>}
  </div>;
}
