import { z } from 'zod';
import { memberProfileUrl } from './memberProfiles.js';
export const text = (max = 200) => z.string().trim().min(1).max(max);
export const email = z.string().trim().toLowerCase().email().max(150);
export const password = z.string().min(12, 'Use at least 12 characters.').max(128);
const optional = (max = 2000) => z.string().trim().max(max).default('');
const asset = z.string().max(2000).refine(v => !v || /^\/(?!\/)[^\r\n]*$/.test(v) || /^https:\/\//.test(v), 'Use a local asset path or HTTPS URL.').default('');
export const resources = ['programmes', 'gallery', 'teams', 'sponsors', 'home'];
const profile = service => z.string().trim().max(2000).transform((value, context) => {
  const url = memberProfileUrl(service, value);
  if (url !== null) return url;
  context.addIssue({code:'custom',message:`Enter a valid ${service === 'linkedin' ? 'LinkedIn' : 'GitHub'} username or HTTPS profile URL.`});
  return z.NEVER;
}).default('');
const member = z.object({ id: text(), name: text(), department: optional(), role: optional(), image: asset, linkedin: profile('linkedin'), github: profile('github') });
const heroSlide = z.object({ id: text(), name: optional(80), image: asset.refine(Boolean, 'Choose a hero image.'), title: optional(200), description: optional(1000) });
const aboutSection = z.object({ id: z.enum(['about-us','our-mission','our-vision']), title: text(), description: text(5000), image: asset, label: optional(150), summary: optional(500), link: z.enum(['','/join','/team','/catalogue','/gallery']).default(''), linkLabel: optional(100) });
const featuredSelection = z.object({ id: text(), kind: z.enum(['events','webinars','courses','membership']) }).refine(value => value.kind !== 'membership' || value.id === 'membership', 'Choose the membership application.');
const homeSchema = z.discriminatedUnion('id', [
  z.object({ id: z.literal('hero'), title: text(), description: text(5000), arabicGreeting: optional(300), image: asset, slides: z.array(heroSlide).max(8).default([]) }).superRefine((value, context) => { if(new Set(value.slides.map(slide=>slide.id)).size!==value.slides.length)context.addIssue({code:'custom',path:['slides'],message:'Each hero image needs a unique ID.'}); }),
  aboutSection,
  z.object({ id: z.literal('featured'), title: text(), description: optional(1000), image: asset, selections: z.array(featuredSelection).max(12).default([]), membership: z.object({title:text(),description:text(5000),image:asset}).optional() }).superRefine((value, context) => { if(new Set(value.selections.map(item=>`${item.kind}:${item.id}`)).size!==value.selections.length)context.addIssue({code:'custom',path:['selections'],message:'Choose each featured item once.'}); }),
]);
export const contentSchemas = {
  programmes: z.object({
    id: text(), kind: z.enum(['events','webinars','courses']), title: text(), description: text(5000),
    details: optional(20000), date: optional(20), time: optional(40), location: optional(200), format: optional(200),
    image: asset, imageAlt: optional(300), heroImage: asset, isPoster: z.boolean().default(false),
    takeaways: z.array(text(500)).max(30).default([]), duration: optional(100), pace: optional(200),
    fee: z.number().min(0).max(1000000).default(0), coverTheme: optional(100), registrationOpen: z.boolean().default(true),
  }).superRefine((v,c) => { if (v.kind !== 'courses' && !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) c.addIssue({ code: 'custom', path: ['date'], message: 'Enter a YYYY-MM-DD date.' }); }),
  gallery: z.object({ id: text(), title: text(), description: text(5000), image: asset.refine(Boolean, 'Select an image.'), category: text(), alt: text(300), placeholder: z.boolean().default(false), poster: z.boolean().default(false) }),
  teams: z.object({ id: text(), label: text(), description: text(5000), members: z.array(member).max(100) }),
  sponsors: z.object({ id: text(), name: text(), src: asset.refine(Boolean), wide: z.boolean().default(false) }),
  home: homeSchema,
};
const departments = ['Computer Science & Engineering','Electrical & Electronic Engineering','Mechanical Engineering','Industrial & Production Engineering','Civil Engineering','Textile Engineering','Bachelor of Business Administration','Architecture'];
export const student = z.object({ fullName: text(100), studentId: text(30), department: z.enum(departments), semester: z.enum(['1.1','1.2','2.1','2.2','3.1','3.2','4.1','4.2','5.1','5.2']), gender: z.enum(['Female','Male','Other','Prefer not to say']), email, phone: optional(25) });
const phoneValid = v => /^\+?\d{7,15}$/.test(v.replace(/[\s()-]/g,''));
export const application = z.object({
  type: z.enum(['membership','events','webinars','courses']), programmeId: optional(200), details: student,
  consent: z.boolean().default(false), payment: z.object({ method: z.enum(['bKash','Nagad','Rocket','Bank transfer','Cash']), sender: optional(100), reference: optional(100), receivedBy: optional(100) }).optional(),
}).superRefine((v,c) => {
  const issue = (path,message) => c.addIssue({code:'custom',path,message});
  if (['membership','courses'].includes(v.type) && !phoneValid(v.details.phone)) issue(['details','phone'],'Enter a valid mobile number.');
  if (v.type === 'membership') {
    if (!v.consent) issue(['consent'],'Consent is required.');
    if (!v.payment) issue(['payment'],'Payment details are required.');
    else if (v.payment.method === 'Cash') { if (!v.payment.receivedBy) issue(['payment','receivedBy'],'Enter the club representative.'); }
    else if (!v.payment.sender || !v.payment.reference) issue(['payment'],'Enter the sender and transaction reference.');
  } else if (!v.programmeId) issue(['programmeId'],'Select a programme.');
});
export const lessonSchema = z.object({ title: text(200), body: text(50000), videoUrl: z.string().max(2000).refine(v=>!v || /^https:\/\//.test(v)).default(''), materials: z.array(z.string().regex(/^[a-f\d]{24}$/)).max(30).default([]), order: z.number().int().min(0).max(10000), published: z.boolean().default(false) });
