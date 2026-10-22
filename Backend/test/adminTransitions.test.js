import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { homedir } from 'node:os';
import path from 'node:path';
import { createApp } from './helpers/app.js';
import { hash, hashPassword } from '../src/security.js';
import { reconcileAdminAccess } from '../src/notifications.js';
import * as M from '../src/models.js';

process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.MONGOMS_DOWNLOAD_DIR = path.join(homedir(), '.cache', 'arpc-mongodb');

const headers = { 'X-ARPC-Request': '1', Origin: 'http://localhost:5173' };
const password = 'a-long-admin-test-password';
const courseData = {
  id: 'transition-course', kind: 'courses', title: 'Transition course',
  description: 'A course for checking publication changes.', image: '/heroBanner.jpg', fee: 0,
};
let mongo, app, owner, ownerRecord, passwordHash;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  passwordHash = await hashPassword(password);
  ownerRecord = await M.User.create({
    email: 'transition-owner@example.test', fullName: 'Transition Owner',
    role: 'superadmin', status: 'active', emailVerified: true, passwordHash,
  });
  app = createApp();
  owner = request.agent(app);
  await owner.post('/api/auth/login').set(headers)
    .send({ email: ownerRecord.email, password }).expect(200);
});

beforeEach(async () => {
  await M.User.deleteMany({ _id: { $ne: ownerRecord._id } });
  await M.Session.deleteMany({ userId: { $ne: ownerRecord._id } });
  await Promise.all([
    M.Content, M.Application, M.Lesson, M.Mail, M.Token, M.Audit, M.Learner, M.LearnerSession,
  ].map(model => model.deleteMany({})));
});

after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

const account = (name, values = {}) => M.User.create({
  fullName: 'Sample Administrator', email: `${name}@example.test`, passwordHash, ...values,
});
const changeAccess = (user, body) => owner.patch(`/api/admin/users/${user._id}`).set(headers).send(body);
const auditCount = target => M.Audit.countDocuments({ target: String(target) });

test('approval and email verification are separate requirements for dashboard access', async () => {
  const user = await account('unverified-approval');
  const administrator = request.agent(app);
  await administrator.post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(200);
  await administrator.get('/api/admin/workspace').expect(403);

  const approved = await changeAccess(user, { status: 'active', expectedStatus: 'pending', revision: 1 }).expect(200);
  assert.equal(approved.body.status, 'active');
  assert.equal(approved.body.emailVerified, false);
  assert.equal(approved.body.accessRevision, 2);
  await administrator.get('/api/admin/workspace').expect(403);

  const mail = await M.Mail.findOne({ to: user.email });
  assert.ok(mail?.html);
  assert.match(mail.text, /verif/i);
  assert.doesNotMatch(mail.text, /access is ready|can now sign in to manage/i);

  const raw = 'a'.repeat(64);
  await M.Token.create({ hash: hash(raw), purpose: 'verify', email: user.email,
    subject: String(user._id), expiresAt: new Date(Date.now() + 3600000) });
  await administrator.post('/api/auth/verify').set(headers).send({ token: raw }).expect(200);
  await administrator.get('/api/admin/workspace').expect(200);
  assert.equal((await M.User.findById(user._id)).accessRevision, 2);
});

