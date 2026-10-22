import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { deliverMail } from './mail.js';
import { connectInfrastructure } from './infrastructure.js';
export async function startServer() {
 if(process.env.NODE_ENV==='production'&&!process.env.REDIS_URL)throw new Error('Production requires REDIS_URL for shared rate limiting.');
 if(process.env.NODE_ENV==='production'&&(!process.env.FRONTEND_URL||!process.env.FRONTEND_URL.startsWith('https://')))throw new Error('Production FRONTEND_URL must use HTTPS.');
 await mongoose.connect(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/arpc',{serverSelectionTimeoutMS:10000});
 await Promise.all(Object.values(mongoose.models).map(model=>model.init()));
 let infrastructure;try{infrastructure=await connectInfrastructure();}catch(error){await mongoose.disconnect();throw error;}
 const app=createApp({redis:infrastructure.redis});
 const server=app.listen(Number(process.env.PORT||4000),process.env.API_LISTEN_HOST||(process.env.NODE_ENV==='development'?'127.0.0.1':'0.0.0.0'),()=>console.log(`ARPC API listening on port ${process.env.PORT||4000}`));server.requestTimeout=30000;server.headersTimeout=15000;server.keepAliveTimeout=5000;
 let timer;if(process.env.MAIL_WORKER_ENABLED!=='false'){timer=setInterval(()=>deliverMail().catch(()=>console.error('Mail worker could not run.')),30000);timer.unref();deliverMail().catch(()=>console.error('Mail worker could not run.'));}
 let stopping;return ()=>stopping ||= (async()=>{app.locals.draining=true;clearInterval(timer);const deadline=setTimeout(()=>server.closeAllConnections(),10000);deadline.unref();await new Promise(resolve=>server.close(resolve));clearTimeout(deadline);await infrastructure.close();await mongoose.disconnect();})();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const stop=await startServer();for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stop().then(()=>process.exit(0)));}
