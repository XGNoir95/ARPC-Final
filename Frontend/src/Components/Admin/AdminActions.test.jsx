import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminApplications from './AdminApplications';
import AdminContentLibrary from './AdminContentLibrary';
import AdminContentEditor from './AdminContentEditor';
import AdminLessons from './AdminLessons';
import { api, post } from '../../utils/api';

vi.mock('../../utils/api',()=>({api:vi.fn(),post:vi.fn()}));
const run=vi.fn(action=>action());
const application={_id:'application',type:'membership',details:{fullName:'Club Applicant',email:'applicant@example.test'},status:'approved',paymentStatus:'verified',notes:'Reviewed',revision:3};
const course={id:'course',title:'Campus reading'};
const snapshot={title:'First lesson',body:'Read and reflect.',videoUrl:'',order:0,materials:[]};
const lesson={...snapshot,_id:'lesson',revision:3,published:true,publishedData:snapshot};
const programme={_id:'programme',id:'gathering',kind:'events',title:'Campus gathering',description:'Meet the club.',date:'2026-12-01',time:'15:00',image:'/logo.jpg',revision:2,live:true,hasChanges:false};
const show=element=>render(<MemoryRouter>{element}</MemoryRouter>);

beforeEach(()=>{vi.clearAllMocks();api.mockResolvedValue([]);post.mockResolvedValue({});});

it('does not send an unchanged application review, including whitespace-only note edits',()=>{
  show(<AdminApplications view="members" applications={[application]} programmes={[]} run={run}/>);
  const save=screen.getByRole('button',{name:'Save review'});
  expect(save).toBeDisabled();
  expect(save).toHaveAccessibleDescription(/review is up to date/i);
  fireEvent.change(screen.getByLabelText('Internal review notes'),{target:{value:'  Reviewed  '}});
  expect(save).toBeDisabled();
  fireEvent.submit(save.closest('form'));
  expect(run).not.toHaveBeenCalled();
  expect(api).not.toHaveBeenCalled();
});

