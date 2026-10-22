import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// Existing account/component suites model the admin site. Public-boundary tests
// explicitly override this; no test-only bypass exists in application code.
beforeEach(() => {
  if (typeof window !== 'undefined') {
    vi.stubEnv('VITE_SITE_MODE', 'admin')
    vi.stubEnv('VITE_ADMIN_ORIGIN', window.location.origin)
  }
})

// jsdom does not implement the browser's native dialog methods.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() { this.setAttribute('open', '') },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() { this.removeAttribute('open') },
  })
}

afterEach(cleanup)
