import { useEffect, useLayoutEffect, useState } from 'react';
import { createPath, Router, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { ContentContext, useContent } from '../ContentContext';
import { ThemeContext } from '../ThemeContext';
import { applyTheme, normalizeTheme } from '../utils/theme';
import { contentWithDraft, websitePreviewMessages as messages, websitePreviewResources } from '../utils/websitePreview';
import usePreviewDocument from '../utils/usePreviewDocument';
import { FiAward } from 'react-icons/fi';
import Navbar from './Navbar';
import About from './Home/About';
import FeaturedEvents from './Home/FeaturedEvents';
import Sponsors from './Home/Sponsors';
import Catalogue from '../Pages/Catalogue';
import Gallery from '../Pages/Gallery';
import Team from '../Pages/Team';
import Enrollment from '../Pages/Enrollment';
import LearningCourse from './LearningCourse';
import FloatingControls from './FloatingControls';
import StateView from './StateView';
import PageErrorBoundary from './PageErrorBoundary';

// Keep navigation inside the selected preview, including button-based nav links.
const previewNavigation = { createHref: to => typeof to === 'string' ? to : createPath(to), push() {}, replace() {}, go() {} };

function LessonPreview({ entry, selection }) {
  const lesson = { ...entry, _id: entry._id || 'draft' };
  const [selected, setSelected] = useState(selection || lesson._id);
  const lessons = [...(entry.courseLessons || []).filter(item => item._id !== lesson._id), lesson].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return <section className="bg-soft px-5 py-6 text-ink max-lg:flex max-lg:flex-col max-lg:pb-14 sm:px-10 sm:py-10"><div className="mx-auto w-full max-w-7xl py-8 max-lg:flex max-lg:flex-1 max-lg:flex-col"><LearningCourse course={entry.courseId || 'draft'} content={{ lessons, completed: [] }} lesson={selected} onSelect={setSelected} onDownload={event => event.preventDefault()} preview/></div></section>;
}

// Empty and incomplete drafts use the phone's available space too.
function PreviewState(props) {
  return <div className="px-8 py-12 max-lg:flex max-lg:flex-col max-lg:pb-20"><StateView {...props} fill/></div>;
}

function PreviewScene({ model, onSelect }) {
  const { resource, entry, view, selection } = model;
  const content = useContent();
  if (resource === 'programmes' && model.includeDraft && entry.kind !== 'courses' && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date || '')) return <PreviewState kind="programmes" title="Add a programme date to preview it." description="The preview updates as you complete the programme details."/>;
  if (resource === 'home') return entry.id === 'featured' ? <FeaturedEvents autoPlay={false} activeIndex={model.index} onItemChange={onSelect} preview/> : <About key={selection || entry.id} initialCardId={selection || entry.id}/>;
  if (resource === 'sponsors') return content.sponsors.length ? <Sponsors key={selection || entry.id} autoPlay={false} initialId={selection || entry.id}/> : <PreviewState icon={FiAward} title="No sponsors published yet." description="The affiliations section stays hidden on the website until a sponsor is published."/>;
  if (resource === 'gallery') return <Gallery key={selection} initialPhotoId={selection || entry.id} autoPlay={false} sectionOnly preview/>;
  if (resource === 'teams') return <Team key={selection} initialTeamId={selection || entry.id} sectionOnly preview/>;
  if (resource === 'programmes') return view === 'programme' ? <Routes><Route path="/enroll/:kind/:id" element={<Enrollment/>}/></Routes> : <Catalogue key={selection} initialId={selection || entry.id} autoPlay={false} sectionKind={entry.kind} preview/>;
  if (resource === 'lessons') return <LessonPreview key={selection} entry={entry} selection={selection}/>;
  return null;
}

export default function WebsitePreviewPage() {
  const [model, setModel] = useState(null);
  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== messages.update) return;
      const { resource, entry, content, theme, disabled, view, index, selection, includeDraft } = event.data;
      if (!websitePreviewResources.includes(resource) || !entry || typeof entry !== 'object' || Array.isArray(entry)) return;
      setModel({ resource, entry: { ...entry, id: entry.id || 'draft', fee: Number(entry.fee || 0) }, includeDraft: includeDraft !== false, content, theme: normalizeTheme(theme), disabled: Boolean(disabled), view, index: Number.isInteger(index) && index >= 0 ? index : undefined, selection: typeof selection === 'string' ? selection : undefined });
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: messages.ready }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  useLayoutEffect(() => { if (model) applyTheme(model.theme); }, [model]);
  const content = usePreviewDocument(model, messages, model && { resource: model.resource, id: model.entry.id, view: model.view });
  if (!model) return <div role="status" className="flex min-h-svh items-center justify-center bg-page text-sm text-muted">Loading website preview…</div>;
  const select = index => {
    if (model.disabled) return;
    setModel({ ...model, index });
    window.parent.postMessage({ type: messages.select, index }, window.location.origin);
  };
  const page = model.resource === 'programmes' && model.view === 'programme';
  const path = model.resource === 'programmes' ? model.view === 'programme' ? `/enroll/${model.entry.kind}/${encodeURIComponent(model.selection || model.entry.id)}` : '/catalogue' : model.resource === 'gallery' ? '/gallery' : model.resource === 'teams' ? '/team' : '/';
  return <ThemeContext.Provider value={{ theme: model.theme, setPreference: theme => setModel({ ...model, theme: normalizeTheme(theme) }) }}>
    <AuthContext.Provider value={{ profile: null, status: 'guest' }}>
      <ContentContext.Provider value={contentWithDraft(model.content, model.resource, model.includeDraft ? model.entry : null)}>
        <Router key={`${model.resource}:${model.entry.id}:${model.view}`} location={path} navigator={previewNavigation}>
          <div inert={model.disabled} onSubmitCapture={event => { event.preventDefault(); event.stopPropagation(); }} onClickCapture={event => { if (event.target.closest('a')) { event.preventDefault(); event.stopPropagation(); } }} className="relative flex min-h-screen flex-col bg-page text-ink [--preview-base-height:844px] lg:[--preview-base-height:900px]">
            {page && <div className="absolute inset-x-0 top-0 z-50"><Navbar blendWithHero/></div>}
            <div ref={content} data-preview-content className="flex flex-col bg-surface max-lg:min-h-svh max-lg:[&>*]:flex-1"><PageErrorBoundary key={`${model.resource}:${model.entry.id}:${model.entry.date || ''}`} standalone><PreviewScene model={model} onSelect={select}/></PageErrorBoundary></div>
            <FloatingControls showScrollToTop={false}/>
          </div>
        </Router>
      </ContentContext.Provider>
    </AuthContext.Provider>
  </ThemeContext.Provider>;
}
