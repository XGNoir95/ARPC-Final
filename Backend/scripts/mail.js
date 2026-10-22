import mongoose from 'mongoose';
import { Mail } from '../src/models.js';
if(process.env.NODE_ENV==='production')throw new Error('Local mailbox inspection is disabled in production.');
await mongoose.connect(process.env.MONGODB_URI);
const jobs=await Mail.find({state:'queued'}).sort({createdAt:-1}).limit(20);
console.log('LOCAL DEVELOPMENT MAILBOX: these messages have not been delivered.');
for(const job of jobs)console.log(`\nTo: ${job.to}\nSubject: ${job.subject}\n${job.text}`);
await mongoose.disconnect();
