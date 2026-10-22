import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import nodemailer from 'nodemailer';
import { homedir } from 'node:os';
import path from 'node:path';
import { createApp } from './helpers/app.js';
import * as M from '../src/models.js';
import { hash, hashPassword, comparePassword, randomToken } from '../src/security.js';
import {
  requestVerificationCode, verifyEmailCode, verificationStatus, verificationMailIsCurrent,
} from '../src/emailVerification.js';
import { deliverMail } from '../src/mail.js';

process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.GOOGLE_CLIENT_ID = 'verification-test-client';
process.env.MONGOMS_DOWNLOAD_DIR = path.join(homedir(), '.cache', 'arpc-mongodb');
const headers = { 'X-ARPC-Request': '1', Origin: 'http://localhost:5173' };
const password = 'a-long-otp-test-password';
const minute = 60_000;
let mongo, app, passwordHash;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  passwordHash = await hashPassword(password);
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.models).map(model => model.deleteMany({})));
  app = createApp({ googleVerify: async (credential, nonce) => ({
    email: 'google-link@example.test', sub: 'verified-google-subject',
    email_verified: true, name: 'Google Administrator', nonce,
  }) });
});

after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

const account = (name, values = {}) => M.User.create({
  fullName: 'Verification Administrator', email: `${name}@example.test`, passwordHash, ...values,
});
const readState = id => M.User.findById(id).select('+emailVerification');
const codeFrom = mail => {
  const match = /Your verification code: (\d{6})\b/.exec(mail.text);
  assert.ok(match, 'Verification email must contain a copyable six-digit code.');
  return match[1];
};
const currentMail = async id => {
  const user = await readState(id);
  return M.Mail.findOne({ eventKey: `verification:${id}:${user.emailVerification.version}` });
};
const issue = async (user, at = new Date()) => {
  const status = await requestVerificationCode(user._id, { at });
  const mail = await currentMail(user._id);
  return { status, mail, code: codeFrom(mail) };
};
const login = async user => {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(200);
  return agent;
};
const rejectWith = (promise, status, pattern) => assert.rejects(promise, error => {
  assert.equal(error.status, status);
  if (pattern) assert.match(error.message, pattern);
  return true;
});
const wrongCode = code => code === '999999' ? '888888' : '999999';

test('signup queues a branded OTP without exposing its code, hash, or challenge to clients', async () => {
  const agent = request.agent(app);
  const result = await agent.post('/api/auth/register').set(headers).send({
    fullName: 'New Administrator', email: 'signup-otp@example.test', password,
    role: 'superadmin', status: 'active', emailVerified: true,
  }).expect(201);
  assert.equal(result.body.profile.status, 'pending');
  assert.equal(result.body.profile.role, 'admin');
  assert.equal(result.body.profile.emailVerified, false);
  assert.equal(result.body.verification.required, true);
  const user = await M.User.findOne({ email: 'signup-otp@example.test' }).select('+emailVerification');
  const mail = await currentMail(user._id);
  const code = codeFrom(mail);
  const state = user.emailVerification;
  assert.match(state.codeHash, /^[a-f\d]{32}:[a-f\d]{128}$/);
  assert.ok(await comparePassword(code, state.codeHash));
  assert.notEqual(state.codeHash, code);
  assert.equal(state.sendCount, 1);
  assert.equal(state.attempts, 0);
  assert.equal(state.expiresAt.getTime() - state.sendWindowAt.getTime(), 10 * minute);
  assert.match(mail.html, /Your verification code/);
  assert.match(mail.text, /10 minutes/);
  assert.doesNotMatch(mail.subject, new RegExp(code));
  assert.equal(await M.Token.countDocuments({ purpose: 'verify' }), 0);
  assert.equal((await M.User.findById(user._id)).emailVerification, undefined);
  for (const response of [result, await agent.get('/api/auth/me').expect(200), await agent.get('/api/auth/verification-status').expect(200)]) {
    const serialized = JSON.stringify(response.body);
    assert.ok(!serialized.includes(state.codeHash));
    assert.ok(!serialized.includes(state.version));
    assert.ok(!serialized.includes(`"${code}"`));
    assert.doesNotMatch(serialized, /passwordHash|codeHash/);
  }
  await agent.get('/api/admin/workspace').expect(403);
});

