import mongoose from 'mongoose';
import { Content } from '../src/models.js';
import { contentSchemas } from '../src/validation.js';
import { catalogue } from '../../Frontend/src/data/catalogue.js';
import { featuredEvents } from '../../Frontend/src/data/featuredEvents.js';
import { galleryPhotos } from '../../Frontend/src/data/gallery.js';
import { teams } from '../../Frontend/src/data/teams.js';
import { affiliations } from '../../Frontend/src/data/sponsors.js';
import { homeContent } from '../../Frontend/src/data/home.js';
await mongoose.connect(process.env.MONGODB_URI);
const seed=async(resource,items)=>{
  for(const item of items){const data=contentSchemas[resource].parse(item);await Content.updateOne({resource,key:data.id},{$setOnInsert:{draft:data,revision:1,live:false}},{upsert:true});}
};
await seed('programmes',Object.entries(catalogue).flatMap(([kind,items])=>items.map(v=>({...v,kind}))));
await seed('programmes',featuredEvents.map(v=>({...v,id:`featured-${v.id}`,kind:'events',date:v.dateTime,location:v.place,format:v.subtitle,description:v.exploration,heroImage:'/images/about/community.jpg',isPoster:true})));
await seed('gallery',galleryPhotos);await seed('teams',teams);await seed('sponsors',affiliations);await seed('home',homeContent);
console.log('Sample content imported as unpublished drafts. Existing records were left unchanged.');await mongoose.disconnect();
