// Email HTML uses inline styles and tables so the design survives email clients
// that strip stylesheets. Keep every workflow's HTML and plain text together.
import { adminFrontendUrl } from './adminBoundary.js';
export const CLUB_NAME = 'Ahsanullah Roh. Peace Club';
export const LOGO_CID = 'arpc-logo@arpc';
export const CLUB_LOGO_URL = 'https://www.aust.edu/storage/files/Te3EO82GEGAdm9ihZ8VGEg1WMi5VHSpjbEw5T0FD.jpg';

const colors = {
  green: '#173d2e', deep: '#0e291e', gold: '#e9ad5e',
  background: '#eef4ef', white: '#ffffff', ink: '#173d2e',
  body: '#426454', muted: '#547366', border: '#d8e2dc', soft: '#f6f8f5',
};
const sans = 'Arial, Helvetica, sans-serif';
const serif = "Georgia, 'Times New Roman', serif";
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const cleanSubject = value => String(value).replace(/[\r\n]+/g, ' ').trim();

function frontendUrl(value = process.env.FRONTEND_URL || 'http://localhost:5173') {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Email links need an HTTP(S) FRONTEND_URL without credentials.');
  }
  return url.href;
}

// Hosted images remain part of the HTML rather than becoming MIME attachments.
export function resolveMailLogoUrl({ logoUrl = process.env.MAIL_LOGO_URL } = {}) {
  const configured = typeof logoUrl === 'string' && logoUrl.trim() !== '';
  if (configured && /[\r\n]/.test(logoUrl)) throw new Error('MAIL_LOGO_URL must be a public HTTPS image URL.');
  const url = new URL(configured ? logoUrl.trim() : CLUB_LOGO_URL);
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const loopback = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '::1' || /^127\./.test(hostname);
  const privateHost = loopback || hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname === '::' || hostname.startsWith('::ffff:') || hostname === '0.0.0.0' || /^(?:10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(hostname) || /^(?:fc|fd)[\da-f]{2}:|^fe[89ab][\da-f]:/i.test(hostname);
  if (url.protocol !== 'https:' || url.username || url.password || privateHost) {
    throw new Error('MAIL_LOGO_URL must be a public HTTPS image URL.');
  }
  return url.href;
}

function safeLink(value, front) {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) throw new Error('Invalid email action URL.');
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.origin !== new URL(front).origin) {
    throw new Error('Email actions must link to the configured club website.');
  }
  // Preserve hash-router routes and the exact token/query supplied by the caller.
  return value;
}

const paragraph = text => `<p style="margin:0 0 18px;font-family:${sans};font-size:16px;line-height:26px;color:${colors.body};overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(text)}</p>`;

