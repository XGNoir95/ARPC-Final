export const resourceNames={programmes:'Programme',gallery:'Photo',teams:'Team',sponsors:'Sponsor',home:'Homepage section'};
export const kindNames={events:'Event',webinars:'Webinar',courses:'Course',membership:'Membership'};
export const titleOf=item=>item.title || item.label || item.name || 'Untitled';
export const contentState=item=>item.live?'published':'draft';
export const shortDate=value=>{if(!value)return 'Date to be confirmed';const date=new Date(`${String(value).slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?'Date to be confirmed':date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});};
export const fileSize=value=>value>=1024*1024?`${(value/1024/1024).toFixed(1)} MB`:`${Math.ceil((value || 0)/1024)} KB`;
export function pageName(path='') {
 const clean=path.split(/[?#]/)[0].replace(/\/$/,'') || '/';
 const names={'/':'Home','/join':'Membership application','/catalogue':'Catalogue','/gallery':'Gallery','/team':'Panel','/profile':'Profile','/login':'Administrator sign in','/register':'Administrator registration','/learn':'Course learning','/forgot-password':'Password recovery','/reset-password':'Reset password','/verify-email':'Email verification'};
 if(names[clean])return names[clean];
 if(clean.startsWith('/enroll/'))return `${kindNames[clean.split('/')[2]] || 'Programme'} enrollment`;
 if(clean.startsWith('/admin'))return 'Admin workspace';
 return 'Other website pages';
}
