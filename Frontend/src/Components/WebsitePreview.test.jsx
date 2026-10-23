import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminContentEditor from './Admin/AdminContentEditor';
import AdminWebsitePreview from './Admin/AdminWebsitePreview';
import WebsitePreviewPage from './WebsitePreviewPage';
import { ThemeContext } from '../contexts/ThemeContext';
import { contentWithDraft, previewContent, websitePreviewMessages as messages } from '../utils/websitePreview';

const featured = { id: 'featured', title: 'Featured at ARPC', selections: [{ id: 'membership', kind: 'membership' }], membership: { title: 'Join the club', description: 'Find friendship through learning and service.', image: '/logo.jpg' } };
const message = (source, data, origin = window.location.origin) => fireEvent(window, new MessageEvent('message', { source, origin, data }));
const update = (resource, entry, extra = {}) => message(window.parent, { type: messages.update, resource, entry, theme: 'light', ...extra });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.theme; });

it.each(['events','webinars','courses'])('renders an empty %s collection without date validation or another programme type', kind => {
  render(<WebsitePreviewPage/>);
  update('programmes', { id: 'collection', kind }, { includeDraft: false, view: 'catalogue', content: { programmes: [] } });
  expect(screen.getByRole('heading', { name: `No ${kind} available yet.` })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Add a programme date to preview it.' })).not.toBeInTheDocument();
  expect(screen.queryByText('Events, webinars and courses will appear here when they are available. Explore the gallery in the meantime.')).not.toBeInTheDocument();
});

it.each([['events','Events','Upcoming'],['webinars','Webinars','Upcoming'],['courses','Courses','Paid']])('recovers from an empty %s preview filter without losing the programme', (kind, title, filter) => {
  render(<WebsitePreviewPage/>);
  update('programmes', { id: 'programme', kind, title: 'Community gathering', description: 'Learn and reflect together.', date: '2000-01-01', time: '15:00', location: 'Campus', fee: 0, image: '/logo.jpg', takeaways: [] }, { view: 'catalogue' });
  const filters = within(screen.getByRole('group', { name: `${title} filters` }));
  fireEvent.click(filters.getByRole('button', { name: filter }));
  expect(screen.getByRole('heading', { name: `No ${kind} match this selection.` })).toBeVisible();
  expect(filters.getByRole('button', { name: filter })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Reset search and filter' }));
  expect(screen.queryByRole('heading', { name: `No ${kind} match this selection.` })).not.toBeInTheDocument();
  expect(filters.getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText(`1 ${kind} shown`)).toBeInTheDocument();
});

it('renders the actual Featured membership introduction and updates it as the draft changes', () => {
  render(<WebsitePreviewPage/>);
  update('home', featured, { theme: 'dark' });
  const carousel = screen.getByRole('group', { name: 'Featured carousel' });
  expect(within(carousel).getByRole('heading', { name: 'Join the club' })).toBeVisible();
  expect(within(carousel).getAllByText(featured.membership.description).length).toBeGreaterThan(0);
  expect(within(carousel).getByRole('link', { name: 'Apply for membership' })).toBeVisible();
  expect(document.documentElement.dataset.theme).toBe('dark');
  const pageControls = within(screen.getByRole('group', { name: 'Page controls' }));
  expect(pageControls.getAllByRole('button')).toHaveLength(1);
  fireEvent.click(pageControls.getByRole('button', { name: 'Toggle dark mode' }));
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeInTheDocument();
  update('home', { ...featured, membership: { ...featured.membership, description: 'Updated membership introduction.' } });
  expect(within(carousel).getAllByText('Updated membership introduction.').length).toBeGreaterThan(0);
  expect(screen.queryByText(featured.membership.description)).not.toBeInTheDocument();
});

it('sends the live membership fields from the editor into its isolated preview', () => {
  render(<MemoryRouter><AdminContentEditor resource="home" item={{ ...featured, _id: 'featured', revision: 2 }} onClose={vi.fn()} onSaved={vi.fn()}/></MemoryRouter>);
  const frame = screen.getByTitle('Desktop home website preview');
  const post = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.change(screen.getByLabelText('Membership introduction'), { target: { value: 'A newly edited introduction.' } });
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ entry: expect.objectContaining({ membership: expect.objectContaining({ description: 'A newly edited introduction.' }) }) }), window.location.origin);
  fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
  expect(screen.getByTitle('Mobile home website preview')).toBeInTheDocument();
});

