import { contentWithDraft } from './websitePreview';
import { featuredItems, homepageDraft } from './homeContent';

export function previewCards(resource, entry, content) {
  const collection = contentWithDraft(content, resource, entry);
  if (!entry) return collection[resource] || [];
  if (resource === 'home') return entry.id === 'featured' ? featuredItems(collection.programmes, entry) : ['about-us', 'our-mission', 'our-vision'].map(id => homepageDraft(id, collection.home.find(card => card.id === id)));
  if (resource === 'programmes') return collection.programmes.filter(item => item.kind === entry.kind);
  if (resource === 'lessons') return [...(entry.courseLessons || []).filter(lesson => lesson._id !== entry._id), entry].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return collection[resource] || [entry];
}
