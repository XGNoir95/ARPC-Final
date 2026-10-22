import { randomInt } from 'node:crypto';
import { User, Mail, Token } from './models.js';
import { randomToken, hashPassword, comparePassword, ensure, HttpError } from './security.js';
import { queueClubMail } from './outbox.js';
import { adminFrontendUrl } from './adminBoundary.js';

const MINUTE = 60_000;
const LIFE = 10 * MINUTE;
const GUESS_WINDOW = 15 * MINUTE;
const SEND_WINDOW = 60 * MINUTE;
const MAX_GUESSES = 5;
const MAX_SENDS = 5;
const eventPrefix = id => `verification:${id}:`;
const readAccount = id => User.findById(id).select('+emailVerification');
const millis = value => value ? new Date(value).getTime() : 0;
const versionMatch = state => state?.version ? { 'emailVerification.version': state.version } : { 'emailVerification.version': { $exists: false } };
function requireWaitOver(until, at, message) {
  if (!until) return;
  const failure = new HttpError(429, message, 'VERIFICATION_WAIT');
  failure.retryAfterSeconds = Math.max(1, Math.ceil((millis(until) - at.getTime()) / 1000));
  throw failure;
}

export function verificationStatus(user, at = new Date()) {
  const state = user.emailVerification;
  const now = at.getTime();
  const lockedUntil = state?.attempts >= MAX_GUESSES && millis(state.attemptWindowAt) + GUESS_WINDOW > now
    ? new Date(millis(state.attemptWindowAt) + GUESS_WINDOW) : null;
  const sendLimitUntil = state?.sendCount >= MAX_SENDS && millis(state.sendWindowAt) + SEND_WINDOW > now
    ? millis(state.sendWindowAt) + SEND_WINDOW : 0;
  const resendAt = Math.max(millis(state?.resendAt), sendLimitUntil, millis(lockedUntil));
  return {
    serverTime: at,
    required: !user.emailVerified,
    expiresAt: !user.emailVerified && state?.expiresAt || null,
    resendAvailableAt: !user.emailVerified && resendAt > now ? new Date(resendAt) : null,
    lockedUntil: !user.emailVerified ? lockedUntil : null,
  };
}

export async function cancelVerificationMail(userId, onlyVersion) {
  const filter = { eventKey: onlyVersion ? `${eventPrefix(userId)}${onlyVersion}` : { $regex: `^${eventPrefix(userId)}` }, state: { $in: ['queued', 'failed'] } };
  await Mail.updateMany(filter, { $set: { state: 'cancelled', lastError: 'Verification code is no longer current.' }, $unset: { lease: 1, leasedUntil: 1, nextAttemptAt: 1 } });
}

export async function finishVerification(userId) {
  // Verification has already committed. Cleanup must not turn that success
  // into a failed response; worker preflight also rejects all obsolete codes.
  const results = await Promise.allSettled([
    Token.deleteMany({ purpose: 'verify', subject: String(userId) }),
    cancelVerificationMail(userId),
  ]);
  if (results.some(result => result.status === 'rejected')) console.error('Verification cleanup deferred; obsolete codes remain unusable.');
}

