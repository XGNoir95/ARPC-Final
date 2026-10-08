import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Footer from './Footer'

describe('Combined footer', () => {
  it('reveals a campus-life companion with the full reflection and removes it on collapse', async () => {
    render(<MemoryRouter><Footer includeQuote /></MemoryRouter>)
    const footer = screen.getByRole('contentinfo')
    const reflection = within(footer).getByText(/^The education which caters/)
    expect(reflection).not.toBeVisible()
    expect(screen.queryByRole('region', { name: 'Put learning into practice.' })).not.toBeInTheDocument()
    fireEvent.click(within(footer).getByText('Read the full reflection'))
    expect(reflection).toBeVisible()
    const companion = await screen.findByRole('region', { name: 'Put learning into practice.' })
    expect(within(companion).queryByRole('img')).not.toBeInTheDocument()
    expect(within(companion).getByRole('link', { name: 'Share an idea with ARPC' })).toHaveAttribute('href', 'mailto:info@arpc.club?subject=An%20idea%20for%20ARPC')
    fireEvent.click(within(footer).getByText('Read the full reflection'))
    expect(reflection).not.toBeVisible()
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Put learning into practice.' })).not.toBeInTheDocument())
  })

  it('keeps the footer useful on other routes without repeating the founder section', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.queryByText('Read the full reflection')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Put learning into practice.' })).not.toBeInTheDocument()
    const navigation = screen.getByRole('navigation', { name: 'Footer navigation' })
    for (const [name, href] of [['Home', '/'], ['Catalogue', '#'], ['Panel', '/team'], ['Profile', '/profile'], ['Login', '/login'], ['Register', '/register']]) {
      expect(within(navigation).getByRole('link', { name, exact: true })).toHaveAttribute('href', href)
    }
    expect(screen.getByRole('link', { name: 'info@arpc.club' })).toHaveAttribute('href', 'mailto:info@arpc.club')
    const directions = within(navigation).getByRole('link', { name: 'Campus directions' })
    const mapUrl = new URL(directions.href)
    expect(mapUrl.origin).toBe('https://www.google.com')
    expect(mapUrl.pathname).toBe('/maps/dir/')
    expect(mapUrl.searchParams.get('destination')).toBe('Ahsanullah University of Science and Technology')
    expect(directions).toHaveAttribute('target', '_blank')
    expect(directions).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByTitle('AUST Campus Map')).not.toBeInTheDocument()
  })

  it('opens registration from the join action', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Footer includeQuote />} />
          <Route path="/register" element={<h1>Registration</h1>} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'Join ARPC' }))
    expect(screen.getByRole('heading', { name: 'Registration' })).toBeVisible()
  })
})
