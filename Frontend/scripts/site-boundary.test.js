// @vitest-environment node
import { createServer as httpServer, get } from 'node:http'
import { once } from 'node:events'
import { afterEach, expect, it } from 'vitest'
import { createServer } from 'vite'
import viteConfig from '../vite.config.js'
import { siteBoundary } from './site-boundary.js'

const cleanup = []
afterEach(async () => { for (const close of cleanup.splice(0).reverse()) await close() })
async function fixture(admin) {
  const api = httpServer((req, res) => { res.end(JSON.stringify({ host: req.headers.host })) })
  api.listen(0, '127.0.0.1'); await once(api, 'listening')
  cleanup.push(() => new Promise(resolve => { api.close(resolve); api.closeAllConnections() }))
  const config = viteConfig({ mode: 'test', command: 'serve' })
  const vite = await createServer({ configFile: false, logLevel: 'silent',
    plugins: [siteBoundary({ admin, adminOrigin: 'http://admin.localhost:5174' })],
    server: { host: '127.0.0.1', port: 0, watch: null, proxy: { '/api': { ...config.server.proxy['/api'], target: `http://127.0.0.1:${api.address().port}` } } },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  cleanup.push(() => vite.close()); await vite.listen()
  return (path, host) => new Promise((resolve, reject) => {
    get({ hostname: '127.0.0.1', port: vite.httpServer.address().port, path, headers: { Host: host } }, res => {
      let body = ''; res.on('data', data => { body += data }); res.on('end', () => resolve({ status: res.statusCode, body }))
    }).on('error', reject)
  })
}

it('returns HTTP 404 for public admin entry points, including encoded and case variants', async () => {
  const request = await fixture(false)
  for (const path of ['/login', '/register?invite=test', '/admin/account', '/forgot-password', '/%6cogin', '/LOGIN']) {
    expect((await request(path, 'localhost:5173')).status).toBe(404)
  }
})

it('preserves the admin Host through the configured Vite API proxy', async () => {
  const request = await fixture(true)
  const response = await request('/api/access/check', 'admin.localhost:5174')
  expect(response.status).toBe(200)
  expect(JSON.parse(response.body)).toEqual({ host: 'admin.localhost:5174' })
  expect((await request('/api/access/check', 'localhost:5174')).status).toBe(404)
})

it('preserves the public Host instead of making it look like an admin request', async () => {
  const request = await fixture(false)
  const response = await request('/api/access/check', 'localhost:5173')
  expect(JSON.parse(response.body)).toEqual({ host: 'localhost:5173' })
})
