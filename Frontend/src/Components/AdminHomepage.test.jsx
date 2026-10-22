import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminHomepage from './AdminHomepage';
import AdminContentEditor from './AdminContentEditor';
import AdminSponsors from './AdminSponsors';
import { api } from '../utils/api';

vi.mock('../utils/api',()=>({api:vi.fn(),post:vi.fn()}));
const show = element => render(<MemoryRouter>{element}</MemoryRouter>);
beforeEach(()=>{vi.clearAllMocks();api.mockResolvedValue({});});

it('presents Homepage sections in page order with no duplicate sponsor or arbitrary slot controls', () => {
  show(<AdminHomepage entries={[]} programmes={[]} onEdit={vi.fn()}/>);
  expect(screen.getAllByRole('heading',{level:2}).map(heading=>heading.textContent)).toEqual(['Hero','About us','Featured']);
  expect(screen.getByRole('button',{name:'Edit hero'})).toBeEnabled();
  expect(screen.getAllByRole('button',{name:/^Edit (About Us|Our Mission|Our Vision)$/})).toHaveLength(3);
  expect(screen.queryByRole('button',{name:'New draft'})).not.toBeInTheDocument();
  expect(screen.queryByText('Sponsors')).not.toBeInTheDocument();
  expect(screen.queryByText('3 of 8')).not.toBeInTheDocument();
});

it('selects About cards and keeps the Featured card selection synchronized with its website carousel', () => {
  const featured = { id: 'featured', title: 'Featured at ARPC', selections: [{ id: 'event', kind: 'events' }, { id: 'membership', kind: 'membership' }] };
  show(<AdminHomepage entries={[featured]} programmes={[{ id: 'event', kind: 'events', title: 'Club gathering', live: true }]} onEdit={vi.fn()}/>);
  const [aboutFrame, featuredFrame] = screen.getAllByTitle('Desktop home website preview');
  const aboutPost = vi.spyOn(aboutFrame.contentWindow, 'postMessage');
  const featuredPost = vi.spyOn(featuredFrame.contentWindow, 'postMessage');
  fireEvent.click(screen.getByRole('button', { name: 'Preview Our Mission' }));
  expect(aboutPost).toHaveBeenLastCalledWith(expect.objectContaining({ entry: expect.objectContaining({ id: 'our-mission' }) }), window.location.origin);
  const membership = screen.getByRole('button', { name: /^Preview featured item 2:/ });
  fireEvent.click(membership);
  expect(membership).toHaveAttribute('aria-pressed', 'true');
  expect(featuredPost).toHaveBeenLastCalledWith(expect.objectContaining({ index: 1 }), window.location.origin);
  const select = (source, index) => fireEvent(window, new MessageEvent('message', { source, origin: window.location.origin, data: { type: 'arpc:website-preview:select', index } }));
  select(window, 0);
  select(featuredFrame.contentWindow, 100);
  expect(membership).toHaveAttribute('aria-pressed', 'true');
  select(featuredFrame.contentWindow, 0);
  expect(screen.getByRole('button', { name: 'Preview featured item 1: Club gathering' })).toHaveAttribute('aria-pressed', 'true');
});

it('saves ordered hero images and deliberately blank per-image captions as a new section', async () => {
  const saved=vi.fn();
  show(<AdminContentEditor resource="home" item={{id:'hero'}} onClose={vi.fn()} onSaved={saved}/>);
  fireEvent.change(screen.getByLabelText('Photo 1 headline'),{target:{value:'Shared opening'}});
  fireEvent.change(screen.getByLabelText('Hero image 1 online image link'),{target:{value:'https://images.example.com/my-campus.jpg'}});
  fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
  await waitFor(()=>expect(api).toHaveBeenCalled());
  expect(api.mock.calls[0]).toEqual(['/admin/content/home',expect.objectContaining({method:'POST',body:expect.objectContaining({data:expect.objectContaining({id:'hero',slides:expect.arrayContaining([expect.objectContaining({image:'https://images.example.com/my-campus.jpg',title:'Shared opening'}),expect.objectContaining({title:''})])})})})]);
  expect(saved).toHaveBeenCalled();
});

