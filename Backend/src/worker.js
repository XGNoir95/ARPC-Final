import mongoose from 'mongoose';
import { deliverMail } from './mail.js';
await mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/arpc');
let activeJob;let stopping=false;const work=async()=>{if(stopping)return;try{activeJob=deliverMail();await activeJob;}catch{console.error('Mail delivery worker failed. Durable jobs remain available for retry.');}if(!stopping)timer=setTimeout(work,10000);};let timer;
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{stopping=true;clearTimeout(timer);await Promise.race([activeJob||Promise.resolve(),new Promise(resolve=>setTimeout(resolve,25000))]);await mongoose.disconnect();process.exit(0);});
await work();