test('administrator actions follow the transition rules and same-state actions have no side effects', async () => {
  const statuses = ['pending', 'active', 'rejected', 'suspended'];
  const allowed = new Set(['pending:active', 'pending:rejected', 'active:suspended', 'suspended:active', 'rejected:pending']);
  for (const previous of statuses) {
    for (const status of statuses) {
      const user = await account(`${previous}-to-${status}`, { status: previous, emailVerified: true });
      const result = await changeAccess(user, { status, expectedStatus: previous, revision: 1 });
      const changed = previous !== status && allowed.has(`${previous}:${status}`);
      if (previous === status || changed) assert.equal(result.status, 200, `${previous} -> ${status}: ${result.text}`);
      else assert.ok([400, 409].includes(result.status), `${previous} -> ${status} must be rejected: ${result.text}`);

      const saved = await M.User.findById(user._id);
      assert.equal(saved.status, changed ? status : previous);
      assert.equal(saved.accessRevision, changed ? 2 : 1);
      assert.equal(await M.Mail.countDocuments({ to: user.email }), changed ? 1 : 0);
      assert.equal(await auditCount(user._id), changed ? 1 : 0);
      if (changed && status === 'pending') {
        const mail = await M.Mail.findOne({ to: user.email });
        assert.match(mail.text, /review/i);
        assert.doesNotMatch(mail.text, /access is ready|can now sign in to manage/i);
      }
    }
  }
});

test('stale administrator state or access revision cannot overwrite a newer decision', async () => {
  const user = await account('stale-access', { status: 'active', emailVerified: true, accessRevision: 3 });
  await changeAccess(user, { status: 'suspended', expectedStatus: 'pending', revision: 3 }).expect(409);
  await changeAccess(user, { status: 'suspended', expectedStatus: 'active', revision: 2 }).expect(409);
  const saved = await M.User.findById(user._id);
  assert.equal(saved.status, 'active');
  assert.equal(saved.accessRevision, 3);
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 0);
  assert.equal(await auditCount(user._id), 0);
});

test('parallel approvals create one effective decision, one notification and one audit entry', async () => {
  const user = await account('parallel-approval', { emailVerified: true });
  const body = { status: 'active', expectedStatus: 'pending', revision: 1 };
  const responses = await Promise.all([changeAccess(user, body), changeAccess(user, body)]);
  assert.ok(responses.some(response => response.status === 200));
  assert.ok(responses.every(response => [200, 409].includes(response.status)));
  const saved = await M.User.findById(user._id);
  assert.equal(saved.status, 'active');
  assert.equal(saved.accessRevision, 2);
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 1);
  assert.equal(await auditCount(user._id), 1);
});

test('administrator notifications recover a committed decision once after an interrupted enqueue', async () => {
  const user = await account('recover-approval', {
    status: 'active', emailVerified: false, accessRevision: 2, notifiedAccessRevision: 1,
  });
  await reconcileAdminAccess();
  await reconcileAdminAccess();

  const eventKey = `admin:${user._id}:access:2`;
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 1);
  const mail = await M.Mail.findOne({ eventKey });
  assert.ok(mail?.html);
  assert.match(mail.text, /approv/i);
  assert.match(mail.text, /verif/i);
  assert.doesNotMatch(mail.text, /access is ready|can now sign in to manage/i);
  const recovered = await M.User.findById(user._id);
  assert.equal(recovered.accessRevision, 2);
  assert.equal(recovered.notifiedAccessRevision, 2);

  await changeAccess(user, { status: 'active', expectedStatus: 'active', revision: 2 }).expect(200);
  await reconcileAdminAccess();
  assert.equal(await M.Mail.countDocuments({ to: user.email }), 1);
  assert.equal(await auditCount(user._id), 0);
  assert.equal((await M.User.findById(user._id)).accessRevision, 2);
});

test('legacy accounts without access revisions do not receive unsolicited mail and remain manageable', async () => {
  const legacyId = new mongoose.Types.ObjectId();
  const email = 'legacy-administrator@example.test';
  await M.User.collection.insertOne({
    _id: legacyId, email, fullName: 'Existing Administrator', role: 'admin',
    status: 'active', emailVerified: true, passwordHash,
  });
  await reconcileAdminAccess();
  assert.equal(await M.Mail.countDocuments({ to: email }), 0);

  const listing = await owner.get('/api/admin/users').expect(200);
  const profile = listing.body.find(user => user.id === String(legacyId));
  assert.equal(profile.accessRevision, 1);
  await changeAccess({ _id: legacyId }, { status: 'suspended', expectedStatus: 'active', revision: 1 }).expect(200);
  await reconcileAdminAccess();
  const suspended = await M.User.findById(legacyId);
  assert.equal(suspended.status, 'suspended');
  assert.equal(suspended.accessRevision, 2);
  assert.equal(suspended.notifiedAccessRevision, 2);
  assert.equal(await M.Mail.countDocuments({ to: email, eventKey: `admin:${legacyId}:access:2` }), 1);
});

