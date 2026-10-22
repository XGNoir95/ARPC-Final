import { test } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { renderClubEmail, renderLegacyEmail, CLUB_NAME, LOGO_CID, CLUB_LOGO_URL, resolveMailLogoUrl } from '../src/emailTemplates.js';
import { buildMailMessage } from '../src/emailMessage.js';

const front = 'https://club.example.test/#';
const url = `${front}/register?invite=test-only&email=member%40example.test`;
const options = { front, year: 2026, logoUrl: CLUB_LOGO_URL };
const sample = { name: 'Sample Member', url, programmeTitle: 'Reflection & Service', reference: 'test-reference' };

test('OTP email preserves leading zeroes, explains expiry and keeps the code out of its subject', () => {
  const mail=renderClubEmail('verification',{...sample,code:'041729',url:`${front}/admin`},options);
  assert.match(mail.text,/Your verification code: 041729/);
  assert.match(mail.html,/>041729<\/p>/);
  assert.match(mail.text,/Valid for 10 minutes/);
  assert.match(mail.text,/Only the latest code works/);
  assert.match(mail.html,/Enter verification code/);
  assert.doesNotMatch(mail.subject,/041729/);
  for(const code of ['12345','1234567','<img>1','abcdef'])assert.throws(()=>renderClubEmail('verification',{...sample,code},options),/six-digit/);
});