it('accepts messages only from its own frame and scales real desktop/mobile viewports', () => {
  let resize;
  vi.stubGlobal('ResizeObserver', class { constructor(callback) { resize = callback; } observe() {} disconnect() {} });
  const { rerender } = render(<ThemeContext.Provider value={{ theme: 'dark' }}><AdminWebsitePreview resource="home" entry={featured}/></ThemeContext.Provider>);
  const frame = screen.getByTitle('Desktop home website preview');
  const post = vi.spyOn(frame.contentWindow, 'postMessage');
  const canvas = screen.getByLabelText('Website preview');
  Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 720 });
  Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 1000 });
  act(() => resize());
  expect(canvas.style.getPropertyValue('--preview-scale')).toBe('0.5');
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('900px');
  message(window, { type: messages.ready });
  message(frame.contentWindow, { type: messages.ready }, 'https://unrelated.example');
  expect(canvas).toHaveAttribute('aria-busy', 'true');
  message(frame.contentWindow, { type: messages.ready });
  expect(canvas).toHaveAttribute('aria-busy', 'false');
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ entry: featured, theme: 'dark' }), window.location.origin);
  fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
  Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 320 });
  act(() => resize());
  expect(canvas.style.getPropertyValue('--preview-width')).toBe('390px');
  expect(Number.parseFloat(canvas.style.getPropertyValue('--preview-height'))).toBeCloseTo(844);
  expect(screen.getByTitle('Mobile home website preview')).toHaveAttribute('src', '/index.html?arpc-website-preview=1');
  rerender(<ThemeContext.Provider value={{ theme: 'dark' }}><AdminWebsitePreview resource="home" entry={featured} disabled/></ThemeContext.Provider>);
  expect(screen.getByRole('button', { name: 'Desktop preview' })).toBeDisabled();
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true }), window.location.origin);
});

it('keeps unrelated drafts private while previewing the current unsaved edit in its published collection', () => {
  const published = { id: 'one', title: 'Published title' };
  const source = { home: [], programmes: [{ id: 'one', title: 'Unpublished change', live: true, publishedData: published }, { id: 'private', title: 'Private draft', live: false }] };
  expect(previewContent(source).programmes).toEqual([published]);
  expect(contentWithDraft(source, 'programmes', { id: 'one', title: 'Current edit' }).programmes).toEqual([{ id: 'one', title: 'Current edit' }]);
});

it('explains a hidden sponsor section without inserting a fictitious organisation', () => {
  render(<WebsitePreviewPage/>);
  update('sponsors', { id: 'collection' }, { includeDraft: false, content: { sponsors: [] } });
  expect(screen.getByRole('heading', { name: 'No sponsors published yet.' })).toBeVisible();
  expect(screen.getByText('The affiliations section stays hidden on the website until a sponsor is published.')).toBeVisible();
  expect(screen.queryByRole('group', { name: 'Affiliations carousel' })).not.toBeInTheDocument();
  expect(contentWithDraft({ sponsors: [] }, 'sponsors', null).sponsors).toEqual([]);
});

it('reviews neighbouring cards without replacing the unsaved draft', () => {
  const entry = { id: 'draft', name: 'Updated partner', src: '/logo.jpg' };
  render(<AdminWebsitePreview resource="sponsors" entry={entry} content={{ sponsors: [{ id: 'other', name: 'Another partner', src: '/logo.jpg', live: true }] }}/>);
  const frame = screen.getByTitle('Desktop sponsors website preview');
  const post = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.click(screen.getByRole('button', { name: 'Preview Another partner' }));
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ entry, selection: 'other' }), window.location.origin);
  expect(screen.getByRole('button', { name: 'Preview Another partner' })).toHaveAttribute('aria-pressed', 'true');
});

