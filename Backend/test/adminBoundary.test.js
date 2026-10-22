import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { homedir } from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { adminBoundaryConfig, createAdminBoundary } from '../src/adminBoundary.js';
import { User } from '../src/models.js';
import { hashPassword } from '../src/security.js';

const origin = 'https://admin.example.test';
const env = { NODE_ENV: 'production', FRONTEND_URL: 'https://www.example.test', ADMIN_FRONTEND_URL: origin,
  ADMIN_ACCESS_MODE: 'cloudflare', ADMIN_ACCESS_ISSUER: 'https://club.cloudflareaccess.com', ADMIN_ACCESS_AUDIENCE: 'admin-app-audience' };
process.env.FRONTEND_URL = env.FRONTEND_URL;
process.env.ADMIN_FRONTEND_URL = origin;
process.env.MONGOMS_DOWNLOAD_DIR = path.join(homedir(), '.cache', 'arpc-mongodb');
let privateKey, app, mongo;
const headers = { Host: 'admin.example.test', Origin: origin, 'X-ARPC-Request': '1' };
async function token(overrides = {}, key = privateKey) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ type: 'app', email: 'owner@example.test', sub: 'identity-123', iat: now, exp: now + 300,
    iss: env.ADMIN_ACCESS_ISSUER, aud: env.ADMIN_ACCESS_AUDIENCE, ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(key);
}
before(async () => {
  const pair = await generateKeyPair('RS256'); privateKey = pair.privateKey;
  const publicKey = await exportJWK(pair.publicKey);
  app = createApp({ adminBoundary: createAdminBoundary({ env, keySet: createLocalJWKSet({ keys: [{ ...publicKey, kid: 'test-key', alg: 'RS256' }] }) }) });
  mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri());
  await User.create({ email: 'owner@example.test', fullName: 'Owner', role: 'superadmin', status: 'active', emailVerified: true, passwordHash: await hashPassword('long-test-password') });
});
after(async () => { await mongoose.disconnect(); await mongo?.stop(); });

test('production defaults closed and refuses local access or incomplete identity configuration', async () => {
  assert.equal(adminBoundaryConfig({ NODE_ENV: 'production' }).mode, 'disabled');
  assert.throws(() => adminBoundaryConfig({ ...env, ADMIN_ACCESS_MODE: 'local' }), /Local admin/);
  assert.throws(() => adminBoundaryConfig({ ...env, ADMIN_ACCESS_AUDIENCE: '' }), /Configure/);
  assert.throws(() => adminBoundaryConfig({ ...env, ADMIN_ACCESS_ISSUER: 'https://attacker.example' }), /Configure/);
  assert.throws(() => adminBoundaryConfig({ ...env, ADMIN_FRONTEND_URL: env.FRONTEND_URL }), /different/);
  const closed = createApp({ adminBoundary: createAdminBoundary({ env: { NODE_ENV: 'production' } }) });
  await request(closed).get('/api/access/check').set(headers).expect(404);
  await request(closed).get('/api/health/live').expect(200);
});

test('public hosts, spoofed forwarding headers and unsigned identities cannot reach admin endpoints', async () => {
  for (const endpoint of ['/api/access/check', '/api/auth/me', '/api/admin/workspace', '/api/config', '/api/auth/google-challenge']) {
    await request(app).get(endpoint).set(headers).expect(404);
    await request(app).get(endpoint).set(headers).set('Host', 'www.example.test').set('X-Forwarded-Host', 'admin.example.test').set('Cf-Access-Jwt-Assertion', await token()).expect(404);
  }
  await request(app).post('/api/auth/register').set(headers).set('Cf-Access-Authenticated-User-Email', 'owner@example.test').send({}).expect(404);
  await request(app).get('/api/access/check').set(headers).set('Origin', env.FRONTEND_URL).set('Cf-Access-Jwt-Assertion', await token()).expect(404);
});

test('verifies signatures, issuer, audience, lifetime and human identity claims', async () => {
  for (const override of [{ aud: 'another-app' }, { iss: 'https://evil.cloudflareaccess.com' }, { exp: 1 }, { exp: undefined }, { iat: undefined }, { iat: Math.floor(Date.now()/1000)+100 }, { sub: '' }, { email: undefined }, { type: 'service' }, { nbf: Math.floor(Date.now() / 1000) + 100 }]) {
    await request(app).get('/api/access/check').set(headers).set('Cf-Access-Jwt-Assertion', await token(override)).expect(404);
  }
  const wrongKey = await generateKeyPair('RS256');
  await request(app).get('/api/access/check').set(headers).set('Cf-Access-Jwt-Assertion', await token({}, wrongKey.privateKey)).expect(404);
  await request(app).get('/api/access/check').set(headers).set('Cf-Access-Jwt-Assertion', await token()).expect(204);
});

test('gateway approval does not bypass the ARPC session and binds an existing session to its identity', async () => {
  const assertion = await token();
  await request(app).get('/api/admin/workspace').set(headers).set('Cf-Access-Jwt-Assertion', assertion).expect(401);
  const login = await request(app).post('/api/auth/login').set(headers).set('Cf-Access-Jwt-Assertion', assertion).send({ email: 'owner@example.test', password: 'long-test-password' }).expect(200);
  const cookie = login.headers['set-cookie'].find(value => value.startsWith('arpc_session=')).split(';')[0];
  const retired = await request(app).post('/api/applications').set({ Host: 'www.example.test', Origin: env.FRONTEND_URL, 'X-ARPC-Request': '1', Cookie: cookie }).send({}).expect(400);
  assert.ok(retired.headers['set-cookie'].some(value => value.startsWith('arpc_session=;')));
  await request(app).get('/api/auth/me').set(headers).set('Cf-Access-Jwt-Assertion', assertion).set('Cookie', cookie).expect(200);
  await request(app).get('/api/auth/me').set(headers).set('Cf-Access-Jwt-Assertion', await token({ email: 'another@example.test' })).set('Cookie', cookie).expect(401);
  await request(app).post('/api/auth/login').set(headers).set('Cf-Access-Jwt-Assertion', await token({ email: 'another@example.test' })).send({ email: 'owner@example.test', password: 'long-test-password' }).expect(403);
  await request(app).post('/api/auth/register').set(headers).set('Cf-Access-Jwt-Assertion', assertion).send({ email: 'outsider@example.test', fullName: 'Outsider', password: 'long-test-password' }).expect(403);
  assert.equal(await User.exists({ email: 'outsider@example.test' }), null);
});

test('local development permits only its separate .localhost origin', async () => {
  const local = createApp({ adminBoundary: createAdminBoundary({ env: { NODE_ENV: 'development' } }) });
  await request(local).get('/api/access/check').set('Host', 'admin.localhost:5174').expect(204);
  await request(local).get('/api/access/check').set('Host', 'localhost:5173').expect(404);
  await request(local).get('/api/access/check').set('Host', 'admin.localhost:5174').set('Origin', 'http://localhost:5173').expect(404);
});