test('verification requires its own authenticated session and rejects cross-site or malformed submissions', async () => {
  const user = await account('session-bound');
  const other = await account('other-session');
  const { code } = await issue(user);
  await request(app).post('/api/auth/verify-code').set(headers).send({ code }).expect(401);
  await request(app).get('/api/auth/verification-status').expect(401);
  await request(app).post('/api/auth/resend-verification').set(headers).send({}).expect(401);
  const otherAgent = await login(other);
  await otherAgent.post('/api/auth/verify-code').set(headers).send({ code }).expect(400);
  assert.equal((await M.User.findById(user._id)).emailVerified, false);
  const agent = await login(user);
  await agent.post('/api/auth/verify-code').send({ code }).expect(403);
  await agent.post('/api/auth/verify-code').set({ ...headers, Origin: 'https://evil.example' }).send({ code }).expect(403);
  for (const invalid of [123456, '12345', '1234567', '12 3456', { $ne: '' }]) {
    await agent.post('/api/auth/verify-code').set(headers).send({ code: invalid }).expect(400);
  }
  assert.equal((await readState(user._id)).emailVerification.attempts, 0);
});

test('a leading-zero code works, is single use, and never grants club approval', async () => {
  const user = await account('leading-zero');
  await issue(user);
  await M.User.updateOne({ _id: user._id }, { $set: { 'emailVerification.codeHash': await hashPassword('000042') } });
  const agent = await login(user);
  const result = await agent.post('/api/auth/verify-code').set(headers).send({ code: '000042' }).expect(200);
  assert.equal(result.body.profile.emailVerified, true);
  assert.equal(result.body.profile.status, 'pending');
  await agent.get('/api/admin/workspace').expect(403);
  await agent.post('/api/auth/verify-code').set(headers).send({ code: '000042' }).expect(400);
  const saved = await readState(user._id);
  assert.equal(saved.emailVerification, undefined);
  assert.equal((await currentMailAfterVerification(user._id)).state, 'cancelled');
  await M.User.updateOne({ _id: user._id }, { $set: { status: 'active' } });
  await agent.get('/api/admin/workspace').expect(200);
});

const currentMailAfterVerification = id => M.Mail.findOne({ eventKey: { $regex: `^verification:${id}:` } });

test('expiry is enforced by the API even before database TTL or worker cleanup', async () => {
  const user = await account('expired');
  const { code, mail } = await issue(user, new Date(Date.now() - 11 * minute));
  const agent = await login(user);
  const result = await agent.post('/api/auth/verify-code').set(headers).send({ code }).expect(400);
  assert.match(result.body.message, /expired/i);
  assert.equal((await readState(user._id)).emailVerification.attempts, 0);
  assert.equal(await verificationMailIsCurrent(mail.eventKey), false);
});

test('resends enforce a cooldown, invalidate the previous code and preserve the guess counter', async () => {
  const user = await account('resend');
  const base = new Date();
  const first = await issue(user, base);
  await rejectWith(verifyEmailCode(user._id, wrongCode(first.code), { at: base }), 400);
  await rejectWith(requestVerificationCode(user._id, { at: new Date(base.getTime() + 59_999) }), 429);
  const second = await issue(user, new Date(base.getTime() + minute));
  assert.equal((await M.Mail.findById(first.mail._id)).state, 'cancelled');
  assert.equal((await readState(user._id)).emailVerification.attempts, 1);
  assert.equal(await verificationMailIsCurrent(first.mail.eventKey, base), false);
  assert.equal(await verificationMailIsCurrent(second.mail.eventKey, base), true);
  if (first.code !== second.code) await rejectWith(verifyEmailCode(user._id, first.code), 400);
  const saved = await verifyEmailCode(user._id, second.code);
  assert.equal(saved.emailVerified, true);
});

