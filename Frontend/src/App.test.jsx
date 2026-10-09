import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => window.history.replaceState(null, '', '/'))

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

  it.each(['/team', '/profile', '/'])('includes one combined quote and footer on %s', async (path) => {
    vi.stubEnv('VITE_GITHUB_PAGES', 'false')
    vi.stubEnv('BASE_URL', '/')
    vi.stubGlobal('scrollTo', vi.fn())
    window.history.replaceState(null, '', path)
    render(<App />)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getByText('Read the full reflection')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Portrait of Khan Bahadur Ahsanullah (R.)' })).toBeVisible()
  })

  it.each([
    ['/team', true],
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
