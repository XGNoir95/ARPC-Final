import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requireSession, issueSession, resolveSession, applicantOnly, sessionCookieOptions, sessionIdleMs } from './sessions.js';
import { publicContent, sharedLimitStore } from './infrastructure.js';
import { randomUUID } from 'node:crypto';
import { jsonLimiter } from './limits.js';
import { OAuth2Client } from 'google-auth-library';
import multer from 'multer';
import PDFDocument from 'pdfkit';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { z } from 'zod';
import * as M from './models.js';
import { application, contentSchemas, email, lessonSchema, password, resources, text } from './validation.js';
import { hash, randomToken, hashPassword, comparePassword, profile, ensure, HttpError } from './security.js';
import { notifyApplication, notifyAdminAccess } from './notifications.js';
import { emailConfigured, queueClubMail } from './mail.js';
import { requestVerificationCode, verifyEmailCode, verificationStatus, finishVerification } from './emailVerification.js';
import { adminFrontendUrl, createAdminBoundary } from './adminBoundary.js';

export function createApp({ googleVerify, redis=null, adminBoundary=createAdminBoundary() } = {}) {
  const app = express();
  const front = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origin = new URL(front).origin;
  const adminFront = adminFrontendUrl();
  const allowedOrigins = [origin, ...(adminFront ? [new URL(adminFront).origin] : [])];
  const cookies = sessionCookieOptions();
  const limiter=({name,...options})=>jsonLimiter({...options,store:sharedLimitStore(redis,name)});
  const proxy=process.env.TRUST_PROXY || '0';ensure(/^[0-3]$/.test(proxy),500,'TRUST_PROXY must be a trusted hop count between 0 and 3.');app.set('trust proxy',Number(proxy));
  const id = value => { ensure(mongoose.isValidObjectId(value),400,'Invalid record ID.'); return value; };
  const audit = (req,action,target) => M.Audit.create({actor:req.user?._id,action,target});
  const routeLink = route => `${front.replace(/\/$/,'')}${route}`;
  const adminRouteLink = route => `${adminFront.replace(/\/$/,'')}${route}`;
  const sameIdentity = (req, target) => ensure(!req.adminIdentityEmail || req.adminIdentityEmail===target,403,'Use the account authorized by your identity provider.');
  const issueToken = async (purpose, targetEmail, subject, hours = 1) => {
    const raw=randomToken(); await M.Token.create({hash:hash(raw),purpose,email:targetEmail,subject,expiresAt:new Date(Date.now()+hours*3600000)}); return raw;
  };
  const consume = async (raw,purpose,identityEmail) => { const token = await M.Token.findOneAndDelete({hash:hash(text(200).parse(raw)),purpose,...(identityEmail?{email:identityEmail}:{}),expiresAt:{$gt:new Date()}}); ensure(token,400,'This link has expired or has already been used.'); return token; };
  const auth = requireSession;
  const admin = (req,res,next) => { ensure(['admin','superadmin'].includes(req.user.role) && req.user.status==='active' && req.user.emailVerified,403,'Your account needs verification and superadmin approval.'); next(); };
  const superadmin = (req,res,next) => { ensure(req.user.role==='superadmin',403,'Superadmin access is required.'); next(); };
  const sessionFor = (req,res,user)=>{sameIdentity(req,user.email);return issueSession(req,res,user);};
  const learnerAuth = async (req,res,next) => {
    const s = req.cookies.arpc_learner && await M.LearnerSession.findOne({hash:hash(req.cookies.arpc_learner),expiresAt:{$gt:new Date()}});
    ensure(s,401,'Open your course access email or request a new link.'); req.learner=await M.Learner.findById(s.learnerId); ensure(req.learner,401,'Learner session unavailable.'); next();
  };
  const hasCourse = async (learner,courseId) => Boolean(await M.Application.exists({type:'courses',programmeId:courseId,'details.email':learner.email,status:'approved'}));
  const learnerCourse = async (req,res,next) => { ensure(await hasCourse(req.learner,req.params.course),403,'Your enrollment must be approved.'); next(); };
  app.disable('x-powered-by');
  app.use(helmet());
  app.use((req,res,next)=>{req.requestId=randomUUID();res.set('X-Request-Id',req.requestId);const started=Date.now();res.on('finish',()=>{if(process.env.REQUEST_LOGGING==='true')console.log(JSON.stringify({requestId:req.requestId,method:req.method,status:res.statusCode,durationMs:Date.now()-started}));});next();});
  app.use(cors({origin:allowedOrigins,credentials:true}));
  app.use(express.json({limit:'1mb'}),cookieParser());
  // Retire cookies issued when admin sign-in lived on the public origin. They
  // must not block participant forms after the admin site moves to its own host.
  app.use((req,res,next)=>{
    if(adminFront && new URL(adminFront).host!==new URL(front).host && req.get('host')===new URL(front).host && req.cookies.arpc_session){
      res.clearCookie('arpc_session',cookies);delete req.cookies.arpc_session;
    }
    next();
  });
  app.get('/api/health/live',(req,res)=>res.set('Cache-Control','no-store').json({ok:true}));
  app.get('/api/health/ready',(req,res)=>{const ok=mongoose.connection.readyState===1&&(!redis||redis.isReady)&&!app.locals.draining;res.set('Cache-Control','no-store').status(ok?200:503).json({ok});});
  app.use('/api',limiter({name:'global',windowMs:60000,limit:300,message:'Too many requests. Please wait a minute before trying again.'}));
  app.use(['/api/auth','/api/admin','/api/config','/api/access'],adminBoundary);
  app.use('/api/assets',(req,res,next)=>req.cookies.arpc_session?adminBoundary(req,res,next):next());
  // Used by the admin gateway before serving HTML, scripts, previews or API calls.
  app.get('/api/access/check',(req,res)=>res.status(204).end());
  app.use('/api', (req,res,next) => {
    res.set('Cache-Control','no-store');
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      ensure(req.get('Sec-Fetch-Site')!=='cross-site',403,'Cross-site requests are not allowed.');
      ensure(req.get('X-ARPC-Request')==='1',403,'A same-site application request is required.');
      ensure(!req.get('Origin') || allowedOrigins.includes(req.get('Origin')),403,'Request origin is not allowed.');
    }
    next();
  });
  app.get('/api/health',(req,res)=>res.json({ok:mongoose.connection.readyState===1,emailConfigured:emailConfigured()}));
  app.get('/api/config',(req,res)=>res.json({googleClientId:process.env.GOOGLE_CLIENT_ID || ''}));
  const authLimit=limiter({name:'accounts',windowMs:15*60000,limit:40,message:'Too many account requests. Please wait before trying again.'});
  const signInLimit=limiter({name:'signin',windowMs:15*60000,limit:10,skipSuccessfulRequests:true,message:'Too many unsuccessful sign-in attempts. Please wait before trying again.'});
  // Session checks and sign-out are ordinary navigation, not sign-in attempts.
  app.use('/api/auth', (req,res,next)=>{
    if(req.method!=='POST' || ['/logout','/logout-all'].includes(req.path)) return next();
    return ['/login','/google'].includes(req.path) ? signInLimit(req,res,next) : authLimit(req,res,next);
  });
  app.post('/api/auth/register',async (req,res)=>{
    const values=z.object({fullName:text(100),email,password,department:z.string().max(150).default(''),inviteToken:z.string().max(200).optional()}).parse(req.body);
    sameIdentity(req,values.email);
    ensure(!await M.User.exists({email:values.email}),409,'An account already exists. Sign in or reset your password.');
    if (values.inviteToken) { const invite=await consume(values.inviteToken,'invite'); ensure(invite.email===values.email,400,'Use the invited email address.'); }
    const user=await M.User.create({fullName:values.fullName,email:values.email,department:values.department,passwordHash:await hashPassword(values.password)});
    let verification;
    try { verification=await requestVerificationCode(user._id); }
    catch { verification={required:true,deliveryUnavailable:true,message:'Your account is saved. Request a verification code from your account status page.'}; }
    await sessionFor(req,res,user); res.status(201).json({profile:profile(user),verification,message:'Account requested. Email verification and superadmin approval are both required.'});
  });
  app.post('/api/auth/login',async (req,res)=>{
    const v=z.object({email,password:z.string().min(1).max(128)}).parse(req.body);
    sameIdentity(req,v.email);
    const user=await M.User.findOne({email:v.email}).select('+passwordHash');
    ensure(await comparePassword(v.password,user?.passwordHash),401,'Email or password is incorrect.');
    ensure(!['rejected','suspended'].includes(user.status),403,'Your account is not active.');
    await sessionFor(req,res,user); res.json({profile:profile(user)});
  });
  app.get('/api/auth/google-challenge',authLimit,async(req,res)=>{
    ensure(process.env.GOOGLE_CLIENT_ID,503,'Google sign-in is not configured.');
    const previous=req.cookies.arpc_google_challenge;if(typeof previous==='string'&&/^[a-f0-9]{64}$/.test(previous)&&await M.Token.exists({hash:hash(previous),purpose:'google',expiresAt:{$gt:new Date()}}))return res.json({nonce:previous});
    const nonce=await issueToken('google','','',1/6);res.cookie('arpc_google_challenge',nonce,{...cookies,maxAge:10*60000});res.json({nonce});
  });
  const verifyGoogle=async(req,res,credential)=>{
    const nonce=req.cookies.arpc_google_challenge;ensure(typeof nonce==='string'&&/^[a-f0-9]{64}$/.test(nonce),401,'Restart Google sign-in to create a fresh security challenge.');
    let payload;try{payload=googleVerify?await googleVerify(credential,nonce):(await new OAuth2Client().verifyIdToken({idToken:credential,audience:process.env.GOOGLE_CLIENT_ID})).getPayload();}catch{throw new HttpError(401,'Google could not verify this sign-in.');}
    ensure(payload?.nonce===nonce,401,'Google sign-in security challenge did not match. Try again.');
    await consume(nonce,'google');res.clearCookie('arpc_google_challenge',cookies);return payload;
  };
  app.post('/api/auth/google',async (req,res)=>{
    ensure(process.env.GOOGLE_CLIENT_ID,503,'Google sign-in needs an OAuth client ID in the backend .env.');
    const {credential}=z.object({credential:text(10000)}).parse(req.body);
    const payload=await verifyGoogle(req,res,credential);
    ensure(payload?.email_verified && payload.sub && payload.email,401,'A verified Google email is required.');
    const googleEmail=email.parse(payload.email);
    sameIdentity(req,googleEmail);
    let user=await M.User.findOne({$or:[{email:googleEmail},{googleSub:payload.sub}]}).select('+googleSub');
    // Do not silently link an existing password account using only matching email.
    ensure(!user || user.googleSub===payload.sub&&user.email===googleEmail,409,'Sign in with your existing password, then link Google in Account settings.');
    if (!user) user=await M.User.create({email:googleEmail,fullName:String(payload.name || 'ARPC administrator').slice(0,100),googleSub:payload.sub,emailVerified:true});
    ensure(!['rejected','suspended'].includes(user.status),403,'Your account is not active.');
    await sessionFor(req,res,user); res.json({profile:profile(user)});
  });
  app.post('/api/auth/link-google',auth,async (req,res)=>{
    ensure(process.env.GOOGLE_CLIENT_ID,503,'Configure Google first.');
    const p=await verifyGoogle(req,res,text(10000).parse(req.body.credential));
    ensure(p?.sub && p.email_verified && email.parse(p.email)===req.user.email,400,'Use the same email as this account.');
    await M.User.updateOne({_id:req.user._id},{$set:{googleSub:p.sub,emailVerified:true},$unset:{emailVerification:1}});
    await finishVerification(req.user._id); res.json({message:'Google sign-in linked.'});
  });
  app.get('/api/auth/me',auth,(req,res)=>res.json({profile:profile(req.user)}));
  app.get('/api/auth/sessions',auth,async(req,res)=>{const sessions=await M.Session.find({userId:req.user._id,expiresAt:{$gt:new Date()},updatedAt:{$gt:new Date(Date.now()-sessionIdleMs())}}).sort({createdAt:-1}).lean();res.json(sessions.map(s=>({id:String(s._id),current:String(s._id)===String(req.session._id),userAgent:s.userAgent || 'Unknown browser',createdAt:s.createdAt,lastSeenAt:s.updatedAt,expiresAt:s.expiresAt})));});
  app.delete('/api/auth/sessions/:id',auth,async(req,res)=>{const removed=await M.Session.findOneAndDelete({_id:id(req.params.id),userId:req.user._id});ensure(removed,404,'Session not found.');if(String(removed._id)===String(req.session._id))res.clearCookie('arpc_session',cookies);res.json({message:'Session revoked.'});});
  app.post('/api/auth/logout-all',auth,async(req,res)=>{await M.Session.deleteMany({userId:req.user._id});res.clearCookie('arpc_session',cookies).json({message:'Signed out on all devices.'});});
  app.post('/api/auth/logout',async (req,res)=>{ if(req.cookies.arpc_session) await M.Session.deleteOne({hash:hash(req.cookies.arpc_session)}); res.clearCookie('arpc_session',cookies).json({message:'Signed out.'}); });
  // Honour outstanding verification links; new registrations receive a short-lived code.
  app.post('/api/auth/verify',async (req,res)=>{
    const t=await consume(req.body.token,'verify',req.adminIdentityEmail);
    const user=await M.User.findOneAndUpdate({_id:t.subject,email:t.email},{$set:{emailVerified:true},$unset:{emailVerification:1}},{returnDocument:'after'});
    ensure(user,400,'This link has expired or has already been used.');
    await finishVerification(user._id);res.json({message:'Email verified. Superadmin approval is still required for pending accounts.'});
  });
  app.get('/api/auth/verification-status',auth,async(req,res)=>{
    const user=await M.User.findById(req.user._id).select('+emailVerification');
    ensure(user,401,'Sign in again to verify your email.');res.json(verificationStatus(user));
  });
  app.post('/api/auth/verify-code',auth,async(req,res)=>{
    const code=z.string().regex(/^\d{6}$/,'Enter the six-digit code from your email.').parse(req.body.code);
    const user=await verifyEmailCode(req.user._id,code);
    res.json({profile:profile(user),message:'Your email is verified. Club approval is still required for pending accounts.'});
  });
  app.post('/api/auth/resend-verification',auth,async (req,res)=>{
    res.json(await requestVerificationCode(req.user._id));
  });
  app.post('/api/auth/forgot-password',async (req,res)=>{
    const target=email.parse(req.body.email); sameIdentity(req,target); const user=await M.User.findOne({email:target});
    if(user) { const t=await issueToken('reset',target,String(user._id)); await queueClubMail(target,'passwordReset',{name:user.fullName,url:adminRouteLink(`/reset-password?token=${t}`)}); }
    res.json({message:'If this account exists, a password reset email has been queued.'});
  });
  app.post('/api/auth/reset-password',async (req,res)=>{
    const p=password.parse(req.body.password); const t=await consume(req.body.token,'reset',req.adminIdentityEmail);
    await M.User.updateOne({_id:t.subject,email:t.email},{passwordHash:await hashPassword(p)});
    await M.Session.deleteMany({userId:t.subject}); await M.Token.deleteMany({purpose:'reset',subject:t.subject});
    res.json({message:'Password changed. Sign in again.'});
  });

  app.get('/api/public/content',async (req,res)=>{
    res.json(await publicContent(redis));
  });
  app.post('/api/analytics/view',limiter({name:'analytics',windowMs:60000,limit:60,message:'Too many analytics requests. Please wait before trying again.'}),async(req,res)=>{
    const route=z.string().max(250).regex(/^\/(?:$|catalogue$|gallery$|team$|join$|enroll\/(events|webinars|courses)\/[\w-]+$)/).parse(req.body.path);
    const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    await M.Traffic.updateOne({day,path:route},{$inc:{views:1}},{upsert:true}); res.status(204).end();
  });
  app.post('/api/applications',applicantOnly,limiter({name:'applications',windowMs:3600000,limit:15,message:'Too many application submissions. Please try again later.'}),async(req,res)=>{
    const v=application.parse(req.body);
    if(v.type!=='membership') { const p=await M.Content.findOne({resource:'programmes',key:v.programmeId,live:true}); ensure(p && p.published.kind===v.type && p.published.registrationOpen,404,'This programme is not accepting enrollments.'); }
    const saved=await M.Application.create({...v,confirmationQueued:false,programmeId:v.type==='membership'?'membership':v.programmeId,payment:v.type==='membership'?{...v.payment,amount:100}:undefined});
    await notifyApplication(saved);
    res.status(201).json({id:saved._id,message:'Application received. A confirmation email has been queued.'});
  });

  app.use('/api/admin',auth,admin);
  app.get('/api/admin/workspace',async (req,res)=>{
    const docs=await M.Content.find().sort({createdAt:-1}).lean();
    const lists=Object.fromEntries(resources.map(r=>[r,docs.filter(d=>d.resource===r).map(d=>({...d.draft,_id:d._id,revision:d.revision,live:d.live,hasChanges:!isDeepStrictEqual(d.draft,d.published),source:d.live?'published':'draft',...(r==='programmes'?{publishedData:d.live?d.published:null,publishedAt:d.publishedAt || d.createdAt}: {})}))]));
    res.json({profile:profile(req.user),...lists,emailConfigured:emailConfigured()});
  });
  const contentResource = (req,res,next)=>{ ensure(resources.includes(req.params.resource),404,'Unknown content collection.'); next(); };
  app.post('/api/admin/content/:resource',contentResource,async(req,res)=>{
    const data=contentSchemas[req.params.resource].parse(req.body.data);
    const saved=await M.Content.create({resource:req.params.resource,key:data.id,draft:data,updatedBy:req.user._id});
    await audit(req,'content.create',String(saved._id)); res.status(201).json(saved);
  });
  app.patch('/api/admin/content/:resource/:id',contentResource,async(req,res)=>{
    const data=contentSchemas[req.params.resource].parse(req.body.data); const revision=z.number().int().positive().parse(req.body.revision);
    const current=await M.Content.findOne({_id:id(req.params.id),resource:req.params.resource,key:data.id,revision});ensure(current,409,'This draft changed. Refresh before saving again.');
    if(isDeepStrictEqual(current.draft,data))return res.json(current);
    const saved=await M.Content.findOneAndUpdate({_id:id(req.params.id),resource:req.params.resource,key:data.id,revision},{$set:{draft:data,updatedBy:req.user._id},$inc:{revision:1}},{returnDocument:'after'});
    ensure(saved,409,'This draft changed. Refresh before saving again.'); await audit(req,'content.update',req.params.id); res.json(saved);
  });
  app.post('/api/admin/content/:resource/:id/publish',contentResource,async(req,res)=>{
    const revision=z.number().int().positive().parse(req.body.revision);
    const doc=await M.Content.findOne({_id:id(req.params.id),resource:req.params.resource,revision}); ensure(doc,409,'Refresh this draft before publishing.');
    if(doc.live&&isDeepStrictEqual(doc.draft,doc.published))return res.json(doc);
    if(doc.resource==='home'&&doc.key==='featured') {
      const selections=(doc.draft.selections || []).filter(item=>item.kind!=='membership');
      const visible=await M.Content.find({resource:'programmes',live:true,key:{$in:selections.map(item=>item.id)}}).lean();
      ensure(selections.every(item=>visible.some(programme=>programme.key===item.id&&programme.published.kind===item.kind)),409,'A selected programme is no longer published. Edit Featured and update the selection.','FEATURED_UNAVAILABLE');
    }
    const saved=await M.Content.findOneAndUpdate({_id:doc._id,revision},{$set:{published:doc.draft,live:true,publishedAt:new Date()},$inc:{revision:1}},{returnDocument:'after'}); ensure(saved,409,'This draft changed. Refresh before publishing.'); await audit(req,'content.publish',req.params.id); res.json(saved);
  });
  app.post('/api/admin/content/:resource/:id/unpublish',contentResource,async(req,res)=>{
    const revision=z.number().int().positive().parse(req.body.revision);
    const current=await M.Content.findOne({_id:id(req.params.id),resource:req.params.resource,revision});ensure(current,409,'Refresh this entry before withdrawing it.');
    if(!current.live)return res.json(current);
    const saved=await M.Content.findOneAndUpdate({_id:id(req.params.id),resource:req.params.resource,revision},{$set:{live:false},$inc:{revision:1}},{returnDocument:'after'}); ensure(saved,409,'Refresh this entry before withdrawing it.'); await audit(req,'content.unpublish',req.params.id); res.json(saved);
  });
  app.delete('/api/admin/content/:resource/:id',contentResource,async(req,res)=>{
    const doc=await M.Content.findOne({_id:id(req.params.id),resource:req.params.resource}); ensure(doc,404,'Entry not found.');
    if(doc.resource==='programmes') ensure(!await M.Application.exists({programmeId:doc.key}),409,'This programme has applications. Unpublish it to preserve enrollment records.');
    await M.Content.deleteOne({_id:doc._id}); if(doc.resource==='programmes') await M.Lesson.deleteMany({courseId:doc.key}); await audit(req,'content.delete',req.params.id); res.status(204).end();
  });
  app.get('/api/admin/applications',async(req,res)=>res.json(await M.Application.find().sort({createdAt:-1}).limit(2000).lean()));
  app.patch('/api/admin/applications/:id',async(req,res)=>{
    const v=z.object({status:z.enum(['pending','approved','rejected']),paymentStatus:z.enum(['pending','verified','rejected']),notes:z.string().trim().max(5000).default(''),revision:z.number().int().positive().optional()}).parse(req.body);
    let a=await M.Application.findById(id(req.params.id)); ensure(a,404,'Application not found.');
    ensure(a.type!=='membership' || v.status!=='approved' || v.paymentStatus==='verified',400,'Verify the registration payment before approving membership.');
    const expected=v.revision || a.revision || 1;delete v.revision;const previous=a.status;
    ensure(expected===(a.revision||1),409,'This application changed. Refresh before saving your review.');
    if(a.status===v.status&&a.paymentStatus===v.paymentStatus&&(a.notes||'')===v.notes)return res.json(a);
    a=await M.Application.findOneAndUpdate({_id:a._id,...(expected===1?{$or:[{revision:1},{revision:{$exists:false}}]}:{revision:expected})},{$set:{...v,reviewedBy:req.user._id,revision:expected+1,reviewVersion:(a.reviewVersion||0)+(previous!==v.status?1:0)}},{returnDocument:'after'});ensure(a,409,'This application changed. Refresh before saving your review.');
    await notifyApplication(a);
    await audit(req,'application.review',req.params.id); res.json(a);
  });
  app.delete('/api/admin/applications/:id',async(req,res)=>{
    const a=await M.Application.findByIdAndDelete(id(req.params.id)); ensure(a,404,'Application not found.');
    if(a.type==='courses' && !await M.Application.exists({type:'courses','details.email':a.details.email,status:'approved'})) {const learner=await M.Learner.findOne({email:a.details.email}); if(learner) await M.LearnerSession.deleteMany({learnerId:learner._id});}
    await audit(req,'application.delete',req.params.id); res.status(204).end();
  });
  app.post('/api/admin/invitations',async(req,res)=>{
    const target=email.parse(req.body.email);
    ensure(!await M.User.exists({email:target}),409,'This account already exists. Manage it from Admin access.','ACCOUNT_EXISTS');
    ensure(!await M.Token.exists({email:target,purpose:'invite',expiresAt:{$gt:new Date()}}),409,'An invitation for this email is still valid. Use the existing invitation or wait until it expires.','INVITATION_PENDING');
    const t=await issueToken('invite',target,'',72); await queueClubMail(target,'adminInvitation',{inviter:req.user.fullName,url:adminRouteLink(`/register?invite=${t}&email=${encodeURIComponent(target)}`)}); await audit(req,'admin.invite',target); res.status(201).json({message:'Invitation queued. Superadmin approval is still required.'});
  });
  app.get('/api/admin/users',superadmin,async(req,res)=>res.json((await M.User.find().sort({createdAt:-1})).map(profile)));
  app.patch('/api/admin/users/:id',superadmin,async(req,res)=>{
    const statuses=z.enum(['pending','active','rejected','suspended']);
    const {status,expectedStatus,revision}=z.object({status:statuses,expectedStatus:statuses.optional(),revision:z.number().int().positive().optional()}).parse(req.body);
    const current=await M.User.findById(id(req.params.id));ensure(current,404,'Account not found.');
    ensure(current.role!=='superadmin',400,'The main superadmin account is protected.');
    ensure(expectedStatus===undefined||expectedStatus===current.status,409,'This account changed. Refresh before changing its access.','ACCOUNT_CHANGED');
    const expectedRevision=current.accessRevision||1;
    ensure(revision===undefined||revision===expectedRevision,409,'This account changed. Refresh before changing its access.','ACCOUNT_CHANGED');
    if(status===current.status)return res.json(profile(current));
    const transitions={pending:['active','rejected'],active:['suspended'],suspended:['active'],rejected:['pending']};
    ensure(transitions[current.status]?.includes(status),409,'This action is not available for the current account status. Refresh and choose an available action.','INVALID_ACCOUNT_ACTION');
    const u=await M.User.findOneAndUpdate({_id:current._id,role:{$ne:'superadmin'},status:current.status,...(expectedRevision===1?{$or:[{accessRevision:1},{accessRevision:{$exists:false}}]}:{accessRevision:expectedRevision})},{$set:{status,accessRevision:expectedRevision+1}},{returnDocument:'after'});
    ensure(u,409,'This account changed. Refresh before changing its access.','ACCOUNT_CHANGED');
    if(status!=='active')await M.Session.deleteMany({userId:u._id});
    await notifyAdminAccess(u);await audit(req,'admin.approval',req.params.id);res.json(profile(u));
  });
  app.delete('/api/admin/users/:id',superadmin,async(req,res)=>{
    const {expectedStatus,revision}=z.object({expectedStatus:z.enum(['pending','active','rejected','suspended']).optional(),revision:z.number().int().positive().optional()}).parse(req.body||{});
    const current=await M.User.findById(id(req.params.id));ensure(current,404,'Account not found.');
    ensure(current.role!=='superadmin'&&String(current._id)!==String(req.user._id),400,'The main superadmin account is protected.');
    const expectedRevision=current.accessRevision||1;
    ensure((expectedStatus===undefined||expectedStatus===current.status)&&(revision===undefined||revision===expectedRevision),409,'This account changed. Refresh before deleting it.','ACCOUNT_CHANGED');
    const deletedAt=new Date();
    const removed=await M.User.findOneAndDelete({_id:current._id,role:{$ne:'superadmin'},status:current.status,...(expectedRevision===1?{$or:[{accessRevision:1},{accessRevision:{$exists:false}}]}:{accessRevision:expectedRevision})});
    ensure(removed,409,'This account changed. Refresh before deleting it.','ACCOUNT_CHANGED');
    const accountMail=['Verify your ARPC account','Verify your ARPC email','Reset your ARPC password','Invitation to ARPC administration','ARPC admin access update'];
    await Promise.all([
      M.Session.deleteMany({userId:removed._id}),
      M.Token.deleteMany({$or:[{purpose:{$in:['verify','reset']},subject:String(removed._id)},{purpose:'invite',email:removed.email,createdAt:{$lte:deletedAt}}]}),
      M.Mail.updateMany({state:{$in:['queued','failed']},$or:[{eventKey:{$regex:`^(admin:${removed._id}:access:|verification:${removed._id}:)`}},{to:removed.email,subject:{$in:accountMail},createdAt:{$lte:deletedAt}}]},{$set:{state:'cancelled',lastError:'Administrator account deleted.'},$unset:{lease:1,leasedUntil:1,nextAttemptAt:1}}),
    ]);
    await audit(req,'admin.delete',String(removed._id));res.status(204).end();
  });
  app.patch('/api/admin/account',async(req,res)=>{const v=z.object({fullName:text(100),department:z.string().max(150).default('')}).parse(req.body);Object.assign(req.user,v);await req.user.save();res.json({profile:profile(req.user)});});
  app.get('/api/admin/analytics',async(req,res)=>{
    const days=await M.Traffic.aggregate([{$group:{_id:'$day',views:{$sum:'$views'}}},{$sort:{_id:1}},{$limit:366}]);
    const pages=await M.Traffic.aggregate([{$group:{_id:'$path',views:{$sum:'$views'}}},{$sort:{views:-1}},{$limit:12}]);
    const applications=await M.Application.aggregate([{$group:{_id:{type:'$type',status:'$status'},count:{$sum:1}}}]);
    const enrollmentByProgramme=await M.Application.aggregate([{$match:{type:{$ne:'membership'}}},{$group:{_id:'$programmeId',count:{$sum:1}}},{$sort:{count:-1}}]);
    const growth=await M.Application.aggregate([{$match:{type:'membership'}},{$group:{_id:{$dateToString:{format:'%Y-%m',date:'$createdAt',timezone:'Asia/Dhaka'}},count:{$sum:1}}},{$sort:{_id:1}}]);
    const verified=await M.Application.countDocuments({type:'membership',paymentStatus:'verified'});
    res.json({days,pages,applications,enrollmentByProgramme,growth,verifiedFees:verified*100,mail:{configured:emailConfigured(),queued:await M.Mail.countDocuments({state:'queued'}),failed:await M.Mail.countDocuments({state:'failed'})}});
  });
  app.get('/api/admin/audit',superadmin,async(req,res)=>res.json(await M.Audit.find().sort({createdAt:-1}).limit(100).lean()));
  app.post('/api/admin/mail/retry',superadmin,async(req,res)=>{const result=await M.Mail.updateMany({state:'failed'},{$set:{state:'queued',attempts:0,lastError:''},$unset:{nextAttemptAt:1,lease:1,leasedUntil:1}});const retried=result.modifiedCount;res.json({retried,message:retried?`${retried} failed email ${retried===1?'delivery':'deliveries'} queued for retry.`:'There are no failed email deliveries to retry.'});});

  const courseExists = async(req,res,next)=>{const course=await M.Content.findOne({resource:'programmes',key:req.params.course,'draft.kind':'courses'});ensure(course,404,'Course not found.');next();};
  app.get('/api/admin/courses/:course/lessons',courseExists,async(req,res)=>res.json(await M.Lesson.find({courseId:req.params.course}).sort({order:1,_id:1}).lean()));
  const validateMaterials = async(v)=>{for(const material of v.materials)ensure(await M.File.exists({_id:material,purpose:'material'}),400,'Select an uploaded learning material.');};
  app.post('/api/admin/courses/:course/lessons',courseExists,async(req,res)=>{const v=lessonSchema.parse(req.body);await validateMaterials(v);res.status(201).json(await M.Lesson.create({...v,published:false,courseId:req.params.course}));});
  app.patch('/api/admin/courses/:course/lessons/:id',courseExists,async(req,res)=>{const v=lessonSchema.parse(req.body);delete v.published;await validateMaterials(v);const revision=z.number().int().positive().parse(req.body.revision);const current=await M.Lesson.findOne({_id:id(req.params.id),courseId:req.params.course,revision});ensure(current,409,'Refresh this lesson before saving again.');if(Object.entries(v).every(([key,value])=>isDeepStrictEqual(current.toObject()[key],value)))return res.json(current);const l=await M.Lesson.findOneAndUpdate({_id:current._id,courseId:req.params.course,revision},{$set:v,$inc:{revision:1}},{returnDocument:'after'});ensure(l,409,'Refresh this lesson before saving again.');res.json(l);});
  app.post('/api/admin/courses/:course/lessons/:id/:action',courseExists,async(req,res)=>{
    ensure(['publish','unpublish'].includes(req.params.action),404,'Unknown lesson action.');const revision=z.number().int().positive().parse(req.body.revision);
    const l=await M.Lesson.findOne({_id:id(req.params.id),courseId:req.params.course,revision});ensure(l,409,'Refresh this lesson before publishing.');
    if(req.params.action==='unpublish'&&!l.published)return res.json(l);
    const snapshot={title:l.title,body:l.body,videoUrl:l.videoUrl,materials:l.materials,order:l.order};await validateMaterials(snapshot);
    if(req.params.action==='publish'&&l.published&&isDeepStrictEqual(snapshot,l.publishedData))return res.json(l);
    const saved=await M.Lesson.findOneAndUpdate({_id:l._id,revision},{$set:{published:req.params.action==='publish',...(req.params.action==='publish'?{publishedData:snapshot}:{})},$inc:{revision:1}},{returnDocument:'after'});ensure(saved,409,'This lesson changed. Refresh and try again.');res.json(saved);
  });
  app.delete('/api/admin/courses/:course/lessons/:id',courseExists,async(req,res)=>{const l=await M.Lesson.findOneAndDelete({_id:id(req.params.id),courseId:req.params.course});ensure(l,404,'Lesson not found.');await M.Progress.updateMany({courseId:req.params.course},{$pull:{completed:req.params.id}});res.status(204).end();});

  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});
  const dir=path.resolve(process.env.UPLOAD_DIR || './uploads');
  app.get('/api/admin/files',async(req,res)=>res.json(await M.File.find().sort({createdAt:-1}).limit(500).lean()));
  app.post('/api/admin/files',upload.single('file'),async(req,res)=>{
    const f=req.file;ensure(f,400,'Choose a file.');const purpose=z.enum(['image','material']).parse(req.body.purpose);
    const b=f.buffer; const png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])); const jpg=b[0]===255 && b[1]===216 && b[2]===255; const webp=b.subarray(0,4).toString()==='RIFF' && b.subarray(8,12).toString()==='WEBP'; const pdf=b.subarray(0,5).toString()==='%PDF-';
    const type=png?'image/png':jpg?'image/jpeg':webp?'image/webp':pdf?'application/pdf':'';
    ensure(type && (purpose==='material' || type.startsWith('image/')),400,'Use a PNG, JPEG or WebP image, or a PDF learning material.');
    const name=f.originalname.replace(/[\r\n\\/]/g,'').slice(0,200);const storageName=randomToken();await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,storageName),b);
    const file=await M.File.create({name,storageName,type,size:f.size,purpose,createdBy:req.user._id});res.status(201).json({...file.toObject(),url:`/api/assets/${file._id}`});
  });
  app.delete('/api/admin/files/:id',async(req,res)=>{
    const file=await M.File.findById(id(req.params.id));ensure(file,404,'File not found.');
    const docs=await M.Content.find().lean();ensure(!docs.some(d=>JSON.stringify([d.draft,d.published]).includes(`/api/assets/${file._id}`)) && !await M.Lesson.exists({$or:[{materials:String(file._id)},{'publishedData.materials':String(file._id)}]}),409,'This file is still referenced. Remove its references first.','FILE_IN_USE');
    await unlink(path.join(dir,file.storageName)).catch(()=>{});await file.deleteOne();res.status(204).end();
  });
  const sendFile=(res,file)=>{res.type(file.type).set('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`);res.sendFile(path.join(dir,file.storageName));};
  app.get('/api/assets/:id',async(req,res)=>{
    const file=await M.File.findById(id(req.params.id));ensure(file && file.purpose==='image',404,'Image not found.');
    const docs=await M.Content.find({live:true}).lean(); let visible=docs.some(d=>JSON.stringify(d.published).includes(`/api/assets/${file._id}`));
    if(!visible && req.cookies.arpc_session){const found=await resolveSession(req,{touch:false});visible=Boolean(found?.user.status==='active'&&found.user.emailVerified);}
    ensure(visible,404,'Image is not published.');res.type(file.type).sendFile(path.join(dir,file.storageName));
  });
  app.get('/api/admin/files/:id/download',async(req,res)=>{const f=await M.File.findById(id(req.params.id));ensure(f,404,'File not found.');sendFile(res,f);});

  app.use('/api/learning',applicantOnly);
  app.post('/api/learning/access',authLimit,async(req,res)=>{
    const target=email.parse(req.body.email);
    if(await M.Application.exists({type:'courses','details.email':target,status:'approved'})){const t=await issueToken('learn',target,'');await queueClubMail(target,'learningAccess',{url:routeLink(`/learn?token=${t}`)});}
    res.json({message:'If you have an approved course enrollment, an access email has been queued.'});
  });
  app.post('/api/learning/signin',authLimit,async(req,res)=>{
    const t=await consume(req.body.token,'learn');ensure(await M.Application.exists({type:'courses','details.email':t.email,status:'approved'}),403,'No approved enrollment is available.');
    const learner=await M.Learner.findOne({email:t.email});ensure(learner,403,'No learner profile is available.');const raw=randomToken();await M.LearnerSession.create({hash:hash(raw),learnerId:learner._id,expiresAt:new Date(Date.now()+7*86400000)});res.cookie('arpc_learner',raw,{...cookies,maxAge:7*86400000});res.json({message:'Learning access opened.'});
  });
  app.post('/api/learning/logout',async(req,res)=>{if(req.cookies.arpc_learner)await M.LearnerSession.deleteOne({hash:hash(req.cookies.arpc_learner)});res.clearCookie('arpc_learner',cookies).json({message:'Signed out.'});});
  app.get('/api/learning',learnerAuth,async(req,res)=>{
    const approved=await M.Application.find({type:'courses','details.email':req.learner.email,status:'approved'});
    const courses=await M.Content.find({resource:'programmes',key:{$in:approved.map(a=>a.programmeId)}}).lean();res.json({learner:{fullName:req.learner.fullName,email:req.learner.email},courses:courses.filter(c=>c.published).map(c=>c.published)});
  });
  app.get('/api/learning/:course',learnerAuth,learnerCourse,async(req,res)=>{
    const docs=await M.Lesson.find({courseId:req.params.course,published:true}).sort({'publishedData.order':1,_id:1}).lean();const lessons=docs.map(l=>({...l.publishedData,_id:l._id}));const progress=await M.Progress.findOne({learnerId:req.learner._id,courseId:req.params.course});
    res.json({lessons,completed:progress?.completed || [],certificateId:progress?.certificateId || null});
  });
  app.post('/api/learning/:course/complete/:id',learnerAuth,learnerCourse,async(req,res)=>{
    const l=await M.Lesson.findOne({_id:id(req.params.id),courseId:req.params.course,published:true});ensure(l,404,'Lesson not available.');
    const done=z.boolean().parse(req.body.completed);
    const p=await M.Progress.findOneAndUpdate({learnerId:req.learner._id,courseId:req.params.course},done?{$addToSet:{completed:req.params.id}}:{$pull:{completed:req.params.id}},{upsert:true,returnDocument:'after'});res.json({completed:p.completed});
  });
  app.get('/api/learning/:course/materials/:id',learnerAuth,learnerCourse,async(req,res)=>{
    ensure(await M.Lesson.exists({courseId:req.params.course,published:true,'publishedData.materials':id(req.params.id)}),404,'Material unavailable.');const f=await M.File.findById(req.params.id);ensure(f,404,'Material unavailable.');sendFile(res,f);
  });
  app.get('/api/learning/:course/certificate',learnerAuth,learnerCourse,async(req,res)=>{
    const lessons=await M.Lesson.find({courseId:req.params.course,published:true});const p=await M.Progress.findOne({learnerId:req.learner._id,courseId:req.params.course});
    ensure(lessons.length>0 && p && lessons.every(l=>p.completed.includes(String(l._id))),409,'Complete every published lesson to receive a certificate.');
    const c=await M.Content.findOne({resource:'programmes',key:req.params.course});ensure(c?.published,404,'Course unavailable.');
    if(!p.certificateId){p.certificateId=`ARPC-${randomToken().slice(0,16).toUpperCase()}`;p.issuedAt=new Date();await p.save();}
    res.type('application/pdf').set('Content-Disposition','attachment; filename="arpc-certificate.pdf"');
    const pdf=new PDFDocument({size:'A4',layout:'landscape',margin:55});pdf.pipe(res);
    pdf.rect(25,25,791,545).lineWidth(2).stroke('#173d2e');pdf.fillColor('#173d2e').font('Times-Bold').fontSize(28).text('Ahsanullah Roh. Peace Club',{align:'center'});
    pdf.moveDown().fillColor('#b27a35').fontSize(34).text('Certificate of Completion',{align:'center'});pdf.moveDown().fillColor('#173d2e').font('Helvetica').fontSize(14).text('This certifies that',{align:'center'});
    pdf.moveDown().font('Times-Bold').fontSize(28).text(req.learner.fullName,{align:'center'});pdf.moveDown().font('Helvetica').fontSize(16).text(`has completed ${c.published.title}`,{align:'center'});pdf.moveDown().fontSize(11).text(`${p.certificateId} | ${p.issuedAt.toISOString().slice(0,10)}`,{align:'center'});pdf.end();
  });
  app.use((req,res)=>res.status(404).json({message:'API route not found.'}));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    if(error instanceof z.ZodError) return res.status(400).json({message:error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')});
    if(error.code===11000)return res.status(409).json({message:'This entry or application already exists.'});
    if(error instanceof multer.MulterError)return res.status(400).json({message:'Choose one file no larger than 10 MB.'});
    const status=error.status || 500; if(status===500) console.error('API request failed:',error.name);
    if(error instanceof HttpError && Number.isSafeInteger(error.retryAfterSeconds) && error.retryAfterSeconds>0)res.set('Retry-After',String(error.retryAfterSeconds));
    res.status(status).json({message:status===500?'The server could not complete this request.':error.message,...(error instanceof HttpError&&error.code?{code:error.code}:{}),requestId:req.requestId});
  });
  return app;
}
