import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminHeroEditor from './AdminHeroEditor';
import AdminHeroSection from './AdminHeroSection';
import { api, post } from '../../utils/api';
import { defaultHero } from '../../utils/homeContent';

vi.mock('../../utils/api', () => ({ api: vi.fn(), post: vi.fn() }));
// jsdom does not execute the preview frame's module entry point. Render the same
// hero here; the frame transport is covered separately in HeroPreview.test.jsx.
vi.mock('./AdminHeroPreview', async () => {
  const { ContentContext } = await import('../../contexts/ContentContext');
  const { default: Hero } = await import('../Home/Hero');
  return { default: ({ hero, index, onSelect }) => <div aria-label="Selected hero image preview"><ContentContext.Provider value={{ home: [hero] }}><Hero activeIndex={index} onPhotoChange={onSelect} autoPlay={false}/></ContentContext.Provider></div> };
});
const hero = {
  id: 'hero', _id: 'opening', revision: 4, title: 'Default welcome', description: 'Default introduction',
  slides: [
    { id: 'campus', name: 'Campus', image: '/campus.jpg', title: '', description: '' },
    { id: 'community', name: 'Community', image: '/community.jpg', title: 'A shared welcome', description: 'Our club community.' },
    { id: 'learning', name: 'Learning', image: '/learning.jpg', title: '', description: '' },
  ],
};
const editor = () => render(<AdminHeroEditor item={hero} onClose={vi.fn()} onSaved={vi.fn()}/>);
beforeEach(() => { vi.clearAllMocks(); api.mockResolvedValue({}); });

it('lets administrators explore the sequence with buttons and the keyboard', () => {
  render(<AdminHeroSection hero={hero}/>);
  const sequence = screen.getByRole('list', { name: 'Hero image sequence' });
  const buttons = within(sequence).getAllByRole('button');
  expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Next hero image' }));
  expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByLabelText('Selected hero image preview').querySelector('img[data-active="true"]')).toHaveAttribute('src', '/community.jpg');
  fireEvent.keyDown(buttons[1], { key: 'End' });
  expect(buttons[2]).toHaveFocus();
  expect(buttons[2]).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(buttons[2], { key: 'ArrowDown' });
  expect(buttons[0]).toHaveFocus();
  expect(within(sequence).getAllByText('Shared caption')).toHaveLength(2);
});

it('edits the selected image, preserves its selection when reordered and saves the new order', async () => {
  editor();
  fireEvent.click(screen.getByRole('button', { name: 'Preview hero image 2' }));
  fireEvent.change(screen.getByLabelText('Photo 2 headline'), { target: { value: 'Meet your community' } });
  fireEvent.click(screen.getByRole('button', { name: 'Move photo 2 up' }));
  expect(screen.getByLabelText('Photo 1 name')).toHaveValue('Community');
  expect(screen.getByLabelText('Photo 1 headline')).toHaveValue('Meet your community');
  expect(screen.getByRole('button', { name: 'Preview hero image 1' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(api).toHaveBeenCalled());
  const { data, revision } = api.mock.calls[0][1].body;
  expect(revision).toBe(4);
  expect(data.slides.map(slide => slide.id)).toEqual(['community', 'campus', 'learning']);
  expect(data.slides[0].title).toBe('Meet your community');
  expect(data.slides[1].title).toBe('');
  expect(data.title).toBe('Default welcome');
  expect(data.description).toBe('Default introduction');
});

it('previews shared wording and switches device sizes without changing the draft', () => {
  editor();
  expect(within(screen.getByLabelText('Selected hero image preview')).getByRole('heading')).toHaveTextContent('A shared welcome');
  fireEvent.click(screen.getByRole('button', { name: 'Mobile preview' }));
  expect(screen.getByRole('button', { name: 'Mobile preview' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Preview hero image 2' }));
  fireEvent.click(screen.getByRole('button', { name: 'Use shared caption' }));
  expect(screen.getByLabelText('Photo 2 headline')).toHaveValue('');
  expect(within(screen.getByLabelText('Selected hero image preview')).getByRole('heading')).toHaveTextContent('Default welcome');
  expect(screen.queryByRole('button', { name: 'Edit default wording' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Default headline')).not.toBeInTheDocument();
});

it('requires an image for new slides and returns to an unchanged draft after removing one', () => {
  editor();
  fireEvent.click(screen.getByRole('button', { name: 'Add hero image' }));
  expect(screen.getByLabelText('Photo 4 name')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Choose an image for every hero slide before saving.');
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Remove photo 4' }));
  expect(screen.getByLabelText('Photo 3 name')).toHaveValue('Learning');
  expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
});

it('locks image selection and preview controls while uploading, then updates the intended image', async () => {
  let finish;
  post.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  editor();
  fireEvent.click(screen.getByRole('button', { name: 'Preview hero image 2' }));
  fireEvent.change(screen.getByLabelText('Upload hero image 2'), { target: { files: [new File(['image'], 'community.jpg', { type: 'image/jpeg' })] } });
  expect(screen.getByRole('button', { name: 'Preview hero image 1' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Mobile preview' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Move photo 2 up' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled();
  await act(async () => finish({ url: '/updated-community.jpg' }));
  expect(screen.getByAltText('Hero image 2 preview')).toHaveAttribute('src', '/updated-community.jpg');
  fireEvent.click(screen.getByRole('button', { name: 'Preview hero image 1' }));
  expect(screen.getByAltText('Hero image 1 preview')).toHaveAttribute('src', '/campus.jpg');
});

it('keeps the hero controls disabled until saving completes', async () => {
  let finish;
  api.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  editor();
  fireEvent.change(screen.getByLabelText('Photo 1 headline'), { target: { value: 'A new welcome' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(screen.getByRole('button', { name: 'Preview hero image 2' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Add hero image' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Desktop preview' })).toBeDisabled();
  await act(async () => finish({}));
});

it('shows the Arabic greeting in the image preview without a duplicate overview card', () => {
  render(<AdminHeroSection hero={hero}/>);
  const greeting = within(screen.getByLabelText('Selected hero image preview')).getByText(defaultHero.arabicGreeting);
  expect(greeting).toHaveAttribute('lang', 'ar');
  expect(greeting).toHaveAttribute('dir', 'rtl');
  expect(screen.getAllByText(defaultHero.arabicGreeting)).toHaveLength(1);
  expect(screen.queryByRole('heading', { name: 'Arabic greeting' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next hero image' }));
  expect(greeting).toBeVisible();
});

it('previews and saves one Arabic greeting across all hero images', async () => {
  editor();
  const wording = within(screen.getByRole('group', { name: 'Hero wording' }));
  const field = wording.getByRole('textbox', { name: 'Arabic greeting' });
  expect(wording.getAllByRole('textbox')).toEqual([screen.getByLabelText('Photo 1 headline'), field, screen.getByLabelText('Photo 1 introduction')]);
  expect(screen.queryByRole('heading', { name: 'Arabic greeting' })).not.toBeInTheDocument();
  expect(screen.queryByText('Default wording')).not.toBeInTheDocument();
  expect(field).toHaveAttribute('dir', 'rtl');
  fireEvent.change(field, { target: { value: 'أهلاً وسهلاً بكم' } });
  const preview = screen.getByLabelText('Selected hero image preview');
  expect(within(preview).getByText('أهلاً وسهلاً بكم')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Preview hero image 3' }));
  expect(within(preview).getByText('أهلاً وسهلاً بكم')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(api).toHaveBeenCalled());
  expect(api.mock.calls[0][1].body.data.arabicGreeting).toBe('أهلاً وسهلاً بكم');
});
