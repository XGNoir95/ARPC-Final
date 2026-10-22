import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AdminProgrammes from './AdminProgrammes';
import AdminCourses from './AdminCourses';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({ api: vi.fn(), post: vi.fn() }));
const entries = [
  { id: 'event', _id: 'event-record', kind: 'events', title: 'Campus gathering', date: '2026-12-01', time: '15:00', live: true, revision: 2 },
  { id: 'private-event', _id: 'private-record', kind: 'events', title: 'Private event', date: '2026-12-02', live: false, revision: 4 },
  { id: 'other-private', _id: 'other-private-record', kind: 'events', title: 'Other private event', live: false },
  { id: 'webinar', _id: 'webinar-record', kind: 'webinars', title: 'Online conversation', date: '2026-12-03', live: true },
  { id: 'course', _id: 'course-record', kind: 'courses', title: 'Read together', live: true, revision: 3 },
  { id: 'other-course', _id: 'other-course-record', kind: 'courses', title: 'Write together', live: false, revision: 1 },
];
const show = (Component = AdminProgrammes, extra = {}) => {
  const actions = { onNew: vi.fn(), onEdit: vi.fn(), onPublish: vi.fn(), onDelete: vi.fn() };
  render(<MemoryRouter>{createElement(Component, { entries, content: { programmes: entries }, files: [], run: action => action(), reloadFiles: vi.fn(), ...actions, ...extra })}</MemoryRouter>);
  return actions;
};
beforeEach(() => { vi.clearAllMocks(); api.mockResolvedValue([]); });
afterEach(() => vi.restoreAllMocks());

it('shows Events before Webinars, each with its own preview and cards, and excludes course content', () => {
  show();
  expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['Events', 'Webinars']);
  const events = screen.getByRole('region', { name: 'Events' });
  const webinars = screen.getByRole('region', { name: 'Webinars' });
  expect(within(events).getByRole('button', { name: 'Preview Campus gathering' })).toBeVisible();
  expect(within(webinars).getByRole('button', { name: 'Preview Online conversation' })).toBeVisible();
  expect(within(events).queryByText('Online conversation')).not.toBeInTheDocument();
  expect(screen.queryByText('Read together')).not.toBeInTheDocument();
  for (const region of [events, webinars]) {
    const preview = within(region).getByTitle('Desktop programmes website preview');
    const cards = within(region).getByRole('region', { name: /^Manage/ });
    expect(preview.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
});

it('previews the selected private event without sending unrelated drafts or courses into the frame', () => {
  show();
  const eventRegion = within(screen.getByRole('region', { name: 'Events' }));
  const frame = eventRegion.getByTitle('Desktop programmes website preview');
  const send = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.click(eventRegion.getByRole('button', { name: 'Mobile preview' }));
  fireEvent.click(eventRegion.getByRole('button', { name: 'Preview Private event' }));
  expect(eventRegion.getByTitle('Mobile programmes website preview')).toBeInTheDocument();
  expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ entry: entries[1], selection: 'private-event', content: expect.objectContaining({ programmes: [entries[0]] }) }), window.location.origin);
});

it('scopes filters and creation actions to their section and keeps edit/publish/delete bound to the card', () => {
  const actions = show();
  const region = within(screen.getByRole('region', { name: 'Events' }));
  fireEvent.click(region.getByRole('button', { name: 'Add event' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add webinar' }));
  expect(actions.onNew.mock.calls).toEqual([['events'], ['webinars']]);
  const controls = within(region.getByRole('group', { name: 'Actions for Private event' }));
  fireEvent.click(controls.getByRole('button', { name: 'Edit Private event' }));
  fireEvent.click(controls.getByRole('button', { name: 'Publish' }));
  fireEvent.click(controls.getByRole('button', { name: 'Delete Private event' }));
  expect(actions.onEdit).toHaveBeenCalledWith(entries[1]);
  expect(actions.onPublish).toHaveBeenCalledWith(entries[1]);
  expect(actions.onDelete).toHaveBeenCalledWith(entries[1]);
  fireEvent.change(region.getByRole('searchbox', { name: 'Search events' }), { target: { value: 'missing' } });
  expect(region.getByRole('heading', { name: 'No events match these filters.' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Online conversation' })).toBeVisible();
  fireEvent.click(region.getByRole('button', { name: 'Reset filters' }));
  expect(region.getByRole('heading', { name: 'Campus gathering' })).toBeVisible();
});

it('keeps empty collection previews typed and does not invent a draft or a programme page', () => {
  show(AdminProgrammes, { entries: [], content: { programmes: [] } });
  for (const [kind, title] of [['events', 'Events'], ['webinars', 'Webinars']]) {
    const region = within(screen.getByRole('region', { name: title }));
    const frame = region.getByTitle('Desktop programmes website preview');
    const send = vi.spyOn(frame.contentWindow, 'postMessage');
    fireEvent.load(frame);
    expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ entry: { id: 'collection', kind }, includeDraft: false, view: 'catalogue', content: expect.objectContaining({ programmes: [] }) }), window.location.origin);
    expect(region.getByRole('option', { name: 'Programme page' })).toBeDisabled();
  }
});

it('keeps course previews, course actions and curriculum together without events or webinars', async () => {
  show(AdminCourses);
  expect(screen.queryByText('Campus gathering')).not.toBeInTheDocument();
  expect(screen.queryByText('Online conversation')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add course' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Manage lessons for Write together' }));
  expect(await screen.findByRole('heading', { name: 'No lessons yet.' })).toBeVisible();
  expect(api).toHaveBeenCalledWith('/admin/courses/other-course/lessons');
  expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
});

it('preserves unsaved lessons when reviewing other course previews and confirms before changing curricula', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  show(AdminCourses);
  fireEvent.click(screen.getByRole('button', { name: 'Manage lessons for Read together' }));
  const empty = await screen.findByRole('region', { name: 'No lessons yet.' });
  fireEvent.click(within(empty).getByRole('button', { name: 'New lesson' }));
  fireEvent.change(screen.getByLabelText('Lesson title'), { target: { value: 'My unsaved lesson' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview Write together' }));
  expect(screen.getByLabelText('Lesson title')).toHaveValue('My unsaved lesson');
  fireEvent.click(screen.getByRole('button', { name: 'Manage lessons for Write together' }));
  expect(confirm).toHaveBeenCalledOnce();
  expect(screen.getByLabelText('Lesson title')).toHaveValue('My unsaved lesson');
  expect(api).not.toHaveBeenCalledWith('/admin/courses/other-course/lessons');
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: 'Manage lessons for Write together' }));
  await waitFor(() => expect(api).toHaveBeenCalledWith('/admin/courses/other-course/lessons'));
  expect(screen.queryByLabelText('Lesson title')).not.toBeInTheDocument();
});
