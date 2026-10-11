import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => window.history.replaceState(null, '', '/'))

// Model cached local hero images; image failures/deadlines are covered separately.
beforeEach(() => vi.stubGlobal('Image', class { complete = true }))

describe('GitHub Pages routing', () => {
  it('opens a direct route, navigates, and keeps the route after a reload', async () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'true')
    vi.stubEnv('BASE_URL', '/ARPC-Final/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', '/ARPC-Final/#/login')

    const firstRender = render(<App />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Sign in to your ARPC account' })).toBeVisible())
    expect(screen.getByRole('img', { name: 'ARPC Logo' })).toHaveAttribute('src', '/ARPC-Final/logo.jpg')
    expect(screen.getByText('Read the full reflection')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up!' }))
    expect(window.location.hash).toBe('#/register')
    await waitFor(() => expect(screen.getByLabelText('AUST email address')).toBeVisible())
    expect(screen.getByText('Read the full reflection')).toBeVisible()
    firstRender.unmount()

    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('AUST email address')).toBeVisible())
    expect(screen.queryByRole('heading', { name: 'Sign in to your ARPC account' })).not.toBeInTheDocument()
  })

  it.each(['/team', '/catalogue', '/profile', '/'])('includes one combined quote and footer on %s', async (path) => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', path)
    render(<App />)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getByText('Read the full reflection')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Portrait of Khan Bahadur Ahsanullah (R.)' })).toBeVisible()
  })

  it('keeps the GitHub Pages catalogue route intact when jumping to a section', () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'true')
    vi.stubEnv('BASE_URL', '/ARPC-Final/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', '/ARPC-Final/#/catalogue')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Come curious. Leave inspired.' })).toBeVisible()
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

    await waitFor(() => expect(screen.getByRole('heading', { name: /The teams.*behind.*ARPC/ })).toBeVisible())
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
    await waitFor(() => expect(screen.getByRole('heading', { name: /Find Where You Belong/ })).toBeVisible())
    expect(screen.queryByRole('heading', { name: 'Come curious. Leave inspired.' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelectorAll('footer')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false')
    expect(container.querySelector('[data-page-skeleton]')).not.toBeInTheDocument()
  })

  it('preserves catalogue filters without replaying a transition when its navbar link is selected again', () => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    window.history.replaceState(null, '', '/catalogue')
    render(<App />)
    fireEvent.click(within(screen.getByRole('group', { name: 'Courses filters' })).getByRole('button', { name: 'Paid', exact: true }))
    scrollTo.mockClear()
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Main navigation' })).getAllByRole('button', { name: 'Catalogue', exact: true })[0])
    expect(within(screen.getByRole('group', { name: 'Courses filters' })).getByRole('button', { name: 'Paid', exact: true })).toHaveAttribute('aria-pressed', 'true')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it.each([
    ['/team', true],
    ['/catalogue', true],
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
