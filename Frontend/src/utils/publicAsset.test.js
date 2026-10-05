import { describe, expect, it, vi } from 'vitest'
import { publicAsset } from './publicAsset'

describe('deployment asset URLs', () => {
  it('keeps assets under the GitHub Pages repository path', () => {
    vi.stubEnv('BASE_URL', '/ARPC-Final/')
    expect(publicAsset('/images/about/community.jpg')).toBe('/ARPC-Final/images/about/community.jpg')
    expect(publicAsset('logo.jpg')).toBe('/ARPC-Final/logo.jpg')
    expect(publicAsset('/sponsors/alfalaq.png')).toBe('/ARPC-Final/sponsors/alfalaq.png')
  })

  it('uses root URLs during local development', () => {
    vi.stubEnv('BASE_URL', '/')
    expect(publicAsset('/logo.jpg')).toBe('/logo.jpg')
  })
})