test('suspension revokes existing sessions and restoration requires signing in again', async () => {
  const user = await account('suspend-restore', { status: 'active', emailVerified: true });
  const administrator = request.agent(app);
  await administrator.post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(200);
  await administrator.get('/api/admin/workspace').expect(200);
  await changeAccess(user, { status: 'suspended', expectedStatus: 'active', revision: 1 }).expect(200);
  assert.equal(await M.Session.countDocuments({ userId: user._id }), 0);
  await administrator.get('/api/auth/me').expect(401);
  await administrator.post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(403);
  await changeAccess(user, { status: 'active', expectedStatus: 'suspended', revision: 2 }).expect(200);
  await administrator.get('/api/admin/workspace').expect(401);
  await administrator.post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(200);
  await administrator.get('/api/admin/workspace').expect(200);
});

test('the bootstrap superadmin cannot be suspended through account management', async () => {
  await changeAccess(ownerRecord, { status: 'suspended', expectedStatus: 'active', revision: 1 }).expect(400);
  assert.equal((await M.User.findById(ownerRecord._id)).status, 'active');
  assert.equal(await M.Mail.countDocuments(), 0);
  assert.equal(await auditCount(ownerRecord._id), 0);
});

test('account deletion revokes old credentials and permits a fresh registration with the same email', async () => {
  const user = await account('delete-and-register', { status: 'active', emailVerified: true });
  const formerAdministrator = request.agent(app);
  const login = await formerAdministrator.post('/api/auth/login').set(headers)
    .send({ email: user.email, password }).expect(200);
  const oldCookie = login.headers['set-cookie'].find(value => value.startsWith('arpc_session=')).split(';')[0];
  await M.User.updateOne({ _id: user._id }, { $set: { status: 'suspended' } });

  const verifyToken = 'b'.repeat(64), resetToken = 'c'.repeat(64);
  await M.Token.create([
    { hash: hash(verifyToken), purpose: 'verify', email: user.email, subject: String(user._id), expiresAt: new Date(Date.now() + 3600000) },
    { hash: hash(resetToken), purpose: 'reset', email: user.email, subject: String(user._id), expiresAt: new Date(Date.now() + 3600000) },
    { hash: hash('d'.repeat(64)), purpose: 'invite', email: user.email, subject: '', expiresAt: new Date(Date.now() + 3600000) },
  ]);

  const deleted = await owner.delete(`/api/admin/users/${user._id}`).set(headers)
    .send({ expectedStatus: 'suspended', revision: 1 });
  assert.ok([200, 204].includes(deleted.status), deleted.text);
  assert.equal(await M.User.findById(user._id), null);
  assert.equal(await M.Session.countDocuments({ userId: user._id }), 0);
  assert.equal(await M.Token.countDocuments({ subject: String(user._id), purpose: { $in: ['verify', 'reset'] } }), 0);
  assert.equal(await M.Token.countDocuments({ email: user.email, purpose: 'invite' }), 0);
  await request(app).get('/api/auth/me').set('Cookie', oldCookie).expect(401);
  await request(app).post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(401);

  const newPassword = 'a-new-password-after-deletion';
  const freshAdministrator = request.agent(app);
  const registered = await freshAdministrator.post('/api/auth/register').set(headers)
    .send({ fullName: 'Fresh Administrator', email: user.email, password: newPassword }).expect(201);
  assert.notEqual(registered.body.profile.id, String(user._id));
  assert.equal(registered.body.profile.status, 'pending');
  assert.equal(registered.body.profile.emailVerified, false);
  await freshAdministrator.get('/api/admin/workspace').expect(403);
  await freshAdministrator.post('/api/auth/verify').set(headers).send({ token: verifyToken }).expect(400);
  await freshAdministrator.post('/api/auth/reset-password').set(headers)
    .send({ token: resetToken, password: 'an-unwanted-old-link-password' }).expect(400);
  await request(app).post('/api/auth/login').set(headers).send({ email: user.email, password }).expect(401);
  await freshAdministrator.post('/api/auth/login').set(headers)
    .send({ email: user.email, password: newPassword }).expect(200);
  await owner.delete(`/api/admin/users/${user._id}`).set(headers)
    .send({ expectedStatus: 'suspended', revision: 1 }).expect(404);
});

