import { adminPagePath } from '../src/utils/adminSite.js'

export function siteBoundary({ admin = false, adminOrigin = '' } = {}) {
  const install = server => {
    if (admin) server.config.logger.info(`[admin] Open ${adminOrigin}/login (local development has no external identity provider).`)
    server.middlewares.use((req, res, next) => {
      let path
      try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/\/+/g, '/') }
      catch { res.writeHead(400); return res.end('Bad request') }
      const wrongHost = admin && req.headers.host !== new URL(adminOrigin).host
      if (wrongHost || !admin && adminPagePath.test(path)) {
        res.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' })
        return res.end('Not found')
      }
      if (admin) res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
      next()
    })
  }
  return { name: 'arpc-site-boundary', configureServer: install, configurePreviewServer: install }
}