export async function requestVerificationCode(userId, { at = new Date(), front = adminFrontendUrl() } = {}) {
  const user = await readAccount(userId);
  ensure(user, 401, 'Sign in again to verify your email.');
  if (user.emailVerified) return { ...verificationStatus(user, at), message: 'Your email is already verified.' };
  const current = user.emailVerification;
  const status = verificationStatus(user, at);
  requireWaitOver(status.lockedUntil, at, 'Too many incorrect codes. Wait before trying again.');
  requireWaitOver(status.resendAvailableAt, at, 'Please wait before requesting another verification code.');
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const codeHash = await hashPassword(code);
  const version = randomToken();
  const resetSendWindow = !current?.sendWindowAt || millis(current.sendWindowAt) + SEND_WINDOW <= at.getTime();
  const fields = {
    'emailVerification.version': version, 'emailVerification.codeHash': codeHash,
    'emailVerification.expiresAt': new Date(at.getTime() + LIFE),
    'emailVerification.resendAt': new Date(at.getTime() + MINUTE),
    'emailVerification.sendWindowAt': resetSendWindow ? at : current.sendWindowAt,
    'emailVerification.sendCount': resetSendWindow ? 1 : current.sendCount + 1,
  };
  // Resending never resets the guess budget, including guesses in flight.
  if (!current?.version) Object.assign(fields, { 'emailVerification.attemptWindowAt': at, 'emailVerification.attempts': 0 });
  const saved = await User.findOneAndUpdate({ _id: userId, emailVerified: false, ...versionMatch(current) }, { $set: fields }, { returnDocument: 'after' }).select('+emailVerification');
  ensure(saved, 409, 'Your verification status changed. Refresh before requesting another code.');
  try {
    await queueClubMail(user.email, 'verification', { name: user.fullName, code, resent: Boolean(current?.version), url: `${front.replace(/\/$/, '')}/admin` }, `${eventPrefix(userId)}${version}`);
  } catch {
    // A successful signup remains usable; failed enqueue must permit immediate recovery.
    await User.updateOne({ _id: userId, emailVerified: false, 'emailVerification.version': version }, {
      $set: { 'emailVerification.resendAt': at, 'emailVerification.expiresAt': at }, $inc: { 'emailVerification.sendCount': -1 },
    });
    ensure(false, 503, 'Your account is saved, but the verification email could not be queued. Request a new code.');
  }
  // Cancel the version replaced by this request only. A delayed enqueue must
  // never cancel a newer code issued concurrently on another process.
  if (current?.version) await cancelVerificationMail(userId, current.version);
  return { ...verificationStatus(saved, at), message: 'A verification code has been queued. Check your inbox and spam folder.' };
}

export async function verifyEmailCode(userId, code, { at = new Date() } = {}) {
  const user = await readAccount(userId);
  ensure(user, 401, 'Sign in again to verify your email.');
  ensure(!user.emailVerified, 400, 'Your email is already verified.');
  const state = user.emailVerification;
  requireWaitOver(verificationStatus(user, at).lockedUntil, at, 'Too many incorrect codes. Wait before trying again.');
  ensure(state?.version && millis(state.expiresAt) > at.getTime(), 400, 'This verification code has expired. Request a new code.');
  if (!state.attemptWindowAt || millis(state.attemptWindowAt) + GUESS_WINDOW <= at.getTime()) {
    await User.updateOne({ _id: userId, emailVerified: false, 'emailVerification.version': state.version, 'emailVerification.attemptWindowAt': state.attemptWindowAt || { $exists: false } }, {
      $set: { 'emailVerification.attemptWindowAt': at, 'emailVerification.attempts': 0 },
    });
  }
  // Claim an attempt in MongoDB before hashing: parallel requests share one budget.
  const claimed = await User.findOneAndUpdate({ _id: userId, emailVerified: false,
    'emailVerification.version': state.version, 'emailVerification.expiresAt': { $gt: at }, 'emailVerification.attempts': { $lt: MAX_GUESSES },
  }, { $inc: { 'emailVerification.attempts': 1 } }, { returnDocument: 'after' }).select('+emailVerification');
  ensure(claimed, 429, 'Verification is unavailable. Refresh your status before trying again.');
  const matches = await comparePassword(code, claimed.emailVerification.codeHash);
  if (!matches) requireWaitOver(verificationStatus(claimed, at).lockedUntil, at, 'Too many incorrect codes. Wait before trying again.');
  ensure(matches, 400, 'That verification code is incorrect. Check your latest email and try again.');
  const verified = await User.findOneAndUpdate({ _id: userId, emailVerified: false,
    'emailVerification.version': state.version, 'emailVerification.expiresAt': { $gt: new Date(Math.max(at.getTime(), Date.now())) },
  }, { $set: { emailVerified: true }, $unset: { emailVerification: 1 } }, { returnDocument: 'after' });
  ensure(verified, 400, 'This code has expired or been replaced. Refresh your status and use the latest code.');
  await finishVerification(userId);
  return verified;
}

export async function verificationMailIsCurrent(eventKey, at = new Date()) {
  const match = /^verification:([a-f\d]{24}):([a-f\d]{64})$/.exec(eventKey || '');
  if (!match) return !String(eventKey || '').startsWith('verification:');
  return Boolean(await User.exists({ _id: match[1], emailVerified: false, 'emailVerification.version': match[2], 'emailVerification.expiresAt': { $gt: at } }));
}
