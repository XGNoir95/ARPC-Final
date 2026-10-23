import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AdminHeroPreview from './Admin/AdminHeroPreview';
import HeroPreviewPage from './HeroPreviewPage';
import { ThemeContext } from '../contexts/ThemeContext';
import { heroPreviewMessages as messages } from '../utils/heroPreview';

const hero = { id: 'hero', title: 'Default welcome', description: 'Default introduction', arabicGreeting: 'السلام عليكم', slides: [
  { id: 'one', name: '', image: '/one.jpg', title: 'Our first headline', description: 'Our first introduction' },
  { id: 'two', name: '', image: '/two.jpg', title: 'Our second headline', description: 'Our second introduction' },
] };
const message = (source, data, origin = window.location.origin) => fireEvent(window, new MessageEvent('message', { source, origin, data }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); delete document.documentElement.dataset.theme; });

it('sends draft edits, selection and theme only to its own preview frame', () => {
  const select = vi.fn();
  const { rerender } = render(<ThemeContext.Provider value={{ theme: 'dark' }}><AdminHeroPreview hero={hero} index={1} onSelect={select}/></ThemeContext.Provider>);
  const frame = screen.getByTitle('Desktop homepage hero preview');
  const post = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.load(frame);
  expect(post).toHaveBeenLastCalledWith({ type: messages.update, hero, index: 1, theme: 'dark', disabled: false }, window.location.origin);
  message(frame.contentWindow, { type: messages.ready });
  expect(screen.getByLabelText('Selected hero image preview')).toHaveAttribute('aria-busy', 'false');
  message(window, { type: messages.select, index: 0 });
  message(frame.contentWindow, { type: messages.select, index: 0 }, 'https://unrelated.example');
  message(frame.contentWindow, { type: messages.select, index: 99 });
  expect(select).not.toHaveBeenCalled();
  message(frame.contentWindow, { type: messages.select, index: 0 });
  expect(select).toHaveBeenCalledExactlyOnceWith(0);
  rerender(<ThemeContext.Provider value={{ theme: 'light' }}><AdminHeroPreview hero={{ ...hero, title: 'Draft edit' }} index={0} onSelect={select} disabled/></ThemeContext.Provider>);
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ hero: expect.objectContaining({ title: 'Draft edit' }), theme: 'light', disabled: true }), window.location.origin);
  message(frame.contentWindow, { type: messages.select, index: 1 });
  expect(select).toHaveBeenCalledTimes(1);
});

it('scales the complete desktop viewport and switches to a real mobile viewport', () => {
  let resized;
  vi.stubGlobal('ResizeObserver', class { constructor(callback) { resized = callback; } observe() {} disconnect() {} });
  const { rerender } = render(<AdminHeroPreview hero={hero}/>);
  const container = screen.getByLabelText('Selected hero image preview');
  Object.defineProperty(container, 'clientWidth', { configurable: true, value: 720 });
  Object.defineProperty(container, 'clientHeight', { configurable: true, value: 1000 });
  act(() => resized());
  expect(container.style.getPropertyValue('--preview-width')).toBe('1440px');
  expect(container.style.getPropertyValue('--preview-height')).toBe('900px');
  expect(container.style.getPropertyValue('--preview-scale')).toBe('0.5');
  expect(container.style.getPropertyValue('--preview-display-height')).toBe('450px');
  const frame = screen.getByTitle('Desktop homepage hero preview');
  message(window, { type: messages.resize, width: 1440, height: 1200 });
  expect(container.style.getPropertyValue('--preview-height')).toBe('900px');
  message(frame.contentWindow, { type: messages.resize, width: 1440, height: 1200 });
  expect(container.style.getPropertyValue('--preview-display-height')).toBe('600px');
  message(frame.contentWindow, { type: messages.resize, width: 1440, height: 900 });
  expect(container.style.getPropertyValue('--preview-height')).toBe('900px');
  rerender(<AdminHeroPreview hero={hero} device="mobile"/>);
  act(() => resized());
  expect(screen.getByTitle('Mobile homepage hero preview')).toHaveAttribute('src', '/index.html?arpc-hero-preview=1');
  expect(container.style.getPropertyValue('--preview-width')).toBe('390px');
  expect(container.style.getPropertyValue('--preview-height')).toBe('844px');
  expect(container.style.getPropertyValue('--preview-scale')).toBe('1');
  expect(container.style.getPropertyValue('--preview-display-width')).toBe('390px');
});

it('renders the real visitor navbar, hero, date, CTA and controls from the parent draft', () => {
  vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  render(<HeroPreviewPage/>);
  expect(window.parent.postMessage).toHaveBeenCalledWith({ type: messages.ready }, window.location.origin);
  message(window.parent, { type: messages.update, hero, index: 0, theme: 'dark' }, 'https://unrelated.example');
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  message(window.parent, { type: messages.update, hero, index: 1, theme: 'dark' });
  expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our second headline');
  expect(screen.getByText('السلام عليكم')).toHaveAttribute('dir', 'rtl');
  expect(screen.getByRole('button', { name: 'Discover ARPC' })).toBeVisible();
  expect(document.querySelector('time')).toBeVisible();
  expect(screen.getByRole('group', { name: 'Page controls' })).toBeVisible();
  expect(within(screen.getByRole('group', { name: 'Page controls' })).getAllByRole('button')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Scroll to top' })).not.toBeInTheDocument();
  expect(document.documentElement.dataset.theme).toBe('dark');
  const controls = within(screen.getByRole('group', { name: 'Hero photos' }));
  fireEvent.click(controls.getByRole('button', { name: '01: Image 1' }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our first headline');
  expect(window.parent.postMessage).toHaveBeenLastCalledWith({ type: messages.select, index: 0 }, window.location.origin);
  message(window.parent, { type: messages.update, hero: { ...hero, arabicGreeting: 'مرحبا' }, index: 0, theme: 'light', disabled: true });
  expect(screen.getByText('مرحبا')).toBeVisible();
  expect(screen.getByRole('heading', { level: 1 }).closest('[inert]')).not.toBeNull();
  fireEvent.click(controls.getByRole('button', { name: '02: Image 2' }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our first headline');
});
