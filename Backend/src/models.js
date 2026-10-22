import mongoose from 'mongoose';
const { Schema } = mongoose;
const model = (name, fields, indexes = []) => {
  const schema = new Schema(fields, { timestamps: true, strict: true });
  indexes.forEach(([keys, options]) => schema.index(keys, options));
  return mongoose.model(name, schema);
};
export const User = model('User', {
  email: { type: String, unique: true, required: true }, fullName: String, department: String,
  passwordHash: { type: String, select: false }, googleSub: { type: String, select: false },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  status: { type: String, enum: ['pending', 'active', 'rejected', 'suspended'], default: 'pending' },
  emailVerified: { type: Boolean, default: false },
  emailVerification: { type: new Schema({
    version: String, codeHash: String, expiresAt: Date, resendAt: Date,
    sendWindowAt: Date, sendCount: Number, attemptWindowAt: Date, attempts: Number,
  }, { _id: false }), select: false },
  accessRevision: { type: Number, default: 1 }, notifiedAccessRevision: { type: Number, default: 1 },
}, [[{ googleSub: 1 }, { unique:true, partialFilterExpression:{googleSub:{$type:'string'}} }]]);
export const Session = model('Session', { hash: { type: String, unique: true }, userId: Schema.Types.ObjectId, expiresAt: Date, userAgent: String }, [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }], [{ userId: 1, createdAt: -1 }, {}]]);
export const Token = model('Token', { hash: { type: String, unique: true }, purpose: String, email: String, subject: String, expiresAt: Date }, [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]]);
export const Content = model('Content', {
  resource: String, key: String, draft: Schema.Types.Mixed, published: Schema.Types.Mixed,
  revision: { type: Number, default: 1 }, live: { type: Boolean, default: false }, publishedAt: Date, updatedBy: Schema.Types.ObjectId,
}, [[{ resource: 1, key: 1 }, { unique: true }]]);
export const Application = model('Application', {
  type: String, programmeId: String, details: Schema.Types.Mixed, payment: Schema.Types.Mixed,
  status: { type: String, default: 'pending' }, paymentStatus: { type: String, default: 'pending' },
  revision:{type:Number,default:1}, confirmationQueued: {type:Boolean,default:true}, reviewVersion:{type:Number,default:0}, notifiedReviewVersion:{type:Number,default:0}, notes: String, reviewedBy: Schema.Types.ObjectId,
}, [[{ type: 1, programmeId: 1, 'details.email': 1, 'details.studentId': 1 }, { unique: true }]]);
export const Lesson = model('Lesson', { courseId: String, title: String, body: String, videoUrl: String, materials: [String], order: Number, published: {type:Boolean,default:false}, publishedData: Schema.Types.Mixed, revision:{type:Number,default:1} });
export const Learner = model('Learner', { email: { type: String, unique: true }, fullName: String });
export const LearnerSession = model('LearnerSession', { hash: { type: String, unique: true }, learnerId: Schema.Types.ObjectId, expiresAt: Date }, [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]]);
export const Progress = model('Progress', { learnerId: Schema.Types.ObjectId, courseId: String, completed: [String], certificateId: String, issuedAt: Date }, [[{ learnerId: 1, courseId: 1 }, { unique: true }]]);
export const File = model('File', { name: String, storageName: String, type: String, size: Number, purpose: String, createdBy: Schema.Types.ObjectId });
export const Mail = model('Mail', { to: String, subject: String, text: String, html: String, state: { type: String, default: 'queued' }, attempts: { type: Number, default: 0 }, eventKey:{type:String,unique:true,sparse:true}, lastError: String, lease: String, leasedUntil: Date, nextAttemptAt: Date }, [[{state:1,nextAttemptAt:1,createdAt:1},{}]]);
export const Traffic = model('Traffic', { day: String, path: String, views: Number }, [[{ day: 1, path: 1 }, { unique: true }]]);
export const Audit = model('Audit', { actor: Schema.Types.ObjectId, action: String, target: String });
