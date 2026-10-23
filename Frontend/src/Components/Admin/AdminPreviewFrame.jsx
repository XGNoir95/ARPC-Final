import { useEffect, useRef, useState } from 'react';
import { heroPreviewViewports } from '../../utils/heroPreview';
import AdminPreviewStage from './AdminPreviewStage';

// Every editor renders the real website at the same viewport, then scales it
// into a stable full-row stage. Mobile keeps a readable phone width and scrolls
// inside its viewport, rather than shrinking long pages into a miniature strip.
export default function AdminPreviewFrame({ device, height, frame, title, label, ready, disabled, src, onLoad, className = '' }) {
  const container = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const viewport = heroPreviewViewports[device];
  const contentHeight = height || viewport.height;
  const mobile = device === 'mobile';
  const scale = mobile ? Math.min(1, size.width / viewport.width) : Math.min(1, size.width / viewport.width, size.height / contentHeight);
  const frameHeight = mobile ? viewport.height : contentHeight;
  useEffect(() => {
    const measure = () => {
      const width = container.current?.clientWidth || 0;
      const height = container.current?.clientHeight || 0;
      setSize(current => current.width === width && current.height === height ? current : { width, height });
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(container.current);
    const initial = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(initial); observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  return <AdminPreviewStage device={device} className={className}>
    <div ref={container} aria-label={label} aria-busy={!ready} inert={disabled} className="flex size-full min-h-0 min-w-0 items-center justify-center" style={{ '--preview-width': `${viewport.width}px`, '--preview-height': `${frameHeight}px`, '--preview-scale': scale, '--preview-display-width': `${viewport.width * scale}px`, '--preview-display-height': `${frameHeight * scale}px` }}>
      <div className="relative h-(--preview-display-height) min-h-1 w-(--preview-display-width) shrink-0 overflow-hidden rounded-xl bg-page ring-1 ring-ink/15"><iframe ref={frame} title={title} src={src} onLoad={onLoad} className="block h-(--preview-height) w-(--preview-width) origin-top-left scale-(--preview-scale) border-0"/></div>
    </div>
    <p className="min-w-0 text-center text-sm leading-5 text-muted">{mobile && contentHeight > viewport.height + 1 ? 'Scroll inside the phone' : ''}</p>
  </AdminPreviewStage>;
}
