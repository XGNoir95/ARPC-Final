import { cleanup,fireEvent,render,screen,waitFor,within } from '@testing-library/react';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import App from './App';
import AuthProvider from './Components/AuthProvider';
import { useAuth } from './AuthContext';
import { api,post } from './utils/api';
vi.mock('./utils/api',()=>({api:vi.fn(),post:vi.fn(),API_BASE:'/api'}));
const profile={id:'admin',fullName:'Test Administrator',email:'admin@example.test',status:'active',emailVerified:true,role:'admin'};let signedIn;
beforeEach(()=>{vi.stubEnv('VITE_GITHUB_PAGES','false');vi.stubEnv('BASE_URL','/');vi.stubGlobal('Image',class{complete=true});vi.stubGlobal('scrollTo',vi.fn());signedIn=true;api.mockImplementation(async path=>{if(path==='/auth/me'){if(signedIn)return {profile};throw Object.assign(new Error('Sign in'),{status:401});}if(path==='/public/content')return {programmes:[],gallery:[],teams:[],sponsors:[],home:[]};if(path==='/admin/workspace')return {profile,programmes:[],gallery:[],teams:[],sponsors:[],home:[],emailConfigured:true};if(path==='/admin/analytics')return {days:[],pages:[],growth:[],mail:{queued:0,failed:0}};if(path==='/config')return {googleClientId:''};return [];});post.mockImplementation(async path=>{if(path==='/auth/logout'||path==='/auth/logout-all')signedIn=false;return {profile};});});
afterEach(()=>{cleanup();window.history.replaceState(null,'','/');localStorage.clear();});
it.each(['/login','/register'])('redirects an existing session from %s to the admin workspace',async path=>{window.history.replaceState(null,'',path);render(<App/>);await waitFor(()=>expect(screen.getByRole('heading',{name:'Your club workspace.'})).toBeVisible(),{timeout:4000});expect(window.location.pathname).toBe('/admin');expect(screen.queryByRole('heading',{name:'Welcome back.'})).not.toBeInTheDocument();});
it('switches workspace sections immediately without remounting or fetching the workspace again',async()=>{
  window.history.replaceState(null,'','/admin/account');
  render(<App/>);
  const navigation=await screen.findByRole('navigation',{name:'Admin navigation'});
  const count=path=>api.mock.calls.filter(([requested])=>requested===path).length;
  const workspaceRequests=count('/admin/workspace');
  const contentRequests=count('/public/content');
  for(const name of ['Sponsors','Gallery','Account']){
    fireEvent.click(within(navigation).getByRole('link',{name}));
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy','false');
    expect(screen.getByRole('heading',{level:1,name})).toBeVisible();
    expect(screen.getByRole('navigation',{name:'Admin navigation'})).toBe(navigation);
    expect(count('/admin/workspace')).toBe(workspaceRequests);
    expect(count('/public/content')).toBe(contentRequests);
  }
});
it.each(['/join','/enroll/events/test','/enroll/webinars/test','/enroll/courses/test','/learn'])('blocks applicant and learner access for an admin at %s',async path=>{window.history.replaceState(null,'',path);render(<App/>);expect(await screen.findByRole('heading',{name:'Manage the club from your workspace.'})).toBeVisible();expect(screen.queryByRole('textbox',{name:/Full name/})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Submit enrollment'})).not.toBeInTheDocument();if(path!=='/learn')expect(screen.getByRole('navigation',{name:'Main navigation'})).toHaveClass('bg-brand');});
it('shows logout instead of Join Us while an admin browses and clears the shared session after logout',async()=>{window.history.replaceState(null,'','/');render(<App/>);const nav=screen.getByRole('navigation',{name:'Main navigation'});const logout=await within(nav).findByRole('button',{name:'Logout'});expect(within(nav).queryByRole('button',{name:'Join Us'})).not.toBeInTheDocument();fireEvent.click(logout);expect(await within(nav).findByRole('button',{name:'Join Us'})).toBeVisible();expect(post).toHaveBeenCalledWith('/auth/logout');});
it('keeps a network error distinct from a signed-out session',async()=>{api.mockImplementation(async path=>{if(path==='/auth/me')throw new Error('Backend unavailable');return {};});window.history.replaceState(null,'','/login');render(<App/>);expect(await screen.findByRole('heading',{name:'We couldn’t check your session.'})).toBeVisible();expect(screen.queryByRole('textbox',{name:/Password/})).not.toBeInTheDocument();});

function AuthProbe() {const {profile,status,acceptSession}=useAuth();return <><p data-testid="auth-state">{status}:{profile?.fullName || 'guest'}</p><button onClick={()=>acceptSession(profileForProbe)}>Accept new login</button></>;}
const profileForProbe={...profile,fullName:'New login'};
it('does not let an older failed session check overwrite a newer login',async()=>{let reject;api.mockImplementation(()=>new Promise((_,r)=>{reject=r;}));render(<AuthProvider><AuthProbe/></AuthProvider>);fireEvent.click(screen.getByRole('button',{name:'Accept new login'}));reject(Object.assign(new Error('Old session expired'),{status:401}));await waitFor(()=>expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated:New login'));});
it('expires shared auth without repeatedly broadcasting failed session checks to other tabs',async()=>{const storage=vi.spyOn(Storage.prototype,'setItem');render(<AuthProvider><AuthProbe/></AuthProvider>);await waitFor(()=>expect(screen.getByTestId('auth-state')).toHaveTextContent('authenticated'));fireEvent(window,new Event('arpc:auth-expired'));await waitFor(()=>expect(screen.getByTestId('auth-state')).toHaveTextContent('guest'));expect(storage).not.toHaveBeenCalled();storage.mockRestore();});
