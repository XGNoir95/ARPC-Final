import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminHomepageEditor from './AdminHomepageEditor';
import { api, post } from '../utils/api';
import { aboutCards } from '../data/about';

vi.mock('../utils/api', () => ({ api: vi.fn(), post: vi.fn() }));
const records = aboutCards.map((card, index) => ({ ...card, _id: `record-${card.id}`, revision: index + 3, live: index !== 1 }));
const select = name => fireEvent.click(screen.getByRole('button', { name: `Preview ${name}` }));
const edit = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
function show(props = {}) {
  const onClose = vi.fn(), onSaved = vi.fn();
  render(<MemoryRouter><AdminHomepageEditor item={records[0]} content={{ home: records }} onClose={onClose} onSaved={onSaved} {...props}/></MemoryRouter>);
  return { onClose, onSaved };
}
beforeEach(() => { vi.clearAllMocks(); api.mockResolvedValue({}); });

it.each(records)('opens $title with all three About editing choices', record => {
  show({ item: record });
  expect(screen.getByLabelText('Card heading')).toHaveValue(record.title);
  expect(screen.getByRole('button', { name: `Preview ${record.title}` })).toHaveAttribute('aria-pressed', 'true');
  for (const card of records) expect(screen.getByRole('button', { name: `Preview ${card.title}` })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
});

it('switches preview and every editable field while retaining unsaved changes on each About card', () => {
  show();
  const frame = screen.getByTitle('Desktop home website preview');
  const preview = vi.spyOn(frame.contentWindow, 'postMessage');
  const edits = [['Card heading', 'Our campus community'], ['Card label', 'Meet us'], ['Short introduction', 'A shared introduction.'], ['Full description', 'A longer community story.'], ['Button text', 'Browse photos'], ['Button destination', '/gallery'], ['Card image online image link', 'https://images.example.com/community.jpg']];
  for (const [label, value] of edits) edit(label, value);
  select('Our Mission');
  expect(screen.getByLabelText('Card heading')).toHaveValue('Our Mission');
  expect(screen.getByLabelText('Short introduction')).toHaveValue(records[1].summary);
  expect(preview).toHaveBeenLastCalledWith(expect.objectContaining({ entry: expect.objectContaining({ id: 'our-mission' }), selection: 'our-mission' }), window.location.origin);
  edit('Card heading', 'Our shared mission');
  select('Our Vision');
  expect(screen.getByLabelText('Card heading')).toHaveValue('Our Vision');
  select('Our campus community');
  for (const [label, value] of edits) expect(screen.getByLabelText(label)).toHaveValue(value);
  expect(preview).toHaveBeenLastCalledWith(expect.objectContaining({ entry: expect.objectContaining({ id: 'about-us', title: 'Our campus community', image: 'https://images.example.com/community.jpg' }) }), window.location.origin);
  select('Our shared mission');
  expect(screen.getByLabelText('Card heading')).toHaveValue('Our shared mission');
  expect(api).not.toHaveBeenCalled();
});

it('saves only the selected About card, retains other edits and uses the returned revision next time', async () => {
  const { onClose, onSaved } = show();
  edit('Card heading', 'Unsaved About');
  select('Our Mission');
  edit('Short introduction', 'Updated mission introduction.');
  api.mockImplementationOnce((_, options) => Promise.resolve({ _id: records[1]._id, revision: 10, draft: options.body.data }));
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(api).toHaveBeenCalledExactlyOnceWith('/admin/content/home/record-our-mission', expect.objectContaining({ method: 'PATCH', body: expect.objectContaining({ revision: 4, data: expect.objectContaining({ id: 'our-mission', summary: 'Updated mission introduction.' }) }) }));
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  select('Unsaved About');
  expect(screen.getByLabelText('Card heading')).toHaveValue('Unsaved About');
  select('Our Mission');
  edit('Short introduction', 'Another mission introduction.');
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2));
  expect(api.mock.calls[1][1].body.revision).toBe(10);
  expect(onClose).not.toHaveBeenCalled();
  select('Unsaved About');
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(api.mock.calls[2]).toEqual(['/admin/content/home/record-about-us', expect.objectContaining({ body: expect.objectContaining({ revision: 3, data: expect.objectContaining({ id: 'about-us', title: 'Unsaved About' }) }) })]);
});

it('creates a missing About card from its defaults, then edits the created record without losing another draft', async () => {
  const { onClose, onSaved } = show({ content: { home: [records[0], { id: 'our-vision', title: 'Public snapshot only' }] } });
  edit('Short introduction', 'Keep this unsaved.');
  select('Our Vision');
  edit('Short introduction', 'Our new vision introduction.');
  api.mockImplementationOnce((_, options) => Promise.resolve({ _id: 'new-vision', revision: 1, draft: options.body.data }));
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(api.mock.calls[0]).toEqual(['/admin/content/home', expect.objectContaining({ method: 'POST', body: expect.objectContaining({ data: expect.objectContaining({ id: 'our-vision', title: 'Our Vision' }) }) })]);
  expect(onClose).not.toHaveBeenCalled();
  edit('Short introduction', 'Updated vision introduction.');
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2));
  expect(api.mock.calls[1]).toEqual(['/admin/content/home/new-vision', expect.objectContaining({ method: 'PATCH', body: expect.objectContaining({ revision: 1 }) })]);
  select('About Us');
  expect(screen.getByLabelText('Short introduction')).toHaveValue('Keep this unsaved.');
});

it('locks About selection during uploads and saves so results stay on the intended card', async () => {
  let finish;
  post.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  show();
  fireEvent.change(screen.getByLabelText('Upload card image'), { target: { files: [new File(['image'], 'about.png', { type: 'image/png' })] } });
  expect(screen.getByRole('button', { name: 'Preview Our Mission' })).toBeDisabled();
  select('Our Mission');
  expect(screen.getByLabelText('Card heading')).toHaveValue('About Us');
  await act(async () => finish({ url: '/api/assets/about-photo' }));
  expect(screen.getByAltText('Card image preview')).toHaveAttribute('src', '/api/assets/about-photo');
  select('Our Mission');
  edit('Short introduction', 'A new mission.');
  api.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  save();
  expect(screen.getByRole('button', { name: 'Preview About Us' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Mobile preview' })).toBeDisabled();
  select('About Us');
  expect(screen.getByLabelText('Card heading')).toHaveValue('Our Mission');
  await act(async () => finish({}));
  select('About Us');
  expect(screen.getByAltText('Card image preview')).toHaveAttribute('src', '/api/assets/about-photo');
});

it('preserves unsaved cards when saving fails and permits retrying the correct target', async () => {
  api.mockRejectedValueOnce({ userFacing: true, message: 'A newer draft exists. Refresh before saving.' });
  const { onClose } = show();
  edit('Card heading', 'Unsaved About');
  select('Our Mission');
  edit('Short introduction', 'Unsaved mission.');
  save();
  expect(await screen.findByRole('alert')).toHaveTextContent('A newer draft exists.');
  expect(onClose).not.toHaveBeenCalled();
  select('Unsaved About');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  select('Our Mission');
  expect(screen.getByLabelText('Short introduction')).toHaveValue('Unsaved mission.');
  save();
  await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  expect(api.mock.calls[1][0]).toBe('/admin/content/home/record-our-mission');
});
