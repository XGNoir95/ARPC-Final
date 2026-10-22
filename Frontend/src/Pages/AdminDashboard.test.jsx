import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import AdminDashboard from "./AdminDashboard";
import { api, post } from "../utils/api";
vi.mock("../utils/api",()=>({api:vi.fn(),post:vi.fn(),API_BASE:'/api'}));
const profile={id:'admin',fullName:'Approved Admin',email:'admin@example.com',role:'admin',status:'active',emailVerified:true};
const item={_id:'record-1',id:'course-1',kind:'courses',title:'A course',description:'Course details',fee:0,takeaways:[],revision:1,live:false,coverTheme:'learning'};
let workspace;
const renderAdmin=(path='/admin')=>render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/*" element={<AdminDashboard/>}/><Route path="/login" element={<h1>Login destination</h1>}/></Routes></MemoryRouter>);
beforeEach(()=>{
 workspace={profile,programmes:[{...item}],gallery:[],teams:[],sponsors:[],home:[],emailConfigured:false};
 api.mockImplementation(async(path,options)=>{
  if(path==='/auth/me')return {profile};
  if(path==='/admin/workspace')return workspace;
  if(path==='/admin/applications'||path==='/admin/files'||path==='/admin/users')return [];
  if(path==='/admin/analytics')return {days:[],pages:[],growth:[],enrollmentByProgramme:[],applications:[],verifiedFees:0,mail:{queued:0,failed:0}};
  if(path==='/config')return {googleClientId:''};
  if(path.startsWith('/admin/content/')&&options){if(options.method==='PATCH')workspace.programmes=[{...options.body.data,revision:2}];return {};}
  return [];
 });post.mockResolvedValue({});
});
afterEach(()=>{cleanup();document.body.style.overflow='';});
it('redirects missing server sessions without trusting browser preview data',async()=>{
 sessionStorage.setItem('arpc-admin-preview-v1',JSON.stringify({profile}));
 api.mockRejectedValue(Object.assign(new Error('Please sign in.'),{status:401}));renderAdmin();
 expect(await screen.findByRole('heading',{name:'Login destination'})).toBeVisible();sessionStorage.clear();
});
it('keeps pending accounts outside the admin workspace',async()=>{
 api.mockImplementation(async()=>({profile:{...profile,status:'pending',emailVerified:false}}));renderAdmin();
 expect(await screen.findByRole('heading',{name:'Your account is awaiting access.'})).toBeVisible();
 expect(screen.queryByRole('navigation',{name:'Admin navigation'})).not.toBeInTheDocument();
});
it('does not describe an approved administrator as awaiting approval when a workspace request fails',async()=>{
 const original=api.getMockImplementation();api.mockImplementation((path,options)=>path==='/admin/workspace'?Promise.reject(Object.assign(new Error('Too many attempts. Try again in 21 seconds.'),{userFacing:true,status:429,retryAfterSeconds:21})):original(path,options));
 renderAdmin();expect(await screen.findByRole('heading',{name:'Your workspace could not be loaded.'})).toBeVisible();
 expect(await screen.findByText('Too many attempts. Try again in 21 seconds.')).toBeVisible();
 expect(screen.queryByRole('heading',{name:'Your account is awaiting access.'})).not.toBeInTheDocument();
});
it('edits a server draft using its revision and restores modal focus',async()=>{
 renderAdmin('/admin/courses');const trigger=await screen.findByRole('button',{name:'Edit A course'});trigger.focus();fireEvent.click(trigger);
 const dialog=screen.getByRole('dialog');fireEvent.change(within(dialog).getByLabelText('Title'),{target:{value:'Updated course'}});
 fireEvent.submit(dialog.querySelector('form'));await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
 expect(api).toHaveBeenCalledWith('/admin/content/programmes/record-1',expect.objectContaining({method:'PATCH',body:expect.objectContaining({revision:1,data:expect.objectContaining({title:'Updated course'})})}));
 expect(await screen.findByRole('heading',{name:'Updated course'})).toBeVisible();expect(document.body.style.overflow).toBe('');
});

it('confirms a saved draft separately from a failed workspace refresh without repeating the save',async()=>{
 const original=api.getMockImplementation();let saved=false;
 api.mockImplementation(async(path,options)=>{if(path==='/admin/workspace'&&saved)throw new Error('private refresh failure');const result=await original(path,options);if(path==='/admin/content/programmes/record-1'&&options?.method==='PATCH')saved=true;return result;});
 renderAdmin('/admin/courses');fireEvent.click(await screen.findByRole('button',{name:'Edit A course'}));
 fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('Title'),{target:{value:'Edited course'}});
 fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
 expect(await screen.findByRole('alert')).toHaveTextContent('Your draft was saved, but we could not refresh the workspace. Refresh before making another change.');
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(api.mock.calls.filter(([path,options])=>path==='/admin/content/programmes/record-1'&&options?.method==='PATCH')).toHaveLength(1);
 expect(screen.queryByText('private refresh failure')).not.toBeInTheDocument();
});
it('publishes, withdraws and deletes entries through the API',async()=>{
 workspace.programmes[0].live=true;workspace.programmes[0].hasChanges=true;renderAdmin('/admin/courses');await screen.findByRole('button',{name:'Publish changes'});
 fireEvent.click(screen.getByRole('button',{name:'Publish changes'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/admin/content/programmes/record-1/publish',{revision:1}));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Unpublish'})).not.toBeDisabled());fireEvent.click(screen.getByRole('button',{name:'Unpublish'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/admin/content/programmes/record-1/unpublish',{revision:1}));
 vi.spyOn(window,'confirm').mockReturnValue(true);await waitFor(()=>expect(screen.getByRole('button',{name:'Delete A course'})).not.toBeDisabled());fireEvent.click(screen.getByRole('button',{name:'Delete A course'}));await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/programmes/record-1',{method:'DELETE'}));
});
it('creates a course using a reusable folder cover',async()=>{
 renderAdmin('/admin/courses');fireEvent.click(await screen.findByRole('button',{name:'Add course'}));const d=screen.getByRole('dialog');
 expect(within(d).getByLabelText('Programme type')).toHaveValue('courses');expect(within(d).getByLabelText('Programme type')).toBeDisabled();fireEvent.change(within(d).getByLabelText('Title'),{target:{value:'New course'}});fireEvent.change(within(d).getByLabelText('Description'),{target:{value:'Description'}});fireEvent.click(within(d).getByRole('radio',{name:'Leadership'}));fireEvent.submit(d.querySelector('form'));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/programmes',expect.objectContaining({method:'POST',body:expect.objectContaining({data:expect.objectContaining({kind:'courses',coverTheme:'leadership'})})})));
});
it('shows real application data and preserves manual payment review',async()=>{
 const original=api.getMockImplementation();api.mockImplementation((path,options)=>path==='/admin/applications'?Promise.resolve([{_id:'application',type:'membership',details:{fullName:'Applicant',email:'applicant@example.com'},status:'pending',paymentStatus:'pending',payment:{method:'Cash',amount:100}}]):original(path,options));
 renderAdmin('/admin/members');await screen.findByRole('heading',{name:'Applicant'});fireEvent.change(screen.getByLabelText('Application status'),{target:{value:'approved'}});fireEvent.change(screen.getByLabelText('Payment verification'),{target:{value:'verified'}});fireEvent.click(screen.getByRole('button',{name:'Save review'}));
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/applications/application',expect.objectContaining({method:'PATCH',body:expect.objectContaining({status:'approved',paymentStatus:'verified'})})));
});
it('allows invitations but keeps approval controls for the superadmin',async()=>{
 renderAdmin('/admin/access');await screen.findByRole('heading',{name:'Invite an administrator'});expect(screen.getByText(/Only the superadmin can approve/)).toBeVisible();fireEvent.change(screen.getByRole('textbox',{name:'Invitation email'}),{target:{value:'next@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Send invitation'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/admin/invitations',{email:'next@example.com'}));
});