test('parallel wrong guesses share one durable five-attempt budget across sessions and resends', async () => {
  const user = await account('parallel-guesses');
  const base = new Date();
  const first = await issue(user, base);
  const initial = await Promise.allSettled(Array.from({ length: 3 }, () => verifyEmailCode(user._id, wrongCode(first.code), { at: base })));
  assert.ok(initial.every(result => result.status === 'rejected' && result.reason.status === 400));
  const second = await issue(user, new Date(base.getTime() + minute));
  const remaining = await Promise.allSettled(Array.from({ length: 10 }, () => verifyEmailCode(user._id, wrongCode(second.code), { at: new Date(base.getTime() + minute) })));
  assert.ok(remaining.every(result => result.status === 'rejected'));
  const stored = await readState(user._id);
  assert.equal(stored.emailVerification.attempts, 5);
  assert.equal(stored.emailVerified, false);
  assert.ok(verificationStatus(stored, base).lockedUntil);
  await rejectWith(verifyEmailCode(user._id, second.code, { at: new Date(base.getTime() + 2 * minute) }), 429);
  await rejectWith(requestVerificationCode(user._id, { at: new Date(base.getTime() + 2 * minute) }), 429);
  const recovered = await issue(user, new Date(base.getTime() + 15 * minute));
  assert.equal((await verifyEmailCode(user._id, recovered.code, { at: new Date(base.getTime() + 15 * minute) })).emailVerified, true);
});

test('parallel correct submissions can consume a challenge only once', async () => {
  const user = await account('parallel-success');
  const { code } = await issue(user);
  const attempts = await Promise.allSettled(Array.from({ length: 4 }, () => verifyEmailCode(user._id, code)));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  assert.ok(attempts.filter(result => result.status === 'rejected').every(result => result.reason.status === 400 || result.reason.status === 429));
  assert.equal((await M.User.findById(user._id)).emailVerified, true);
  assert.equal(await M.Mail.countDocuments({ state: 'queued' }), 0);
});

test('an account cannot send more than five verification messages in an hour', async () => {
  const user = await account('hour-limit');
  const base = new Date();
  for (let n = 0; n < 5; n++) await issue(user, new Date(base.getTime() + n * minute));
  await rejectWith(requestVerificationCode(user._id, { at: new Date(base.getTime() + 5 * minute) }), 429);
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 5);
  const status = verificationStatus(await readState(user._id), new Date(base.getTime() + 5 * minute));
  assert.equal(status.resendAvailableAt.getTime(), base.getTime() + 60 * minute);
  await issue(user, new Date(base.getTime() + 60 * minute));
  assert.equal((await readState(user._id)).emailVerification.sendCount, 1);
});

test('parallel resend requests create one new challenge and one new outbox job', async () => {
  const user = await account('parallel-resend');
  const base = new Date();
  await issue(user, base);
  const results = await Promise.allSettled(Array.from({ length: 4 }, () => requestVerificationCode(user._id, { at: new Date(base.getTime() + minute) })));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await readState(user._id)).emailVerification.sendCount, 2);
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 2);
  assert.equal(await M.Mail.countDocuments({ to: user.email, state: 'queued' }), 1);
});

test('legacy verification links clear OTPs and all other verification links for that account', async () => {
  const user = await account('legacy-link');
  const { code } = await issue(user);
  const raw = randomToken();
  await M.Token.create({ hash: hash(raw), purpose: 'verify', email: user.email, subject: String(user._id), expiresAt: new Date(Date.now() + minute) });
  await M.Token.create({ hash: hash(randomToken()), purpose: 'verify', email: user.email, subject: String(user._id), expiresAt: new Date(Date.now() + minute) });
  await request(app).post('/api/auth/verify').set(headers).send({ token: raw }).expect(200);
  assert.equal((await readState(user._id)).emailVerification, undefined);
  assert.equal((await M.User.findById(user._id)).status, 'pending');
  assert.equal(await M.Token.countDocuments({ purpose: 'verify', subject: String(user._id) }), 0);
  assert.equal(await M.Mail.countDocuments({ to: user.email, state: 'queued' }), 0);
  await rejectWith(verifyEmailCode(user._id, code), 400);
});

