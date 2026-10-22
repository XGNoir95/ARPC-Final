import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';
import { createApp } from './helpers/app.js';
import * as M from '../src/models.js';
import { hashPassword } from '../src/security.js';
import { contentSchemas } from '../src/validation.js';
import { homeContent } from '../../Frontend/src/data/home.js';

process.env.FRONTEND_URL='http://localhost:5173';
process.env.MONGOMS_DOWNLOAD_DIR=path.join(homedir(),'.cache','arpc-mongodb');
const headers={'X-ARPC-Request':'1',Origin:'http://localhost:5173'};
let mongo,app,admin,uploads;
before(async()=>{
  uploads=await mkdtemp(path.join(tmpdir(),'arpc-home-content-'));process.env.UPLOAD_DIR=uploads;
  mongo=await MongoMemoryServer.create();await mongoose.connect(mongo.getUri());
  await Promise.all(Object.values(mongoose.models).map(model=>model.init()));
  app=createApp();
  await M.User.create({email:'homepage-editor@example.test',fullName:'Homepage Editor',status:'active',emailVerified:true,passwordHash:await hashPassword('homepage-test-password')});
  admin=request.agent(app);await admin.post('/api/auth/login').set(headers).send({email:'homepage-editor@example.test',password:'homepage-test-password'}).expect(200);
});
after(async()=>{await mongoose.disconnect();await mongo?.stop();await rm(uploads,{recursive:true,force:true});});

test('seeded and legacy homepage sections remain compatible with the expanded schema',()=>{
  for(const item of homeContent)assert.equal(contentSchemas.home.safeParse(item).success,true,item.id);
  assert.equal(contentSchemas.home.safeParse({id:'hero',title:'Legacy',description:'Legacy introduction',image:'/heroBanner.jpg'}).success,true);
  assert.equal(contentSchemas.home.safeParse({id:'our-mission',title:'Legacy mission',description:'Full text',image:'/heroBanner.jpg'}).success,true);
});

test('hero captions and every About field survive save and publish without exposing private edits',async()=>{
  const data={id:'hero',title:'Default title',description:'Default introduction',arabicGreeting:'أهلاً وسهلاً بكم',image:'/heroBanner.jpg',slides:[{id:'one',name:'Campus',image:'/heroBanner.jpg',title:'Shared caption',description:''},{id:'two',name:'Community',image:'/images/about/community.jpg',title:'',description:''}]};
  let result=await admin.post('/api/admin/content/home').set(headers).send({data}).expect(201);
  const hero=result.body;
  assert.equal((await request(app).get('/api/public/content')).body.home.length,0);
  result=await admin.post(`/api/admin/content/home/${hero._id}/publish`).set(headers).send({revision:1}).expect(200);
  let published=(await request(app).get('/api/public/content')).body.home.find(item=>item.id==='hero');
  assert.equal(published.slides[1].title,'');assert.equal(published.slides[0].title,'Shared caption');
  assert.equal(published.arabicGreeting,data.arabicGreeting);
  await admin.patch(`/api/admin/content/home/${hero._id}`).set(headers).send({revision:result.body.revision,data:{...data,arabicGreeting:'مرحبا',slides:[{...data.slides[0],title:'Private draft'},data.slides[1]]}}).expect(200);
  published=(await request(app).get('/api/public/content')).body.home.find(item=>item.id==='hero');assert.equal(published.slides[0].title,'Shared caption');
  assert.equal(published.arabicGreeting,data.arabicGreeting);
  const about={id:'about-us',title:'Our community',description:'Full story',summary:'Short version',label:'Meet ARPC',link:'/gallery',linkLabel:'View our photos',image:'/images/about/community.jpg'};
  const saved=await admin.post('/api/admin/content/home').set(headers).send({data:about}).expect(201);
  await admin.post(`/api/admin/content/home/${saved.body._id}/publish`).set(headers).send({revision:1}).expect(200);
  assert.deepEqual((await request(app).get('/api/public/content')).body.home.find(item=>item.id==='about-us'),about);
});