test('deleting an administrator preserves club records and unrelated security records', async () => {
  const user = await account('delete-preserve', { status: 'suspended', emailVerified: true });
  const other = await account('delete-unrelated', { status: 'active', emailVerified: true });
  const unrelatedSession = await M.Session.create({
    hash: hash('unrelated-administrator-session'), userId: other._id, expiresAt: new Date(Date.now() + 3600000),
  });
  const unrelatedToken = await M.Token.create({
    hash: hash('unrelated-verification-link'), purpose: 'verify', email: other.email,
    subject: String(other._id), expiresAt: new Date(Date.now() + 3600000),
  });
  const googleChallenge = await M.Token.create({
    hash: hash('unbound-google-challenge'), purpose: 'google', email: '', subject: '',
    expiresAt: new Date(Date.now() + 3600000),
  });
  const content = await M.Content.create({
    resource: 'home', key: 'hero', updatedBy: user._id, live: true,
    draft: { id: 'hero', title: 'Club welcome', description: 'Public club content.', image: '/heroBanner.jpg' },
    published: { id: 'hero', title: 'Club welcome', description: 'Public club content.', image: '/heroBanner.jpg' },
  });
  const application = await M.Application.create({
    type: 'membership', programmeId: 'membership', status: 'approved', paymentStatus: 'verified',
    reviewedBy: user._id, details: { fullName: user.fullName, email: user.email, studentId: 'preserved-application' },
  });
  const historicalAudit = await M.Audit.create({ actor: user._id, action: 'content.publish', target: String(content._id) });
  const baseMail = { to: user.email, subject: 'Access status', text: 'An earlier access decision.' };
  await M.Mail.create([
    { ...baseMail, state: 'queued', eventKey: `admin:${user._id}:access:2` },
    { ...baseMail, state: 'failed', attempts: 5, eventKey: `admin:${user._id}:access:3` },
  ]);
  const applicationMail = await M.Mail.create({
    to: user.email, subject: 'Application received', text: 'Preserve this unrelated receipt.',
    eventKey: `application:${application._id}:received`, state: 'queued',
  });
  const otherAccessMail = await M.Mail.create({
    to: other.email, subject: 'Access status', text: 'Another administrator notification.',
    eventKey: `admin:${other._id}:access:2`, state: 'queued',
  });
  const ownerSessions = await M.Session.find({ userId: ownerRecord._id }).lean();

  const deleted = await owner.delete(`/api/admin/users/${user._id}`).set(headers)
    .send({ expectedStatus: 'suspended', revision: 1 });
  assert.ok([200, 204].includes(deleted.status), deleted.text);
  assert.equal(await M.Mail.countDocuments({
    eventKey: { $regex: `^admin:${user._id}:access:` }, state: { $in: ['queued', 'failed'] },
  }), 0);
  assert.deepEqual((await M.Content.findById(content._id)).toObject(), content.toObject());
  assert.deepEqual((await M.Application.findById(application._id)).toObject(), application.toObject());
  assert.deepEqual((await M.Audit.findById(historicalAudit._id)).toObject(), historicalAudit.toObject());
  assert.deepEqual((await M.Session.findById(unrelatedSession._id)).toObject(), unrelatedSession.toObject());
  assert.deepEqual((await M.Token.findById(unrelatedToken._id)).toObject(), unrelatedToken.toObject());
  assert.deepEqual((await M.Token.findById(googleChallenge._id)).toObject(), googleChallenge.toObject());
  assert.deepEqual((await M.Mail.findById(applicationMail._id)).toObject(), applicationMail.toObject());
  assert.deepEqual((await M.Mail.findById(otherAccessMail._id)).toObject(), otherAccessMail.toObject());
  assert.deepEqual(await M.Session.find({ userId: ownerRecord._id }).lean(), ownerSessions);
});