test('linking an already verified Google identity clears OTPs without granting approval', async () => {
  const user = await account('google-link');
  await issue(user);
  await M.Token.create({ hash: hash(randomToken()), purpose: 'verify', email: user.email, subject: String(user._id), expiresAt: new Date(Date.now() + minute) });
  const agent = await login(user);
  await agent.get('/api/auth/google-challenge').expect(200);
  await agent.post('/api/auth/link-google').set(headers).send({ credential: 'verified-identity' }).expect(200);
  const saved = await readState(user._id);
  assert.equal(saved.emailVerified, true);
  assert.equal(saved.emailVerification, undefined);
  assert.equal(saved.status, 'pending');
  assert.equal(await M.Token.countDocuments({ purpose: 'verify', subject: String(user._id) }), 0);
  assert.equal(await M.Mail.countDocuments({ to: user.email, state: 'queued' }), 0);
  await agent.get('/api/admin/workspace').expect(403);
});

test('an enqueue failure preserves signup, its session, and an immediate resend recovery path', async () => {
  const original = M.Mail.findOneAndUpdate;
  const agent = request.agent(app);
  let result;
  M.Mail.findOneAndUpdate = function (filter, ...args) {
    if (String(filter.eventKey || '').startsWith('verification:')) throw new Error('Simulated outbox failure.');
    return original.call(this, filter, ...args);
  };
  try {
    result = await agent.post('/api/auth/register').set(headers).send({ fullName: 'Recoverable Signup', email: 'queue-recovery@example.test', password }).expect(201);
  } finally {
    M.Mail.findOneAndUpdate = original;
  }
  assert.equal(result.body.verification.deliveryUnavailable, true);
  assert.equal(result.body.profile.emailVerified, false);
  await agent.get('/api/auth/me').expect(200);
  const user = await M.User.findOne({ email: 'queue-recovery@example.test' }).select('+emailVerification');
  assert.equal(user.emailVerification.sendCount, 0);
  assert.equal(verificationStatus(user).resendAvailableAt, null);
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 0);
  await agent.post('/api/auth/resend-verification').set(headers).send({}).expect(200);
  const code = codeFrom(await currentMail(user._id));
  await agent.post('/api/auth/verify-code').set(headers).send({ code }).expect(200);
});

