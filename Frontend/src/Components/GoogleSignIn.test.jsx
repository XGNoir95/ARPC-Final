import { act,cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import GoogleSignIn from './GoogleSignIn';
import { api } from '../utils/api';
import { ThemeContext } from '../contexts/ThemeContext';
vi.mock('../utils/api',()=>({api:vi.fn()}));
beforeEach(()=>{vi.stubGlobal('google',{accounts:{id:{initialize:vi.fn(),renderButton:vi.fn(el=>{const b=document.createElement('button');b.textContent='Official Google button';el.append(b);})}}});api.mockImplementation(async path=>path==='/config'?{googleClientId:'test-client'}:{nonce:'browser-challenge'});});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('uses the official dark Google button and redraws when the theme changes',async()=>{
 const {rerender}=render(<ThemeContext.Provider value={{theme:'dark'}}><GoogleSignIn onCredential={vi.fn()}/></ThemeContext.Provider>);
 await screen.findByRole('button',{name:'Official Google button'});
 expect(window.google.accounts.id.renderButton.mock.calls.at(-1)[1].theme).toBe('filled_black');
 rerender(<ThemeContext.Provider value={{theme:'light'}}><GoogleSignIn onCredential={vi.fn()}/></ThemeContext.Provider>);
 await waitFor(()=>expect(window.google.accounts.id.renderButton.mock.calls.at(-1)[1].theme).toBe('outline'));
});
it('uses a server challenge, English provider text and a responsive official button',async()=>{render(<GoogleSignIn register onCredential={vi.fn()}/>);await screen.findByRole('button',{name:'Official Google button'});expect(api).toHaveBeenCalledWith('/auth/google-challenge');expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(expect.objectContaining({client_id:'test-client',nonce:'browser-challenge',auto_select:false}));expect(window.google.accounts.id.renderButton).toHaveBeenCalledWith(expect.any(HTMLElement),expect.objectContaining({locale:'en',text:'signup_with',logo_alignment:'left',shape:'rectangular'}));});
it('renews the single-use challenge after a Google credential response',async()=>{const credential=vi.fn().mockResolvedValue();render(<GoogleSignIn onCredential={credential}/>);await screen.findByRole('button',{name:'Official Google button'});await window.google.accounts.id.initialize.mock.calls[0][0].callback({credential:'test-id-token'});await waitFor(()=>expect(window.google.accounts.id.initialize).toHaveBeenCalledTimes(2));expect(credential).toHaveBeenCalledWith('test-id-token');expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(2);});
it('shows a safe sign-in error and recovers after retrying',async()=>{
 let outdated=true;
 api.mockImplementation(async path=>{if(path==='/config')return {googleClientId:'test-client'};if(outdated)throw Object.assign(new Error('API route not found.'),{status:404});return {nonce:'updated-browser-challenge'};});
 render(<GoogleSignIn onCredential={vi.fn()}/>);
 expect(await screen.findByText(/Google sign-in is unavailable right now/)).toHaveAttribute('role','status');
 expect(screen.queryByText(/backend|API route/)).not.toBeInTheDocument();
 expect(window.google.accounts.id.initialize).not.toHaveBeenCalled();
 outdated=false;fireEvent.click(screen.getByRole('button',{name:'Try Google again'}));
 await screen.findByRole('button',{name:'Official Google button'});
 expect(screen.queryByRole('status')).not.toBeInTheDocument();
 expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(expect.objectContaining({nonce:'updated-browser-challenge'}));
});

function watchSizes(initialWidth=360) {
 let notify;let width=initialWidth;let nextId=0;const frames=new Map();const disconnect=vi.fn();
 vi.spyOn(HTMLElement.prototype,'getBoundingClientRect').mockImplementation(()=>({width,height:44,top:0,left:0,bottom:44,right:width,x:0,y:0,toJSON:()=>({})}));
 vi.stubGlobal('ResizeObserver',class {constructor(callback){notify=callback;}observe(){}disconnect=disconnect;});
 vi.stubGlobal('requestAnimationFrame',vi.fn(callback=>{frames.set(++nextId,callback);return nextId;}));
 vi.stubGlobal('cancelAnimationFrame',vi.fn(id=>frames.delete(id)));
 return {
  notify(nextWidth,height=44){width=nextWidth;notify([{target:window.google.accounts.id.renderButton.mock.calls[0][0],contentRect:{width,height}}]);},
  flush(){act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback());});},
  frames,disconnect,
 };
}
it.each([false,true])('preserves the Google iframe during repeated height-only resizes (register=%s)',async register=>{
 const sizes=watchSizes();render(<GoogleSignIn register={register} onCredential={vi.fn()}/>);
 const original=await screen.findByRole('button',{name:'Official Google button'});
 for(const height of [44,46,44,48,44]){sizes.notify(360,height);sizes.flush();}
 expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(1);
 expect(screen.getByRole('button',{name:'Official Google button'})).toBe(original);
});
it('redraws once for an actual width change and ignores subpixel and capped desktop changes',async()=>{
 const sizes=watchSizes();render(<GoogleSignIn onCredential={vi.fn()}/>);
 await screen.findByRole('button',{name:'Official Google button'});
 sizes.notify(320);sizes.flush();expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(2);
 expect(window.google.accounts.id.renderButton.mock.calls.at(-1)[1].width).toBe(320);
 sizes.notify(320.8,48);sizes.flush();expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(2);
 sizes.notify(500);sizes.flush();expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(3);
 sizes.notify(650);sizes.flush();expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(3);
});
it('cancels a queued redraw when unmounted',async()=>{
 const sizes=watchSizes();const {unmount}=render(<GoogleSignIn onCredential={vi.fn()}/>);
 await screen.findByRole('button',{name:'Official Google button'});
 sizes.notify(320);unmount();sizes.flush();
 expect(sizes.disconnect).toHaveBeenCalledOnce();expect(sizes.frames.size).toBe(0);
 expect(window.google.accounts.id.renderButton).toHaveBeenCalledTimes(1);
});
it('does not attach a resize observer if the challenge arrives after unmounting',async()=>{
 let resolveChallenge;const observer=vi.fn();
 vi.stubGlobal('ResizeObserver',observer);
 api.mockImplementation(path=>path==='/config'?Promise.resolve({googleClientId:'test-client'}):new Promise(resolve=>{resolveChallenge=resolve;}));
 const {unmount}=render(<GoogleSignIn onCredential={vi.fn()}/>);
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/auth/google-challenge'));
 unmount();await act(async()=>{resolveChallenge({nonce:'late-challenge'});});
 expect(observer).not.toHaveBeenCalled();expect(window.google.accounts.id.renderButton).not.toHaveBeenCalled();
});