test('account deletion enforces ownership, protected roles and stale-state checks', async () => {
  const target = await account('delete-protected-target', { status: 'suspended', accessRevision: 3 });
  const administrator = await account('delete-ordinary-admin', { status: 'active', emailVerified: true });
  const ordinary = request.agent(app);
  await ordinary.post('/api/auth/login').set(headers).send({ email: administrator.email, password }).expect(200);
  const body = { expectedStatus: 'suspended', revision: 3 };
  await request(app).delete(`/api/admin/users/${target._id}`).set(headers).send(body).expect(401);
  await ordinary.delete(`/api/admin/users/${target._id}`).set(headers).send(body).expect(403);
  await owner.delete(`/api/admin/users/${ownerRecord._id}`).set(headers)
    .send({ expectedStatus: 'active', revision: 1 }).expect(400);
  const otherOwner = await account('delete-another-owner', { role: 'superadmin', status: 'active', emailVerified: true });
  await owner.delete(`/api/admin/users/${otherOwner._id}`).set(headers)
    .send({ expectedStatus: 'active', revision: 1 }).expect(400);
  await owner.delete(`/api/admin/users/${target._id}`).set(headers)
    .send({ expectedStatus: 'pending', revision: 3 }).expect(409);
  await owner.delete(`/api/admin/users/${target._id}`).set(headers)
    .send({ expectedStatus: 'suspended', revision: 2 }).expect(409);
  await owner.delete(`/api/admin/users/${new mongoose.Types.ObjectId()}`).set(headers).send(body).expect(404);
  await owner.delete('/api/admin/users/not-an-id').set(headers).send(body).expect(400);
  assert.equal((await M.User.findById(target._id)).status, 'suspended');
  assert.equal((await M.User.findById(target._id)).accessRevision, 3);
  assert.ok(await M.User.exists({ _id: ownerRecord._id }));
  assert.ok(await M.User.exists({ _id: otherOwner._id }));
  assert.equal(await M.Mail.countDocuments(), 0);
  assert.equal(await M.Audit.countDocuments(), 0);
});

test('account deletion supports legacy revisions and an omitted optional request body', async () => {
  const legacyId = new mongoose.Types.ObjectId();
  await M.User.collection.insertOne({
    _id: legacyId, email: 'delete-legacy-account@example.test', fullName: 'Legacy Administrator',
    role: 'admin', status: 'suspended', emailVerified: true, passwordHash,
  });
  const legacyDeletion = await owner.delete(`/api/admin/users/${legacyId}`).set(headers)
    .send({ expectedStatus: 'suspended', revision: 1 });
  assert.ok([200, 204].includes(legacyDeletion.status), legacyDeletion.text);
  assert.equal(await M.User.findById(legacyId), null);

  const user = await account('delete-with-optional-body');
  const deletion = await owner.delete(`/api/admin/users/${user._id}`).set(headers);
  assert.ok([200, 204].includes(deletion.status), deletion.text);
  assert.equal(await M.User.findById(user._id), null);
});

