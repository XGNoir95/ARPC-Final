import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import Learning from './Learning';
import { api, post } from '../utils/api';
import { downloadFile } from '../utils/download';
vi.mock('../utils/download',()=>({downloadFile:vi.fn()}));
vi.mock('../utils/api',()=>({api:vi.fn(),post:vi.fn(),API_BASE:'/api'}));
beforeEach(()=>{api.mockImplementation(async path=>path==='/learning'?{learner:{fullName:'Learner',email:'student@example.com'},courses:[{id:'course',title:'A course'}]}:{lessons:[{_id:'lesson',title:'Lesson one',body:'Published learning text',videoUrl:'https://example.com/video',materials:['file-1']}],completed:[]});post.mockResolvedValue({completed:['lesson']});});
it('loads approved courses, marks progress and exposes protected certificate/material links',async()=>{
  render(<MemoryRouter><Learning/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'A course'}));await screen.findByRole('heading',{name:'Lesson one'});
  expect(screen.getByRole('link',{name:'Download resource 1'})).toHaveAttribute('href','/api/learning/course/materials/file-1');expect(screen.queryByRole('link',{name:'Download certificate'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Mark lesson complete'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/learning/course/complete/lesson',{completed:true}));expect(await screen.findByRole('link',{name:'Download certificate'})).toHaveAttribute('href','/api/learning/course/certificate');
});
it('requests a new email link when the learner session is missing',async()=>{
  api.mockRejectedValue(Object.assign(new Error('Open your course access email.'),{status:401}));post.mockResolvedValue({message:'An access email has been queued.'});render(<MemoryRouter><Learning/></MemoryRouter>);
  await screen.findByText('Your session has ended. Please sign in again.');fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'student@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Email my access link'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/learning/access',{email:'student@example.com'}));expect(await screen.findByText(/If you have an approved course enrollment/)).toBeVisible();
});

it('explains an approved course with no published lessons',async()=>{
  const original=api.getMockImplementation();api.mockImplementation(path=>path==='/learning/course'?Promise.resolve({lessons:[],completed:[]}):original(path));
  render(<MemoryRouter><Learning/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'A course'}));
  expect(await screen.findByRole('heading',{name:'No lessons available yet.'})).toBeVisible();
  expect(screen.queryByRole('button',{name:'Mark lesson complete'})).not.toBeInTheDocument();
});
it('can retry a failed lesson load without losing course access',async()=>{
  const original=api.getMockImplementation();let failed=true;api.mockImplementation(path=>path==='/learning/course'&&failed?Promise.reject(new Error('private failure')):original(path));
  render(<MemoryRouter><Learning/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'A course'}));
  expect(await screen.findByRole('heading',{name:'We couldn’t load these lessons.'})).toBeVisible();
  expect(screen.queryByText('private failure')).not.toBeInTheDocument();
  failed=false;fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  expect(await screen.findByRole('heading',{name:'Lesson one'})).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'A course'}));
  expect(screen.getByRole('heading',{name:'Lesson one'})).toBeVisible();
});

it('keeps failed learning downloads inside the page with a useful message',async()=>{
  downloadFile.mockRejectedValue(Object.assign(new Error('This file is no longer available. Please contact the club.'),{userFacing:true,status:404}));
  render(<MemoryRouter><Learning/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'A course'}));
  fireEvent.click(await screen.findByRole('link',{name:'Download resource 1'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('This file is no longer available. Please contact the club.');
  expect(screen.getByRole('heading',{name:'Lesson one'})).toBeVisible();
  expect(downloadFile).toHaveBeenCalledWith('/learning/course/materials/file-1');
});

it('keeps course selection stable while a progress update is being saved',async()=>{
  const original=api.getMockImplementation();api.mockImplementation(path=>path==='/learning'?Promise.resolve({learner:{fullName:'Learner'},courses:[{id:'course',title:'A course'},{id:'other',title:'Another course'}]}):original(path));
  let finish;post.mockReturnValue(new Promise(resolve=>{finish=resolve;}));
  render(<MemoryRouter><Learning/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'A course'}));
  fireEvent.click(await screen.findByRole('button',{name:'Mark lesson complete'}));
  expect(screen.getByRole('button',{name:'Another course'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Another course'}));
  expect(api).not.toHaveBeenCalledWith('/learning/other');
  await act(async()=>finish({completed:['lesson']}));
  expect(screen.getByRole('button',{name:'Another course'})).not.toBeDisabled();
  expect(screen.getByRole('button',{name:'Mark incomplete'})).toBeVisible();
});

it('returns to the access form when a protected download reports an expired session',async()=>{
  downloadFile.mockRejectedValue(Object.assign(new Error('Your learning session has ended. Request a new access link to continue.'),{userFacing:true,status:401}));
  render(<MemoryRouter><Learning/></MemoryRouter>);fireEvent.click(await screen.findByRole('button',{name:'A course'}));
  fireEvent.click(await screen.findByRole('link',{name:'Download resource 1'}));
  expect(await screen.findByRole('heading',{name:'Return to your learning.'})).toBeVisible();
  expect(screen.getByText('Your learning session has ended. Request a new access link to continue.')).toBeVisible();
  expect(screen.queryByRole('heading',{name:'Lesson one'})).not.toBeInTheDocument();
});
