import { describe, expect, it } from 'vitest';
import { heroSlides, homepageDraft, featuredItems, publishedProgrammes, heroGreeting, defaultHero } from './homeContent';

describe('Homepage content resolution', () => {
  it('uses the standard Arabic greeting for missing or blank values and preserves custom wording', () => {
    expect(heroGreeting()).toBe(defaultHero.arabicGreeting);
    expect(heroGreeting({ arabicGreeting: '  ' })).toBe(defaultHero.arabicGreeting);
    expect(heroGreeting({ arabicGreeting: 'أهلاً وسهلاً بكم' })).toBe('أهلاً وسهلاً بكم');
  });
  it('uses neutral image numbers and leaves image names empty until an administrator chooses one', () => {
    expect(heroSlides().map(slide => slide.name)).toEqual(['Image 1', 'Image 2', 'Image 3']);
    expect(homepageDraft('hero').slides.map(slide => slide.name)).toEqual(['', '', '']);
    const legacy = { slides: [{ id: 'campus', name: 'AUST campus', image: '/heroBanner.jpg' }, { id: 'community', name: 'Community', image: '/images/about/community.jpg' }, { id: 'learning', name: 'Learning', image: '/images/about/learning.jpg' }] };
    expect(heroSlides(legacy).map(slide => slide.name)).toEqual(['Image 1', 'Image 2', 'Image 3']);
    expect(homepageDraft('hero', legacy).slides.map(slide => slide.name)).toEqual(['', '', '']);
    const custom = { slides: [{ id: 'campus', name: 'My chosen image', image: '/heroBanner.jpg' }, { id: 'my-photo', name: 'Community', image: '/my-photo.jpg' }] };
    expect(heroSlides(custom).map(slide => slide.name)).toEqual(['My chosen image', 'Community']);
    expect(homepageDraft('hero', custom).slides[0].name).toBe('My chosen image');
  });
  it('uses a completed caption for every blank hero image, including a caption after the first image', () => {
    const slides = heroSlides({ title:'Default',description:'Default introduction',slides:[{id:'a',image:'/a.jpg'},{id:'b',image:'/b.jpg',title:'Shared headline',description:'Shared introduction'},{id:'c',image:'/c.jpg'}] });
    expect(slides.map(slide=>slide.title)).toEqual(['Shared headline','Shared headline','Shared headline']);
    expect(slides.map(slide=>slide.description)).toEqual(['Shared introduction','Shared introduction','Shared introduction']);
    expect(slides.map(slide=>slide.image)).toEqual(['/a.jpg','/b.jpg','/c.jpg']);
  });
  it('preserves individual captions and safely resolves legacy hero images', () => {
    expect(heroSlides({title:'Legacy headline',description:'Legacy introduction',image:'/legacy.jpg'})[0]).toMatchObject({image:'/legacy.jpg',title:'Legacy headline'});
    const slides=heroSlides({slides:[{id:'a',image:'/a.jpg',title:'First'},{id:'b',image:'/b.jpg',title:'Second'},{id:'c',image:'/c.jpg',title:'  '}]});
    expect(slides.map(slide=>slide.title)).toEqual(['First','Second','First']);
    expect(slides.map(slide=>slide.label)).toEqual(['01','02','03']);
  });
  it('keeps all About card wording configurable while supplying missing legacy fields', () => {
    expect(homepageDraft('about-us',{title:'Custom title',description:'Full text',summary:'New summary',label:'Custom label',link:'/gallery',linkLabel:'See photos',image:'/custom.jpg'})).toMatchObject({title:'Custom title',description:'Full text',summary:'New summary',label:'Custom label',link:'/gallery',linkLabel:'See photos',image:'/custom.jpg'});
    expect(homepageDraft('our-mission',{label:'',summary:''})).toMatchObject({label:'What guides us',summary:'Turning knowledge into kindness and shared purpose into action.'});
  });
});

const at = new Date('2026-10-17T12:00:00Z');
const event=(id,date)=>({id,kind:'events',date,title:id});
describe('Featured selection', () => {
  it('keeps a manually selected mix in order and skips withdrawn programmes', () => {
    const available=[event('event','2026-10-18'),{id:'course',kind:'courses',title:'Course'},{id:'webinar',kind:'webinars',title:'Webinar',date:'2026-10-19'}];
    const result=featuredItems(available,{selections:[{id:'webinar',kind:'webinars'},{id:'membership',kind:'membership'},{id:'missing',kind:'events'},{id:'course',kind:'courses'},{id:'event',kind:'events'}]},at);
    expect(result.map(item=>item.kind)).toEqual(['webinars','membership','courses','events']);
    expect(result[1]).toMatchObject({id:'membership',registrationOpen:true});
  });
  it('selects the closest upcoming dates and most recent undated courses with a mix of kinds', () => {
    const available=[...Array.from({length:8},(_,i)=>event(`event-${i}`,`2026-10-${String(i+18).padStart(2,'0')}`)),{id:'webinar',kind:'webinars',date:'2026-11-01'},{id:'old-course',kind:'courses',publishedAt:'2026-01-01'},{id:'new-course',kind:'courses',publishedAt:'2026-10-16'},event('old-event','2026-09-01')];
    const result=featuredItems(available,{selections:[]},at);
    expect(result).toHaveLength(6);
    expect(new Set(result.map(item=>item.kind))).toEqual(new Set(['events','webinars','courses']));
    expect(result[0].id).toBe('event-0');
    expect(result.map(item=>item.id)).toContain('new-course');
    expect(result.map(item=>item.id)).not.toContain('old-course');
  });
  it('uses the Dhaka calendar day at midnight and the latest past date as a fallback', () => {
    const available=[event('today','2026-10-18'),event('yesterday','2026-10-17')];
    expect(featuredItems(available,{},new Date('2026-10-17T19:00:00Z')).map(item=>item.id)).toEqual(['today','yesterday']);
    expect(featuredItems([event('older','2026-01-01'),event('recent','2026-10-16')],{},at).map(item=>item.id)).toEqual(['recent','older']);
  });
  it('never invents data for an empty automatic section or features draft programme wording', () => {
    expect(featuredItems([],{},at)).toEqual([]);
    expect(publishedProgrammes([{id:'hidden',live:false,title:'Hidden'},{id:'live',live:true,title:'Private edit',publishedData:{id:'live',kind:'events',title:'Published title'}}])).toEqual([{id:'live',kind:'events',title:'Published title',publishedAt:undefined}]);
  });
});
