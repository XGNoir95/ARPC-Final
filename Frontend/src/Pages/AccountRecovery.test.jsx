import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import AccountRecovery from './AccountRecovery';
import { post } from '../utils/api';
vi.mock('../utils/api',()=>({post:vi.fn()}));beforeEach(()=>{post.mockReset();post.mockResolvedValue({message:'Email queued.'});});
it('submits reset requests without revealing account existence',async()=>{render(<MemoryRouter><AccountRecovery/></MemoryRouter>);fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'admin@example.com'}});fireEvent.click(screen.getByRole('button',{name:'Send reset link'}));await waitFor(()=>expect(post).toHaveBeenCalledWith('/auth/forgot-password',{email:'admin@example.com'}));});
it('consumes email verification once during StrictMode effect replay',async()=>{render(<StrictMode><MemoryRouter initialEntries={['/verify-email?token=one-time']}><AccountRecovery verify/></MemoryRouter></StrictMode>);await screen.findByRole('heading',{name:'Your email is verified.'});expect(post).toHaveBeenCalledTimes(1);expect(post).toHaveBeenCalledWith('/auth/verify',{token:'one-time'});});

it.each([['/verify-email',true,'This verification link is incomplete.'],['/reset-password',false,'This reset link is incomplete.']])('explains a missing token at %s',async(path,verify,title)=>{
  render(<MemoryRouter initialEntries={[path]}><AccountRecovery verify={verify}/></MemoryRouter>);
  expect(screen.getByRole('heading',{name:title})).toBeVisible();
  expect(post).not.toHaveBeenCalled();
});
it('replaces an expired reset form with a clear request for a new link',async()=>{
  post.mockRejectedValue(Object.assign(new Error('Token MongoQuery detail'),{status:400}));
  render(<MemoryRouter initialEntries={['/reset-password?token=expired']}><AccountRecovery/></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('New password'),{target:{value:'a-long-new-password'}});
  fireEvent.change(screen.getByLabelText('Confirm new password'),{target:{value:'a-long-new-password'}});
  fireEvent.click(screen.getByRole('button',{name:'Change password'}));
  expect(await screen.findByRole('heading',{name:'This reset link is no longer available.'})).toBeVisible();
  expect(screen.getByRole('link',{name:'Request a new reset link'})).toHaveAttribute('href','/forgot-password');
  expect(screen.queryByText(/MongoQuery/)).not.toBeInTheDocument();
});
it('keeps recovery failures distinct from a successful email request',async()=>{
  post.mockRejectedValue(new Error('SMTP /secret/password failed'));
  render(<MemoryRouter><AccountRecovery/></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'admin@example.com'}});
  fireEvent.click(screen.getByRole('button',{name:'Send reset link'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t send your request. Please try again.');
  expect(screen.getByLabelText('Email address')).toHaveValue('admin@example.com');
  expect(screen.queryByText(/SMTP|secret/)).not.toBeInTheDocument();
});
