import { createClient } from 'redis';
import { RedisStore } from 'rate-limit-redis';
import { Content } from './models.js';
import { hash, HttpError } from './security.js';
export async function connectInfrastructure() {
 const url=process.env.REDIS_URL;if(!url)return {redis:null,close:async()=>{}};
 const redis=createClient({url,disableOfflineQueue:true,commandsQueueMaxLength:1000,commandOptions:{timeout:2000},socket:{connectTimeout:5000,reconnectStrategy:retries=>Math.min(100*2**Math.min(retries,5),3000)}});
 redis.on('error',()=>console.error('Redis connection unavailable. Shared protection remains closed.'));
 // First startup must have a usable shared store; reconnect automatically after a later outage.
 await Promise.race([redis.connect(),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('Redis startup timed out. Check REDIS_URL.')),6000);timer.unref();})]).catch(error=>{redis.destroy();throw error;});
 return {redis,close:async()=>{if(redis.isOpen)redis.destroy();}};
}
export function sharedLimitStore(redis,name) {
 if(!redis)return undefined;
 return new RedisStore({prefix:`${process.env.REDIS_PREFIX || 'arpc'}:limit:${name}:`,sendCommand:async(...args)=>{if(!redis.isReady)throw new HttpError(503,'Service protection is temporarily unavailable. Please try again shortly.');try{return await redis.sendCommand(args);}catch{throw new HttpError(503,'Service protection is temporarily unavailable. Please try again shortly.');}}});
}
export async function publicContent(redis) {
 // Durable metadata determines the key on every read, so withdrawing or deleting a
 // photo cannot resurrect stale content after a Redis outage or a concurrent cache fill.
 const revision=await Content.find({live:true}).sort({_id:1}).select('_id revision').lean();
 const key=`${process.env.REDIS_PREFIX || 'arpc'}:public:${hash(JSON.stringify(revision))}`;
 if(redis?.isReady){try{const cached=await redis.get(key);if(cached)return JSON.parse(cached);}catch{/* Published MongoDB data is the fallback. */}}
 const docs=await Content.find({live:true}).lean();
 const names=['programmes','gallery','teams','sponsors','home'];const value=Object.fromEntries(names.map(r=>[r,docs.filter(d=>d.resource===r).map(d=>r==='programmes'?{...d.published,publishedAt:d.publishedAt || d.createdAt}:d.published)]));
 if(redis?.isReady){try{await redis.set(key,JSON.stringify(value),{EX:60});}catch{/* Cache writes must not fail a public read. */}}
 return value;
}
