# Running the backend infrastructure

The public gateway now returns 404 for admin pages and APIs. For local admin use,
run `npm run dev:admin` in `Frontend` with the ordinary local backend and open
`http://admin.localhost:5174/login`. The separate production admin gateway and
Cloudflare Access integration are documented in [admin hosting](../docs/admin-hosting.md).
The Compose scale-test stack keeps admin access disabled until a protected admin
deployment is explicitly configured.

The usual workflow is unchanged: run `npm run dev:local` inside Backend and `npm run dev` inside Frontend. Restart both after installing these changes. Existing admin sessions remain usable until their idle or absolute expiry. The new fields in Backend/.env.example have safe local defaults; your real Backend/.env and mail credentials are not overwritten.

## Optional Redis for the existing local backend

Start a local Redis container and set REDIS_URL=redis://127.0.0.1:6379 in Backend/.env, then restart the backend:

```powershell
docker run -d --name arpc-redis -p 127.0.0.1:6379:6379 redis:8-alpine
```

Leave TRUST_PROXY=0 when accessing Node directly. Production requires Redis. Use a dedicated Redis service with authentication and TLS when hosted; do not expose a development Redis port to the internet. REDIS_PREFIX can separate counters and cache keys when several applications share a Redis service.

## Two APIs behind a local gateway

From the repository root:

```powershell
docker compose up -d --build --wait
docker compose exec api1 node scripts/seed.js
docker compose exec api1 node scripts/admin.js
```

The seed command imports samples as drafts and preserves existing records. The admin bootstrap reads SUPERADMIN_NAME, SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD from Backend/.env. It refuses to overwrite an existing superadmin. Remove the bootstrap password after creating the account.

Open http://localhost:8080. This topology uses its own named MongoDB volume, separate from the current dev:local database. It does not import your existing local database automatically. Google sign-in needs http://localhost:8080 in the OAuth client’s authorised JavaScript origins. Existing http://localhost:5173 entries can remain for Vite development.

Nginx routes requests to two APIs without sticky sessions. Both use MongoDB sessions, Redis rate counters and a shared upload volume. The independent mail worker claims durable jobs from MongoDB. SMTP settings are inherited from Backend/.env; leaving them blank retains queued messages for later delivery.

Stop this optional stack with `docker compose down`. Named data volumes remain. Do not use `down --volumes` on real club data; that deletes its database and uploaded files.

## CDN boundaries

VITE_ASSET_CDN_URL is an optional HTTPS base for public assets referenced through publicAsset(). Publish the matching public images to that CDN path before enabling it and rebuild the frontend. Nginx serves built assets with long cache lifetimes and public images with a short lifetime. A CDN account is not automatically created.

Exclude every /api path from CDN caches. Auth, admin, applications, learner resources and uploaded API images use no-store responses. Private learner materials stay on authenticated API routes. Frontend-generated bundles can also sit behind a CDN at the same site origin; routing base paths remain separate from asset hosting.

## Integration tests

Backend tests use disposable MongoDB databases. For Redis tests, supply a dedicated test database rather than a production Redis URL:

```powershell
$env:REDIS_TEST_URL='redis://127.0.0.1:6379/15'
cd Backend
npm test
```

Redis tests isolate their key namespace and do not flush a shared database. CI includes a disposable Redis service and runs this suite. Without REDIS_TEST_URL the Redis integration case is skipped; ordinary MongoDB/auth tests still run.

## Production preparation

The provided Compose stack intentionally uses development HTTP on localhost. For production, use a real HTTPS frontend origin, configure TLS at the gateway, keep Secure cookies enabled, protect MongoDB and Redis with credentials and network policy, and place secrets outside the image. Maintain and test backups for MongoDB and uploaded files; confirm that a database restore and a corresponding upload restore belong to the same recovery point. Use a MongoDB replica set and managed Redis redundancy when availability requirements justify them.

The two API replicas share one host, one database, one Redis and one gateway. This tests horizontal API routing; it is not multi-host high availability. MongoDB sharding remains deferred because the present club dataset is small. See ../docs/backend-system-design.md for the data flows, replay guarantees and remaining hosting decisions.