function layout(message, { front, year, legacyBody, logoUrl } = {}) {
  const home = frontendUrl(front);
  const logo = resolveMailLogoUrl({ front: home, logoUrl });
  const currentYear = year ?? new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Dhaka' }).format(new Date());
  const action = message.action && { ...message.action, url: safeLink(message.action.url, home) };
  const greeting = message.name ? `Hello ${message.name},` : 'Hello,';
  const rows = (message.details || []).filter(([, value]) => value !== undefined && value !== null && value !== '');
  const detailsHtml = rows.length ? `<table width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 24px;border-collapse:collapse;">${rows.map(([label, value]) => `<tr><th scope="row" align="left" valign="top" style="width:34%;padding:12px 12px 12px 0;border-bottom:1px solid ${colors.border};font-family:${sans};font-size:14px;line-height:22px;font-weight:400;color:${colors.muted};">${escapeHtml(label)}</th><td valign="top" style="padding:12px 0;border-bottom:1px solid ${colors.border};font-family:${sans};font-size:14px;line-height:22px;font-weight:600;color:${colors.ink};overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(value)}</td></tr>`).join('')}</table>` : '';
  const actionHtml = action ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 24px;"><tr><td align="center" bgcolor="${colors.green}" style="background-color:${colors.green};border-radius:8px;mso-padding-alt:15px 24px;"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:15px 24px;border:1px solid ${colors.green};border-radius:8px;font-family:${sans};font-size:16px;line-height:22px;font-weight:700;color:${colors.white};text-decoration:none;text-align:center;mso-padding-alt:0;">${escapeHtml(action.label)}</a></td></tr></table>` : '';
  const noteHtml = message.note ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;"><tr><td bgcolor="${colors.soft}" style="padding:18px 20px;background-color:${colors.soft};border-left:3px solid ${colors.gold};border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-family:${sans};font-size:14px;line-height:22px;font-weight:700;color:${colors.ink};">${escapeHtml(message.note.title)}</p><p style="margin:0;font-family:${sans};font-size:14px;line-height:22px;color:${colors.body};">${escapeHtml(message.note.body)}</p></td></tr></table>` : '';
  const fallbackHtml = action ? `<p style="margin:24px 0 0;font-family:${sans};font-size:13px;line-height:21px;color:${colors.muted};">If the button doesn't work, copy and paste this link into your browser:<br><a href="${escapeHtml(action.url)}" style="color:${colors.green};text-decoration:underline;overflow-wrap:anywhere;word-break:break-all;">${escapeHtml(action.url)}</a></p>` : '';
  const subject = cleanSubject(message.subject);
  const codeHtml = message.code ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:6px 0 24px;"><tr><td align="center" bgcolor="${colors.soft}" style="padding:22px 12px;background-color:${colors.soft};border:1px solid ${colors.border};border-radius:8px;"><p style="margin:0 0 10px;font-family:${sans};font-size:14px;line-height:22px;color:${colors.muted};">Your verification code</p><p style="margin:0;font-family:${sans};font-size:34px;line-height:44px;letter-spacing:6px;font-weight:700;color:${colors.ink};">${escapeHtml(message.code)}</p></td></tr></table>` : '';
  const text = [
    `${CLUB_NAME} (ARPC)`, message.title, '', ...(legacyBody ? [] : [greeting, '']),
    ...(message.paragraphs || []), '', ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(message.code ? ['', `Your verification code: ${message.code}`] : []),
    ...(action ? ['', `${action.label}: ${action.url}`] : []),
    ...(message.note ? ['', `${message.note.title}: ${message.note.body}`] : []),
    '', 'With best wishes,', 'The ARPC team', '', CLUB_NAME, 'AUST, Tejgaon, Dhaka',
    `Visit the club website: ${home}`, 'Need help? Reply to this email to contact the club.',
  ].join('\n');
  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="format-detection" content="telephone=no, date=no, address=no, email=no"><title>${escapeHtml(subject)}</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic;border:0}a:focus-visible{outline:3px solid ${colors.gold};outline-offset:3px}@media only screen and (max-width:620px){.email-outer{padding:16px 8px!important}.email-content{padding:28px 24px!important}.email-header{padding:26px 24px!important}.email-title{font-size:28px!important;line-height:34px!important}.email-brand{font-size:28px!important}.email-club-name{font-size:13px!important;line-height:19px!important}.email-logo{width:56px!important;height:56px!important}.email-logo-cell{width:72px!important}}</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${colors.background};">
<div style="display:none;font-size:1px;line-height:1px;color:${colors.background};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(message.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${colors.background}" style="width:100%;background-color:${colors.background};"><tr><td class="email-outer" align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:separate;table-layout:fixed;">
<tr><td class="email-header" bgcolor="${colors.deep}" style="padding:30px 40px;background-color:${colors.deep};border-radius:16px 16px 0 0;border-bottom:4px solid ${colors.gold};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="email-logo-cell" width="84" valign="middle" style="width:84px;"><img class="email-logo" src="${escapeHtml(logo)}" width="64" height="64" alt="ARPC club emblem" style="display:block;width:64px;height:64px;border:0;border-radius:50%;background-color:${colors.white};"></td><td valign="middle"><p class="email-brand" style="margin:0 0 4px;font-family:${serif};font-size:34px;line-height:38px;color:${colors.gold};">ARPC</p><p class="email-club-name" style="margin:0;font-family:${sans};font-size:14px;line-height:21px;color:${colors.white};">${CLUB_NAME}</p></td></tr></table>
</td></tr>
<tr><td class="email-content" bgcolor="${colors.white}" style="padding:36px 40px;background-color:${colors.white};border-left:1px solid ${colors.border};border-right:1px solid ${colors.border};border-bottom:1px solid ${colors.border};border-radius:0 0 16px 16px;">
<h1 class="email-title" style="margin:0 0 24px;font-family:${serif};font-size:32px;line-height:39px;font-weight:600;color:${colors.ink};">${escapeHtml(message.title)}</h1>
${legacyBody || `${paragraph(greeting)}${(message.paragraphs || []).map(paragraph).join('')}`}
${codeHtml}${detailsHtml}${actionHtml}${noteHtml}
<p style="margin:0;font-family:${sans};font-size:15px;line-height:24px;color:${colors.body};">With best wishes,<br><strong style="color:${colors.ink};font-weight:700;">The ARPC team</strong></p>
${fallbackHtml}
</td></tr>
<tr><td align="center" style="padding:24px 16px 0;"><p style="margin:0 0 8px;font-family:${sans};font-size:14px;line-height:22px;font-weight:700;color:${colors.green};">${CLUB_NAME}</p><p style="margin:0 0 12px;font-family:${sans};font-size:13px;line-height:21px;color:${colors.muted};">AUST, Tejgaon, Dhaka<br><a href="${escapeHtml(home)}" style="color:${colors.green};text-decoration:underline;">Visit our website</a></p><p style="margin:0 0 12px;font-family:${sans};font-size:13px;line-height:21px;color:${colors.muted};">Need help? Reply to this email to contact the club.</p><p style="margin:0;font-family:${sans};font-size:12px;line-height:19px;color:${colors.muted};">A service email from ARPC. &copy; ${escapeHtml(currentYear)} ${CLUB_NAME}.</p></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  return { subject, text, html };
}