test('concurrent account deletion and approval cannot both commit from the same revision', async () => {
  const user = await account('delete-versus-approval', { emailVerified: true });
  const [approved, deleted] = await Promise.all([
    changeAccess(user, { status: 'active', expectedStatus: 'pending', revision: 1 }),
    owner.delete(`/api/admin/users/${user._id}`).set(headers).send({ expectedStatus: 'pending', revision: 1 }),
  ]);
  assert.ok([200, 404, 409].includes(approved.status), approved.text);
  assert.ok([200, 204, 409].includes(deleted.status), deleted.text);
  const approvalCommitted = approved.status === 200;
  const deletionCommitted = [200, 204].includes(deleted.status);
  assert.equal(Number(approvalCommitted) + Number(deletionCommitted), 1);
  const remaining = await M.User.findById(user._id);
  if (approvalCommitted) {
    assert.equal(remaining.status, 'active');
    assert.equal(remaining.accessRevision, 2);
    assert.equal(await M.Mail.countDocuments({ to: user.email }), 1);
  } else {
    assert.equal(remaining, null);
    assert.equal(await M.Mail.countDocuments({ to: user.email, state: { $in: ['queued', 'failed'] } }), 0);
  }
});

test('unchanged drafts and repeated publication actions preserve revisions and audit history', async () => {
  const created = await owner.post('/api/admin/content/programmes').set(headers).send({ data: courseData }).expect(201);
  const url = `/api/admin/content/programmes/${created.body._id}`;
  const originalAudits = await auditCount(created.body._id);
  const unchanged = await owner.patch(url).set(headers).send({ data: courseData, revision: 1 }).expect(200);
  assert.equal(unchanged.body.revision, 1);
  const alreadyDraft = await owner.post(`${url}/unpublish`).set(headers).send({ revision: 1 }).expect(200);
  assert.equal(alreadyDraft.body.revision, 1);
  assert.equal(await auditCount(created.body._id), originalAudits);

  const published = await owner.post(`${url}/publish`).set(headers).send({ revision: 1 }).expect(200);
  assert.equal(published.body.revision, 2);
  const publishAudits = await auditCount(created.body._id);
  const repeated = await owner.post(`${url}/publish`).set(headers).send({ revision: 2 }).expect(200);
  assert.equal(repeated.body.revision, 2);
  assert.equal(repeated.body.publishedAt, published.body.publishedAt);
  assert.equal(await auditCount(created.body._id), publishAudits);
  await owner.post(`${url}/publish`).set(headers).send({ revision: 1 }).expect(409);
  await owner.patch(url).set(headers).send({ data: courseData, revision: 1 }).expect(409);

  const withdrawn = await owner.post(`${url}/unpublish`).set(headers).send({ revision: 2 }).expect(200);
  assert.equal(withdrawn.body.revision, 3);
  const withdrawAudits = await auditCount(created.body._id);
  const stillWithdrawn = await owner.post(`${url}/unpublish`).set(headers).send({ revision: 3 }).expect(200);
  assert.equal(stillWithdrawn.body.revision, 3);
  assert.equal(await auditCount(created.body._id), withdrawAudits);
  await owner.post(`${url}/unpublish`).set(headers).send({ revision: 2 }).expect(409);
});

