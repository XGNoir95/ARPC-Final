import nodemailer from 'nodemailer';
import { reconcileApplications, reconcileAdminAccess } from './notifications.js';
export { queueMail, queueClubMail } from './outbox.js';
import { Mail, User } from './models.js';
import { randomToken } from './security.js';
import { buildMailMessage } from './emailMessage.js';
import { verificationMailIsCurrent } from './emailVerification.js';
export const emailConfigured=()=>Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS);
export async function claimMail(at=new Date(),lease=randomToken()) {
 return await Mail.findOneAndUpdate({attempts:{$lt:5},$or:[{state:'queued',$or:[{nextAttemptAt:{$exists:false}},{nextAttemptAt:{$lte:at}}]},{state:'processing',leasedUntil:{$lte:at}}]},{$set:{state:'processing',lease,leasedUntil:new Date(at.getTime()+120000)},$inc:{attempts:1}},{sort:{createdAt:1},returnDocument:'after'});
}
let working=false;
export async function deliverMail({now=()=>new Date()}={}) {
 if(working)return;working=true;
 try{await reconcileApplications();await reconcileAdminAccess();}catch{working=false;throw new Error('Notification reconciliation failed. Pending records remain recoverable.');}
 if(!emailConfigured()){working=false;return;}
 let transport;
 try {
 transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  await Mail.updateMany({state:'processing',leasedUntil:{$lte:now()},attempts:{$gte:5}},{$set:{state:'failed',lastError:'Worker stopped during the final delivery attempt.'},$unset:{lease:1,leasedUntil:1}});
  for(let n=0;n<20;n++) {
   const at=now();const lease=randomToken();
   const job=await claimMail(at,lease);
   if(!job)break;
   try {
    if(!await verificationMailIsCurrent(job.eventKey,at)){
     await Mail.updateOne({_id:job._id,lease},{$set:{state:'cancelled',lastError:'Verification code expired or replaced.'},$unset:{lease:1,leasedUntil:1,nextAttemptAt:1}});
     continue;
    }
    const accountId=/^admin:([a-f\d]{24}):access:/.exec(job.eventKey||'')?.[1];
    if(accountId&&!await User.exists({_id:accountId})){
     await Mail.updateOne({_id:job._id,lease},{$set:{state:'cancelled',lastError:'Administrator account deleted.'},$unset:{lease:1,leasedUntil:1,nextAttemptAt:1}});
     continue;
    }
    await transport.sendMail(buildMailMessage(job));
    await Mail.updateOne({_id:job._id,lease},{$set:{state:'sent',lastError:''},$unset:{lease:1,leasedUntil:1,nextAttemptAt:1}});
   }catch{
    const failed=job.attempts>=5;await Mail.updateOne({_id:job._id,lease},{$set:{state:failed?'failed':'queued',lastError:'Delivery failed. Check SMTP configuration.',nextAttemptAt:new Date(now().getTime()+Math.min(3600000,30000*2**(job.attempts-1)))},$unset:{lease:1,leasedUntil:1}});
   }
  }
 }finally{transport?.close?.();working=false;}
}