test('every outgoing email has a branded HTML and usable plain-text version', () => {
  const cases = [
    ['verification', {}], ['verification', { resent: true }], ['passwordReset', {}], ['adminInvitation', { inviter: 'Club representative' }],
    ...['active', 'pending', 'suspended', 'rejected'].map(status => ['adminAccess', { status }]),
    ['adminAccess', { status: 'active', emailVerified: false }],
    ...['membership', 'events', 'webinars', 'courses'].flatMap(applicationType => [
      ['applicationReceived', { applicationType }],
      ...['pending', 'approved', 'rejected'].map(status => ['applicationUpdate', { applicationType, status }]),
    ]),
    ['learningAccess', {}], ['learningAccess', { approved: true }],
  ];
  for (const [type, data] of cases) {
    const message = renderClubEmail(type, { ...sample, ...data }, options);
    assert.ok(message.subject.length > 5 && !/[\r\n]/.test(message.subject), `${type}: subject`);
    assert.ok(message.text.includes(CLUB_NAME) && message.text.includes('Hello Sample Member,'), `${type}: plain-text identity`);
    assert.ok(message.html.includes(`src="${CLUB_LOGO_URL}"`) && message.html.includes(CLUB_NAME), `${type}: brand`);
    assert.doesNotMatch(message.html, /src="cid:/i);
    assert.ok(message.html.includes('The ARPC team') && message.html.includes('Reply to this email'), `${type}: footer`);
    assert.match(message.html, /<html lang="en"/);
    assert.match(message.html, /name="viewport"/);
    assert.match(message.html, /font-size:16px;line-height:26px/);
    assert.doesNotMatch(message.html, /<script|<iframe|fonts\.googleapis|display:flex|display:grid/i);
    if (['verification', 'passwordReset', 'adminInvitation', 'learningAccess'].includes(type)) {
      assert.ok(message.text.includes(url), `${type}: plain-text action link`);
      assert.ok(message.html.includes(url.replaceAll('&', '&amp;')), `${type}: encoded HTML link`);
    }
  }
});

test('names, programme titles, reference numbers and inviter names are escaped', () => {
  const injection = '<img src=x onerror="alert(1)"> & \'Quoted\'';
  for (const [type, data] of [
    ['applicationUpdate', { applicationType: 'courses', status: 'approved', programmeTitle: injection, reference: injection }],
    ['adminInvitation', { inviter: injection }],
  ]) {
    const message = renderClubEmail(type, { ...sample, ...data, name: injection }, options);
    assert.doesNotMatch(message.html, /<img src=x/);
    assert.ok(message.html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;Quoted&#39;'));
    assert.ok(message.text.includes(injection), 'plain text remains readable');
  }
});

test('token lifetimes and administrator approval requirements are explicit', () => {
  for (const [type, lifetime] of [['verification', '24 hours'], ['passwordReset', 'one hour'], ['adminInvitation', '72 hours'], ['learningAccess', 'one hour']]) {
    const message = renderClubEmail(type, sample, options);
    assert.ok(message.text.includes(lifetime));
    assert.match(message.text, /used once/);
    if (['verification', 'adminInvitation'].includes(type)) assert.match(message.text, /superadmin.*approv/i);
  }
  assert.match(renderClubEmail('passwordReset', sample, options).text, /your password will stay the same/);
  assert.match(renderClubEmail('learningAccess', sample, options).text, /don't forward/);
});

test('messages distinguish application status, payment review and course access', () => {
  const received = renderClubEmail('applicationReceived', { ...sample, applicationType: 'membership', notes: 'PRIVATE REVIEW', payment: { transactionId: 'PRIVATE PAYMENT' } }, options);
  assert.match(received.text, /Awaiting review/);
  assert.match(received.text, /not payment verification/);
  assert.doesNotMatch(received.text + received.html, /PRIVATE REVIEW|PRIVATE PAYMENT/);
  const course = renderClubEmail('applicationUpdate', { ...sample, applicationType: 'courses', status: 'approved' }, options);
  assert.match(course.text, /Course enrollment/);
  assert.match(course.text, /separate email/);
  assert.doesNotMatch(course.text, /courses application/);
  const rejected = renderClubEmail('applicationUpdate', { ...sample, applicationType: 'events', status: 'rejected' }, options);
  assert.match(rejected.text, /not been approved/);
  assert.doesNotMatch(rejected.html, /href="[^"]*\/login/);
});

test('only approved administrators receive a sign-in action', () => {
  const approved = renderClubEmail('adminAccess', { status: 'active' }, options);
  assert.ok(approved.text.includes(`${front}/login`));
  for (const status of ['rejected', 'suspended']) {
    const message = renderClubEmail('adminAccess', { status }, options);
    assert.doesNotMatch(message.text, /Sign in to the dashboard/);
    assert.doesNotMatch(message.html, /href="[^"]*\/login/);
  }
});

test('approval email explains verification when approval comes first', () => {
  const approved=renderClubEmail('adminAccess',{status:'active',emailVerified:false},options);
  assert.match(approved.text,/approved/i);
  assert.match(approved.text,/Email verification is still required/);
  assert.doesNotMatch(approved.text,/You can now sign in to manage/);
  assert.match(approved.text,/request a new code/);
  const reopened=renderClubEmail('adminAccess',{status:'pending'},options);
  assert.match(reopened.text,/reopened/);
  assert.doesNotMatch(reopened.text,/Sign in to the dashboard/);
});

test('action URLs preserve hash routes and refuse injected or foreign destinations', () => {
  const message = renderClubEmail('verification', { url }, options);
  assert.equal((message.html.match(/href="https:\/\/club\.example\.test\/#\/register\?invite=test-only&amp;email=member%40example\.test"/g) || []).length, 2);
  for (const bad of ['javascript:alert(1)', 'data:text/html,bad', 'https://outside.example.test/verify', 'https://user:secret@club.example.test/verify', `${url}\r\nInjected: value`]) {
    assert.throws(() => renderClubEmail('verification', { url: bad }, options));
  }
  assert.throws(() => renderClubEmail('adminAccess', { status: 'active' }, { front: 'javascript:alert(1)' }));
  for (const routing of ['https://club.example.test', 'https://club.example.test/', 'https://club.example.test/#', 'https://club.example.test/subdir/#']) {
    const rendered = renderClubEmail('adminAccess', { status: 'active' }, { front: routing });
    const expected = `${routing.replace(/\/$/, '')}/login`;
    assert.ok(rendered.text.includes(expected));
  }
});

test('unknown template and status values fail instead of sending misleading copy', () => {
  assert.throws(() => renderClubEmail('unknown', {}, options));
  assert.throws(() => renderClubEmail('adminAccess', { status: 'unknown' }, options));
  assert.throws(() => renderClubEmail('applicationUpdate', { applicationType: 'courses', status: 'unknown' }, options));
  assert.throws(() => renderClubEmail('applicationReceived', { applicationType: 'unknown' }, options));
});

test('existing queued text is escaped, with only club URLs linked', () => {
  const original = `Hello <script>alert(1)</script>\nVerify: ${url}\nExternal: https://outside.example.test/`;
  const message = renderLegacyEmail('ARPC update\r\nInjected', original, options);
  assert.equal(message.subject, 'ARPC update Injected');
  assert.match(message.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.ok(message.html.includes(`href="${url.replaceAll('&', '&amp;')}"`));
  assert.doesNotMatch(message.html, /href="https:\/\/outside/);
});

test('message construction honors the configured sender and decorates legacy records', () => {
  const job = { _id: 'preview', to: 'member@example.test', subject: 'ARPC update', text: 'Your original message.' };
  const message = buildMailMessage(job, { sender: 'club@example.test' });
  assert.deepEqual(message.from, { name: `${CLUB_NAME} (ARPC)`, address: 'club@example.test' });
  assert.equal(message.text, job.text);
  assert.match(message.html, /Your original message/);
  assert.equal(message.attachments, undefined);
  assert.equal(buildMailMessage(job, { sender: 'ARPC Office <club@example.test>' }).from, 'ARPC Office <club@example.test>');
  const customHtml = '<p>Already rendered safely</p>';
  assert.equal(buildMailMessage({ ...job, html: customHtml }, { sender: 'club@example.test' }).html, customHtml);
});

test('hosted emblem configuration is escaped, public HTTPS and independent of the local website', () => {
  assert.equal(resolveMailLogoUrl({ logoUrl: '' }), CLUB_LOGO_URL);
  const logoUrl = 'https://cdn.example.test/arpc/logo.jpg?version=2&source=email';
  const message = renderClubEmail('verification', { ...sample, url: 'http://localhost:5173/verify-email?token=test' }, { ...options, front: 'http://localhost:5173', logoUrl });
  assert.ok(message.html.includes('src="https://cdn.example.test/arpc/logo.jpg?version=2&amp;source=email"'));
  for (const bad of ['javascript:alert(1)', 'data:image/png;base64,test', '/logo.jpg', 'http://cdn.example.test/logo.jpg', 'https://user:secret@cdn.example.test/logo.jpg', 'https://localhost/logo.jpg', 'https://127.0.0.1/logo.jpg', 'https://192.168.1.2/logo.jpg', 'https://[::1]/logo.jpg', `${logoUrl}\r\nInjected: value`]) {
    assert.throws(() => resolveMailLogoUrl({ logoUrl: bad }), undefined, bad);
  }
});

test('MAIL_LOGO_URL overrides the built-in public image without changing action links', () => {
  const previous = process.env.MAIL_LOGO_URL;
  try {
    process.env.MAIL_LOGO_URL = 'https://cdn.example.test/updated-logo.jpg';
    const message = renderClubEmail('verification', sample, { front });
    assert.ok(message.html.includes('src="https://cdn.example.test/updated-logo.jpg"'));
    assert.ok(message.text.includes(url));
  } finally {
    if (previous === undefined) delete process.env.MAIL_LOGO_URL;
    else process.env.MAIL_LOGO_URL = previous;
  }
});

test('already queued CID and local-image mastheads use the current hosted emblem at send time', () => {
  const old = renderClubEmail('verification', sample, options);
  const logoUrl = 'https://cdn.example.test/logo.jpg?size=64&source=email';
  for (const src of [`cid:${LOGO_CID}`, 'http://localhost:5173/logo.jpg']) {
    const message = buildMailMessage({ _id: 'queued', to: 'member@example.test', ...old, html: old.html.replace(CLUB_LOGO_URL, src) }, { sender: 'club@example.test', logoUrl });
    assert.ok(message.html.includes('src="https://cdn.example.test/logo.jpg?size=64&amp;source=email"'));
    assert.doesNotMatch(message.html, /src="(?:cid:|http:\/\/localhost)/);
    assert.equal(message.attachments, undefined);
    assert.equal(message.text, old.text);
  }
});

test('real MIME construction includes HTML and plain text without logo attachments or Content-ID', async () => {
  const template = renderClubEmail('verification', sample, options);
  const message = buildMailMessage({ _id: 'offline-preview', to: 'member@example.test', ...template }, { sender: 'club@example.test' });
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  try {
    const result = await transport.sendMail(message);
    const mime = result.message.toString();
    assert.match(mime, /Content-Type: multipart\/alternative/);
    assert.match(mime, /Content-Type: text\/plain; charset=utf-8/);
    assert.match(mime, /Content-Type: text\/html; charset=utf-8/);
    assert.doesNotMatch(mime, /Content-Type: (?:multipart\/related|image\/jpeg)/i);
    assert.doesNotMatch(mime, /Content-ID:|Content-Disposition:|filename=arpc-logo/i);
    assert.ok(message.html.includes(`src="${CLUB_LOGO_URL}"`));
  } finally { transport.close(); }
});

test('suspension emails, including older queued CID HTML, produce no attachment MIME parts', async () => {
  const template = renderClubEmail('adminAccess', { name: 'Sample Administrator', status: 'suspended' }, options);
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  try {
    for (const html of [template.html, template.html.replace(CLUB_LOGO_URL, `cid:${LOGO_CID}`)]) {
      const message = buildMailMessage({ _id: 'suspension-regression', to: 'administrator@example.test', ...template, html }, { sender: 'club@example.test' });
      const result = await transport.sendMail(message);
      const mime = result.message.toString();
      assert.equal(message.subject, 'ARPC admin access update');
      assert.match(message.text, /suspended/);
      assert.ok(message.html.includes(`src="${CLUB_LOGO_URL}"`));
      assert.equal(message.attachments, undefined);
      assert.match(mime, /Content-Type: multipart\/alternative/);
      assert.match(mime, /Content-Type: text\/plain; charset=utf-8/);
      assert.match(mime, /Content-Type: text\/html; charset=utf-8/);
      assert.doesNotMatch(message.html, /cid:/i);
      assert.doesNotMatch(mime, /Content-ID:|Content-Disposition:|Content-Type: (?:image\/|multipart\/(?:related|mixed))|filename=/i);
    }
  } finally { transport.close(); }
});
