import { aboutCards } from '../data/about.js';

export const defaultHero = {
  id: 'hero', title: 'Find Where You Belong.\nDiscover Who You’ll Become.',
  description: 'Faith, friendship, and service — a place to grow together at AUST.', image: '/heroBanner.jpg',
  arabicGreeting: 'السلامُ عليكم ورحمةُ اللهِ وبركاتُهُ',
};
export const defaultHeroSlides = [
  { id: 'campus', name: '', image: '/heroBanner.jpg', title: '', description: '' },
  { id: 'community', name: '', image: '/images/about/community.jpg', title: '', description: '' },
  { id: 'learning', name: '', image: '/images/about/learning.jpg', title: '', description: '' },
];
const previousHeroNames = { campus: 'AUST campus', community: 'Community', learning: 'Learning' };
const imageName = slide => {
  const original = defaultHeroSlides.find(item => item.id === slide.id);
  return original && slide.image === original.image && slide.name === previousHeroNames[slide.id] ? '' : slide.name || '';
};
export const defaultFeatured = {
  id: 'featured', title: 'Featured at ARPC', description: '', selections: [],
  membership: { title: 'Find your place at ARPC.', description: 'Membership applications are open. Join a community built on faith, friendship and service.', image: '/logo.jpg' },
};
export const homepageSlots = [
  { id: 'hero', name: 'Hero', description: 'Set the opening images and the words that appear over each one.' },
  { id: 'about-us', name: 'About us' }, { id: 'our-mission', name: 'Our mission' }, { id: 'our-vision', name: 'Our vision' },
  { id: 'featured', name: 'Featured', description: 'Choose a mix of programmes and membership, or let the homepage select for you.' },
];

export const heroGreeting = hero => hero?.arabicGreeting?.trim() || defaultHero.arabicGreeting;

export function heroSlides(hero) {
  const slides = hero?.slides?.length ? hero.slides : defaultHeroSlides.map((slide, index) => ({ ...slide, ...(index === 0 && hero?.image ? { image: hero.image } : {}) }));
  const title = slides.find(slide => slide.title?.trim())?.title || hero?.title || defaultHero.title;
  const description = slides.find(slide => slide.description?.trim())?.description || hero?.description || defaultHero.description;
  return slides.map((slide, index) => ({ ...slide, id: slide.id || `slide-${index}`, label: String(index + 1).padStart(2, '0'), name: imageName(slide).trim() || `Image ${index + 1}`, title: slide.title?.trim() ? slide.title : title, description: slide.description?.trim() ? slide.description : description }));
}

export function homepageDraft(id, entry) {
  if (id === 'hero') {
    const slides = entry?.slides?.length ? entry.slides : defaultHeroSlides.map((slide, index) => ({ ...slide, ...(index === 0 && entry?.image ? { image: entry.image } : {}) }));
    return { ...defaultHero, ...entry, slides: slides.map(slide => ({ ...slide, name: imageName(slide) })) };
  }
  if (id === 'featured') return { ...defaultFeatured, ...entry, membership: { ...defaultFeatured.membership, ...entry?.membership } };
  const sample = aboutCards.find(card => card.id === id);
  const values = { ...sample, ...entry };
  for (const field of ['label', 'summary', 'link', 'linkLabel', 'image']) if (!values[field]) values[field] = sample?.[field] || '';
  return values;
}

export function publishedProgrammes(entries = []) {
  return entries.filter(entry => entry.live).map(entry => ({ ...(entry.publishedData || entry), publishedAt: entry.publishedAt }));
}

// Calendar dates are interpreted in the club's timezone, not a visitor's timezone.
const dayAt = at => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
const dateValue = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : 0;

export function featuredItems(programmes = [], featured, at = new Date()) {
  const config = { ...defaultFeatured, ...featured };
  const membership = { ...defaultFeatured.membership, ...config.membership, id: 'membership', kind: 'membership', registrationOpen: true };
  if (config.selections?.length) return config.selections.flatMap(selection => {
    const item = selection.kind === 'membership' ? membership : programmes.find(programme => programme.id === selection.id && programme.kind === selection.kind);
    return item ? [item] : [];
  });
  const today = dayAt(at);
  const rank = item => item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date >= today ? 0 : 2 : 1;
  const ranked = [...programmes].sort((a, b) => rank(a) - rank(b) || (rank(a) === 0 ? a.date.localeCompare(b.date) : rank(a) === 2 ? b.date.localeCompare(a.date) : dateValue(b.publishedAt) - dateValue(a.publishedAt)) || a.id.localeCompare(b.id));
  // Reserve room for each available kind before filling the remaining positions.
  const diverse = [...new Set(ranked.map(item => item.kind))].map(kind => ranked.find(item => item.kind === kind));
  const chosen = new Set([...new Set([...diverse, ...ranked].map(item => item.id))].slice(0, 6));
  return ranked.filter(item => chosen.has(item.id)).slice(0, 6);
}
