import { expect, it } from 'vitest';
import { requestMessage, userMessage } from './userMessages';

it.each([400,401,403,404,409,410,413,422,429,500,502,503])('does not expose arbitrary server detail for HTTP %s',status=>{
  const message=requestMessage({path:'/applications',status,serverMessage:'MongoError /private/db password=secret stack trace'});
  expect(message).toBeTruthy();expect(message).not.toMatch(/MongoError|private|password=|stack trace/);
});
it('distinguishes missing connectivity, failed credentials and a slow request',()=>{
  expect(requestMessage({kind:'offline'})).toMatch(/offline/);
  expect(requestMessage({path:'/auth/login',status:401})).toBe('Email or password is incorrect.');
  expect(requestMessage({path:'/auth/reset-password',status:400})).toMatch(/link has expired/);
  expect(requestMessage({path:'/applications',status:409})).toMatch(/application.*already exists/);
  expect(requestMessage({path:'/auth/verify-code',status:400})).toBe('This code is incorrect or has expired. Check the latest email or request a new code.');
});
it('gives throttled requests a usable delay without forwarding server messages',()=>{
  expect(requestMessage({status:429,retryAfterSeconds:21})).toBe('Too many attempts. Try again in 21 seconds.');
  expect(requestMessage({status:429,retryAfterSeconds:90})).toContain('2 minutes');
  expect(requestMessage({status:429,retryAfterSeconds:1})).toContain('1 second.');
  expect(requestMessage({status:429,retryAfterSeconds:60})).toContain('1 minute.');
});

it('does not describe every forbidden admin action as a pending approval',()=>{
  expect(requestMessage({path:'/admin/users',status:403})).toMatch(/permission/);
  expect(requestMessage({path:'/admin/users',status:403})).not.toMatch(/approval is required/);
});
it('only displays authored errors or known status guidance',()=>{
  expect(userMessage(new Error('secret detail'),'Try again.')).toBe('Try again.');
  expect(userMessage({userFacing:true,message:'Use another email.'})).toBe('Use another email.');
});

it('explains account and invitation conflicts using known error codes without exposing server text',()=>{
  const common={status:409,serverMessage:'private database query'};
  expect(requestMessage({...common,path:'/admin/invitations',code:'ACCOUNT_EXISTS'})).toMatch(/Open Admin access/);
  expect(requestMessage({...common,path:'/admin/invitations',code:'INVITATION_PENDING'})).toMatch(/valid invitation/);
  expect(requestMessage({...common,path:'/admin/users/record',code:'ACCOUNT_CHANGED'})).toMatch(/current access/);
  expect(requestMessage({...common,path:'/admin/users/record',code:'INVALID_ACCOUNT_ACTION'})).toMatch(/no longer available/);
  expect(requestMessage({...common,path:'/admin/invitations',code:'unknown'})).not.toMatch(/private database/);
});
