import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { API_PROXY_TARGET, devApi } from './scripts/dev-api.js'
import { siteBoundary } from './scripts/site-boundary.js'


// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const admin = mode === 'admin'
  const adminOrigin = env.VITE_ADMIN_ORIGIN || (command === 'serve' ? 'http://admin.localhost:5174' : '')
  if (admin && !adminOrigin) throw new Error('Set VITE_ADMIN_ORIGIN to the protected admin origin before building the admin site.')
  if (admin && new URL(adminOrigin).origin !== adminOrigin) throw new Error('VITE_ADMIN_ORIGIN must be an exact origin without a path or trailing slash.')
  if (admin && command === 'build' && new URL(adminOrigin).protocol !== 'https:') throw new Error('The deployed admin origin must use HTTPS.')
  if (admin && env.VITE_API_URL && env.VITE_API_URL !== '/api') throw new Error('The admin site requires a same-origin /api proxy through the identity gateway.')
  const usesLocalApi = (env.VITE_API_URL || '/api').replace(/\/$/, '') === '/api'

  return {
    cacheDir: admin ? 'node_modules/.vite-admin' : 'node_modules/.vite-public',
    base: admin ? '/' : env.VITE_BASE_PATH || '/',
    define: mode === 'test' ? {} : {
      'import.meta.env.VITE_SITE_MODE': JSON.stringify(admin ? 'admin' : 'public'),
      'import.meta.env.VITE_ADMIN_ORIGIN': JSON.stringify(adminOrigin),
      'import.meta.env.VITE_GITHUB_PAGES': JSON.stringify(admin ? 'false' : env.VITE_GITHUB_PAGES || 'false'),
    },
    plugins: [react(), tailwindcss(), mode !== 'test' && siteBoundary({ admin, adminOrigin }), mode !== 'test' && usesLocalApi && devApi()],
    build: { outDir: admin ? 'dist-admin' : 'dist' },
    // Keep the browser origin aligned with FRONTEND_URL and Google OAuth settings.
    // Fail clearly if another Vite instance already owns this port.
    // Preserve the browser Host so the API can distinguish public/admin origins.
    server: { host: '127.0.0.1', port: admin ? 5174 : 5173, strictPort: true, proxy: { '/api': { target: API_PROXY_TARGET, changeOrigin: false } } },
  }
})
