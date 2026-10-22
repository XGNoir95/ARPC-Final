import { Session, User } from './models.js';
import { ensure, hash, randomToken } from './security.js';
export const sessionCookieOptions=()=>({httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/api'});
export const sessionIdleMs=()=>Math.max(1,Number(process.env.SESSION_IDLE_HOURS)||12)*3600000;
export async function resolveSession(req,{touch=true}={}) {
 const raw=req.cookies.arpc_session;if(typeof raw!=='string'||!/^[a-f0-9]{64}$/.test(raw))return null;
 const now=new Date();const session=await Session.findOne({hash:hash(raw),expiresAt:{$gt:now},updatedAt:{$gt:new Date(now.getTime()-sessionIdleMs())}});
 if(!session)return null;const user=await User.findById(session.userId);
 if(req.adminIdentityEmail && user?.email!==req.adminIdentityEmail)return null;
 if(!user||['rejected','suspended'].includes(user.status)){await Session.deleteOne({_id:session._id});return null;}
 if(touch&&now-session.updatedAt>5*60000){const alive=await Session.updateOne({_id:session._id},{$set:{updatedAt:now}});if(!alive.matchedCount)return null;}
 return {session,user};
}
export async function requireSession(req,res,next) {
 const found=await resolveSession(req);if(!found)res.clearCookie('arpc_session',sessionCookieOptions());ensure(found,401,'Your session has ended. Please sign in.');Object.assign(req,{user:found.user,session:found.session});next();
}
export async function issueSession(req,res,user) {
 const raw=randomToken();const old=req.cookies.arpc_session;if(typeof old==='string')await Session.deleteOne({hash:hash(old)});
 const lifetime=Math.max(1,Math.min(30,Number(process.env.SESSION_DAYS)||7))*86400000;
 const session=await Session.create({hash:hash(raw),userId:user._id,expiresAt:new Date(Date.now()+lifetime),userAgent:(req.get('User-Agent') || 'Unknown browser').slice(0,180)});
 const keep=await Session.find({userId:user._id}).sort({createdAt:-1,_id:-1}).skip(5).select('_id');if(keep.length)await Session.deleteMany({_id:{$in:keep.map(s=>s._id)}});
 res.clearCookie('arpc_learner',sessionCookieOptions());res.cookie('arpc_session',raw,{...sessionCookieOptions(),maxAge:lifetime});return session;
}
export async function applicantOnly(req,res,next) {
 ensure(!await resolveSession(req),403,'Administrator accounts cannot apply for membership, enroll in programmes or use learner access. Use the admin workspace.');next();
}
