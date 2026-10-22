import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import AdminContentLibrary from './AdminContentLibrary';

const gallery = [
  { id: 'campus', _id: 'campus-record', title: 'Campus morning', description: 'The club on campus.', category: 'Campus', image: '/heroBanner.jpg', alt: 'Campus courtyard', revision: 2, live: true },
  { id: 'poster', _id: 'poster-record', title: 'Gathering poster', description: 'An invitation to the club.', category: 'Artwork', image: '/logo.jpg', alt: 'Club invitation', poster: true, revision: 4, live: false },
  { id: 'private', _id: 'private-record', title: 'Unrelated private image', category: 'Campus', image: '/private.jpg', live: false },
];
const teams = [
  { id: 'committee', _id: 'committee-record', label: 'Executive Committee', description: 'The people guiding the club.', live: true, revision: 3, members: [{ id: 'chair', name: 'Club Chair', role: 'President', department: 'CSE' }] },
  { id: 'events', _id: 'events-record', label: 'Events team', description: 'The people behind our gatherings.', live: false, revision: 7, members: [
    { id: 'first', name: 'First Member', role: 'Lead' }, { id: 'second', name: 'Second Member', role: 'Volunteer' }, { id: 'third', name: 'Third Member', role: 'Volunteer' }, { id: 'coordinator', name: 'Fourth Member', role: 'Coordinator', department: 'Architecture' },
  ] },
  { id: 'new-team', _id: 'new-record', label: 'New team', members: [], live: false, revision: 1 },
];

function show(resource = 'gallery', extra = {}) {
  const actions = { onNew: vi.fn(), onEdit: vi.fn(), onPublish: vi.fn(), onDelete: vi.fn() };
  const entries = resource === 'gallery' ? gallery : teams;
  render(<MemoryRouter><AdminContentLibrary resource={resource} entries={entries} content={{ gallery, teams }} {...actions} {...extra}/></MemoryRouter>);
  return actions;
}

it.each(['gallery', 'teams'])('places a persistent %s website preview before its cards without a preview dialog', resource => {
  show(resource);
  const frame = screen.getByTitle(`Desktop ${resource} website preview`);
  const cards = screen.getByRole('region', { name: resource === 'gallery' ? 'Manage gallery' : 'Manage panel teams' });
  expect(frame.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: resource === 'gallery' ? 'Preview Gathering poster' : 'Preview Events team' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: resource === 'gallery' ? 'Preview Gathering poster' : 'Preview Events team' })).toHaveAttribute('aria-pressed', 'true');
});

it.each(['gallery', 'teams'])('keeps mobile mode while selecting a private %s draft and hides other private records from the frame', resource => {
  show(resource);
  const frame = screen.getByTitle(`Desktop ${resource} website preview`);
  const send = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
  const records = resource === 'gallery' ? gallery : teams;
  fireEvent.click(screen.getByRole('button', { name: `Preview ${records[1].title || records[1].label}` }));
  expect(screen.getByTitle(`Mobile ${resource} website preview`)).toBeInTheDocument();
  expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ resource, entry: records[1], selection: records[1].id, content: expect.objectContaining({ [resource]: [records[0]] }) }), window.location.origin);
});

it('combines image category, search and publication filters and resets them together', () => {
  show();
  fireEvent.change(screen.getByRole('combobox', { name: 'Gallery category' }), { target: { value: 'Artwork' } });
  expect(screen.getByRole('heading', { name: 'Gathering poster' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Campus morning' })).not.toBeInTheDocument();
  fireEvent.click(within(screen.getByRole('group', { name: 'Gallery images publication status' })).getByRole('button', { name: /^Published/ }));
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search gallery' }), { target: { value: 'unknown' } });
  expect(screen.getByRole('heading', { name: 'No images match these filters.' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
  expect(screen.getByRole('searchbox', { name: 'Search gallery' })).toHaveValue('');
  expect(screen.getByRole('combobox', { name: 'Gallery category' })).toHaveValue('all');
  expect(screen.getByRole('heading', { name: 'Campus morning' })).toBeVisible();
});

it('finds teams by members, departments and roles even beyond the three roster thumbnails', () => {
  show('teams');
  const search = screen.getByRole('searchbox', { name: 'Search panel teams' });
  for (const value of ['Fourth Member', 'Coordinator', 'Architecture']) {
    fireEvent.change(search, { target: { value } });
    expect(screen.getByRole('heading', { name: 'Events team' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Executive Committee' })).not.toBeInTheDocument();
  }
  expect(screen.getByText('1 more in the preview')).toBeVisible();
  expect(screen.queryByRole('combobox', { name: 'Gallery category' })).not.toBeInTheDocument();
});

it.each(['gallery', 'teams'])('binds %s edit, publishing and deletion to the original record and revision', resource => {
  const actions = show(resource);
  const record = (resource === 'gallery' ? gallery : teams)[1];
  const title = record.title || record.label;
  const group = within(screen.getByRole('group', { name: `Actions for ${title}` }));
  expect(group.getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual([`Edit ${title}`, 'Publish', 'Unpublish', `Delete ${title}`]);
  expect(group.getByRole('button', { name: 'Unpublish' })).toBeDisabled();
  fireEvent.click(group.getByRole('button', { name: `Edit ${title}` }));
  fireEvent.click(group.getByRole('button', { name: 'Publish' }));
  fireEvent.click(group.getByRole('button', { name: `Delete ${title}` }));
  expect(actions.onEdit).toHaveBeenCalledWith(record);
  expect(actions.onPublish).toHaveBeenCalledWith(record);
  expect(actions.onDelete).toHaveBeenCalledWith(record);
  const published = within(screen.getByRole('group', { name: `Actions for ${(resource === 'gallery' ? gallery : teams)[0].title || teams[0].label}` }));
  expect(published.getByRole('button', { name: 'Published' })).toBeDisabled();
});

it.each(['gallery', 'teams'])('provides an empty %s preview and a first-entry action without fake content', resource => {
  const actions = show(resource, { entries: [], content: { gallery: [], teams: [] } });
  const frame = screen.getByTitle(`Desktop ${resource} website preview`);
  const send = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.load(frame);
  expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ includeDraft: false, content: expect.objectContaining({ [resource]: [] }) }), window.location.origin);
  expect(screen.getByRole('heading', { name: resource === 'gallery' ? 'Start your club album.' : 'Introduce your first team.' })).toBeVisible();
  fireEvent.click(screen.getAllByRole('button', { name: resource === 'gallery' ? 'Add image' : 'Add team' })[0]);
  expect(actions.onNew).toHaveBeenCalledOnce();
});

it('disables card selection and mutations while an operation is running', () => {
  const actions = show('gallery', { busy: true });
  const select = screen.getByRole('button', { name: 'Preview Gathering poster' });
  const edit = screen.getByRole('button', { name: 'Edit Gathering poster' });
  expect(select).toBeDisabled();
  expect(edit).toBeDisabled();
  fireEvent.click(edit);
  expect(actions.onEdit).not.toHaveBeenCalled();
});