it.each([false,true])('opens the official sign-in from a full-width action without submitting the password form (register=%s)',async register=>{
 vi.spyOn(HTMLDialogElement.prototype,'showModal').mockImplementation(function(){this.setAttribute('open','');});
 vi.spyOn(HTMLDialogElement.prototype,'close').mockImplementation(function(){this.removeAttribute('open');});
 const credential=vi.fn().mockResolvedValue();
 render(<GoogleSignIn fullWidth separator register={register} onCredential={credential}/>);
 const trigger=screen.getByRole('button',{name:register?'Sign up with Google':'Sign in with Google'});
 expect(trigger).toHaveAttribute('type','button');
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 trigger.focus();fireEvent.click(trigger);
 const dialog=screen.getByRole('dialog',{name:'Continue with Google'});
 await screen.findByRole('button',{name:'Official Google button'});
 expect(window.google.accounts.id.initialize).toHaveBeenCalledWith(expect.objectContaining({nonce:'browser-challenge'}));
 await act(async()=>{await window.google.accounts.id.initialize.mock.calls[0][0].callback({credential:'verified-credential'});});
 expect(credential).toHaveBeenCalledWith('verified-credential');
 expect(dialog).not.toBeInTheDocument();
 expect(trigger).toHaveFocus();
});

it('closes the sign-in dialog with Escape and restores keyboard focus',async()=>{
 vi.spyOn(HTMLDialogElement.prototype,'showModal').mockImplementation(function(){this.setAttribute('open','');});
 vi.spyOn(HTMLDialogElement.prototype,'close').mockImplementation(function(){this.removeAttribute('open');});
 render(<GoogleSignIn fullWidth onCredential={vi.fn()}/>);
 const trigger=screen.getByRole('button',{name:'Sign in with Google'});
 trigger.focus();fireEvent.click(trigger);
 await screen.findByRole('button',{name:'Official Google button'});
 fireEvent(screen.getByRole('dialog'),new Event('cancel',{bubbles:false,cancelable:true}));
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 expect(trigger).toHaveFocus();
 expect(window.google.accounts.id.initialize.mock.calls).toHaveLength(1);
});

it('defers Google initialization until the account-link action opens and explains the matching address',async()=>{
  vi.spyOn(HTMLDialogElement.prototype,'showModal').mockImplementation(function(){this.setAttribute('open','');});
  vi.spyOn(HTMLDialogElement.prototype,'close').mockImplementation(function(){this.removeAttribute('open');});
  render(<GoogleSignIn fullWidth compact linkAccount onCredential={vi.fn()}/>);
  expect(api).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button',{name:'Link Google account'}));
  expect(screen.getByRole('dialog',{name:'Link Google sign-in'})).toBeVisible();
  expect(screen.getByText(/same email address as your administrator account/)).toBeVisible();
  await screen.findByRole('button',{name:'Official Google button'});
});
