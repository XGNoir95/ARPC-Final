const stableValue = value => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  return typeof value === 'string' ? value.trim() : value;
};

export const sameValues = (left, right) => JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));

export function lessonDraft(lesson = {}) {
  return {
    title: (lesson.title || '').trim(),
    body: (lesson.body || '').trim(),
    videoUrl: (lesson.videoUrl || '').trim(),
    order: Number(lesson.order || 0),
    materials: lesson.materials || [],
  };
}

export const lessonHasChanges = lesson => !sameValues(lessonDraft(lesson), lessonDraft(lesson.publishedData));

export function contentFields(resource, item = {}) {
  const fields = { [resource === 'teams' ? 'label' : resource === 'sponsors' ? 'name' : 'title']: item.label || item.name || item.title || '' };
  if (resource !== 'sponsors') fields.description = item.description || '';
  if (resource === 'programmes') Object.assign(fields, {
    details: item.details || '', location: item.location || '', format: item.format || '',
    duration: item.duration || '', pace: item.pace || '', fee: item.fee || 0,
    date: item.date || '', time: item.time || '',
    takeaways: (item.takeaways || []).join('\n'), registrationOpen: item.registrationOpen !== false,
  });
  if (resource === 'gallery') Object.assign(fields, { category: item.category || 'Campus', alt: item.alt || '', placeholder: Boolean(item.placeholder), poster: Boolean(item.poster) });
  if (resource === 'sponsors') fields.wide = Boolean(item.wide);
  return fields;
}

export function comparableFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, key === 'fee' ? Number(value || 0) : key === 'takeaways' ? value.split('\n').map(line => line.trim()).filter(Boolean) : value]));
}
