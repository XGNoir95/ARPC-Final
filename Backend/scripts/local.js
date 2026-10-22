import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';
import { startServer } from '../src/server.js';
const dbPath=path.resolve(process.env.LOCAL_DB_DIR || path.join(homedir(),'.arpc','dev-db'));await mkdir(dbPath,{recursive:true});
process.env.MONGOMS_DOWNLOAD_DIR=path.join(homedir(),'.cache','arpc-mongodb');
// Development convenience: a real mongod binary with a persistent WiredTiger database.
const mongo=await MongoMemoryServer.create({instance:{port:27017,dbName:'arpc',dbPath,storageEngine:'wiredTiger'}});
process.env.MONGODB_URI=mongo.getUri('arpc');
let stop;
try { stop=await startServer(); } catch(error) { await mongo.stop(); throw error; }
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await stop();await mongo.stop();process.exit(0);});
