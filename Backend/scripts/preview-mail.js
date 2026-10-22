// Deliberately does not load .env, MongoDB or SMTP. All content is fictional.
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderClubEmail, renderLegacyEmail, resolveMailLogoUrl } from '../src/emailTemplates.js';
import { clubLogoPath } from '../src/emailMessage.js';

const output = fileURLToPath(new URL('../.cache/mail-preview/', import.meta.url));
const front = 'https://arpc.example.test/#';
const sample = { name: 'Sample Member', reference: 'ARPC-PREVIEW-2026', programmeTitle: 'Reflection at AUST' };
const options = { front, logoUrl: 'https://arpc.example.test/logo.jpg' };
const previewHtml = html => html.replaceAll(resolveMailLogoUrl(options), 'arpc-logo.jpg');
const examples = [
  ['verify', 'Verify an account', 'verification', { code: '041729', url: `${front}/admin` }],
  ['verify-again', 'Resend verification', 'verification', { resent: true, code: '830154', url: `${front}/admin` }],
  ['verify-legacy', 'Existing verification link', 'verification', { url: `${front}/verify-email?token=preview-only` }],
  ['reset-password', 'Reset a password', 'passwordReset', { url: `${front}/reset-password?token=preview-only` }],
  ['invitation', 'Administrator invitation', 'adminInvitation', { inviter: 'The ARPC team', url: `${front}/register?invite=preview-only&email=member%40example.test` }],
  ...[['active', 'Administrator approved'], ['suspended', 'Administrator suspended'], ['rejected', 'Administrator not approved']].map(([status, label]) => [`admin-${status}`, label, 'adminAccess', { status }]),
  ['admin-verify-first', 'Approved, verification needed', 'adminAccess', { status: 'active', emailVerified: false }],
  ['admin-reopened', 'Administrator review reopened', 'adminAccess', { status: 'pending' }],
  ...[['membership', 'Membership'], ['events', 'Event'], ['webinars', 'Webinar'], ['courses', 'Course']].map(([applicationType, label]) => [`receipt-${applicationType}`, `${label} application received`, 'applicationReceived', { applicationType, ...(applicationType === 'membership' ? { programmeTitle: undefined } : {}) }]),
  ['membership-approved', 'Membership approved', 'applicationUpdate', { applicationType: 'membership', programmeTitle: undefined, status: 'approved' }],
  ['event-approved', 'Event enrollment approved', 'applicationUpdate', { applicationType: 'events', status: 'approved' }],
  ['webinar-pending', 'Webinar awaiting review', 'applicationUpdate', { applicationType: 'webinars', status: 'pending' }],
  ['course-approved', 'Course enrollment approved', 'applicationUpdate', { applicationType: 'courses', status: 'approved' }],
  ['application-rejected', 'Application not approved', 'applicationUpdate', { applicationType: 'membership', programmeTitle: undefined, status: 'rejected' }],
  ['course-access', 'First course access', 'learningAccess', { approved: true, url: `${front}/learn?token=preview-only` }],
  ['learning-access', 'Requested learning access', 'learningAccess', { programmeTitle: undefined, url: `${front}/learn?token=preview-only` }],
];
await mkdir(output, { recursive: true });
await copyFile(clubLogoPath, path.join(output, 'arpc-logo.jpg'));
for (const [slug, , type, data] of examples) {
  const rendered = renderClubEmail(type, { ...sample, ...data }, options);
  await writeFile(path.join(output, `${slug}.html`), previewHtml(rendered.html));
  await writeFile(path.join(output, `${slug}.txt`), rendered.text);
}
const legacy = renderLegacyEmail('An update from ARPC', `Hello Sample Member,\nYour existing email keeps its original message and links.\nVisit the club: ${front}/`, options);
await writeFile(path.join(output, 'existing-queued.html'), previewHtml(legacy.html));
await writeFile(path.join(output, 'existing-queued.txt'), legacy.text);
examples.push(['existing-queued', 'Previously queued email']);

await writeFile(path.join(output, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ARPC email previews</title>
<style>*{box-sizing:border-box}body{margin:0;background:#eef4ef;color:#173d2e;font:15px/1.6 Arial,Helvetica,sans-serif}header{padding:24px 32px;background:#0e291e;color:#fff;border-bottom:4px solid #e9ad5e}h1{font:32px/1.2 Georgia,serif;margin:0 0 8px}header p{margin:0;color:#d8e2dc}.workspace{display:grid;grid-template-columns:275px minmax(0,1fr);gap:24px;padding:24px;max-width:1320px;margin:auto}aside{align-self:start;background:white;border:1px solid #d8e2dc;border-radius:12px;padding:12px}aside a{display:block;text-decoration:none;color:#173d2e;border-radius:6px;padding:9px 12px;line-height:1.4}aside a:hover,aside a[aria-current="true"]{background:#eef4ef;font-weight:bold}main{min-width:0}.toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px}.toolbar strong{margin-right:auto}button,.text-link{font:inherit;color:#173d2e;border:1px solid #b6c9bd;padding:8px 14px;border-radius:8px;background:#fff;cursor:pointer}button[aria-pressed="true"]{background:#173d2e;color:#fff}a:focus-visible,button:focus-visible{outline:3px solid #e9ad5e;outline-offset:2px}.preview{width:100%;max-width:720px;margin:auto}iframe{display:block;width:100%;height:1200px;border:1px solid #d8e2dc;background:#eef4ef;border-radius:12px}@media(max-width:760px){header{padding:24px}.workspace{grid-template-columns:1fr;padding:16px;gap:16px}aside{display:flex;overflow:auto;gap:4px}aside a{flex-shrink:0}.preview{max-width:100%}}</style></head>
<body><header><h1>Club correspondence</h1><p>ARPC email previews with fictional details. Nothing has been sent.</p></header>
<div class="workspace"><aside aria-label="Choose an email">${examples.map(([slug, label], i) => `<a href="${slug}.html" target="email-preview" data-slug="${slug}"${i === 0 ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</aside>
<main><div class="toolbar"><strong id="selection">Verify an account</strong><button type="button" data-width="720px" aria-pressed="true">Desktop</button><button type="button" data-width="375px" aria-pressed="false">Mobile</button><a class="text-link" id="plain-text" href="verify.txt" target="_blank">Plain text</a></div><div class="preview"><iframe name="email-preview" title="Selected ARPC email" src="verify.html"></iframe></div></main></div>
<script>document.querySelectorAll('aside a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('aside a').forEach(item=>item.removeAttribute('aria-current'));link.setAttribute('aria-current','true');document.getElementById('selection').textContent=link.textContent;document.getElementById('plain-text').href=link.dataset.slug+'.txt'}));document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.preview').style.maxWidth=button.dataset.width;document.querySelectorAll('[data-width]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)))}));</script></body></html>`);
console.log(`Created ${examples.length} fictional email previews: ${path.join(output, 'index.html')}`);
