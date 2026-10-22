import { useState } from 'react';
import { FiImage } from 'react-icons/fi';

export default function SafeImage({ src, alt = '', className = '', fallbackLabel = 'Image unavailable', fallback = 'media', onError, ...props }) {
  const [failed, setFailed] = useState(null);
  if (!src || failed === src) {
    if (fallback === 'hide') return null;
    return <span role="img" aria-label={alt ? `${fallbackLabel}: ${alt}` : fallbackLabel} aria-hidden={props['aria-hidden']} className={`@container flex min-h-12 flex-col items-center justify-center gap-2 overflow-hidden bg-raised text-muted ${className}`}><FiImage aria-hidden="true" className="size-6 shrink-0"/><span aria-hidden="true" className="hidden px-3 text-center text-sm leading-6 @min-[8rem]:block">{fallbackLabel}</span></span>;
  }
  return <img {...props} src={src} alt={alt} className={className} onError={event => { setFailed(src); onError?.(event); }}/>;
}
