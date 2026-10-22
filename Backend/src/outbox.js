import { Mail } from './models.js';
import { renderClubEmail } from './emailTemplates.js';

export async function queueMail(to,subject,text,eventKey,html) {
 if(!eventKey)return Mail.create({to,subject,text,html});
 try{return await Mail.findOneAndUpdate({eventKey},{$setOnInsert:{to,subject,text,html,eventKey,state:'queued',attempts:0}},{upsert:true,returnDocument:'after'});}catch(error){if(error.code===11000)return Mail.findOne({eventKey});throw error;}
}

export async function queueClubMail(to,type,data={},eventKey) {
 const {subject,text,html}=renderClubEmail(type,data);
 return queueMail(to,subject,text,eventKey,html);
}