test('lesson publication is idempotent but changed lesson drafts create a new published snapshot', async () => {
  await owner.post('/api/admin/content/programmes').set(headers).send({ data: courseData }).expect(201);
  const lesson = { title: 'First lesson', body: 'Original learning material.', order: 0 };
  const created = await owner.post('/api/admin/courses/transition-course/lessons').set(headers).send(lesson).expect(201);
  const url = `/api/admin/courses/transition-course/lessons/${created.body._id}`;
  const unchanged = await owner.patch(url).set(headers).send({ ...lesson, revision: 1 }).expect(200);
  assert.equal(unchanged.body.revision, 1);
  const alreadyDraft = await owner.post(`${url}/unpublish`).set(headers).send({ revision: 1 }).expect(200);
  assert.equal(alreadyDraft.body.revision, 1);
  const published = await owner.post(`${url}/publish`).set(headers).send({ revision: 1 }).expect(200);
  assert.equal(published.body.revision, 2);
  const repeated = await owner.post(`${url}/publish`).set(headers).send({ revision: 2 }).expect(200);
  assert.equal(repeated.body.revision, 2);
  await owner.post(`${url}/publish`).set(headers).send({ revision: 1 }).expect(409);

  const edited = await owner.patch(url).set(headers).send({ ...lesson, body: 'Updated learning material.', revision: 2 }).expect(200);
  assert.equal(edited.body.revision, 3);
  assert.equal(edited.body.publishedData.body, lesson.body);
  const republished = await owner.post(`${url}/publish`).set(headers).send({ revision: 3 }).expect(200);
  assert.equal(republished.body.revision, 4);
  assert.equal(republished.body.publishedData.body, 'Updated learning material.');
  const unchangedPublication = await owner.post(`${url}/publish`).set(headers).send({ revision: 4 }).expect(200);
  assert.equal(unchangedPublication.body.revision, 4);
  const withdrawn = await owner.post(`${url}/unpublish`).set(headers).send({ revision: 4 }).expect(200);
  assert.equal(withdrawn.body.revision, 5);
  const repeatedWithdrawal = await owner.post(`${url}/unpublish`).set(headers).send({ revision: 5 }).expect(200);
  assert.equal(repeatedWithdrawal.body.revision, 5);
  await owner.post(`${url}/unpublish`).set(headers).send({ revision: 4 }).expect(409);
});

test('unchanged application reviews neither mutate revisions nor repeat notifications', async () => {
  const application = await M.Application.create({
    type: 'membership', programmeId: 'membership', confirmationQueued: true, notes: '',
    details: { fullName: 'Review Applicant', email: 'review-applicant@example.test', studentId: 'review-1' },
  });
  const url = `/api/admin/applications/${application._id}`;
  const initial = { status: 'pending', paymentStatus: 'pending', notes: '', revision: 1 };
  const unchanged = await owner.patch(url).set(headers).send(initial).expect(200);
  assert.equal(unchanged.body.revision, 1);
  assert.equal(await auditCount(application._id), 0);
  assert.equal(await M.Mail.countDocuments(), 0);

  const notes = { ...initial, notes: 'Payment reviewed by the club.' };
  const changed = await owner.patch(url).set(headers).send(notes).expect(200);
  assert.equal(changed.body.revision, 2);
  assert.equal(await M.Mail.countDocuments(), 0);
  await owner.patch(url).set(headers).send(initial).expect(409);
  const approval = { ...notes, status: 'approved', paymentStatus: 'verified', revision: 2 };
  const approved = await owner.patch(url).set(headers).send(approval).expect(200);
  assert.equal(approved.body.revision, 3);
  assert.equal(approved.body.reviewVersion, 1);
  const decisionAudits = await auditCount(application._id);
  const decisionMail = await M.Mail.countDocuments();
  assert.equal(decisionMail, 1);
  const repeat = await owner.patch(url).set(headers).send({ ...approval, revision: 3 }).expect(200);
  assert.equal(repeat.body.revision, 3);
  assert.equal(repeat.body.reviewVersion, 1);
  assert.equal(await auditCount(application._id), decisionAudits);
  assert.equal(await M.Mail.countDocuments(), decisionMail);
  await owner.patch(url).set(headers).send(approval).expect(409);
});