it('previews the edited Catalogue section without unrelated page sections', () => {
  const { unmount } = render(<WebsitePreviewPage/>);
  update('programmes', { id: 'course', kind: 'courses', title: 'Learning together', description: 'A course introduction', fee: 0, image: '/logo.jpg', takeaways: [] });
  expect(screen.getByRole('heading', { name: 'Courses', exact: true })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Events', exact: true })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  expect(document.documentElement).toHaveClass('overflow-y-auto');
  expect(document.documentElement).not.toHaveClass('overscroll-y-contain');
  unmount();
  expect(document.documentElement).not.toHaveClass('overflow-y-auto');
});

it('keeps the administrator focus outside the mobile course preview when course drafts change', () => {
  vi.stubGlobal('matchMedia', vi.fn(query => ({ matches: query === '(max-width: 1023px)' })));
  render(<><input aria-label="Draft title" autoFocus/><WebsitePreviewPage/></>);
  const draft = { id: 'course', kind: 'courses', title: 'Learning together', description: 'A course introduction', fee: 0, takeaways: [] };
  update('programmes', draft);
  expect(screen.getByRole('textbox', { name: 'Draft title' })).toHaveFocus();
  update('programmes', { ...draft, title: 'Updated course introduction' });
  expect(screen.getByRole('textbox', { name: 'Draft title' })).toHaveFocus();
  expect(screen.getByRole('region', { name: 'Updated course introduction' })).toBeVisible();
});

it.each(['events','webinars'])('keeps editor focus when a %s draft updates', kind => {
 render(<><input aria-label="Draft title" autoFocus/><WebsitePreviewPage/></>);
 const draft={id:'programme',kind,title:'Learn together',description:'Our introduction.',date:'2026-12-01',time:'15:00',takeaways:[]};
 update('programmes',draft);
 expect(screen.getByRole('textbox',{name:'Draft title'})).toHaveFocus();
 update('programmes',{...draft,title:'Updated programme'});
 expect(screen.getByRole('textbox',{name:'Draft title'})).toHaveFocus();
});

it('renders member social URLs in the same public profile used by the team page',()=>{
 render(<WebsitePreviewPage/>);
 update('teams',{id:'team',label:'Club team',description:'Our people.',members:[{id:'member',name:'Club Member',role:'Coordinator',linkedin:'club-member',github:'@club-dev'}]});
 fireEvent.click(screen.getByRole('button',{name:/View profile: Club Member/}));
 expect(screen.getByRole('link',{name:'Club Member on LinkedIn'})).toHaveAttribute('href','https://www.linkedin.com/in/club-member');
 expect(screen.getByRole('link',{name:'Club Member on GitHub'})).toHaveAttribute('href','https://github.com/club-dev');
});

it('fits the complete About content inside the available stage', () => {
  let resize;
  vi.stubGlobal('ResizeObserver', class { constructor(callback) { resize = callback; } observe() {} disconnect() {} });
  render(<AdminWebsitePreview resource="home" entry={{ id: 'about-us' }}/>);
  const canvas = screen.getByLabelText('Website preview');
  Object.defineProperty(canvas, 'clientWidth', { configurable: true, value: 1000 });
  Object.defineProperty(canvas, 'clientHeight', { configurable: true, value: 1000 });
  act(() => resize());
  expect(canvas.style.getPropertyValue('--preview-width')).toBe('1440px');
  const frame = screen.getByTitle('Desktop home website preview');
  message(frame.contentWindow, { type: messages.resize, resource: 'home', id: 'about-us', view: 'catalogue', width: 1440, height: 1100 });
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('1100px');
  expect(Number.parseFloat(canvas.style.getPropertyValue('--preview-display-height'))).toBeCloseTo(1100 * 1000 / 1440);
  message(frame.contentWindow, { type: messages.resize, resource: 'home', id: 'about-us', view: 'catalogue', width: 1440, height: 800 });
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('800px');
  expect(screen.queryByText(/Scroll inside the preview/)).not.toBeInTheDocument();
});

it.each([[{}, 'draft'], [{ _id: 'lesson-record' }, 'lesson-record']])('fits a lesson preview before it has a public content ID', (identity, id) => {
  render(<AdminWebsitePreview resource="lessons" entry={{ ...identity, title: 'Draft reading', body: 'A longer reading.' }}/>);
  const frame = screen.getByTitle('Desktop lessons website preview');
  message(frame.contentWindow, { type: messages.resize, resource: 'lessons', id, view: 'catalogue', width: 1440, height: 1400 });
  expect(screen.getByLabelText('Website preview').style.getPropertyValue('--preview-height')).toBe('1400px');
});

it('rejects foreign and unsupported renderer messages without mounting content', () => {
  render(<WebsitePreviewPage/>);
  message(window.parent, { type: messages.update, resource: 'home', entry: featured }, 'https://unrelated.example');
  update('accounts', featured);
  update('home', null);
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});

it.each([
  ['home', 'featured'], ['home', 'about-us'], ['sponsors', 'partner'],
  ['programmes', 'course'], ['gallery', 'photo'], ['teams', 'team'], ['lessons', 'lesson'],
])('keeps the %s %s stage stable and mobile width readable regardless of content length', (resource, id) => {
  let resize;
  vi.stubGlobal('ResizeObserver', class { constructor(callback) { resize = callback; } observe() {} disconnect() {} });
  render(<AdminWebsitePreview resource={resource} entry={{ id, kind: 'courses' }} showCards={false}/>);
  const canvas = screen.getByLabelText('Website preview');
  Object.defineProperties(canvas, { clientWidth: { configurable: true, value: 1000 }, clientHeight: { configurable: true, value: 846 } });
  act(() => resize());
  const stage = canvas.closest('[data-preview-stage]');
  const frame = screen.getByTitle(`Desktop ${resource} website preview`);
  const geometry = stage.className;
  const size = { type: messages.resize, resource, id, view: 'catalogue', width: 1440, height: 1800 };
  message(frame.contentWindow, size);
  expect(canvas.style.getPropertyValue('--preview-display-height')).toBe('846px');
  expect(Number.parseFloat(canvas.style.getPropertyValue('--preview-display-width'))).toBeCloseTo(676.8);
  fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
  message(frame.contentWindow, { ...size, width: 390, height: 700 });
  expect(stage.className).toBe(geometry);
  expect(canvas.clientWidth).toBe(1000);
  expect(canvas.clientHeight).toBe(846);
  expect(canvas.style.getPropertyValue('--preview-display-width')).toBe('390px');
  expect(canvas.style.getPropertyValue('--preview-scale')).toBe('1');
  expect(canvas.style.getPropertyValue('--preview-display-height')).toBe('844px');
  expect(screen.queryByText('Scroll inside the phone')).not.toBeInTheDocument();
  message(frame.contentWindow, { ...size, width: 390, height: 2400 });
  expect(canvas.style.getPropertyValue('--preview-display-height')).toBe('844px');
  expect(canvas.style.getPropertyValue('--preview-display-width')).toBe('390px');
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('844px');
  expect(screen.getByText('Scroll inside the phone')).toBeVisible();
  expect(canvas.style.getPropertyValue('--preview-scale')).toBe('1');
  expect(stage.className).toBe(geometry);
  Object.defineProperties(canvas, { clientWidth: { configurable: true, value: 260 }, clientHeight: { configurable: true, value: 600 } });
  act(() => resize());
  expect(canvas.style.getPropertyValue('--preview-display-width')).toBe('260px');
  expect(Number(canvas.style.getPropertyValue('--preview-scale'))).toBeCloseTo(260 / 390);
  expect(Number.parseFloat(canvas.style.getPropertyValue('--preview-display-height'))).toBeCloseTo(844 * 260 / 390);
  fireEvent.click(screen.getByRole('button', { name: 'Desktop preview' }));
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('1800px');
  expect(stage.className).toBe(geometry);
});

it('tracks Featured content heights separately for each device and ignores unrelated messages', () => {
  render(<AdminWebsitePreview resource="home" entry={featured}/>);
  const frame = screen.getByTitle('Desktop home website preview');
  const canvas = screen.getByLabelText('Website preview');
  const size = { type: messages.resize, resource: 'home', id: 'featured', view: 'catalogue', width: 1440, height: 510 };
  message(window, size);
  message(frame.contentWindow, size, 'https://unrelated.example');
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('900px');
  message(frame.contentWindow, size);
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('510px');
  message(frame.contentWindow, { ...size, height: 780 });
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('780px');
  message(frame.contentWindow, { ...size, height: 1800 });
  message(frame.contentWindow, { ...size, view: 'programme', height: 500 });
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('1800px');
  message(frame.contentWindow, { ...size, height: -1 });
  message(frame.contentWindow, { ...size, id: 'about-us', height: 500 });
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('1800px');
  fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
  message(frame.contentWindow, { ...size, width: 390, height: 700 });
  // A content report cannot stretch or shrink the mobile viewport.
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('844px');
  fireEvent.click(screen.getByRole('button', { name: 'Desktop preview' }));
  expect(canvas.style.getPropertyValue('--preview-height')).toBe('1800px');
});

it.each([
  ['sponsors', { id: 'partner', name: 'Club Partner', src: '/logo.jpg' }, 'Our Affiliations'],
  ['teams', { id: 'team', label: 'Club team', description: 'Our people', members: [{ id: 'member', name: 'Club Member', role: 'Coordinator', department: 'CSE' }] }, 'Club team'],
  ['programmes', { id: 'course', kind: 'courses', title: 'Learning together', description: 'A course introduction', image: '/logo.jpg', fee: 0, takeaways: ['Reflect together'] }, 'Learning together'],
  ['lessons', { _id: 'lesson', title: 'First reading', body: 'The full lesson text.', materials: ['resource'], videoUrl: 'https://example.test/video' }, 'First reading'],
])('uses the public %s components for its preview', (resource, entry, heading) => {
  render(<WebsitePreviewPage/>);
  update(resource, entry);
  expect(screen.getAllByRole('heading', { name: heading })[0]).toBeVisible();
  if (resource === 'lessons') {
    expect(screen.getByText(entry.body)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Watch lesson video' })).toHaveAttribute('href', entry.videoUrl);
    expect(screen.getByRole('link', { name: 'Download resource 1' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mark lesson complete' })).toBeDisabled();
  }
});

it('opens the public gallery viewer with the edited caption', () => {
  render(<WebsitePreviewPage/>);
  update('gallery', { id: 'photo', title: 'Club moment', category: 'Campus', image: '/logo.jpg', alt: 'Our club', description: 'A complete gallery caption.' });
  fireEvent.click(screen.getByRole('button', { name: 'View image: Club moment' }));
  expect(within(screen.getByRole('dialog')).getByText('A complete gallery caption.')).toBeVisible();
});

it('shows the real programme page and keeps enrollment submission inside the preview inactive', () => {
  render(<WebsitePreviewPage/>);
  update('programmes', { id: 'course', kind: 'courses', title: 'Learning together', description: 'Our course introduction.', details: 'The full programme details.', fee: 0, duration: 'Four weeks', takeaways: ['Read together'], image: '/logo.jpg' }, { view: 'programme' });
  expect(screen.getByRole('heading', { level: 1, name: 'Learning together' })).toBeVisible();
  expect(screen.getByText('Our course introduction.')).toBeVisible();
  expect(screen.getByText('Read together')).toBeVisible();
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('button', { name: 'Home', exact: true }));
  expect(screen.getByRole('heading', { level: 1, name: 'Learning together' })).toBeVisible();
  const form = screen.getByRole('form', { name: 'Your enrollment details' });
  expect(fireEvent.submit(form)).toBe(false);
  expect(screen.queryByRole('heading', { name: 'Review your enrollment' })).not.toBeInTheDocument();
});

it('allows reading other published course lessons without changing learner progress', () => {
  render(<WebsitePreviewPage/>);
  update('lessons', { _id: 'draft', title: 'Draft reading', body: 'Draft content.', materials: [], courseLessons: [{ _id: 'published', title: 'Published reading', body: 'Published content.', materials: [] }] });
  fireEvent.click(screen.getByRole('button', { name: 'Published reading' }));
  expect(screen.getByRole('heading', { name: 'Published reading' })).toBeVisible();
  expect(screen.getByText('Published content.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Mark lesson complete' })).toBeDisabled();
});
