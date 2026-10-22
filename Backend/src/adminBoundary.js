import { createRemoteJWKSet, jwtVerify } from 'jose';

export function adminFrontendUrl(env = process.env) {
  return env.ADMIN_FRONTEND_URL || (env.NODE_ENV === 'development' ? 'http://admin.localhost:5174'
    : env.NODE_ENV === 'production' ? '' : env.FRONTEND_URL || 'http://localhost:5173');
}

export function adminBoundaryConfig(env = process.env) {
  const mode = env.ADMIN_ACCESS_MODE || (env.NODE_ENV === 'development' ? 'local' : 'disabled');
  if (!['local', 'cloudflare', 'disabled'].includes(mode)) throw new Error('Invalid ADMIN_ACCESS_MODE.');
  if (mode === 'disabled') return { mode };
  const url = new URL(adminFrontendUrl(env));
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('ADMIN_FRONTEND_URL must be an origin without a path, credentials, query or fragment.');
  if (url.origin === new URL(env.FRONTEND_URL || 'http://localhost:5173').origin) throw new Error('Admin and public origins must be different.');
  if (mode === 'local') {
    if (env.NODE_ENV !== 'development' || url.protocol !== 'http:' || !url.hostname.endsWith('.localhost')) throw new Error('Local admin access requires NODE_ENV=development and an HTTP .localhost hostname.');
    return { mode, origin: url.origin, host: url.host };
  }
  if (url.protocol !== 'https:') throw new Error('Cloudflare admin access requires an HTTPS admin origin.');
  const issuer = env.ADMIN_ACCESS_ISSUER || '';
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) || !env.ADMIN_ACCESS_AUDIENCE?.trim()) throw new Error('Configure ADMIN_ACCESS_ISSUER and ADMIN_ACCESS_AUDIENCE for the Cloudflare Access application.');
  return { mode, origin: url.origin, host: url.host, issuer, audience: env.ADMIN_ACCESS_AUDIENCE };
}

export function createAdminBoundary({ env = process.env, keySet } = {}) {
  const config = adminBoundaryConfig(env);
  const keys = config.mode === 'cloudflare' ? keySet || createRemoteJWKSet(new URL(`${config.issuer}/cdn-cgi/access/certs`), { timeoutDuration: 5000, cooldownDuration: 30000 }) : null;
  return async (req, res, next) => {
    const deny = () => res.status(404).set('Cache-Control', 'no-store').json({ message: 'Not found.' });
    // Never trust X-Forwarded-Host or an unsigned email header. The gateway must
    // preserve Host; a forged Host alone cannot satisfy the signed assertion.
    if (config.mode === 'disabled' || req.get('host') !== config.host || req.get('Origin') && req.get('Origin') !== config.origin) return deny();
    if (config.mode === 'local') {
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) return deny();
    } else {
      const token = req.get('Cf-Access-Jwt-Assertion');
      if (!token || token.length > 16384) return deny();
      try {
        const { payload } = await jwtVerify(token, keys, {
          algorithms: ['RS256'], issuer: config.issuer, audience: config.audience,
          requiredClaims: ['exp', 'iat', 'sub', 'email'], clockTolerance: 5,
        });
        if (typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || typeof payload.sub !== 'string' || !payload.sub || payload.iat > Date.now()/1000 + 5 || payload.type !== 'app') return deny();
        req.adminIdentityEmail = payload.email.trim().toLowerCase();
      } catch { return deny(); }
    }
    res.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
  };
}
