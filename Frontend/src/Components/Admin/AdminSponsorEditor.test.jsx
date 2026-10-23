import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminSponsorEditor from './AdminSponsorEditor';
import { api, post } from '../../utils/api';

vi.mock('../../utils/api', () => ({ api: vi.fn(), post: vi.fn() }));

const sponsors = [
  { _id: 'record-one', id: 'one', revision: 3, name: 'First partner', src: '/first.jpg', wide: false, live: true },
  { _id: 'record-two', id: 'two', revision: 7, name: 'Second partner', src: '/second.jpg', wide: true, live: true },
  { _id: 'record-private', id: 'private', revision: 2, name: 'Private partner', src: '/private.jpg', wide: false, live: false },
];

function show(props = {}) {
  const onClose = vi.fn(), onSaved = vi.fn();
  const result = render(<MemoryRouter><AdminSponsorEditor item={sponsors[0]} content={{ sponsors }} onClose={onClose} onSaved={onSaved} {...props}/></MemoryRouter>);
  return { ...result, onClose, onSaved };
}

const select = name => fireEvent.click(screen.getByRole('button', { name: `Preview ${name}` }));
const changeName = name => fireEvent.change(screen.getByLabelText('Sponsor name'), { target: { value: name } });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));

beforeEach(() => { vi.clearAllMocks(); api.mockResolvedValue({}); });

it('switches the preview, name, logo, proportions and save target to the selected sponsor', async () => {
  const { onClose } = show();
  const frame = screen.getByTitle('Desktop sponsors website preview');
  const send = vi.spyOn(frame.contentWindow, 'postMessage');
  select('Second partner');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Second partner');
  expect(screen.getByAltText('Logo preview')).toHaveAttribute('src', '/second.jpg');
  expect(screen.getByRole('radio', { name: /^Wide/ })).toBeChecked();
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ entry: expect.objectContaining({ id: 'two', name: 'Second partner' }), selection: 'two' }), window.location.origin);

  changeName('Updated second partner');
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(api).toHaveBeenCalledExactlyOnceWith('/admin/content/sponsors/record-two', {
    method: 'PATCH', body: { revision: 7, data: { id: 'two', name: 'Updated second partner', src: '/second.jpg', wide: true } },
  });
});

it('retains unsaved fields for every sponsor while switching, including unpublished drafts', () => {
  show();
  changeName('Unsaved first');
  fireEvent.change(screen.getByLabelText('Logo online image link'), { target: { value: 'https://images.example.com/new-first.jpg' } });
  fireEvent.click(screen.getByRole('radio', { name: /^Wide/ }));
  select('Private partner');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Private partner');
  expect(screen.getByAltText('Logo preview')).toHaveAttribute('src', '/private.jpg');
  expect(screen.getByRole('radio', { name: /^Standard/ })).toBeChecked();
  changeName('Unsaved private');
  select('Unsaved first');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Unsaved first');
  expect(screen.getByLabelText('Logo online image link')).toHaveValue('https://images.example.com/new-first.jpg');
  expect(screen.getByRole('radio', { name: /^Wide/ })).toBeChecked();
  select('Unsaved private');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Unsaved private');
  expect(api).not.toHaveBeenCalled();
});

it('saves only the selected sponsor and keeps other unsaved edits open with the latest saved revision', async () => {
  const { onClose, onSaved } = show();
  changeName('Unsaved first');
  select('Second partner');
  changeName('Updated second');
  api.mockResolvedValueOnce({ _id: 'record-two', revision: 8, live: true, draft: { id: 'two', name: 'Updated second', src: '/second.jpg', wide: true } });
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Updated second');

  select('Unsaved first');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Unsaved first');
  select('Updated second');
  changeName('Second revision');
  api.mockResolvedValueOnce({ _id: 'record-two', revision: 9, live: true, draft: { id: 'two', name: 'Second revision', src: '/second.jpg', wide: true } });
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2));
  expect(api.mock.calls[1][1].body.revision).toBe(8);
  expect(onClose).not.toHaveBeenCalled();

  select('Unsaved first');
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(api.mock.calls[2]).toEqual(['/admin/content/sponsors/record-one', expect.objectContaining({ body: expect.objectContaining({ revision: 3, data: expect.objectContaining({ name: 'Unsaved first' }) }) })]);
});

it('keeps a new sponsor separate from existing records and switches a saved creation to PATCH', async () => {
  const { onClose, onSaved } = show({ item: null });
  changeName('New partner');
  fireEvent.change(screen.getByLabelText('Logo online image link'), { target: { value: 'https://images.example.com/new.jpg' } });
  select('Second partner');
  changeName('Unsaved second');
  select('New partner');
  const id = screen.getByRole('button', { name: 'Preview New partner' });
  expect(id).toHaveAttribute('aria-pressed', 'true');
  api.mockImplementationOnce((_, options) => Promise.resolve({ _id: 'new-record', revision: 1, live: false, draft: options.body.data }));
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(api.mock.calls[0][0]).toBe('/admin/content/sponsors');
  expect(api.mock.calls[0][1].method).toBe('POST');
  expect(onClose).not.toHaveBeenCalled();
  changeName('Renamed new partner');
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(2));
  expect(api.mock.calls[1][0]).toBe('/admin/content/sponsors/new-record');
  expect(api.mock.calls[1][1].method).toBe('PATCH');
  expect(api.mock.calls[1][1].body.revision).toBe(1);
});

it('retains an incomplete new sponsor when saving another card', async () => {
  const { onClose, onSaved } = show({ item: null });
  fireEvent.click(screen.getByRole('radio', { name: /^Wide/ }));
  select('First partner');
  changeName('Updated first');
  save();
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  expect(onClose).not.toHaveBeenCalled();
  select('Untitled draft');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('');
  expect(screen.getByRole('radio', { name: /^Wide/ })).toBeChecked();
});

it('locks sponsor selection during saves and uploads so results cannot land on another record', async () => {
  let finish;
  post.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  show();
  fireEvent.change(screen.getByLabelText('Upload logo'), { target: { files: [new File(['logo'], 'logo.png', { type: 'image/png' })] } });
  expect(screen.getByRole('button', { name: 'Preview Second partner' })).toBeDisabled();
  select('Second partner');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('First partner');
  await act(async () => finish({ url: '/uploaded.jpg' }));
  expect(screen.getByAltText('Logo preview')).toHaveAttribute('src', '/uploaded.jpg');
  select('Second partner');
  changeName('Updated second');
  api.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  save();
  expect(screen.getByRole('button', { name: 'Preview First partner' })).toBeDisabled();
  select('First partner');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Updated second');
  await act(async () => finish({ _id: 'record-two', revision: 8 }));
});

it('keeps failed edits with their sponsor and does not carry its save error to another card', async () => {
  show();
  changeName('Failed first');
  api.mockRejectedValueOnce(Object.assign(new Error('Refresh before saving again.'), { userFacing: true }));
  save();
  expect(await screen.findByRole('alert')).toHaveTextContent('Refresh before saving again.');
  select('Second partner');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  select('Failed first');
  expect(screen.getByLabelText('Sponsor name')).toHaveValue('Failed first');
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
});
