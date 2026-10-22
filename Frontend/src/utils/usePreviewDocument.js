import { useEffect, useRef } from 'react';

// Preview documents can be taller than the phone viewport. Keep vertical scrolling
// available, then let native scroll chaining reach the editor at either end.
const documentClasses = ['overflow-x-hidden', 'overflow-y-auto', '[scrollbar-gutter:auto]', '[scrollbar-width:thin]'];

export default function usePreviewDocument(model, messages, identity) {
  const content = useRef(null);
  useEffect(() => {
    const added = documentClasses.filter(name => !document.documentElement.classList.contains(name));
    document.documentElement.classList.add(...added);
    return () => document.documentElement.classList.remove(...added);
  }, []);
  useEffect(() => {
    const element = content.current;
    if (!model || !element) return;
    let active = true;
    let pending;
    let previous = '';
    const report = () => {
      if (!active) return;
      const width = window.innerWidth;
      const height = Math.ceil(element.getBoundingClientRect().height);
      const size = `${width}:${height}`;
      if (height <= 0 || size === previous) return;
      previous = size;
      window.parent.postMessage({ type: messages.resize, ...identity, width, height }, window.location.origin);
    };
    const schedule = () => { if (!active) return; cancelAnimationFrame(pending); pending = requestAnimationFrame(report); };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(element);
    schedule();
    document.fonts?.ready.then(schedule);
    element.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);
    return () => { active = false; cancelAnimationFrame(pending); observer?.disconnect(); element.removeEventListener('load', schedule, true); window.removeEventListener('resize', schedule); };
  }, [model, messages, identity]);
  return content;
}
