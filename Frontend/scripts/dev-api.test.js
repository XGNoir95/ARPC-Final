// @vitest-environment node
import { createServer as createHttpServer, request } from 'node:http'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { afterEach, expect, it, vi } from 'vitest'
import { createServer as createViteServer } from 'vite'
import { devApi } from './dev-api.js'

const cleanup = []
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close()
})

async function backend() {
  const state = { ready: true, requests: [] }
  const server = createHttpServer(async (req, res) => {
    if (req.url === '/api/health/ready') {
      res.writeHead(state.ready ? 200 : 503, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: state.ready }))
    }
    let body = ''
    for await (const chunk of req) body += chunk
    state.requests.push({ method: req.method, url: req.url, body })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ saved: true }))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  cleanup.push(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections() }))
  return { state, server, port, target: `http://127.0.0.1:${port}` }
}

async function frontend(target, options = {}) {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), warnOnce: vi.fn(), hasErrorLogged: () => false, hasWarned: false, clearScreen: vi.fn() }
  const server = await createViteServer({
    configFile: false,
    customLogger: logger,
    plugins: [devApi({ target, startupTimeout: 1500, requestTimeout: 1500, probeTimeout: 100, interval: 20, ...options })],
    server: { host: '127.0.0.1', port: 0, proxy: { '/api': target }, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  cleanup.push(() => server.close())
  await server.listen()
  return { url: `http://127.0.0.1:${server.httpServer.address().port}`, logger }
}

it('waits for database readiness before making the frontend available', async () => {
  const api = await backend()
  api.state.ready = false
  let started = false
  const starting = frontend(api.target).then(value => { started = true; return value })
  await delay(100)
  expect(started).toBe(false)
  api.state.ready = true
  const vite = await starting
  expect((await fetch(`${vite.url}/api/public/content`)).status).toBe(200)
})

it('fails startup with actionable instructions when the API stays offline', async () => {
  const api = await backend()
  await new Promise(resolve => api.server.close(resolve))
  await expect(frontend(api.target, { startupTimeout: 150 })).rejects.toThrow('npm run dev:local')
})

it('holds requests across a refused connection and forwards a POST exactly once', async () => {
  const api = await backend()
  const vite = await frontend(api.target)
  await new Promise(resolve => { api.server.close(resolve); api.server.closeAllConnections() })
  const body = JSON.stringify({ application: 'test' })
  const saving = fetch(`${vite.url}/api/applications`, { method: 'POST', body })
  await delay(100)
  expect(api.state.requests).toHaveLength(0)
  api.server.listen(api.port, '127.0.0.1')
  await once(api.server, 'listening')
  expect(await (await saving).json()).toEqual({ saved: true })
  expect(api.state.requests).toEqual([{ method: 'POST', url: '/api/applications', body }])
  expect(vite.logger.error).not.toHaveBeenCalled()
})

it('returns a bounded JSON 503 during a prolonged outage and recovers without a Vite restart', async () => {
  const api = await backend()
  const vite = await frontend(api.target, { requestTimeout: 150 })
  api.state.ready = false
  const responses = await Promise.all(['/api/auth/me', '/api/public/content', '/api/analytics/view'].map(path => fetch(`${vite.url}${path}`)))
  for (const response of responses) {
    expect(response.status).toBe(503)
    expect(response.headers.get('Retry-After')).toBe('2')
    expect(await response.json()).toMatchObject({ code: 'DEV_API_UNAVAILABLE' })
  }
  expect(api.state.requests).toHaveLength(0)
  expect(vite.logger.error).toHaveBeenCalledTimes(1)
  api.state.ready = true
  expect((await fetch(`${vite.url}/api/public/content`)).status).toBe(200)
  expect(vite.logger.info).toHaveBeenCalledWith(expect.stringContaining('recovered'))
})

it('does not submit a cancelled POST after the backend recovers', async () => {
  const api = await backend()
  const vite = await frontend(api.target)
  api.state.ready = false
  const submission = request(`${vite.url}/api/applications`, { method: 'POST' })
  submission.on('error', () => {})
  submission.end('cancelled')
  await delay(100)
  submission.destroy()
  await delay(50)
  api.state.ready = true
  await delay(100)
  expect(api.state.requests).toHaveLength(0)
})