test('featured sections accept mixed choices but cannot publish references to private programmes',async()=>{
  const data={id:'course',kind:'courses',title:'Public course',description:'Course details',image:'/logo.jpg',registrationOpen:true};
  const programme=await admin.post('/api/admin/content/programmes').set(headers).send({data}).expect(201);
  const feature={id:'featured',title:'Featured at ARPC',description:'',selections:[{id:'course',kind:'courses'},{id:'membership',kind:'membership'}],membership:{title:'Join us',description:'Applications are open',image:'/logo.jpg'}};
  const saved=await admin.post('/api/admin/content/home').set(headers).send({data:feature}).expect(201);
  const rejected=await admin.post(`/api/admin/content/home/${saved.body._id}/publish`).set(headers).send({revision:1}).expect(409);assert.equal(rejected.body.code,'FEATURED_UNAVAILABLE');
  const live=await admin.post(`/api/admin/content/programmes/${programme.body._id}/publish`).set(headers).send({revision:1}).expect(200);
  await admin.patch(`/api/admin/content/programmes/${programme.body._id}`).set(headers).send({revision:live.body.revision,data:{...data,title:'Private edited course'}}).expect(200);
  await admin.post(`/api/admin/content/home/${saved.body._id}/publish`).set(headers).send({revision:1}).expect(200);
  const publicData=(await request(app).get('/api/public/content')).body;
  assert.deepEqual(publicData.home.find(item=>item.id==='featured').selections,feature.selections);
  assert.equal(publicData.programmes.find(item=>item.id==='course').title,'Public course');
  assert.ok(publicData.programmes.find(item=>item.id==='course').publishedAt);
  const workspace=(await admin.get('/api/admin/workspace')).body;
  assert.equal(workspace.programmes.find(item=>item.id==='course').publishedData.title,'Public course');
  assert.equal(workspace.programmes.find(item=>item.id==='course').title,'Private edited course');
});

test('nested hero and membership uploads remain private until their section is published',async()=>{
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO/aX1sAAAAASUVORK5CYII=','base64');
  const upload=await admin.post('/api/admin/files').set(headers).field('purpose','image').attach('file',png,{filename:'hero.png',contentType:'image/png'}).expect(201);
  let workspace=(await admin.get('/api/admin/workspace')).body;
  const hero=workspace.home.find(item=>item.id==='hero');
  const data={...hero,slides:[{id:'uploaded',image:upload.body.url,title:'Uploaded hero'}]};
  const saved=await admin.patch(`/api/admin/content/home/${hero._id}`).set(headers).send({data,revision:hero.revision}).expect(200);
  await request(app).get(upload.body.url).expect(404);
  await admin.post(`/api/admin/content/home/${hero._id}/publish`).set(headers).send({revision:saved.body.revision}).expect(200);
  await request(app).get(upload.body.url).expect(200);
  const memberImage=await admin.post('/api/admin/files').set(headers).field('purpose','image').attach('file',png,{filename:'membership.png',contentType:'image/png'}).expect(201);
  workspace=(await admin.get('/api/admin/workspace')).body;
  const feature=workspace.home.find(item=>item.id==='featured');
  const updated=await admin.patch(`/api/admin/content/home/${feature._id}`).set(headers).send({revision:feature.revision,data:{...feature,membership:{...feature.membership,image:memberImage.body.url}}}).expect(200);
  await request(app).get(memberImage.body.url).expect(404);
  await admin.post(`/api/admin/content/home/${feature._id}/publish`).set(headers).send({revision:updated.body.revision}).expect(200);
  await request(app).get(memberImage.body.url).expect(200);
});

test('homepage validation rejects duplicate slides/selections and unsafe card destinations',()=>{
  const hero={id:'hero',title:'Headline',description:'Introduction',slides:[{id:'same',image:'/a.jpg'},{id:'same',image:'/b.jpg'}]};
  assert.equal(contentSchemas.home.safeParse(hero).success,false);
  assert.equal(contentSchemas.home.safeParse({...hero,slides:[{id:'one',image:''}]}).success,false);
  assert.equal(contentSchemas.home.safeParse({...hero,arabicGreeting:'a'.repeat(301),slides:[]}).success,false);
  assert.equal(contentSchemas.home.safeParse({id:'featured',title:'Featured',selections:[{kind:'courses',id:'course'},{kind:'courses',id:'course'}]}).success,false);
  assert.equal(contentSchemas.home.safeParse({id:'about-us',title:'About',description:'Story',link:'javascript:alert(1)'}).success,false);
});

test('legacy programme recency uses creation time rather than a newer private edit',async()=>{
  const createdAt=new Date('2026-01-05T08:00:00Z');
  const data={id:'legacy-recency',kind:'courses',title:'Published legacy course',description:'Legacy course',fee:0};
  await M.Content.create({resource:'programmes',key:data.id,live:true,published:data,draft:{...data,title:'Private legacy edit'},createdAt});
  const actual=(await request(app).get('/api/public/content')).body.programmes.find(item=>item.id===data.id);
  assert.equal(actual.publishedAt,createdAt.toISOString());assert.equal(actual.title,data.title);
});
