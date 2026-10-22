import { setTimeout as delay } from 'node:timers/promises'

export const API_PROXY_TARGET = 'http://127.0.0.1:4000'
const unavailableMessage = 'The local API is unavailable. In a separate terminal, run: cd Backend; npm run dev:local. Check that terminal for database or startup errors.'

// Check the database-aware readiness endpoint before handing a request to Vite's
// proxy. Only health checks are retried; application requests are forwarded once.
export function apiReadiness(target, { probeTimeout = 1000, interval = 250 } = {}) {
  let pending
  return function waitUntilReady(timeout, signal) {
    if (pending) return pending
    pending = (async () => {
      const deadline = Date.now() + timeout
      while (!signal?.aborted && Date.now() < deadline) {
        try {
          const timeoutSignal = AbortSignal.timeout(Math.max(1, Math.min(probeTimeout, deadline - Date.now())))
          const response = await fetch(`${target}/api/health/ready`, {
            signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
            redirect: 'error',
          })
          const body = await response.json()
          if (response.ok && body.ok === true) return true
        } catch {
          // Connection refusal is expected while the API/database is restarting.
        }
        const remaining = deadline - Date.now()
        if (remaining > 0) {
          try { await delay(Math.min(interval, remaining), undefined, { signal }) }
          catch { return false }
        }
      }
      return false
    })().finally(() => { pending = undefined })
    return pending
  }
}

export function devApi({ target = API_PROXY_TARGET, startupTimeout = 30000, requestTimeout = 12000, probeTimeout, interval } = {}) {
  return {
    name: 'arpc-dev-api-readiness',
    apply: 'serve',
    async configureServer(server) {
      const controller = new AbortController()
      server.httpServer?.once('close', () => controller.abort())
      const ready = apiReadiness(target, { probeTimeout, interval })
      const logger = server.config.logger
      logger.info(`[api] Waiting for the backend at ${target}...`)
      if (!await ready(startupTimeout, controller.signal)) {
        throw new Error(`[api] ${unavailableMessage} Expected API: ${target}`)
      }
      logger.info('[api] Backend and database are ready.')
      let unavailable = false
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0]
        if (pathname !== '/api' && !pathname?.startsWith('/api/')) return next()
        const available = await ready(requestTimeout, controller.signal)
        // A cancelled browser request must never be forwarded later (especially POSTs).
        if (req.aborted || res.destroyed || controller.signal.aborted) return
        if (available) {
          if (unavailable) logger.info('[api] Backend recovered; requests are available again.')
          unavailable = false
          return next()
        }
        if (!unavailable) logger.error(`[api] ${unavailableMessage} Expected API: ${target}`)
        unavailable = true
        res.writeHead(503, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Retry-After': '2',
        })
        res.end(JSON.stringify({ code: 'DEV_API_UNAVAILABLE', message: 'The local backend is unavailable. Check the backend terminal and try again.' }))
      })
    },
  }
}
