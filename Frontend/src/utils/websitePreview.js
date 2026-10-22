export const websitePreviewMessages = {
  ready: 'arpc:website-preview:ready',
  update: 'arpc:website-preview:update',
  resize: 'arpc:website-preview:resize',
  select: 'arpc:website-preview:select',
};

export const websitePreviewResources = ['home', 'sponsors', 'programmes', 'gallery', 'teams', 'lessons'];

// Only public content is sent to the isolated renderer, never account/session data.
export function previewContent(source = {}) {
  return Object.fromEntries(['home', 'sponsors', 'programmes', 'gallery', 'teams'].map(key => [key,
    (Array.isArray(source?.[key]) ? source[key] : []).filter(item => item && (!Object.hasOwn(item, 'live') || item.live)).map(item => item.publishedData || item),
  ]));
}

export function contentWithDraft(content, resource, entry) {
  const result = { ...previewContent(content), hasData: true };
  if (entry && ['home', 'sponsors', 'programmes', 'gallery', 'teams'].includes(resource)) {
    const existing = result[resource].findIndex(item => item.id === entry.id);
    if (existing < 0) result[resource].push(entry);
    else result[resource][existing] = entry;
  }
  return result;
}
