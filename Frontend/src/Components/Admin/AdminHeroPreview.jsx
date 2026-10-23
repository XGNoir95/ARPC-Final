import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { heroPreviewMessages as messages, heroPreviewViewports } from '../../utils/heroPreview';
import AdminPreviewFrame from './AdminPreviewFrame';

export default function AdminHeroPreview({ hero, index = 0, device = 'desktop', className = '', onSelect, disabled = false }) {
  const { theme } = useTheme();
  const frame = useRef(null);
  const [ready, setReady] = useState(false);
  const [heights, setHeights] = useState({});
  const viewport = heroPreviewViewports[device];
  const height = Math.max(viewport.height, heights[viewport.width] || 0);
  const send = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: messages.update, hero, index, theme, disabled }, window.location.origin);
  }, [hero, index, theme, disabled]);

  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === messages.ready) { send(); setReady(true); }
      if (event.data?.type === messages.select && !disabled && Number.isInteger(event.data.index) && event.data.index >= 0 && event.data.index < (hero.slides?.length || 3)) onSelect?.(event.data.index);
      if (event.data?.type === messages.resize) {
        const { width, height } = event.data;
        if (![1440, 390].includes(width) || !Number.isFinite(height) || height <= 0 || height > 100000) return;
        const rounded = Math.ceil(height);
        setHeights(current => current[width] === rounded ? current : { ...current, [width]: rounded });
      }
    };
    window.addEventListener('message', receive);
    send();
    return () => window.removeEventListener('message', receive);
  }, [send, onSelect, hero.slides?.length, disabled]);

  return <AdminPreviewFrame device={device} height={height} frame={frame} className={className} label="Selected hero image preview" ready={ready} disabled={disabled} title={`${device === 'mobile' ? 'Mobile' : 'Desktop'} homepage hero preview`} src={`${import.meta.env.BASE_URL}index.html?arpc-hero-preview=1`} onLoad={send}/>;
}