const applicationLabels = { membership: 'membership', events: 'event enrollment', webinars: 'webinar enrollment', courses: 'course enrollment' };

function applicationMessage(type, data) {
  const label = applicationLabels[data.applicationType];
  if (!label) throw new Error('Unknown email application type.');
  const received = type === 'applicationReceived';
  const statuses = { pending: 'Awaiting review', approved: 'Approved', rejected: 'Not approved' };
  const status = received ? 'pending' : data.status;
  if (!statuses[status]) throw new Error('Unknown email application status.');
  const noun = data.applicationType === 'membership' ? 'membership application' : label;
  const messages = {
    pending: {
      title: received ? "We've received your application." : 'Your application is awaiting review.',
      paragraphs: [`Thank you for your interest in ARPC. Your ${noun} is awaiting review by the club.`, 'We will email you when a decision has been made. Please keep your reference number for any questions about your application.'],
    },
    approved: {
      title: data.applicationType === 'membership' ? 'Welcome to the club.' : 'Your enrollment is approved.',
      paragraphs: [`Your ${noun} has been approved. ${data.applicationType === 'membership' ? "We're glad to welcome you to the ARPC community." : 'Thank you for joining us.'}`, data.applicationType === 'courses' ? 'Your private learning access link will arrive in a separate email. Use that link to open your approved courses.' : 'Keep this email for your records. If you have any questions about taking part, reply to this email to contact the club.'],
    },
    rejected: {
      title: 'An update on your application.',
      paragraphs: [`Your ${noun} has not been approved on this occasion.`, 'If you have a question about this decision, reply to this email and include the reference number below.'],
    },
  };
  return {
    subject: received ? 'ARPC application received' : 'ARPC application update',
    preheader: `Your ${noun}: ${statuses[status].toLowerCase()}.`,
    ...messages[status],
    details: [['Application', noun.charAt(0).toUpperCase() + noun.slice(1)], ['Programme', data.programmeTitle], ['Status', statuses[status]], ['Reference', data.reference]],
    ...(received && data.applicationType === 'membership' ? { note: { title: 'Membership payment', body: 'The club will check your registration payment as part of the review. This email confirms receipt of your application, not payment verification.' } } : {}),
  };
}

