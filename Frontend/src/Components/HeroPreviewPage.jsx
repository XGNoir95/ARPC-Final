import { useEffect, useLayoutEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { ContentContext } from '../ContentContext';
import { ThemeContext } from '../ThemeContext';
import { applyTheme, normalizeTheme } from '../utils/theme';
import { heroPreviewMessages as messages } from '../utils/heroPreview';
import usePreviewDocument from '../utils/usePreviewDocument';
import Navbar from './Navbar';
import Hero from './Home/Hero';
import FloatingControls from './FloatingControls';

export default function HeroPreviewPage() {
  const [model, setModel] = useState(null);
  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== messages.update) return;
      const { hero, index, theme, disabled } = event.data;
      if (!hero || hero.id !== 'hero' || !Number.isInteger(index) || index < 0) return;
      setModel({ hero, index, theme: normalizeTheme(theme), disabled: Boolean(disabled) });
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: messages.ready }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  useLayoutEffect(() => { if (model) applyTheme(model.theme); }, [model]);
  const content = usePreviewDocument(model, messages);

  if (!model) return <div role="status" className="flex min-h-svh items-center justify-center bg-page text-sm text-muted">Loading hero preview…</div>;
  const select = index => {
    if (model.disabled) return;
    setModel({ ...model, index });
    window.parent.postMessage({ type: messages.select, index }, window.location.origin);
  };
  return <ThemeContext.Provider value={{ theme: model.theme, setPreference: theme => setModel({ ...model, theme: normalizeTheme(theme) }) }}>
    <AuthContext.Provider value={{ profile: null, status: 'guest' }}>
      <ContentContext.Provider value={{ home: [model.hero], programmes: [], hasData: true }}>
        <MemoryRouter>
          <div inert={model.disabled} className="relative flex min-h-screen flex-col bg-page text-ink [--preview-base-height:844px] lg:[--preview-base-height:900px]">
            <div className="absolute inset-x-0 top-0 z-50"><Navbar blendWithHero/></div>
            <div ref={content} data-preview-content className="flow-root [&_#hero]:min-h-(--preview-base-height)"><Hero activeIndex={model.index} onPhotoChange={select} autoPlay={false}/></div>
            <FloatingControls showScrollToTop={false}/>
          </div>
        </MemoryRouter>
      </ContentContext.Provider>
    </AuthContext.Provider>
  </ThemeContext.Provider>;
}
