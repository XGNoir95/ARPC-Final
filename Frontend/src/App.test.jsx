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

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up!' }))
    expect(window.location.hash).toBe('#/register')
    await waitFor(() => expect(screen.getByLabelText('AUST email address')).toBeVisible())
    firstRender.unmount()

    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('AUST email address')).toBeVisible())
    expect(screen.queryByRole('heading', { name: 'Sign in to your ARPC account' })).not.toBeInTheDocument()
  })
})
