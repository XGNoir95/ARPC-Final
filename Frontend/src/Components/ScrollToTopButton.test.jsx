import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ScrollToTopButton from './ScrollToTopButton';

const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
const setScrollY = value => Object.defineProperty(window, 'scrollY', { configurable: true, value });

beforeEach(() => {
  setScrollY(0);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'scrollY', originalScrollY);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('stays mounted at the top and enables after a small scroll without a visibility threshold', () => {
  render(<ScrollToTopButton />);
  const button = screen.getByRole('button', { name: 'Scroll to top' });
  expect(button).toBeVisible();
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('title', 'Already at the top');
  fireEvent.click(button);
  expect(window.scrollTo).not.toHaveBeenCalled();

  setScrollY(24);fireEvent.scroll(window);
  expect(button).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Scroll to top' })).toBe(button);
  setScrollY(0);fireEvent.scroll(window);
  expect(button).toBeVisible();
  expect(button).toBeDisabled();
});

it('initializes correctly on an already scrolled page and updates after restoration or resize', () => {
  setScrollY(180);
  render(<ScrollToTopButton />);
  const button = screen.getByRole('button', { name: 'Scroll to top' });
  expect(button).toBeEnabled();
  setScrollY(0);fireEvent(window, new Event('pageshow'));
  expect(button).toBeDisabled();
  setScrollY(90);fireEvent.resize(window);
  expect(button).toBeEnabled();
});

it.each([[false, 'smooth'], [true, 'instant']])('returns to the top with the correct motion preference (%s)', (reduced, behavior) => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduced })));
  setScrollY(600);
  render(<ScrollToTopButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior });
});