test('the worker cancels expired, superseded, malformed, verified and deleted-account OTP jobs before SMTP', async () => {
  const expired = await account('worker-expired');
  const stale = await account('worker-superseded');
  const deleted = await account('worker-deleted');
  const verified = await account('worker-verified');
  const current = await account('worker-current');
  const base = new Date();
  const expiredJob = await issue(expired, new Date(base.getTime() - 11 * minute));
  const staleJob = await issue(stale, base);
  const newestJob = await issue(stale, new Date(base.getTime() + minute));
  const deletedJob = await issue(deleted, base);
  const verifiedJob = await issue(verified, base);
  const currentJob = await issue(current, base);
  await M.User.deleteOne({ _id: deleted._id });
  await M.User.updateOne({ _id: verified._id }, { $set: { emailVerified: true } });
  const malformed = await M.Mail.create({ to: 'malformed@example.test', subject: 'Malformed verification', text: 'Invalid', eventKey: 'verification:invalid:version' });
  await M.Mail.updateMany({ _id: staleJob.mail._id }, { $set: { state: 'queued' } });
  const sent = [];
  const originalTransport = nodemailer.createTransport;
  const originalEnv = Object.fromEntries(['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].map(key => [key, process.env[key]]));
  Object.assign(process.env, { SMTP_HOST: 'smtp.invalid', SMTP_USER: 'dummy@example.test', SMTP_PASS: 'test-only' });
  nodemailer.createTransport = () => ({ sendMail: async message => { sent.push(message); }, close() {} });
  try {
    await deliverMail({ now: () => base });
  } finally {
    nodemailer.createTransport = originalTransport;
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  assert.deepEqual(sent.map(message => message.to).sort(), [stale.email, current.email].sort());
  for (const job of [expiredJob.mail, staleJob.mail, deletedJob.mail, verifiedJob.mail, malformed]) {
    assert.equal((await M.Mail.findById(job._id)).state, 'cancelled');
  }
  for (const job of [newestJob.mail, currentJob.mail]) assert.equal((await M.Mail.findById(job._id)).state, 'sent');
});

test('a delayed earlier enqueue cannot cancel the newer current verification email', async () => {
  const user = await account('delayed-enqueue');
  const base = new Date();
  await issue(user, new Date(base.getTime() - minute));
  const original = M.Mail.findOneAndUpdate;
  let release, started;
  const gate = new Promise(resolve => { release = resolve; });
  const began = new Promise(resolve => { started = resolve; });
  let holdFirst = true;
  M.Mail.findOneAndUpdate = function (filter, ...args) {
    if (holdFirst && String(filter.eventKey || '').startsWith('verification:')) {
      holdFirst = false;
      started();
      return gate.then(() => original.call(this, filter, ...args));
    }
    return original.call(this, filter, ...args);
  };
  const earlier = requestVerificationCode(user._id, { at: base });
  let latest;
  try {
    await began;
    latest = await issue(user, new Date(base.getTime() + minute));
  } finally {
    release();
    await earlier;
    M.Mail.findOneAndUpdate = original;
  }
  assert.equal((await M.Mail.findById(latest.mail._id)).state, 'queued');
  assert.equal(await verificationMailIsCurrent(latest.mail.eventKey, base), true);
});

test('cleanup failures after verification commits still return success and log no private details', async () => {
  const user = await account('cleanup-recovery');
  const { code, mail } = await issue(user);
  const agent = await login(user);
  const originalDelete = M.Token.deleteMany;
  const originalUpdate = M.Mail.updateMany;
  const originalError = console.error;
  const logs = [];
  M.Token.deleteMany = () => Promise.reject(new Error(`Private cleanup details: ${user.email} ${code}`));
  M.Mail.updateMany = () => Promise.reject(new Error(`Private email body: ${mail.text}`));
  console.error = (...values) => { logs.push(values); };
  let result;
  try {
    result = await agent.post('/api/auth/verify-code').set(headers).send({ code }).expect(200);
  } finally {
    M.Token.deleteMany = originalDelete;
    M.Mail.updateMany = originalUpdate;
    console.error = originalError;
  }
  assert.equal(result.body.profile.emailVerified, true);
  assert.equal(result.body.profile.status, 'pending');
  assert.equal((await readState(user._id)).emailVerification, undefined);
  assert.deepEqual(logs, [['Verification cleanup deferred; obsolete codes remain unusable.']]);
  assert.equal((await M.Mail.findById(mail._id)).state, 'queued');
  assert.equal(await verificationMailIsCurrent(mail.eventKey), false);
});

test('resend cooldown and guess lockouts return an actionable Retry-After header', async () => {
  const user = await account('retry-after');
  const { code } = await issue(user);
  const agent = await login(user);
  const resend = await agent.post('/api/auth/resend-verification').set(headers).send({}).expect(429);
  assert.equal(resend.body.code, 'VERIFICATION_WAIT');
  assert.ok(Number(resend.headers['retry-after']) >= 1 && Number(resend.headers['retry-after']) <= 60);
  for (let n = 0; n < 4; n++) {
    await agent.post('/api/auth/verify-code').set(headers).send({ code: wrongCode(code) }).expect(400);
  }
  for (const attemptCode of [wrongCode(code), code]) {
    const locked = await agent.post('/api/auth/verify-code').set(headers).send({ code: attemptCode }).expect(429);
    assert.equal(locked.body.code, 'VERIFICATION_WAIT');
    assert.ok(Number(locked.headers['retry-after']) >= 1 && Number(locked.headers['retry-after']) <= 900);
  }
  const lockedResend = await agent.post('/api/auth/resend-verification').set(headers).send({}).expect(429);
  assert.equal(lockedResend.body.code, 'VERIFICATION_WAIT');
  assert.ok(Number(lockedResend.headers['retry-after']) > 60);
  assert.equal((await readState(user._id)).emailVerification.attempts, 5);
});
