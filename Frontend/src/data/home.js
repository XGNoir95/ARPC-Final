import { aboutCards } from './about.js';
import { defaultHero, defaultHeroSlides, defaultFeatured } from '../utils/homeContent.js';
export const homeContent = [
  { ...defaultHero, slides: defaultHeroSlides },
  ...aboutCards,
  defaultFeatured,
];
