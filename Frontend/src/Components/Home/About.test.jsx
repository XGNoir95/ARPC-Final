import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import About from './About'

const renderAbout = () => render(<MemoryRouter><About /></MemoryRouter>)
const article = (name) => screen.getByRole('button', { name }).closest('article')

const pointer = (target, type, pointerType = 'mouse') => {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  fireEvent(target, event)
}

describe('About card interactions', () => {
  it('starts with all three cards closed and their previews visible', () => {
    renderAbout()
    expect(screen.getByRole('button', { name: 'About Us' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Our Mission' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: 'Our Vision' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(article('About Us')).getByText('A student community rooted in faith, friendship, and service.')).toBeVisible()
    expect(within(article('Our Mission')).getByText('Turning knowledge into kindness and shared purpose into action.')).toBeVisible()
    expect(within(article('Our Vision')).getByText('A campus shaped by peace, compassion, and a sense of belonging.')).toBeVisible()
    expect(screen.queryAllByRole('region', { name: /^(About Us|Our Mission|Our Vision)$/ })).toHaveLength(0)
  })

  it('returns every card to its closed state when the pointer leaves, including after a click', () => {
    renderAbout()
    for (const name of ['About Us', 'Our Mission', 'Our Vision']) {
      const card = article(name)
      pointer(card, 'pointerover')
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-expanded', 'true')
      fireEvent.click(screen.getByRole('button', { name }))
      pointer(card, 'pointerout')
      expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(3)
      expect(screen.queryAllByRole('region', { name: /^(About Us|Our Mission|Our Vision)$/ })).toHaveLength(0)
    }
  })

  it('stays open when moving between content inside the hovered card', () => {
    renderAbout()
    const card = article('About Us')
    pointer(card, 'pointerover')
    const event = new MouseEvent('pointerout', {
      bubbles: true,
      relatedTarget: within(card).getByRole('link', { name: 'Meet our team' }),
    })
    Object.defineProperty(event, 'pointerType', { value: 'mouse' })
    fireEvent(within(card).getByRole('button', { name: 'About Us' }), event)
    expect(screen.getByRole('button', { name: 'About Us' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('activates on the first hover and on pointer movement after page load', () => {
    renderAbout()
    pointer(article('Our Mission'), 'pointerover')
    expect(screen.getByRole('button', { name: 'Our Mission' })).toHaveAttribute('aria-expanded', 'true')
    pointer(article('Our Vision'), 'pointermove')
    expect(screen.getByRole('button', { name: 'Our Vision' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Our Mission' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('region', { name: /^(About Us|Our Mission|Our Vision)$/ })).toHaveLength(1)
  })

  it('supports tap and keyboard focus without simulated touch hover', () => {
    renderAbout()
    pointer(article('Our Mission'), 'pointerover', 'touch')
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Our Mission' }))
    expect(screen.getByRole('button', { name: 'Our Mission' })).toHaveAttribute('aria-expanded', 'true')
    fireEvent.focus(screen.getByRole('button', { name: 'Our Vision' }))
    expect(screen.getByRole('button', { name: 'Our Vision' })).toHaveAttribute('aria-expanded', 'true')
    const link = screen.getByRole('link', { name: 'Grow with us' })
    fireEvent.blur(screen.getByRole('button', { name: 'Our Vision' }), { relatedTarget: link })
    expect(screen.getByRole('button', { name: 'Our Vision' })).toHaveAttribute('aria-expanded', 'true')
    fireEvent.blur(link, { relatedTarget: null })
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(3)
  })

  it('keeps contracted detail panels inert and links to real application routes', () => {
    renderAbout()
    expect(article('Our Mission').querySelector('[role="region"]')).toHaveAttribute('inert')
    pointer(article('About Us'), 'pointerover')
    expect(screen.getByRole('link', { name: 'Meet our team' })).toHaveAttribute('href', '/team')
    fireEvent.click(screen.getByRole('button', { name: 'Our Mission' }))
    expect(screen.getByRole('link', { name: 'Be part of our mission' })).toHaveAttribute('href', '/register')
  })
})
