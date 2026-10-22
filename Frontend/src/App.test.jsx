import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { api, post } from './utils/api'
import { catalogue } from './data/catalogue'
import { galleryPhotos } from './data/gallery'
import { teams } from './data/teams'
vi.mock('./utils/api', () => ({ api:vi.fn(), post:vi.fn(), API_BASE:'/api' }))

afterEach(() => { window.history.replaceState(null, '', '/'); sessionStorage.clear(); })

// Model cached local hero images; image failures/deadlines are covered separately.
beforeEach(() => {
  vi.stubGlobal('Image', class { complete = true })
  let profile = null
  api.mockImplementation(async path => {
    if(path === '/public/content') return {programmes:Object.entries(catalogue).flatMap(([kind,items])=>items.map(p=>({...p,kind}))),gallery:galleryPhotos,teams,sponsors:[],home:[]}
    if(path === '/config') return {googleClientId:''}
    if(path === '/auth/me' && profile) return {profile}
    if(path === '/auth/verification-status' && profile) return {required:!profile.emailVerified,expiresAt:new Date(Date.now()+600000).toISOString(),resendAvailableAt:new Date(Date.now()+60000).toISOString(),lockedUntil:null}
    const error = new Error('Please sign in.');error.status=401;throw error
  })
  post.mockImplementation(async path => {
    if(path==='/auth/register') profile={fullName:'Requested Admin',email:'admin@example.com',status:'pending',emailVerified:false,role:'admin'}
    if(path==='/auth/logout') profile=null
    return {profile,message:'Queued.'}
  })
})

