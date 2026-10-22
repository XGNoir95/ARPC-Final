// This controls presentation only. The API independently enforces the admin
// hostname, identity gateway and the existing administrator session/role rules.
export function isAdminSite() {
  return import.meta.env.VITE_SITE_MODE === 'admin'
    && Boolean(import.meta.env.VITE_ADMIN_ORIGIN)
    && window.location.origin === import.meta.env.VITE_ADMIN_ORIGIN
}

export const adminPagePath = /^\/(?:login|register|forgot-password|reset-password|verify-email|admin)(?:\/|$)/i
