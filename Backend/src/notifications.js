import { Application, Content, Learner, Token, User, Mail } from './models.js';
import { queueClubMail } from './outbox.js';
import { hash, randomToken } from './security.js';

export async function notifyAdminAccess(user) {
 if((user.accessRevision||1)<=(user.notifiedAccessRevision||1))return;
 if(!await User.exists({_id:user._id,accessRevision:user.accessRevision,status:user.status}))return;
 const eventKey=`admin:${user._id}:access:${user.accessRevision}`;
 await queueClubMail(user.email,'adminAccess',{name:user.fullName,status:user.status,emailVerified:user.emailVerified},eventKey);
 // A concurrent deletion must not leave a newly queued access email behind.
 if(!await User.exists({_id:user._id})){
  await Mail.updateMany({eventKey,state:{$in:['queued','failed']}},{$set:{state:'cancelled',lastError:'Administrator account deleted.'}});
  return;
 }
 await User.updateOne({_id:user._id,accessRevision:user.accessRevision},{$set:{notifiedAccessRevision:user.accessRevision}});
}

export async function reconcileAdminAccess() {
 const pending=await User.find({$expr:{$gt:[{$ifNull:['$accessRevision',1]},{$ifNull:['$notifiedAccessRevision',1]}]}}).sort({updatedAt:1}).limit(50);
 for(const user of pending)await notifyAdminAccess(user);
}

export async function notifyApplication(a) {
 // Only the published programme name belongs in participant emails, never drafts
 // or the administrator's internal review notes.
 const programme=a.type==='membership'?null:await Content.findOne({resource:'programmes',key:a.programmeId}).select('published.title').lean();
 const data={name:a.details.fullName,applicationType:a.type,programmeTitle:programme?.published?.title,reference:String(a._id)};
 if(a.confirmationQueued===false){await queueClubMail(a.details.email,'applicationReceived',data,`application:${a._id}:received`);await Application.updateOne({_id:a._id},{$set:{confirmationQueued:true}});}
 if((a.reviewVersion||0)>(a.notifiedReviewVersion||0)){
  const event=`application:${a._id}:review:${a.reviewVersion}`;
  await queueClubMail(a.details.email,'applicationUpdate',{...data,status:a.status},event);
  if(a.type==='courses'&&a.status==='approved'){
   await Learner.updateOne({email:a.details.email},{$set:{fullName:a.details.fullName}},{upsert:true});
   const raw=randomToken();await Token.create({hash:hash(raw),purpose:'learn',email:a.details.email,subject:'',expiresAt:new Date(Date.now()+3600000)});
   const front=(process.env.FRONTEND_URL||'http://localhost:5173').replace(/\/$/,'');await queueClubMail(a.details.email,'learningAccess',{name:a.details.fullName,programmeTitle:data.programmeTitle,approved:true,url:`${front}/learn?token=${raw}`},event+':access');
  }
  await Application.updateOne({_id:a._id,reviewVersion:a.reviewVersion},{$set:{notifiedReviewVersion:a.reviewVersion}});
 }
}
export async function reconcileApplications() {
 const pending=await Application.find({$or:[{confirmationQueued:false},{$expr:{$gt:[{$ifNull:['$reviewVersion',0]},{$ifNull:['$notifiedReviewVersion',0]}]}}]}).sort({createdAt:1}).limit(50);
 for(const a of pending)await notifyApplication(a);
}
