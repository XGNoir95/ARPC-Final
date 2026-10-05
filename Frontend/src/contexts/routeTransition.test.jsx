import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { RouteTransitionProvider } from '../RouteTransitionContext'
import { useRouteTransition } from './routeTransition'

const RouteStatus = () => {
  const { prevPathname, currentPathname } = useRouteTransition()
  return <p>{`${prevPathname || 'none'} -> ${currentPathname}`}</p>
}

it('shares previous/current paths with consumers when navigation changes', () => {
  const { rerender } = render(
    <RouteTransitionProvider value={{ prevPathname: '/login', currentPathname: '/register' }}>
      <RouteStatus />
    </RouteTransitionProvider>,
  )
  expect(screen.getByText('/login -> /register')).toBeInTheDocument()
  rerender(
    <RouteTransitionProvider value={{ prevPathname: '/register', currentPathname: '/' }}>
      <RouteStatus />
    </RouteTransitionProvider>,
  )
  expect(screen.getByText('/register -> /')).toBeInTheDocument()
})
