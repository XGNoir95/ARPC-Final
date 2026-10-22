import { randomBytes, scrypt as derive, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(derive);
export const randomToken = () => randomBytes(32).toString('hex');
export const hash = v => createHash('sha256').update(v).digest('hex');
export async function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(value, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}
export async function comparePassword(value, stored = '') {
  const [salt,key] = stored.split(':');
  if (!salt || !key) { await scrypt(value, 'missing-account', 64); return false; }
  const actual = await scrypt(value,salt,64);
  const expected = Buffer.from(key,'hex');
  return expected.length === actual.length && timingSafeEqual(expected,actual);
}
export const profile = u => ({ id: String(u._id), fullName: u.fullName, email: u.email, department: u.department || '', role: u.role, status: u.status, emailVerified: u.emailVerified, accessRevision: u.accessRevision || 1 });
export class HttpError extends Error { constructor(status,message,code) { super(message); this.status = status; if(code)this.code=code; } }
export const ensure = (condition,status,message,code) => { if (!condition) throw new HttpError(status,message,code); };