it('edits every visible and expanded part of an About card', async () => {
  show(<AdminContentEditor resource="home" item={{id:'about-us',_id:'about',revision:3}} onClose={vi.fn()} onSaved={vi.fn()}/>);
  for(const [label,value] of [['Card heading','Our community'],['Card label','Meet ARPC'],['Short introduction','A new introduction'],['Full description','A full story'],['Button text','Browse photos']])fireEvent.change(screen.getByLabelText(label),{target:{value}});
  fireEvent.change(screen.getByLabelText('Button destination'),{target:{value:'/gallery'}});
  fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith('/admin/content/home/about',expect.objectContaining({body:expect.objectContaining({revision:3,data:expect.objectContaining({label:'Meet ARPC',summary:'A new introduction',description:'A full story',link:'/gallery',linkLabel:'Browse photos'})})})));
});

it('selects different programme types and membership without creating duplicate programme records', async () => {
  const programmes=[{id:'event',kind:'events',title:'Gathering',live:true},{id:'course',kind:'courses',title:'Course',live:true},{id:'private',kind:'webinars',title:'Private draft',live:false}];
  show(<AdminContentEditor resource="home" item={{id:'featured'}} programmes={programmes} onClose={vi.fn()} onSaved={vi.fn()}/>);
  fireEvent.click(screen.getByRole('radio',{name:/Choose specific items/}));
  fireEvent.click(screen.getByRole('checkbox',{name:'Feature Gathering'}));
  fireEvent.click(screen.getByRole('checkbox',{name:'Membership applications Invite students to join the club.'}));
  fireEvent.click(screen.getByRole('checkbox',{name:'Feature Course'}));
  expect(screen.queryByRole('checkbox',{name:'Feature Private draft'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Move featured item 3 up'}));
  fireEvent.click(screen.getByRole('button',{name:'Save draft'}));
  await waitFor(()=>expect(api).toHaveBeenCalled());
  expect(api.mock.calls[0][1].body.data.selections).toEqual([{id:'event',kind:'events'},{id:'course',kind:'courses'},{id:'membership',kind:'membership'}]);
});

it('prevents duplicate submissions and dismissal while a page draft is saving', async () => {
  let resolve;api.mockImplementation(()=>new Promise(done=>{resolve=done;}));const close=vi.fn();
  show(<AdminContentEditor resource="sponsors" item={{_id:'sponsor',id:'partner',revision:2,name:'Partner',src:'/logo.jpg'}} onClose={close} onSaved={vi.fn()}/>);
  fireEvent.change(screen.getByLabelText('Sponsor name'),{target:{value:'Updated Partner'}});
  const form=screen.getByRole('button',{name:'Save draft'}).closest('form');fireEvent.submit(form);fireEvent.submit(form);
  fireEvent.click(screen.getByRole('button',{name:'Close dialog'}));
  expect(api).toHaveBeenCalledTimes(1);expect(close).not.toHaveBeenCalled();
  await act(async()=>resolve({}));expect(close).toHaveBeenCalledTimes(1);
});

it('keeps four sponsor actions in the same professional order and enforces publication state', () => {
  const publish=vi.fn(),edit=vi.fn(),remove=vi.fn();const entry={_id:'sponsor',id:'partner',name:'A partner',src:'/logo.jpg',live:true,hasChanges:false};
  show(<AdminSponsors entries={[entry]} onNew={vi.fn()} onEdit={edit} onPublish={publish} onDelete={remove}/>);
  const actions=screen.getByLabelText('Actions for A partner');
  expect(within(actions).getAllByRole('button').map(button=>button.getAttribute('aria-label') || button.textContent)).toEqual(['Edit A partner','Published','Unpublish','Delete A partner']);
  expect(within(actions).getByRole('button',{name:'Published'})).toBeDisabled();
  fireEvent.click(within(actions).getByRole('button',{name:'Unpublish'}));expect(publish).toHaveBeenCalledWith(entry,true);
  fireEvent.click(within(actions).getByRole('button',{name:'Delete A partner'}));expect(remove).toHaveBeenCalledWith(entry);
});

it('keeps the sponsor preview in the tab and changes the reviewed draft without opening a dialog', () => {
  const entries = [
    { _id: 'one', id: 'one', name: 'Published partner', src: '/one.jpg', live: true },
    { _id: 'two', id: 'two', name: 'Draft partner', src: '/two.jpg', live: false },
    { _id: 'three', id: 'three', name: 'Unrelated private partner', src: '/three.jpg', live: false },
  ];
  show(<AdminSponsors entries={entries} onNew={vi.fn()} onEdit={vi.fn()} onPublish={vi.fn()} onDelete={vi.fn()}/>);
  const frame = screen.getByTitle('Desktop sponsors website preview');
  const post = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.click(screen.getByRole('heading', { name: 'Draft partner' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Preview Draft partner' })).toHaveAttribute('aria-pressed', 'true');
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ entry: entries[1], includeDraft: true, content: expect.objectContaining({ sponsors: [entries[0]] }) }), window.location.origin);
  fireEvent.click(screen.getByRole('img', { name: 'Published partner logo' }));
  expect(screen.getByRole('button', { name: 'Preview Published partner' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Preview Draft partner' }).closest('li'));
  expect(screen.getByRole('button', { name: 'Preview Draft partner' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search sponsors' }), { target: { value: 'no match' } });
  expect(screen.getByRole('heading', { name: 'No sponsors match these filters.' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByRole('button', { name: 'Preview Draft partner' })).toBeVisible();
});

it('keeps sponsor action buttons independent of card selection and locks selection while busy', () => {
  const entries = [
    { _id: 'first', id: 'first', name: 'First partner', src: '/first.jpg', live: true },
    { _id: 'second', id: 'second', name: 'Second partner', src: '/second.jpg', live: true, hasChanges: true },
  ];
  const onEdit = vi.fn(), onPublish = vi.fn(), onDelete = vi.fn();
  const props = { entries, onNew: vi.fn(), onEdit, onPublish, onDelete };
  const { rerender } = show(<AdminSponsors {...props}/>);
  const actions = within(screen.getByRole('group', { name: 'Actions for Second partner' }));
  fireEvent.click(actions.getByRole('button', { name: 'Edit Second partner' }));
  fireEvent.click(actions.getByRole('button', { name: 'Publish' }));
  fireEvent.click(actions.getByRole('button', { name: 'Unpublish' }));
  fireEvent.click(actions.getByRole('button', { name: 'Delete Second partner' }));
  expect(onEdit).toHaveBeenCalledExactlyOnceWith(entries[1]);
  expect(onPublish.mock.calls).toEqual([[entries[1]], [entries[1], true]]);
  expect(onDelete).toHaveBeenCalledExactlyOnceWith(entries[1]);
  expect(screen.getByRole('button', { name: 'Preview First partner' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Preview Second partner' })).toHaveAttribute('aria-pressed', 'false');
  rerender(<MemoryRouter><AdminSponsors {...props} busy/></MemoryRouter>);
  const second = screen.getByRole('button', { name: 'Preview Second partner' });
  expect(second).toBeDisabled();
  fireEvent.click(second.closest('li'));
  fireEvent.click(second);
  expect(screen.getByRole('button', { name: 'Preview First partner' })).toHaveAttribute('aria-pressed', 'true');
});

it('keeps an empty sponsor preview available and provides an action to add the first sponsor', () => {
  const add = vi.fn();
  show(<AdminSponsors entries={[]} onNew={add} onEdit={vi.fn()} onPublish={vi.fn()} onDelete={vi.fn()}/>);
  const frame = screen.getByTitle('Desktop sponsors website preview');
  const post = vi.spyOn(frame.contentWindow, 'postMessage');
  fireEvent.load(frame);
  expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ includeDraft: false, content: expect.objectContaining({ sponsors: [] }) }), window.location.origin);
  fireEvent.click(screen.getByRole('button', { name: 'Add first sponsor' }));
  expect(add).toHaveBeenCalledOnce();
});

it('keeps Featured management useful when there are no published programmes', () => {
  const edit = vi.fn();
  show(<AdminHomepage entries={[]} programmes={[{ id: 'private', title: 'Private programme', live: false }]} onEdit={edit}/>);
  const panel = within(screen.getByRole('region', { name: 'Featured management' }));
  expect(panel.getByRole('heading', { name: 'No featured items yet.' })).toBeVisible();
  expect(panel.queryByText('Private programme')).not.toBeInTheDocument();
  fireEvent.click(panel.getByRole('button', { name: 'Edit featured' }));
  expect(edit).toHaveBeenCalledWith(expect.objectContaining({ id: 'featured' }));
});

it('shows sponsor-specific preview content without a fictitious description field', () => {
  show(<AdminContentEditor resource="sponsors" item={{id:'partner',name:'Partner',src:'/logo.jpg',wide:true,_id:'sponsor',revision:1}} onClose={vi.fn()} onSaved={vi.fn()}/>);
  expect(screen.getByRole('radio',{name:/Wide/})).toBeChecked();
  expect(screen.getByText('Before publishing')).toBeVisible();
  expect(screen.queryByText('Your description will appear here as you write.')).not.toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Save draft'})).toBeDisabled();
});
