# Separate admin site

The public site no longer exposes `/login`, `/register`, password recovery,
verification or `/admin/*`. These paths return 404 in the public Vite/Nginx
servers and render the missing-page view in public SPA/hash routing. There is no
redirect advertising the admin hostname. The public site does not request admin
sessions. Public learning, applications and content keep their existing routes.

## Local development

Keep the backend running with `npm run dev:local` in `Backend`. In `Frontend`,
run both of these commands in separate terminals:

```powershell
npm run dev
npm run dev:admin
```

- Public: `http://localhost:5173`
- Admin: `http://admin.localhost:5174/login`

The admin site must use that exact hostname, not `localhost:5174`. Modern browsers
resolve `.localhost` to the local computer; no public domain is needed. Both Vite
servers and the development API bind to loopback. The backend defaults to the
local admin mode only when `NODE_ENV=development`. This mode deliberately has no
external identity provider and is for this computer only. Existing ARPC account
credentials, email verification, approval and roles still apply. Cookies are
host-only, so sign in again on the new admin hostname; cookies from the old public
site do not grant admin-host access.

Production rejects `ADMIN_ACCESS_MODE=local`. Without an explicit production
provider configuration, admin APIs stay closed. Do not publish the development
servers through a tunnel or expose them on a LAN.

## Configure the identity gateway when the domain is ready

The prepared adapter uses Cloudflare Access. It can connect to the chosen identity
provider; no Cloudflare account, hostname, DNS record or policy was created by
this code change. Follow the official [self-hosted application setup](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/).

1. Choose separate public and admin hostnames. Protect the **entire admin hostname**
   with a self-hosted Access application, including static files, previews and
   `/api`. Allow only the intended administrator identities/group and require MFA
   in the identity provider. Do not use an everyone-allowed or bypass policy.
2. Connect that admin application through Cloudflare Tunnel to the private admin
   Nginx container. Preserve the admin Host header. Enable the tunnel's Access
   token validation. Do not expose the Node ports or admin Nginx directly to the
   Internet, and do not publish admin artifacts to GitHub Pages or the public CDN.
3. Configure the backend using the actual application values:

   ```dotenv
   NODE_ENV=production
   FRONTEND_URL=https://www.yourdomain.com
   ADMIN_FRONTEND_URL=https://admin.yourdomain.com
   ADMIN_ACCESS_MODE=cloudflare
   ADMIN_ACCESS_ISSUER=https://YOUR-TEAM.cloudflareaccess.com
   ADMIN_ACCESS_AUDIENCE=YOUR-ACCESS-APPLICATION-AUD
   ```

   Keep the existing production Redis, MongoDB, HTTPS and proxy settings too.
   `ADMIN_ACCESS_ISSUER` has no trailing slash. These values are identifiers,
   not a shared password or an API token.
4. Build the public image with `infra/Dockerfile.edge`. Build the admin image with
   `infra/Dockerfile.admin`, passing `--build-arg VITE_ADMIN_ORIGIN=https://admin.yourdomain.com`.
   Supply `ADMIN_HOST=admin.yourdomain.com` to its Nginx container. Attach both
   gateway containers to the private API network containing `api1` and `api2`.
   The admin image uses `/api` on its own origin; do not point it at the public API
   hostname. The existing `compose.yaml` is a public, local scale-test stack and
   does not automatically deploy this production admin gateway.
5. Add the admin origin to the optional Google sign-in client's authorized
   origins. A gateway login and an ARPC login must identify the **same email**.
   An identity allowed through Access can request an ARPC account; it remains
   pending until verification and superadmin approval. For invitations, allow the
   recipient in Access first. Admin invitations, verification and recovery emails
   now use `ADMIN_FRONTEND_URL`; participant learning links use `FRONTEND_URL`.

## Enforced checks

The backend validates the Access JWT's signature, fixed RS256 algorithm, issuer,
application audience, expiry, issue time, subject, application-token type and
email using the configured team's public keys. It does not trust unsigned email
headers or `X-Forwarded-Host`. Missing/invalid identity returns 404. Gateway approval
does not create an ARPC session or bypass account roles/approval. Existing ARPC
sessions and credential/token flows are bound to the verified gateway email.

The admin Nginx template uses an authentication subrequest for **every** resource,
including the initial login page. The public Nginx rejects admin paths independently.
Application tokens are validated again on protected APIs, so a direct API call or
forged hostname is insufficient. This follows Cloudflare's [origin JWT validation
guidance](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

The hostname is not a secret. Security comes from the gateway, cryptographic
identity checks, private origin network and existing account authorization.

## Verification before going live

Run frontend/backend tests, build and verify both artifacts, then validate Nginx
with `nginx -t` in the deployment environment. Test with a permitted and a denied
identity. Verify public `/login` and `/api/auth/login` return 404, the admin hostname
requires IdP authentication even for HTML/assets, missing/forged/wrong-audience or
expired assertions cannot reach the origin, and allowed users still need their
approved ARPC accounts. Test logout, expiry, recovery email links and preview frames.
The real IdP login, DNS, TLS and tunnel must be verified after those services exist.
