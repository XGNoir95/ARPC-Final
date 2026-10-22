import { fileURLToPath } from 'node:url';
import { CLUB_NAME, LOGO_CID, renderLegacyEmail, resolveMailLogoUrl } from './emailTemplates.js';

export const clubLogoPath = fileURLToPath(new URL('./assets/arpc-logo.jpg', import.meta.url));

export function buildMailMessage(job, { sender = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim(), front, logoUrl } = {}) {
  // Honor a configured display name; give bare SMTP addresses the club's name.
  const from = sender?.includes('<') ? sender : { name: `${CLUB_NAME} (ARPC)`, address: sender };
  const body = job.html ? job : renderLegacyEmail(job.subject, job.text, { front, logoUrl });
  const logo = resolveMailLogoUrl({ front, logoUrl }).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  // Also repair already queued CID emails, and apply the current public logo URL
  // to branded HTML queued before the deployment URL was configured.
  const html = body.html.replace(/(<img\b(?=[^>]*\bclass=["'][^"']*\bemail-logo\b[^"']*["'])[^>]*\bsrc=)(["'])[^"']*\2/gi, (_, prefix, quote) => `${prefix}${quote}${logo}${quote}`).replaceAll(`cid:${LOGO_CID}`, logo);
  return {
    from, to: job.to, subject: body.subject, text: job.text, html,
    messageId: `<arpc-${job._id}@mail.arpc.local>`,
    disableFileAccess: true, disableUrlAccess: true,
  };
}
