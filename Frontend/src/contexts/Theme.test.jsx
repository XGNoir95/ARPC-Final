import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ThemeProvider from './ThemeProvider';
import ThemeToggle from '../Components/ThemeToggle';
import { THEME_KEY } from '../utils/theme';

beforeEach(() => {
  localStorage.removeItem(THEME_KEY);
  document.head.insertAdjacentHTML('beforeend', '<meta name="theme-color" content="#ffffff">');
});
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals();
  localStorage.removeItem(THEME_KEY);
  delete document.documentElement.dataset.theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach(element => element.remove());
});
const show = () => render(<ThemeProvider><ThemeToggle/></ThemeProvider>);

it('switches directly between light and dark with one click and no selection menu', () => {
  show();const button=screen.getByRole('button',{name:'Toggle dark mode'});button.focus();
  expect(button).toHaveAttribute('aria-pressed','false');
  fireEvent.click(button);
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  expect(button).toHaveAttribute('aria-pressed','true');
  expect(button).toHaveAttribute('title','Switch to light mode');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(button).toHaveFocus();
  fireEvent.click(button);
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(localStorage.getItem(THEME_KEY)).toBe('light');
  expect(button).toHaveAttribute('aria-pressed','false');
  expect(button).toHaveAttribute('title','Switch to dark mode');
});

it('restores the saved choice and updates the browser chrome color', () => {
  localStorage.setItem(THEME_KEY,'dark');show();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.querySelector('meta[name="theme-color"]').content).toBe('#0a0a0a');
  fireEvent.click(screen.getByRole('button',{name:'Toggle dark mode'}));
  expect(document.querySelector('meta[name="theme-color"]').content).toBe('#ffffff');
});

it('keeps the original light appearance by default, even on a dark device', () => {
  vi.stubGlobal('matchMedia',vi.fn(()=>({matches:true})));show();
  expect(document.documentElement.dataset.theme).toBe('light');
});

it('synchronizes explicit choices and cleared preferences between tabs', () => {
  show();
  act(()=>window.dispatchEvent(new StorageEvent('storage',{key:THEME_KEY,newValue:'dark'})));
  expect(document.documentElement.dataset.theme).toBe('dark');
  act(()=>window.dispatchEvent(new StorageEvent('storage',{key:null,newValue:null})));
  expect(document.documentElement.dataset.theme).toBe('light');
});

it('still toggles when browser storage is blocked', () => {
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('Storage blocked');});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('Storage blocked');});
  show();fireEvent.click(screen.getByRole('button',{name:'Toggle dark mode'}));
  expect(document.documentElement.dataset.theme).toBe('dark');
  fireEvent.click(screen.getByRole('button',{name:'Toggle dark mode'}));
  expect(document.documentElement.dataset.theme).toBe('light');
});

const boot=readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
it.each([['dark','dark'],['light','light'],[null,'light'],['system','light']])('applies the %s saved choice before React starts',(preference,expected)=>{
  const page={documentElement:{dataset:{}},querySelector:()=>({content:''})};
  runInNewContext(boot,{document:page,localStorage:{getItem:()=>preference}});
  expect(page.documentElement.dataset.theme).toBe(expected);
});

it('boots in light mode when storage is unavailable',()=>{
  const page={documentElement:{dataset:{}},querySelector:()=>({content:''})};
  runInNewContext(boot,{document:page,localStorage:{getItem:()=>{throw new Error('Blocked');}}});
  expect(page.documentElement.dataset.theme).toBe('light');
});