describe('GitHub Pages routing', () => {
  it('keeps the selected appearance when moving between login and registration',async()=>{
    vi.stubEnv('VITE_GITHUB_PAGES','false');vi.stubEnv('BASE_URL','/');vi.stubGlobal('scrollTo',vi.fn());window.history.replaceState(null,'','/login');
    try {
      render(<App/>);await screen.findByRole('heading',{name:'Welcome back.'});
      const controls=screen.getByRole('group',{name:'Page controls'});
      const scrollButton=within(controls).getByRole('button',{name:'Scroll to top'});
      expect(scrollButton).toBeVisible();
      expect(scrollButton).toBeDisabled();
      fireEvent.click(screen.getByRole('button',{name:'Toggle dark mode'}));
      expect(document.documentElement.dataset.theme).toBe('dark');
      fireEvent.click(screen.getByRole('link',{name:'Create account'}));
      await screen.findByRole('heading',{name:'Create your account.'},{timeout:4000});
      expect(within(controls).getByRole('button',{name:'Scroll to top'})).toBe(scrollButton);
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(screen.getByRole('button',{name:'Toggle dark mode'})).toHaveAttribute('title','Switch to light mode');
    } finally { localStorage.removeItem('arpc-color-theme'); }
  })
  it('shows a useful not-found page with readable navigation',async()=>{
    vi.stubEnv('VITE_GITHUB_PAGES','false');vi.stubEnv('BASE_URL','/');vi.stubGlobal('scrollTo',vi.fn());window.history.replaceState(null,'','/this-page-does-not-exist');
    render(<App/>);
    expect(screen.getByRole('heading',{name:'We can’t find that page.'})).toBeVisible();
    expect(screen.getByRole('navigation',{name:'Main navigation'})).toHaveClass('bg-brand');
    expect(screen.getByRole('link',{name:'Go to home'})).toHaveAttribute('href','/');
  })
  it.each([false, true])('opens Gallery from navigation, loads the whole layout and supports reload (hash routing: %s)', async (hashRouting) => {
    vi.stubEnv('VITE_GITHUB_PAGES', String(hashRouting))
    vi.stubEnv('BASE_URL', hashRouting ? '/ARPC-Final/' : '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', hashRouting ? '/ARPC-Final/#/catalogue' : '/catalogue')
    const { container, unmount } = render(<App />)
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })
    fireEvent.click(within(navigation).getByRole('button', { name: 'Gallery' }))
    expect(container.querySelector('[data-page-skeleton="/gallery"]')).toBeVisible()
    expect(container.querySelectorAll('[data-skeleton-photo]')).toHaveLength(7)
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Life at ARPC.'), { timeout: 4000 })
    expect(navigation).toHaveClass('bg-transparent')
    expect(within(navigation).getByRole('button', { name: 'Gallery' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('main')).toHaveFocus()
    expect(hashRouting ? window.location.hash : window.location.pathname).toBe(hashRouting ? '#/gallery' : '/gallery')
    unmount()
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Life at ARPC.')
  })
  it.each([true, false])('opens a course enrollment with a complete loader and supports a direct reload (hash routing: %s)', async (hashRouting) => {
    vi.stubEnv('VITE_GITHUB_PAGES', String(hashRouting))
    vi.stubEnv('BASE_URL', hashRouting ? '/ARPC-Final/' : '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', hashRouting ? '/ARPC-Final/#/catalogue' : '/catalogue')
    const { container, unmount } = render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Open course folder: Lessons from the Seerah' }))
    fireEvent.click(screen.getByRole('link', { name: 'Enroll in course' }))
    expect(container.querySelector('[data-page-skeleton="/enroll/courses/seerah-foundations"]')).toBeVisible()
    expect(container.querySelectorAll('[data-skeleton-field]')).toHaveLength(7)
    expect(container.querySelector('[data-skeleton-section="footer"]')).toBeVisible()
    expect(screen.getByRole('contentinfo')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByRole('form', { name: 'Your enrollment details' })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('form', { name: 'Your enrollment details' })).toBeVisible(), { timeout: 4000 })
    expect(screen.getByRole('textbox', { name: 'Mobile number' })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveClass('bg-transparent')
    expect(screen.getByRole('main')).toHaveFocus()
    expect(container.querySelector('[data-skeleton-section="footer"]')).not.toBeInTheDocument()
    expect(hashRouting ? window.location.hash : window.location.pathname).toBe(hashRouting ? '#/enroll/courses/seerah-foundations' : '/enroll/courses/seerah-foundations')
    unmount()
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Lessons from the Seerah')
  })
  it('opens a direct route, navigates, and keeps the route after a reload', async () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'true')
    vi.stubEnv('BASE_URL', '/ARPC-Final/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', '/ARPC-Final/#/login')

    const firstRender = render(<App />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeVisible())
    expect(screen.getByRole('img', { name: 'ARPC Logo' })).toHaveAttribute('src', '/ARPC-Final/logo.jpg')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Create account' }))
    expect(window.location.hash).toBe('#/register')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText(/Email address/)).toBeVisible(), { timeout: 4000 })
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    firstRender.unmount()

    render(<App />)
    await waitFor(() => expect(screen.getByLabelText(/Email address/)).toBeVisible())
    expect(screen.queryByRole('heading', { name: 'Welcome back.' })).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Back to home' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Find Where You Belong/ })).toBeVisible(), { timeout: 4000 })
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })

  it.each([false, true])('requests an admin account after signup and restores pending status from the server on reload (hash routing: %s)', async (hashRouting) => {
    vi.stubEnv('VITE_GITHUB_PAGES', String(hashRouting))
    vi.stubEnv('BASE_URL', hashRouting ? '/ARPC-Final/' : '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', hashRouting ? '/ARPC-Final/#/register' : '/register')
    const { unmount } = render(<App />)
    await screen.findByLabelText(/^Full name/)
    const values = [['Full name', 'Preview Admin'], ['Phone number', '01700000000'], ['Email address', 'admin@aust.edu'], ['Student ID', '123456'], ['Department', 'Architecture'], ['Batch / Year', '22.1.1'], ['Password', 'preview-password'], ['Confirm password', 'preview-password']]
    for (const [label, value] of values) fireEvent.change(screen.getByLabelText(new RegExp(`^${label}`)), { target: { value } })
    fireEvent.click(screen.getByRole('button', { name: 'Request account' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Your account is awaiting access.' })).toBeVisible(), { timeout:4000 })
    await waitFor(() => expect(screen.getByLabelText('Verification code')).toBeEnabled())
    expect(hashRouting ? window.location.hash : window.location.pathname).toBe(hashRouting ? '#/admin' : '/admin')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
    expect(sessionStorage.getItem('arpc-admin-preview-v1')).toBeNull()
    unmount()
    render(<App />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Your account is awaiting access.' })).toBeVisible())
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeVisible(), { timeout: 4000 })
    expect(post).toHaveBeenCalledWith('/auth/logout')
  })

  it.each(['/team', '/catalogue', '/gallery', '/profile', '/join', '/'])('includes one combined quote and footer on %s', async (path) => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', path)
    render(<App />)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getByText('Read the full reflection')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Portrait of Khan Bahadur Ahsanullah (R.)' })).toBeVisible()
  })

  it.each([false, true])('opens the membership form from Join Us (hash routing: %s)', async (hashRouting) => {
    vi.stubEnv('VITE_GITHUB_PAGES', String(hashRouting))
    vi.stubEnv('BASE_URL', hashRouting ? '/ARPC-Final/' : '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', hashRouting ? '/ARPC-Final/#/team' : '/team')
    const { container } = render(<App />)
    const join=within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole('button', { name: 'Join Us' })
    await waitFor(()=>expect(join).not.toBeDisabled())
    fireEvent.click(join)
    expect(container.querySelector('[data-page-skeleton="/join"]')).toBeVisible()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Membership application' })).toBeVisible(), { timeout: 4000 })
    expect(hashRouting ? window.location.hash : window.location.pathname).toBe(hashRouting ? '#/join' : '/join')
    expect(screen.getByRole('textbox', { name: 'Full name' })).toBeVisible()
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('contentinfo')).toBeVisible()
  })

  it('keeps the GitHub Pages catalogue route intact when jumping to a section', async () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'true')
    vi.stubEnv('BASE_URL', '/ARPC-Final/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', '/ARPC-Final/#/catalogue')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Come curious. Leave inspired.' })).toBeVisible()
    await screen.findByRole('group', { name: 'Courses filters' })
    const target = document.getElementById('catalogue-courses')
    target.scrollIntoView = vi.fn()
    fireEvent.click(screen.getByRole('button', { name: 'Courses', exact: true }))
    expect(target.scrollIntoView).toHaveBeenCalledOnce()
    expect(window.location.hash).toBe('#/catalogue')
    expect(screen.getByText('Read the full reflection')).toBeVisible()
  })

  it('immediately replaces the outgoing page with a skeleton and focuses content when ready', async () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    window.history.replaceState(null, '', '/catalogue')
    const { container } = render(<App />)
    scrollTo.mockClear()

    const outgoing = screen.getByRole('heading', { name: 'Come curious. Leave inspired.' })
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })
    const footer = screen.getByRole('contentinfo')
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getAllByRole('button', { name: 'Panel', exact: true })[0])
    expect(outgoing).not.toBeInTheDocument()
    expect(container.querySelector('[data-page-skeleton="/team"]')).toBeVisible()
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('main').firstElementChild).toHaveAttribute('inert')
    expect(screen.queryByRole('heading', { name: /The teams.*behind.*ARPC/ })).not.toBeInTheDocument()
    expect(navigation).toBe(screen.getByRole('navigation', { name: 'Main navigation' }))
    expect(navigation).toHaveClass('route-nav-loading')
    expect(footer).toBe(screen.getByRole('contentinfo'))
    expect(screen.getByRole('status')).toHaveTextContent('Loading panel')
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' })

    await waitFor(() => expect(screen.getByRole('heading', { name: /The teams.*behind.*ARPC/ })).toBeVisible(), { timeout: 4000 })
    expect(outgoing).not.toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'instant' })
    expect(screen.getByRole('main')).toHaveFocus()
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false')
    expect(screen.getByRole('main').firstElementChild).not.toHaveAttribute('inert')
    expect(navigation).not.toHaveClass('route-nav-loading')
    await waitFor(() => expect(container.querySelector('[data-page-skeleton]')).not.toBeInTheDocument())
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('footer')).toHaveLength(1)
  })

  it('keeps only the latest destination when back navigation interrupts loading', async () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', '/team')
    const { container } = render(<App />)
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getAllByRole('button', { name: 'Catalogue', exact: true })[0])
    window.history.replaceState(null, '', '/')
    fireEvent(window, new PopStateEvent('popstate'))
    await waitFor(() => expect(screen.getByRole('heading', { name: /Find Where You Belong/ })).toBeVisible(), { timeout: 4000 })
    expect(screen.queryByRole('heading', { name: 'Come curious. Leave inspired.' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('footer')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false')
    expect(container.querySelector('[data-page-skeleton]')).not.toBeInTheDocument()
  })

  it('preserves catalogue filters without replaying a transition when its navbar link is selected again', async () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    window.history.replaceState(null, '', '/catalogue')
    render(<App />)
    fireEvent.click(within(await screen.findByRole('group', { name: 'Courses filters' })).getByRole('button', { name: 'Paid', exact: true }))
    scrollTo.mockClear()
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getAllByRole('button', { name: 'Catalogue', exact: true })[0])
    expect(within(screen.getByRole('group', { name: 'Courses filters' })).getByRole('button', { name: 'Paid', exact: true })).toHaveAttribute('aria-pressed', 'true')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it.each([
    ['/team', true],
    ['/catalogue', true],
    ['/join', true],
    ['/', true],
    ['/profile', false],
  ])('uses transparent overlay navigation only on photo hero routes: %s', (path, overlay) => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', path)
    render(<App />)
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(navigation.classList.contains('bg-transparent')).toBe(overlay)
    expect(navigation.parentElement.classList.contains('absolute')).toBe(overlay)
  })
})
