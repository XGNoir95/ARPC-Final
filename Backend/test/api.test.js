import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import nodemailer from 'nodemailer';
import { deliverMail } from '../src/mail.js';
import { createApp } from './helpers/app.js';
import * as M from '../src/models.js';
import { hashPassword } from '../src/security.js';
import { homedir } from 'node:os';
import path from 'node:path';
process.env.FRONTEND_URL='http://localhost:5173';process.env.GOOGLE_CLIENT_ID='test-client';
process.env.MONGOMS_DOWNLOAD_DIR=path.join(homedir(),'.cache','arpc-mongodb');
const headers={'X-ARPC-Request':'1',Origin:'http://localhost:5173'};
const details={fullName:'Sample Applicant',studentId:'12345',department:'Computer Science & Engineering',semester:'1.1',gender:'Prefer not to say',email:'learner@example.com',phone:'+8801712345678'};
let mongo, app, owner, admin, programme, pending;
before(async()=>{
  mongo=await MongoMemoryServer.create();await mongoose.connect(mongo.getUri());
  app=createApp({googleVerify:async (t,nonce)=>{if(t==='bad')throw new Error();return {email:'google@example.com',email_verified:true,sub:'google-sub',name:'Google Admin',nonce};}});
  await Promise.all(Object.values(mongoose.models).map(m=>m.init()));
  await M.User.create({email:'owner@example.com',fullName:'Owner',role:'superadmin',status:'active',emailVerified:true,passwordHash:await hashPassword('long-password-owner')});
  owner=request.agent(app);await owner.post('/api/auth/login').set(headers).send({email:'owner@example.com',password:'long-password-owner'}).expect(200);
});
after(async()=>{await mongoose.disconnect();await mongo?.stop();});
test('Backend end-to-end workflows',async t=>{
  await t.test('team member social links survive draft save, publish and public content delivery',async()=>{
    const data={id:'linked-team',label:'Club team',description:'Our people.',members:[{id:'member',name:'Club Member',linkedin:'club-member',github:'@club-dev'}]};
    const created=await owner.post('/api/admin/content/teams').set(headers).send({data}).expect(201);
    const published=await owner.post(`/api/admin/content/teams/${created.body._id}/publish`).set(headers).send({revision:created.body.revision}).expect(200);
    const publicContent=await request(app).get('/api/public/content').expect(200);
    const member=publicContent.body.teams.find(team=>team.id===data.id).members[0];
    assert.equal(member.linkedin,'https://www.linkedin.com/in/club-member');assert.equal(member.github,'https://github.com/club-dev');
    await owner.patch(`/api/admin/content/teams/${created.body._id}`).set(headers).send({data:{...data,members:[{...data.members[0],github:'https://github.com.evil.test/user'}]},revision:published.body.revision}).expect(400);
  });
  await t.test('reject cross-site mutations and unapproved access',async()=>{
    await request(app).post('/api/auth/register').send({}).expect(403);
    await request(app).post('/api/auth/register').set({...headers,Origin:'https://evil.example'}).send({}).expect(403);
    await request(app).get('/api/admin/workspace').expect(401);
  });
  await t.test('registration ignores privilege injection, hashes password and queues verification',async()=>{
    pending=request.agent(app);
    const r=await pending.post('/api/auth/register').set(headers).send({email:'admin@example.com',fullName:'Admin',password:'long-password-admin',role:'superadmin',status:'active',emailVerified:true}).expect(201);
    assert.equal(r.body.profile.role,'admin');assert.equal(r.body.profile.status,'pending');assert.equal(r.body.profile.passwordHash,undefined);
    await pending.get('/api/admin/workspace').expect(403);
    const u=await M.User.findOne({email:'admin@example.com'}).select('+passwordHash');assert.ok(!u.passwordHash.includes('long-password-admin'));
    assert.equal(await M.Mail.countDocuments({state:'queued'}),1);
    const queued=await M.Mail.findOne({to:u.email});assert.match(queued.html,/<h1/);assert.match(queued.html,/Enter verification code/);assert.match(queued.text,/10 minutes/);
  });
  await t.test('email verification is single use; superadmin approval required',async()=>{
    const u=await M.User.findOne({email:'admin@example.com'});
    await owner.patch(`/api/admin/users/${u._id}`).set(headers).send({status:'active',expectedStatus:'pending',revision:1}).expect(200);
    await pending.get('/api/admin/workspace').expect(403);
    const mail=await M.Mail.findOne({to:u.email});const code=/Your verification code: (\d{6})/.exec(mail.text)[1];
    await pending.post('/api/auth/verify-code').set(headers).send({code}).expect(200);
    await pending.post('/api/auth/verify-code').set(headers).send({code}).expect(400);
    await owner.patch(`/api/admin/users/${u._id}`).set(headers).send({status:'active'}).expect(200);
    admin=pending;await admin.get('/api/admin/workspace').expect(200);await admin.get('/api/admin/users').expect(403);
  });
  await t.test('Google identity never grants admin permissions; invalid tokens fail',async()=>{
    const flow=request.agent(app);await flow.get('/api/auth/google-challenge').expect(200);const r=await flow.post('/api/auth/google').set(headers).send({credential:'valid'}).expect(200);assert.equal(r.body.profile.status,'pending');assert.equal(r.body.profile.emailVerified,true);
    await flow.get('/api/auth/google-challenge').expect(200);await flow.post('/api/auth/google').set(headers).send({credential:'bad'}).expect(401);
  });
  await t.test('draft CRUD, optimistic concurrency and publication snapshots',async()=>{
    const data={id:'test-course',kind:'courses',title:'Test course',description:'Course description',image:'/heroBanner.jpg',fee:0};
    const r=await admin.post('/api/admin/content/programmes').set(headers).send({data}).expect(201);programme=r.body;
    let pub=await request(app).get('/api/public/content');assert.equal(pub.body.programmes.length,0);
    let p=await admin.post(`/api/admin/content/programmes/${programme._id}/publish`).set(headers).send({revision:1}).expect(200);programme=p.body;
    await admin.patch(`/api/admin/content/programmes/${programme._id}`).set(headers).send({data:{...data,title:'Changed draft'},revision:1}).expect(409);
    const edit=await admin.patch(`/api/admin/content/programmes/${programme._id}`).set(headers).send({data:{...data,title:'Changed draft'},revision:2}).expect(200);programme=edit.body;
    pub=await request(app).get('/api/public/content');assert.equal(pub.body.programmes[0].title,'Test course');
    await admin.post('/api/admin/content/no-such-resource').set(headers).send({data}).expect(404);
  });
  await t.test('server validates applications; duplicates conflict and receipts queued',async()=>{
    await request(app).post('/api/applications').set(headers).send({type:'courses',programmeId:'unknown',details}).expect(404);
    await request(app).post('/api/applications').set(headers).send({type:'courses',programmeId:'test-course',details:{...details,phone:''}}).expect(400);
    await request(app).post('/api/applications').set(headers).send({type:'courses',programmeId:'test-course',details}).expect(201);
    await request(app).post('/api/applications').set(headers).send({type:'courses',programmeId:'test-course',details}).expect(409);
    const receipt=await M.Mail.findOne({to:details.email,subject:'ARPC application received'});assert.ok(receipt);assert.match(receipt.html,/Test course/);assert.doesNotMatch(receipt.html,/Changed draft/);assert.match(receipt.text,/Course enrollment/);
  });
  await t.test('membership requires manual payment verification before approval',async()=>{
    const v={type:'membership',details,consent:true,payment:{method:'Cash',receivedBy:'Club representative'}};
    const r=await request(app).post('/api/applications').set(headers).send(v).expect(201);
    await admin.patch(`/api/admin/applications/${r.body.id}`).set(headers).send({status:'approved',paymentStatus:'pending'}).expect(400);
    await admin.patch(`/api/admin/applications/${r.body.id}`).set(headers).send({status:'approved',paymentStatus:'verified'}).expect(200);
  });
  await t.test('course approval, lessons, learner access, progress and PDF certificate',async()=>{
    const a=await M.Application.findOne({type:'courses'});
    await admin.patch(`/api/admin/applications/${a._id}`).set(headers).send({status:'approved',paymentStatus:'pending'}).expect(200);
    const l=await admin.post('/api/admin/courses/test-course/lessons').set(headers).send({title:'First lesson',body:'Read this lesson.',order:0,published:true}).expect(201);
    await admin.post(`/api/admin/courses/test-course/lessons/${l.body._id}/publish`).set(headers).send({revision:1}).expect(200);
    await admin.post('/api/admin/courses/test-course/lessons').set(headers).send({title:'Draft lesson',body:'Hidden.',order:1,published:false}).expect(201);
    const mail=await M.Mail.findOne({subject:'Your ARPC course access'});const token=/token=([a-f0-9]+)/.exec(mail.text)[1];const learner=request.agent(app);
    await learner.post('/api/learning/signin').set(headers).send({token}).expect(200);
    await learner.post('/api/learning/signin').set(headers).send({token}).expect(400);
    const area=await learner.get('/api/learning/test-course').expect(200);assert.equal(area.body.lessons.length,1);
    await admin.patch(`/api/admin/courses/test-course/lessons/${l.body._id}`).set(headers).send({title:'Changed lesson draft',body:'Private update',order:0,revision:2}).expect(200);
    const unchanged=await learner.get('/api/learning/test-course').expect(200);assert.equal(unchanged.body.lessons[0].title,'First lesson');
    await learner.get('/api/learning/test-course/certificate').expect(409);
    await learner.post(`/api/learning/test-course/complete/${l.body._id}`).set(headers).send({completed:true}).expect(200);
    const pdf=await learner.get('/api/learning/test-course/certificate').expect(200);assert.match(pdf.headers['content-type'],/pdf/);
    await learner.get('/api/learning/other-course').expect(403);
    await learner.get('/api/admin/workspace').expect(401);
    await admin.delete(`/api/admin/content/programmes/${programme._id}`).set(headers).expect(409);
    await admin.patch(`/api/admin/applications/${a._id}`).set(headers).send({status:'rejected',paymentStatus:'pending'}).expect(200);
    await learner.get('/api/learning/test-course').expect(403);
  });
  await t.test('images reject script payloads and only published references are public',async()=>{
    await admin.post('/api/admin/files').set(headers).field('purpose','image').attach('file',Buffer.from('<svg onload="alert(1)"></svg>'),'bad.svg').expect(400);
    const png=Buffer.from([137,80,78,71,13,10,26,10,0,0]);
    const f=await admin.post('/api/admin/files').set(headers).field('purpose','image').attach('file',png,'test.png').expect(201);
    await request(app).get(f.body.url).expect(404);await admin.get(f.body.url).expect(200);
    const g=await admin.post('/api/admin/content/gallery').set(headers).send({data:{id:'photo',title:'Photo',description:'Caption',category:'Campus',alt:'Test photo',image:f.body.url}}).expect(201);
    await admin.post(`/api/admin/content/gallery/${g.body._id}/publish`).set(headers).send({revision:1}).expect(200);
    await request(app).get(f.body.url).expect(200);await admin.delete(`/api/admin/files/${f.body._id}`).set(headers).expect(409);
    await admin.delete(`/api/admin/content/gallery/${g.body._id}`).set(headers).expect(204);
    await admin.delete(`/api/admin/files/${f.body._id}`).set(headers).expect(204);
  });
  await t.test('analytics aggregates page views and verified fees without visitor identities',async()=>{
    await request(app).post('/api/analytics/view').set(headers).send({path:'/catalogue'}).expect(204);
    await request(app).post('/api/analytics/view').set(headers).send({path:'/admin'}).expect(400);
    const r=await admin.get('/api/admin/analytics').expect(200);assert.equal(r.body.verifiedFees,100);assert.equal(r.body.pages[0]._id,'/catalogue');assert.equal(r.body.mail.configured,false);
  });
  await t.test('reset emails do not disclose existence; reset expires sessions',async()=>{
    const r=await request(app).post('/api/auth/forgot-password').set(headers).send({email:'admin@example.com'}).expect(200);
    const missing=await request(app).post('/api/auth/forgot-password').set(headers).send({email:'missing@example.com'}).expect(200);assert.deepEqual(r.body,missing.body);
    const mail=await M.Mail.findOne({subject:'Reset your ARPC password'});const token=/token=([a-f0-9]+)/.exec(mail.text)[1];
    await request(app).post('/api/auth/reset-password').set(headers).send({token,password:'a-new-long-password'}).expect(200);
    await admin.get('/api/admin/workspace').expect(401);
    await request(app).post('/api/auth/reset-password').set(headers).send({token,password:'another-long-password'}).expect(400);
  });
  await t.test('outbox delivers after configuration, reports failures and stops after five attempts',async()=>{
    const previous=Object.fromEntries(['SMTP_HOST','SMTP_USER','SMTP_PASS','MAIL_FROM'].map(k=>[k,process.env[k]]));
    Object.assign(process.env,{SMTP_HOST:'smtp.example.test',SMTP_USER:'dummy@example.test',SMTP_PASS:'test-only-secret'});
    const sent=[];const smtp=t.mock.method(nodemailer,'createTransport',()=>({sendMail:async message=>{if(message.subject==='Failing delivery')throw new Error('SMTP failure');sent.push(message);}}));
    const good=await M.Mail.create({to:'dummy-recipient@example.test',subject:'Working delivery',text:'Test email.'});
    const bad=await M.Mail.create({to:'dummy-recipient@example.test',subject:'Failing delivery',text:'Test email.'});
    try {
      await deliverMail();assert.equal((await M.Mail.findById(good._id)).state,'sent');
      const delivered=sent.find(message=>message.subject==='Working delivery');assert.ok(delivered);assert.deepEqual(delivered.from,{name:'Ahsanullah Roh. Peace Club (ARPC)',address:'dummy@example.test'});assert.equal(delivered.text,'Test email.');assert.match(delivered.html,/Test email\./);assert.equal(delivered.attachments,undefined);assert.match(delivered.html,/www\.aust\.edu\/storage\/files\//);
      for(let n=1;n<6;n++)await deliverMail({now:()=>new Date(Date.now()+n*600000)});const failed=await M.Mail.findById(bad._id);assert.equal(failed.state,'failed');assert.equal(failed.attempts,5);
    } finally {smtp.mock.restore();for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
  });
  await t.test('session refresh and successful login do not exhaust failed sign-in protection',async()=>{
    const isolated=createApp();const flow=request.agent(isolated);
    const credentials={email:'owner@example.com',password:'long-password-owner'};
    await flow.post('/api/auth/login').set(headers).send(credentials).expect(200);
    for(let n=0;n<45;n++)await flow.get('/api/auth/me').expect(200);
    for(let n=0;n<12;n++)await flow.post('/api/auth/login').set(headers).send(credentials).expect(200);
    for(let n=0;n<10;n++)await flow.post('/api/auth/login').set(headers).send({...credentials,password:'invalid-password'}).expect(401);
    const blocked=await flow.post('/api/auth/login').set(headers).send(credentials).expect(429).expect('Content-Type',/json/);
    assert.equal(blocked.body.code,'RATE_LIMITED');assert.match(blocked.body.message,/unsuccessful sign-in/);assert.ok(Number(blocked.headers['retry-after'])>0);
    await flow.get('/api/auth/me').expect(200);
    await flow.post('/api/auth/logout').set(headers).expect(200);
    await flow.get('/api/auth/me').expect(401);
  });
});