it('permits a notes-only review without requiring another approval action',async()=>{
  show(<AdminApplications view="members" applications={[application]} programmes={[]} run={run}/>);
  fireEvent.change(screen.getByLabelText('Internal review notes'),{target:{value:'Verified with the committee.'}});
  fireEvent.click(screen.getByRole('button',{name:'Save review'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/applications/application',{method:'PATCH',body:{status:'approved',paymentStatus:'verified',notes:'Verified with the committee.',revision:3}}));
});

it('explains and enforces payment verification before membership approval',()=>{
  show(<AdminApplications view="members" applications={[{...application,status:'pending',paymentStatus:'pending'}]} programmes={[]} run={run}/>);
  fireEvent.change(screen.getByLabelText('Application status'),{target:{value:'approved'}});
  const save=screen.getByRole('button',{name:'Save review'});
  expect(save).toBeDisabled();
  expect(save).toHaveAccessibleDescription('Verify the registration payment before approving this membership.');
  fireEvent.submit(save.closest('form'));
  expect(api).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Payment verification'),{target:{value:'verified'}});
  expect(save).toBeEnabled();
  fireEvent.click(save);
  expect(api).toHaveBeenCalledWith('/admin/applications/application',expect.objectContaining({body:expect.objectContaining({status:'approved',paymentStatus:'verified'})}));
});

it('does not offer to publish the same live content again',()=>{
  const onPublish=vi.fn();
  show(<AdminContentLibrary resource="gallery" entries={[programme]} onPublish={onPublish}/>);
  const published=screen.getByRole('button',{name:'Published'});
  expect(published).toBeDisabled();
  expect(published).toHaveAccessibleDescription('The website already shows this version.');
  fireEvent.click(published);
  expect(onPublish).not.toHaveBeenCalled();
  expect(screen.getByRole('button',{name:'Unpublish'})).toBeEnabled();
});

it('allows publishing genuine content edits while a previous version is live',()=>{
  const onPublish=vi.fn();
  show(<AdminContentLibrary resource="gallery" entries={[{...programme,hasChanges:true}]} onPublish={onPublish}/>);
  fireEvent.click(screen.getByRole('button',{name:'Publish changes'}));
  expect(onPublish).toHaveBeenCalledWith(expect.objectContaining({hasChanges:true}));
});

it('does not submit an unchanged content draft and re-disables saving when edits are restored',()=>{
  show(<AdminContentEditor resource="programmes" item={programme} onClose={vi.fn()} onSaved={vi.fn()}/>);
  const save=screen.getByRole('button',{name:'Save draft'});
  expect(save).toBeDisabled();
  expect(save).toHaveAccessibleDescription(/draft is up to date/i);
  fireEvent.submit(save.closest('form'));
  expect(api).not.toHaveBeenCalled();
  const title=screen.getByLabelText('Title');
  fireEvent.change(title,{target:{value:'Updated gathering'}});
  expect(save).toBeEnabled();
  fireEvent.change(title,{target:{value:programme.title}});
  expect(save).toBeDisabled();
});

it('recognises equivalent numeric fields and takeaway whitespace as unchanged',()=>{
  show(<AdminContentEditor resource="programmes" item={{...programme,kind:'courses',fee:100,takeaways:['First point','Second point']}} onClose={vi.fn()} onSaved={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Course fee (BDT)'),{target:{value:'100.00'}});
  fireEvent.change(screen.getByLabelText('Takeaways (one per line)'),{target:{value:' First point \n\nSecond point '}});
  expect(screen.getByRole('button',{name:'Save draft'})).toBeDisabled();
});

it.each([
  ['gallery',{title:'Campus photo',description:'Our community.',category:'Campus',alt:'Members together',image:'/logo.jpg'}],
  ['teams',{label:'Executive committee',description:'The club team.',members:[{id:'member',name:'Club Member',role:'President',department:'CSE',image:'/logo.jpg'}]}],
  ['sponsors',{name:'Campus partner',src:'/logo.jpg',wide:true}],
  ['home',{id:'hero',title:'Welcome to ARPC',description:'A place for our community.',image:'/logo.jpg'}],
])('recognises an unchanged %s draft without an unnecessary save', (resource,item)=>{
  show(<AdminContentEditor resource={resource} item={{...item,_id:'entry',revision:2}} onClose={vi.fn()} onSaved={vi.fn()}/>);
  const save=screen.getByRole('button',{name:'Save draft'});
  expect(save).toBeDisabled();
  fireEvent.submit(save.closest('form'));
  expect(api).not.toHaveBeenCalled();
});

it('recognises an online image-link change in an existing draft',()=>{
  show(<AdminContentEditor resource="programmes" item={{...programme,image:'https://images.example.com/original.jpg'}} onClose={vi.fn()} onSaved={vi.fn()}/>);
  const image=screen.getByLabelText('Image online image link');
  fireEvent.change(image,{target:{value:'https://images.example.com/updated-photo.jpg'}});
  expect(screen.getByRole('button',{name:'Save draft'})).toBeEnabled();
  fireEvent.change(image,{target:{value:'https://images.example.com/original.jpg'}});
  expect(screen.getByRole('button',{name:'Save draft'})).toBeDisabled();
});

it('keeps unchanged lesson publication and draft saving disabled',async()=>{
  api.mockResolvedValue([lesson]);
  show(<AdminLessons courses={[course]} files={[]} run={run} reloadFiles={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Course'),{target:{value:'course'}});
  const published=await screen.findByRole('button',{name:'Published'});
  expect(published).toBeDisabled();
  expect(published).toHaveAccessibleDescription('Learners already see this version.');
  fireEvent.click(published);
  expect(post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:/First lesson/}));
  const save=screen.getByRole('button',{name:'Save lesson'});
  expect(save).toBeDisabled();
  fireEvent.submit(save.closest('form'));
  expect(run).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/^Display order/),{target:{value:'1'}});
  expect(save).toBeEnabled();
  fireEvent.change(screen.getByLabelText(/^Display order/),{target:{value:'0'}});
  expect(save).toBeDisabled();
});

it('permits publishing a lesson with a changed draft and preserves its revision',async()=>{
  api.mockResolvedValue([{...lesson,title:'New draft title'}]);
  show(<AdminLessons courses={[course]} files={[]} run={run} reloadFiles={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Course'),{target:{value:'course'}});
  fireEvent.click(await screen.findByRole('button',{name:'Publish changes'}));
  await waitFor(()=>expect(post).toHaveBeenCalledWith('/admin/courses/course/lessons/lesson/publish',{revision:3}));
});
