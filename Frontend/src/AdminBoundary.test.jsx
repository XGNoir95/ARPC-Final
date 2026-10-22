import { render, screen } from '@testing-library/react'
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import App from './App'
import { api } from './utils/api'

vi.mock('./utils/api', () => ({ api: vi.fn(), post: vi.fn(), API_BASE: '/api' }))
beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubEnv('VITE_SITE_MODE', 'public')
  vi.stubEnv('VITE_GITHUB_PAGES', 'false')
  vi.stubEnv('BASE_URL', '/')
  api.mockImplementation(async path => {
    if (path === '/public/content') return { home: [], programmes: [], gallery: [], teams: [], sponsors: [] }
    throw Object.assign(new Error('No session'), { status: 401 })
  })
})
afterEach(() => window.history.replaceState(null, '', '/'))

it.each(['/login', '/register', '/admin', '/admin/account', '/forgot-password', '/reset-password', '/verify-email'])('does not expose %s on the public site', async path => {
  window.history.replaceState(null, '', path)
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'We can’t find that page.' })).toBeVisible()
  expect(api).not.toHaveBeenCalledWith('/auth/me', expect.anything())
  expect(screen.queryByRole('textbox', { name: 'Email address' })).not.toBeInTheDocument()
})

it('rejects an admin build served on the wrong origin', async () => {
  vi.stubEnv('VITE_SITE_MODE', 'admin')
  vi.stubEnv('VITE_ADMIN_ORIGIN', 'https://admin.example.test')
  window.history.replaceState(null, '', '/login')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'We can’t find that page.' })).toBeVisible()
})

it('keeps the admin login available on the configured admin origin', async () => {
  vi.stubEnv('VITE_SITE_MODE', 'admin')
  vi.stubEnv('VITE_ADMIN_ORIGIN', window.location.origin)
  window.history.replaceState(null, '', '/login')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'Welcome back.' })).toBeVisible()
})

it('also hides admin paths in public hash-routing deployments', async () => {
  vi.stubEnv('VITE_GITHUB_PAGES', 'true')
  window.history.replaceState(null, '', '/#/register')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'We can’t find that page.' })).toBeVisible()
})
