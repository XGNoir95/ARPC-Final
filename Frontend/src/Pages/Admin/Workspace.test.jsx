import { act, cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AdminWorkspace from './Workspace';
import { api, post } from '../../utils/api';
import { AuthContext } from '../../contexts/AuthContext';
vi.mock('../../utils/api',()=>({api:vi.fn(),post:vi.fn(),API_BASE:'/api'}));
const profile={id:'main',fullName:'Club Admin',email:'admin@example.com',role:'superadmin',status:'active',emailVerified:true};
const event={_id:'event',id:'gathering',title:'A campus gathering',description:'Meet the community',kind:'events',date:'2026-12-01',image:'/heroBanner.jpg',revision:3,live:true};
const course={_id:'course',id:'learning',title:'Reflection course',description:'Read and discuss',kind:'courses',coverTheme:'reflection',revision:2,live:false};
let workspace,applications,lessons;
const show=path=>render(<MemoryRouter initialEntries={[path]}><Routes><Route path='/admin/*' element={<AdminWorkspace/>}/></Routes></MemoryRouter>);
beforeEach(()=>{
 workspace={profile,programmes:[event,course],gallery:[{_id:'photo',id:'photo',title:'Together at campus',category:'Campus',image:'/heroBanner.jpg',description:'A photo',live:false,revision:1}],teams:[{_id:'team',id:'committee',label:'Executive Committee',description:'Our people',members:[{id:'member',name:'Team Member',role:'President'}],live:false,revision:1}],sponsors:[{_id:'sponsor',id:'sponsor',name:'Club Partner',src:'/logo.jpg',live:false,revision:1}],home:[{_id:'home',id:'hero',title:'Welcome to ARPC',description:'Our club',image:'/heroBanner.jpg',live:false,revision:1}],emailConfigured:true};
 applications=[{_id:'a',type:'membership',details:{fullName:'First Applicant',email:'first@example.com'},status:'pending',paymentStatus:'pending'},{_id:'b',type:'membership',details:{fullName:'Second Applicant',email:'second@example.com'},status:'approved',paymentStatus:'verified'}];
 lessons=[{_id:'lesson',title:'First reading',body:'Published reading',order:0,revision:4,published:true,materials:[]}];
 api.mockImplementation(async(path,options)=>{
  if(path==='/auth/me')return {profile};if(path==='/admin/workspace')return workspace;if(path==='/admin/applications')return applications;if(path==='/admin/files')return [{_id:'pdf',name:'Reading.pdf',type:'application/pdf',purpose:'material',size:2048}];if(path==='/admin/users')return [{...profile},{id:'pending',fullName:'New Admin',email:'new@example.com',role:'admin',status:'pending',emailVerified:false}];if(path==='/admin/analytics')return {days:[{_id:new Date().toISOString().slice(0,10),views:7}],growth:[{_id:'2026-10',count:3}],pages:[{_id:'/',views:7}],mail:{queued:0,failed:0},verifiedFees:100};if(path==='/config')return {googleClientId:''};if(path==='/admin/courses/learning/lessons'&&!options)return lessons;return {};
 });post.mockResolvedValue({_id:'new-file'});
});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it.each([['gallery','Together at campus'],['teams','Executive Committee'],['sponsors','Club Partner'],['home','Hero'],['account','Your profile']])('renders the %s workspace using real records',async(view,title)=>{show(`/admin/${view}`);expect(await screen.findByRole('heading',{name:title})).toBeVisible();});
it('separates Events and Webinars and keeps course management out of Programmes',async()=>{
 workspace.programmes.push({_id:'webinar',id:'online',kind:'webinars',title:'Online conversation',date:'2026-12-02',live:false,revision:1});
 show('/admin/programmes');await screen.findByRole('heading',{name:event.title});
 const events=within(screen.getByRole('region',{name:'Events'}));
 const webinars=within(screen.getByRole('region',{name:'Webinars'}));
 expect(events.getByRole('heading',{name:event.title})).toBeVisible();
 expect(events.queryByRole('heading',{name:'Online conversation'})).not.toBeInTheDocument();
 expect(webinars.getByRole('heading',{name:'Online conversation'})).toBeVisible();
 expect(screen.queryByRole('heading',{name:course.title})).not.toBeInTheDocument();
 expect(screen.queryByRole('button',{name:'Add course'})).not.toBeInTheDocument();
 fireEvent.click(events.getByRole('button',{name:/Drafts/}));
 expect(events.getByRole('heading',{name:'No events match these filters.'})).toBeVisible();
 fireEvent.click(events.getByRole('button',{name:'Reset filters'}));
 expect(events.getByRole('heading',{name:event.title})).toBeVisible();
});
it('opens workspace search from the keyboard and opens a matching draft',async()=>{
 show('/admin');await screen.findByRole('heading',{name:'Your club workspace.'});await waitFor(()=>{fireEvent.keyDown(document,{key:'k',ctrlKey:true});expect(screen.getByRole('dialog')).toBeVisible();});const search=screen.getByRole('dialog');fireEvent.change(within(search).getByRole('searchbox'),{target:{value:'Reflection'}});fireEvent.click(within(search).getByRole('button',{name:/Reflection course/}));expect(screen.getByRole('dialog',{name:'Edit course draft'})).toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Close dialog'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(document.body.style.overflow).toBe('');
});
it('updates the chart readout when the selected metric changes',async()=>{
 show('/admin');await screen.findByRole('img',{name:'Daily page views chart'});fireEvent.click(screen.getByRole('button',{name:'Membership applications'}));expect(screen.getByRole('img',{name:'Monthly membership application chart'})).toBeVisible();expect(screen.getByRole('combobox',{name:'Traffic date range'})).toBeDisabled();expect(screen.getByRole('status')).toHaveTextContent('3');expect(screen.getByRole('status')).toHaveTextContent('2026-10');
});
it('opens the admin menu and closes it with Escape while restoring keyboard focus',async()=>{
 show('/admin');await screen.findByRole('heading',{name:'Your club workspace.'});
 const toggle=screen.getByRole('button',{name:'Open admin menu'});
 toggle.focus();fireEvent.click(toggle);
 expect(toggle).toHaveAttribute('aria-expanded','true');
 fireEvent.keyDown(document,{key:'Escape'});
 expect(toggle).toHaveAttribute('aria-expanded','false');
 expect(toggle).toHaveFocus();
});
it('closes the expanded admin menu when switching to the desktop breakpoint',async()=>{
 let changed;
 const media={matches:false,addEventListener:vi.fn((_,listener)=>{changed=listener;}),removeEventListener:vi.fn()};
 vi.stubGlobal('matchMedia',vi.fn(()=>media));
 try {
  show('/admin');await screen.findByRole('heading',{name:'Your club workspace.'});
  const toggle=screen.getByRole('button',{name:'Open admin menu'});
  fireEvent.click(toggle);expect(toggle).toHaveAttribute('aria-expanded','true');
  act(()=>{media.matches=true;changed();});
  expect(toggle).toHaveAttribute('aria-expanded','false');
 } finally {vi.unstubAllGlobals();}
});
it('selects chart data by touch or keyboard without shrinking the axis labels into the plot',async()=>{
 const currentDate=new Date();
 const previousDate=new Date(currentDate);previousDate.setDate(previousDate.getDate()-1);
 const days=[{_id:previousDate.toISOString().slice(0,10),views:3},{_id:currentDate.toISOString().slice(0,10),views:7}];
 const fallback=api.getMockImplementation();
 api.mockImplementation(async(path,options)=>path==='/admin/analytics'?{days,growth:[],pages:[],mail:{queued:0,failed:0}}:fallback(path,options));
 show('/admin');const chart=await screen.findByRole('img',{name:'Daily page views chart'});
 expect(chart.querySelector('text')).toBeNull();
 const points=within(screen.getByRole('group',{name:'Chart data points'}));
 fireEvent.click(points.getByRole('button',{name:`${days[0]._id}: 3`}));
 expect(screen.getByRole('status')).toHaveTextContent('3');
 expect(screen.getByRole('status')).toHaveTextContent(days[0]._id);
 fireEvent.focus(points.getByRole('button',{name:`${days[1]._id}: 7`}));
 expect(screen.getByRole('status')).toHaveTextContent('7');
 expect(screen.getByRole('status')).toHaveTextContent(days[1]._id);
});
it('switches application details and keeps the decision bound to the chosen applicant',async()=>{
 show('/admin/members');await screen.findByRole('heading',{name:'First Applicant'});fireEvent.click(screen.getByRole('button',{name:/Second Applicant/}));expect(screen.getByRole('heading',{name:'Second Applicant'})).toBeVisible();fireEvent.change(screen.getByLabelText('Application status'),{target:{value:'rejected'}});fireEvent.click(screen.getByRole('button',{name:'Save review'}));await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/applications/b',expect.objectContaining({method:'PATCH',body:expect.objectContaining({status:'rejected'})})));
});
it('recovers an empty application search by clearing both search and status filters',async()=>{
 show('/admin/members');await screen.findByRole('heading',{name:'First Applicant'});
 fireEvent.click(screen.getByRole('button',{name:/^Pending/}));
 const search=screen.getByRole('searchbox',{name:'Search applications'});
 fireEvent.change(search,{target:{value:'unknown applicant'}});
 expect(screen.getByRole('heading',{name:'No applications match your search.'})).toBeVisible();
 fireEvent.click(screen.getByRole('button',{name:'Reset filters'}));
 expect(search).toHaveValue('');
 expect(screen.getByRole('button',{name:/Second Applicant/})).toBeVisible();
 expect(screen.getByRole('heading',{name:'First Applicant'})).toBeVisible();
});
it('clears an empty workspace search and restores the navigation choices',async()=>{
 show('/admin');await screen.findByRole('heading',{name:'Your club workspace.'});
 await waitFor(()=>{fireEvent.keyDown(document,{key:'k',ctrlKey:true});expect(screen.getByRole('dialog')).toBeVisible();});
 const dialog=within(screen.getByRole('dialog'));
 const search=dialog.getByRole('searchbox',{name:'Search workspace'});
 fireEvent.change(search,{target:{value:'unknown workspace entry'}});
 expect(dialog.getByRole('heading',{name:'No results found.'})).toBeVisible();
 fireEvent.click(dialog.getByRole('button',{name:'Clear search'}));
 expect(search).toHaveValue('');
 expect(dialog.getByRole('link',{name:'Overview'})).toBeVisible();
 expect(dialog.queryByRole('heading',{name:'No results found.'})).not.toBeInTheDocument();
});
it('starts a new lesson from a course card without leaving Courses',async()=>{
 lessons=[];show('/admin/courses');
 fireEvent.click(await screen.findByRole('button',{name:`Manage lessons for ${course.title}`}));
 const empty=await screen.findByRole('region',{name:'No lessons yet.'});
 fireEvent.click(within(empty).getByRole('button',{name:'New lesson'}));
 expect(screen.getByRole('heading',{name:'Create a lesson'})).toBeVisible();
 expect(screen.getByLabelText('Lesson title')).toHaveValue('');
});
it('previews lesson edits and saves the draft with its revision without publishing',async()=>{
 show('/admin/courses');fireEvent.click(await screen.findByRole('button',{name:`Manage lessons for ${course.title}`}));fireEvent.click(await screen.findByRole('button',{name:/First reading/}));fireEvent.change(screen.getByLabelText('Lesson title'),{target:{value:'Updated reading'}});fireEvent.change(screen.getByLabelText('Lesson text'),{target:{value:'New draft content'}});fireEvent.click(screen.getByRole('button',{name:'Preview'}));const frame=screen.getByTitle('Desktop lessons website preview');const previewPost=vi.spyOn(frame.contentWindow,'postMessage');fireEvent.load(frame);expect(previewPost).toHaveBeenCalledWith(expect.objectContaining({resource:'lessons',entry:expect.objectContaining({title:'Updated reading',body:'New draft content'})}),window.location.origin);fireEvent.click(screen.getByRole('button',{name:'Save lesson'}));await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/courses/learning/lessons/lesson',expect.objectContaining({method:'PATCH',body:expect.objectContaining({title:'Updated reading',body:'New draft content',revision:4})})));expect(post).not.toHaveBeenCalled();
});

it('renames the lesson destination to Courses and redirects its old address',async()=>{
 show('/admin/learning');
 expect(await screen.findByRole('heading',{name:course.title})).toBeVisible();
 expect(within(screen.getByRole('navigation',{name:'Admin navigation'})).getByRole('link',{name:'Courses'})).toHaveAttribute('href','/admin/courses');
 expect(screen.queryByRole('link',{name:'Course lessons'})).not.toBeInTheDocument();
 expect(screen.queryByRole('heading',{name:event.title})).not.toBeInTheDocument();
});

it.each([['programmes','event','events'],['programmes','webinar','webinars'],['courses','course','courses']])('creates a %s %s with the correct fixed type',async(view,label,kind)=>{
 show(`/admin/${view}`);
 fireEvent.click(await screen.findByRole('button',{name:`Add ${label}`}));
 const dialog=within(screen.getByRole('dialog'));
 expect(dialog.getByLabelText('Programme type')).toHaveValue(kind);
 expect(dialog.getByLabelText('Programme type')).toBeDisabled();
 expect(dialog.getAllByRole('option').filter(option=>['Event','Webinar','Course'].includes(option.textContent))).toHaveLength(1);
 fireEvent.change(dialog.getByLabelText('Title'),{target:{value:`New ${label}`}});
 fireEvent.change(dialog.getByLabelText('Description'),{target:{value:'An invitation from the club.'}});
 if(kind!=='courses'){
  fireEvent.change(dialog.getByLabelText('Date'),{target:{value:'2026-12-15'}});
  fireEvent.change(dialog.getByLabelText('Time'),{target:{value:'15:00'}});
 }
 fireEvent.click(dialog.getByRole('button',{name:'Save draft'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/programmes',expect.objectContaining({method:'POST',body:expect.objectContaining({data:expect.objectContaining({kind,title:`New ${label}`})})})));
});

it('publishes and deletes courses through the existing programme resource with its revision',async()=>{
 const confirm=vi.spyOn(window,'confirm').mockReturnValue(true);
 show('/admin/courses');
 const actions=within(await screen.findByRole('group',{name:`Actions for ${course.title}`}));
 fireEvent.click(actions.getByRole('button',{name:'Publish'}));
 await waitFor(()=>expect(post).toHaveBeenCalledWith('/admin/content/programmes/course/publish',{revision:2}));
 await waitFor(()=>expect(actions.getByRole('button',{name:`Delete ${course.title}`})).toBeEnabled());
 fireEvent.click(actions.getByRole('button',{name:`Delete ${course.title}`}));
 expect(confirm).toHaveBeenCalled();
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/programmes/course',{method:'DELETE'}));
});
it('uploads a private course material with the selected purpose',async()=>{
 show('/admin/courses');await screen.findByRole('heading',{name:'Course materials'});const file=new File(['PDF contents'],'Notes.pdf',{type:'application/pdf'});fireEvent.change(screen.getByLabelText('Upload course material'),{target:{files:[file]}});await waitFor(()=>expect(post).toHaveBeenCalledWith('/admin/files',expect.any(FormData)));expect(post.mock.calls.at(-1)[1].get('purpose')).toBe('material');expect(post.mock.calls.at(-1)[1].get('file')).toBe(file);
});

it('removes Media library from navigation and redirects the old route to Courses',async()=>{
 show('/admin/files');await screen.findByRole('heading',{name:'Course materials'});
 expect(screen.queryByRole('link',{name:'Media library'})).not.toBeInTheDocument();
 expect(within(screen.getByRole('navigation',{name:'Admin navigation'})).getByRole('link',{name:'Courses',exact:true})).toHaveAttribute('aria-current','page');
 expect(screen.getByText('Reading.pdf')).toBeVisible();
});

it('saves member profile handles as usable social URLs and sends them to the live preview',async()=>{
 show('/admin/teams');fireEvent.click(await screen.findByRole('button',{name:'Edit Executive Committee'}));
 const frame=within(screen.getByRole('dialog')).getByTitle('Desktop teams website preview');const preview=vi.spyOn(frame.contentWindow,'postMessage');
 fireEvent.change(screen.getByRole('textbox',{name:/LinkedIn profile/}),{target:{value:'club-member'}});
 fireEvent.change(screen.getByRole('textbox',{name:/GitHub profile/}),{target:{value:'@club-dev'}});
 expect(preview).toHaveBeenLastCalledWith(expect.objectContaining({entry:expect.objectContaining({members:[expect.objectContaining({linkedin:'club-member',github:'@club-dev'})]})}),window.location.origin);
 fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/teams/team',expect.objectContaining({method:'PATCH',body:expect.objectContaining({data:expect.objectContaining({members:[expect.objectContaining({linkedin:'https://www.linkedin.com/in/club-member',github:'https://github.com/club-dev'})]})})})));
});
it('allows account approval before verification while explaining the email requirement',async()=>{show('/admin/access');await screen.findByRole('heading',{name:'New Admin'});expect(screen.getByRole('button',{name:'Approve'})).toBeEnabled();expect(screen.getByText(/Workspace access will remain locked until the email is verified/)).toBeVisible();});
it('uploads a team member photo and includes its stored address in the saved draft',async()=>{
 post.mockResolvedValue({url:'/api/assets/member-photo'});
 show('/admin/teams');fireEvent.click(await screen.findByRole('button',{name:'Edit Executive Committee'}));
 const file=new File(['image'],'member.png',{type:'image/png'});
 fireEvent.change(screen.getByLabelText('Upload photo for team member'),{target:{files:[file]}});
 await waitFor(()=>expect(screen.getByAltText('Photo for Team Member preview')).toHaveAttribute('src','/api/assets/member-photo'));
 fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/teams/team',expect.objectContaining({method:'PATCH',body:expect.objectContaining({data:expect.objectContaining({members:[expect.objectContaining({id:'member',image:'/api/assets/member-photo'})]})})})));
});

it('edits gallery artwork and captions through the existing image record and revision',async()=>{
 show('/admin/gallery');fireEvent.click(await screen.findByRole('button',{name:'Edit Together at campus'}));
 const dialog=within(screen.getByRole('dialog'));
 expect(dialog.queryByRole('button',{name:'Preview Together at campus'})).not.toBeInTheDocument();
 fireEvent.change(dialog.getByLabelText('Title'),{target:{value:'A shared campus moment'}});
 fireEvent.change(dialog.getByLabelText('Category'),{target:{value:'Community'}});
 fireEvent.change(dialog.getByLabelText('Image description (alt text)'),{target:{value:'Members together at campus'}});
 fireEvent.change(dialog.getByLabelText('Image online image link'),{target:{value:'https://images.example.com/community.jpg'}});
 fireEvent.click(dialog.getByLabelText('Poster artwork'));
 fireEvent.click(dialog.getByRole('button',{name:'Save draft'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/gallery/photo',expect.objectContaining({method:'PATCH',body:expect.objectContaining({revision:1,data:expect.objectContaining({id:'photo',title:'A shared campus moment',category:'Community',image:'https://images.example.com/community.jpg',poster:true,alt:'Members together at campus'})})})));
});

it('keeps edited team roles, departments and names synchronized with the draft preview and save',async()=>{
 show('/admin/teams');fireEvent.click(await screen.findByRole('button',{name:'Edit Executive Committee'}));
 const dialog=within(screen.getByRole('dialog'));
 const frame=dialog.getByTitle('Desktop teams website preview'),send=vi.spyOn(frame.contentWindow,'postMessage');
 fireEvent.change(dialog.getByLabelText(/^name$/i),{target:{value:'Updated Member'}});
 fireEvent.change(dialog.getByLabelText(/^role$/i),{target:{value:'Coordinator'}});
 fireEvent.change(dialog.getByLabelText(/^department$/i),{target:{value:'Architecture'}});
 expect(send).toHaveBeenLastCalledWith(expect.objectContaining({resource:'teams',entry:expect.objectContaining({id:'committee',members:[expect.objectContaining({id:'member',name:'Updated Member',role:'Coordinator',department:'Architecture'})]})}),window.location.origin);
 fireEvent.click(dialog.getByRole('button',{name:'Save draft'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/teams/team',expect.objectContaining({method:'PATCH',body:expect.objectContaining({revision:1,data:expect.objectContaining({members:[expect.objectContaining({id:'member',name:'Updated Member',role:'Coordinator',department:'Architecture'})]})})})));
});

it.each([['gallery','Together at campus','photo'],['teams','Executive Committee','team']])('publishes and deletes %s entries using the correct content resource',async(resource,title,id)=>{
 vi.spyOn(window,'confirm').mockReturnValue(true);
 show(`/admin/${resource}`);
 const actions=within(await screen.findByRole('group',{name:`Actions for ${title}`}));
 fireEvent.click(actions.getByRole('button',{name:'Publish'}));
 await waitFor(()=>expect(post).toHaveBeenCalledWith(`/admin/content/${resource}/${id}/publish`,{revision:1}));
 await waitFor(()=>expect(actions.getByRole('button',{name:`Delete ${title}`})).toBeEnabled());
 fireEvent.click(actions.getByRole('button',{name:`Delete ${title}`}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith(`/admin/content/${resource}/${id}`,{method:'DELETE'}));
});
it.each(['pending','active'])('refreshes shared authentication after email verification while preserving %s access',async status=>{
 const fallback=api.getMockImplementation();let current={...profile,status,emailVerified:false};
 api.mockImplementation((path,options)=>path==='/auth/me'?Promise.resolve({profile:current}):path==='/auth/verification-status'?Promise.resolve({required:true,expiresAt:new Date(Date.now()+600000).toISOString(),resendAvailableAt:null,lockedUntil:null}):fallback(path,options));
 post.mockImplementation(async path=>{if(path==='/auth/verify-code'){current={...current,emailVerified:true};return {profile:current};}return {};});
 const acceptSession=vi.fn();
 render(<AuthContext.Provider value={{acceptSession,signOut:vi.fn()}}><MemoryRouter initialEntries={['/admin']}><Routes><Route path='/admin/*' element={<AdminWorkspace/>}/></Routes></MemoryRouter></AuthContext.Provider>);
 const input=await screen.findByLabelText('Verification code');await waitFor(()=>expect(input).toBeEnabled());
 expect(api.mock.calls.some(([path])=>path==='/admin/workspace')).toBe(false);
 fireEvent.change(input,{target:{value:'012345'}});fireEvent.click(screen.getByRole('button',{name:'Verify email'}));
 await waitFor(()=>expect(acceptSession).toHaveBeenCalledWith(expect.objectContaining({emailVerified:true,status})));
 if(status==='active')expect(await screen.findByRole('heading',{name:'Your club workspace.'})).toBeVisible();
 else {
  expect(await screen.findByText('Your email is verified. The club will review your request before you can open the admin workspace.')).toBeVisible();
  expect(screen.queryByLabelText('Verification code')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Refresh status'})).toBeEnabled();
  expect(api.mock.calls.some(([path])=>path==='/admin/workspace')).toBe(false);
 }
});