export function renderClubEmail(type, data = {}, options = {}) {
  const adminEmail = ['verification','passwordReset','adminInvitation','adminAccess'].includes(type);
  const front = frontendUrl(options.front || (adminEmail ? adminFrontendUrl() : undefined));
  const route = path => `${front.replace(/\/$/, '')}${path}`;
  let message;
  switch (type) {
    case 'verification':
      if (data.code !== undefined) {
        if (!/^\d{6}$/.test(data.code)) throw new Error('Verification emails require a six-digit code.');
        message = {
          subject: data.resent ? 'Verify your ARPC email' : 'Verify your ARPC account',
          preheader: 'Confirm your email to continue your administrator account request.',
          title: 'Verify your email address.', name: data.name, code: data.code,
          paragraphs: ['Enter this code on your ARPC account status page to confirm your email address.', 'Club approval is also required before you can open the administrator workspace.'],
          action: { label: 'Enter verification code', url: data.url },
          note: { title: 'Valid for 10 minutes', body: 'Use this code once. Only the latest code works. Never share it; the club will never ask you to send it by email or phone. If you did not request this account, ignore this email.' },
        }; break;
      }
      message = {
        subject: data.resent ? 'Verify your ARPC email' : 'Verify your ARPC account',
        preheader: 'Verify your email to continue your administrator account request.',
        title: 'Verify your email address.',
        paragraphs: ['Thank you for requesting an ARPC administrator account. Please verify your email address to continue.', 'Both email verification and superadmin approval are required before you can access the dashboard. If the club has already approved your account, verifying your email completes the remaining step.'],
        action: { label: 'Verify email address', url: data.url },
        note: { title: 'Valid for 24 hours', body: "This link can be used once. If you didn't request this account, you can ignore this email." },
      }; break;
    case 'passwordReset':
      message = {
        subject: 'Reset your ARPC password', preheader: 'Use your private link to choose a new password. It expires in one hour.',
        title: 'Choose a new password.',
        paragraphs: ['We received a request to reset the password for your ARPC administrator account. Use the button below to choose a new password.'],
        action: { label: 'Reset password', url: data.url },
        note: { title: 'Valid for one hour', body: "This link can be used once. Keep it private. If you didn't request a reset, ignore this email; your password will stay the same." },
      }; break;
    case 'adminInvitation':
      message = {
        subject: 'Invitation to ARPC administration', preheader: 'You are invited to help manage the ARPC club workspace.',
        title: "You're invited to the club workspace.",
        paragraphs: [data.inviter ? `${data.inviter} has invited you to create an ARPC administrator account.` : 'You have been invited to create an ARPC administrator account.', 'Create your account using the email address that received this invitation. Email verification and superadmin approval are required before dashboard access is available.'],
        action: { label: 'Create administrator account', url: data.url },
        note: { title: 'Valid for 72 hours', body: "This invitation can be used once. If you weren't expecting it, you can ignore this email." },
      }; break;
    case 'adminAccess': {
      const variants = {
        active: data.emailVerified===false
          ? { title: 'Your administrator request is approved.', paragraphs: ['The club has approved your ARPC administrator account. Email verification is still required before you can open the dashboard.', 'Sign in and enter the code from your latest verification email. If it has expired, request a new code from your account status page.'], action: { label: 'Check account status', url: route('/login') }, details: [['Club approval', 'Approved'], ['Email verification', 'Required']] }
          : { title: 'Your administrator access is ready.', paragraphs: ['Your ARPC administrator account has been approved. You can now sign in to manage the club workspace.'], action: { label: 'Sign in to the dashboard', url: route('/login') }, details: [['Account status', 'Approved']] },
        pending: { title: 'Your administrator request is under review.', paragraphs: ['The club has reopened your ARPC administrator request for review.', 'We will email you when a decision has been made. Dashboard access requires both approval and email verification.'], details: [['Account status', 'Awaiting review']] },
        suspended: { title: 'Your administrator access is paused.', paragraphs: ['Your ARPC administrator account has been suspended, and your active sessions have been signed out.', 'If you need clarification or believe this needs to be reviewed, reply to this email to contact the club.'], details: [['Account status', 'Suspended']] },
        rejected: { title: 'An update on your administrator request.', paragraphs: ['Your request for an ARPC administrator account has not been approved.', 'If you have a question about this decision, reply to this email to contact the club.'], details: [['Account status', 'Not approved']] },
      };
      if (!variants[data.status]) throw new Error('Unknown administrator email status.');
      message = { subject: 'ARPC admin access update', preheader: variants[data.status].title, ...variants[data.status] };
      break;
    }
    case 'applicationReceived':
    case 'applicationUpdate':
      message = applicationMessage(type, data); break;
    case 'learningAccess':
      message = {
        subject: data.approved ? 'Your ARPC course access' : 'Your ARPC learning access',
        preheader: 'Your private link to the ARPC learning area is ready. It expires in one hour.',
        title: data.approved ? 'Your learning starts here.' : 'Your learning access link is ready.',
        paragraphs: [data.approved ? 'Your course enrollment is approved. Use your private link below to open the learning area and explore your lessons.' : 'Use your private link below to return to your approved courses and continue learning.'],
        details: data.programmeTitle ? [['Course', data.programmeTitle]] : [],
        action: { label: 'Open learning area', url: data.url },
        note: { title: 'Valid for one hour', body: "This link can be used once. Keep it private and don't forward this email. If it expires, request a new access link from the learning page." },
      }; break;
    default: throw new Error(`Unknown club email template: ${type}`);
  }
  return layout({ ...message, name: data.name }, { ...options, front });
}

// Old outbox records remain deliverable and receive the same branded shell.
// Only links to the club's configured origin become clickable.
export function renderLegacyEmail(subject, text, options = {}) {
  const front = frontendUrl(options.front);
  const escapedLines = String(text || '').split(/\r?\n/).map(line => {
    let last = 0;
    let html = '';
    for (const match of line.matchAll(/https?:\/\/[^\s<>"']+/g)) {
      html += escapeHtml(line.slice(last, match.index));
      const url = match[0];
      try {
        safeLink(url, front);
        html += `<a href="${escapeHtml(url)}" style="color:${colors.green};text-decoration:underline;overflow-wrap:anywhere;word-break:break-all;">${escapeHtml(url)}</a>`;
      } catch { html += escapeHtml(url); }
      last = match.index + url.length;
    }
    return html + escapeHtml(line.slice(last));
  }).join('<br>');
  const rendered = layout({ subject, title: subject, preheader: 'An update from Ahsanullah Roh. Peace Club.', paragraphs: [String(text || '')] }, {
    ...options, front, legacyBody: `<p style="margin:0 0 24px;font-family:${sans};font-size:16px;line-height:26px;color:${colors.body};overflow-wrap:anywhere;word-break:break-word;">${escapedLines}</p>`,
  });
  return rendered;
}