test('repeated course approval does not issue another learning-access token', async () => {
  const application = await M.Application.create({
    type: 'courses', programmeId: courseData.id, confirmationQueued: true, notes: '',
    details: { fullName: 'Course Applicant', email: 'course-applicant@example.test', studentId: 'course-1' },
  });
  const url = `/api/admin/applications/${application._id}`;
  const review = { status: 'approved', paymentStatus: 'pending', notes: '', revision: 1 };
  const approved = await owner.patch(url).set(headers).send(review).expect(200);
  assert.equal(approved.body.revision, 2);
  assert.equal(await M.Mail.countDocuments({ to: application.details.email }), 2);
  assert.equal(await M.Token.countDocuments({ email: application.details.email, purpose: 'learn' }), 1);
  await owner.patch(url).set(headers).send({ ...review, revision: 2 }).expect(200);
  assert.equal(await M.Mail.countDocuments({ to: application.details.email }), 2);
  assert.equal(await M.Token.countDocuments({ email: application.details.email, purpose: 'learn' }), 1);
});

test('invitations cannot target existing accounts or duplicate a current invitation', async () => {
  for (const status of ['pending', 'active', 'suspended', 'rejected']) {
    const user = await account(`invited-${status}`, { status });
    await owner.post('/api/admin/invitations').set(headers).send({ email: user.email }).expect(409);
  }
  assert.equal(await M.Token.countDocuments({ purpose: 'invite' }), 0);
  assert.equal(await M.Mail.countDocuments(), 0);
  assert.equal(await M.Audit.countDocuments(), 0);

  const email = 'new-invitation@example.test';
  await owner.post('/api/admin/invitations').set(headers).send({ email }).expect(201);
  await owner.post('/api/admin/invitations').set(headers).send({ email }).expect(409);
  assert.equal(await M.Token.countDocuments({ email, purpose: 'invite' }), 1);
  assert.equal(await M.Mail.countDocuments({ to: email }), 1);
  await M.Token.updateMany({ email, purpose: 'invite' }, { $set: { expiresAt: new Date(0) } });
  await owner.post('/api/admin/invitations').set(headers).send({ email }).expect(201);
  assert.equal(await M.Token.countDocuments({ email, purpose: 'invite', expiresAt: { $gt: new Date() } }), 1);
  assert.equal(await M.Mail.countDocuments({ to: email }), 2);
});

test('mail retry reports its actual count and leaves sent, queued and processing mail unchanged', async () => {
  const base = { to: 'retry@example.test', subject: 'Retry state test', text: 'Not sent by this test.' };
  const future = new Date(Date.now() + 3600000);
  const failed = await M.Mail.create([
    { ...base, state: 'failed', attempts: 5, lastError: 'Delivery failed.', lease: 'old-lease', leasedUntil: new Date(0), nextAttemptAt: future },
    { ...base, state: 'failed', attempts: 5, lastError: 'Delivery failed.' },
  ]);
  const sent = await M.Mail.create({ ...base, state: 'sent', attempts: 1 });
  const queued = await M.Mail.create({ ...base, state: 'queued', attempts: 2, nextAttemptAt: future });
  const processing = await M.Mail.create({ ...base, state: 'processing', attempts: 1, lease: 'current-worker', leasedUntil: future });

  const result = await owner.post('/api/admin/mail/retry').set(headers).send({}).expect(200);
  assert.equal(result.body.retried, 2);
  for (const job of failed) {
    const retried = await M.Mail.findById(job._id);
    assert.equal(retried.state, 'queued');
    assert.equal(retried.attempts, 0);
    assert.equal(retried.lastError, '');
    assert.equal(retried.lease, undefined);
    assert.equal(retried.leasedUntil, undefined);
    assert.equal(retried.nextAttemptAt, undefined);
  }
  for (const untouched of [sent, queued, processing]) {
    assert.deepEqual((await M.Mail.findById(untouched._id)).toObject(), untouched.toObject());
  }
  const repeated = await owner.post('/api/admin/mail/retry').set(headers).send({}).expect(200);
  assert.equal(repeated.body.retried, 0);
  assert.equal(await M.Mail.countDocuments(), 5);
});
