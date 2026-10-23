<p align="center">
  <img src="Frontend/public/newLogo.png" alt="Ahsanullah Roh. Peace Club emblem" width="100" />
</p>

<h1 align="center">ARPC Club Management Platform</h1>

<p align="center">
  <strong>Ahsanullah Roh. Peace Club | AUST</strong><br />
  Public club website, administrator workspace and course learning portal.
</p>

<p align="center">
  <a href="docs/README.md">Documentation</a> |
  <a href="docs/ARCHITECTURE.md">Architecture</a> |
  <a href="Backend/README.md">Backend setup</a> |
  <a href=".github/CONTRIBUTING.md">Contributing</a>
</p>

ARPC is a full-stack platform for presenting the club, publishing programmes, collecting applications and managing approved course learners. A React frontend serves separate public and administrator builds, backed by an Express API and MongoDB. The interface uses a forest green, sage and gold palette, locally hosted typography, responsive layouts and interactive book, folder, laptop and gallery views.

The application supports local development today. Production hosting still requires configured domains, an identity gateway, persistent storage and external services; see [Deployment](#deployment).

## Features

### Public website

- **Home:** ordered hero slides with individual captions, Arabic greeting and Hijri date; editable About Us, Mission and Vision cards; featured programmes, membership promotion, club reflection, contact links and sponsor carousel.
- **Programme catalogue:** searchable and filterable events, webinars and courses, presented through interactive bookshelves, folders and course covers, with programme details and registration availability.
- **Gallery:** photo slideshow with page-fold transitions, playback controls, keyboard and swipe navigation, captions and a full-image viewer.
- **Panel and teams:** committee and team rosters, member profiles and supported social links.
- **Responsive experience:** desktop and mobile layouts, light/dark themes, keyboard interactions, reduced-motion support and explicit loading, empty and error states.

### Membership and programme applications

- Validated membership, event, webinar and course forms with a review step before submission.
- Server-side validation, duplicate checks, MongoDB persistence, queued email receipts and downloadable text summaries.
- Membership fee of **BDT 100**, enforced by the server, with payment details reviewed manually by administrators.
- Application review, decision history and internal notes in the administrator workspace.

### Administrator workspace

- Separate administrator hostname with development-only local access and production Cloudflare Access identity verification.
- Password authentication, optional Google sign-in, email verification, account recovery and invitation workflows.
- Superadmin approval, suspension, restoration and deletion of eligible administrator accounts; active-device listings and session revocation.
- Content editing for homepage sections, programmes, sponsors, gallery items and team/member profiles.
- Draft saving, explicit publication and withdrawal, separate published snapshots and revision checks to prevent stale edits overwriting newer decisions.
- Shared desktop/mobile website previews, selectable cards and ordered image/member controls.
- Image upload **or** external HTTPS image link, plus authorized course-material uploads.
- Application management, workspace search, activity history, email retry controls and aggregate analytics.

### Course learning portal

- Approved course applicants receive email access links and use learner sessions separate from administrator sessions.
- Published lessons, HTTPS video links and protected learning-material downloads.
- Lesson completion tracking, course progress and downloadable PDF completion certificates.
- Server-side enrollment checks on learning endpoints; access is revoked when the relevant enrollment is rejected or deleted.

### Backend and infrastructure

- MongoDB stores application records, content snapshots, accounts, hashed session tokens, progress, audit records and a durable email outbox.
- Redis provides shared rate limiting and short-lived public-content caching; it is optional in local development and required in production.
- SMTP delivery uses branded HTML/plain-text templates, leased jobs and bounded retries. Mail processing can run inside the API or in a separate worker.
- Role checks, HttpOnly session cookies, origin checks, request validation, upload validation and security headers protect API boundaries.
- Health endpoints, integration tests and an optional Docker Compose stack with two API instances, MongoDB, Redis, a mail worker and Nginx.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, Framer Motion, React Icons |
| API | Node.js, Express 5, Mongoose, Zod |
| Persistence | MongoDB; filesystem storage for uploaded files |
| Cache and rate limits | Redis |
| Identity | Cookie sessions, scrypt password hashing, optional Google sign-in, Cloudflare Access gateway integration |
| Email and documents | Nodemailer, MongoDB outbox, PDFKit |
| Verification | Vitest, Testing Library, Node test runner, Supertest, ESLint, artifact/style checks |
| Automation | GitHub Actions, CodeQL, Docker Compose, Nginx templates |

## Run locally

Use **Node.js 24** and npm; the repository includes [`.nvmrc`](.nvmrc). Install backend and frontend dependencies separately. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

### 1. Start the backend

From the repository root:

```sh
cd Backend
npm ci
# First setup only: copy .env.example to .env and configure it.
npm run dev:local
```

Create `Backend/.env` only if it does not already exist. Start with the values in [Backend/.env.example](Backend/.env.example); keep actual credentials out of Git.

`dev:local` downloads and starts a real MongoDB process, persisting its database at `~/.arpc/dev-db` unless `LOCAL_DB_DIR` is set. It supplies its own local connection URL. To use an existing MongoDB server or Atlas instead, set `MONGODB_URI` and run `npm run dev`.

The API listens at `http://127.0.0.1:4000` by default. Health endpoints are `/api/health/live` and `/api/health/ready`.

### 2. Start the public website

In a second terminal:

```sh
cd Frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/api` to the local backend and checks API readiness during startup and backend restarts.

### 3. Start the administrator website

In a third terminal, using the same frontend installation:

```sh
cd Frontend
npm run dev:admin
```

Open **http://admin.localhost:5174/login**. Local access requires the development settings from the backend environment template. Public-site authentication and administrator routes are unavailable on the ordinary public origin.

### 4. Initialize content and the first superadmin

With the backend running, from `Backend`:

```sh
npm run seed
npm run admin:create
```

The seed script imports bundled sample content as **unpublished drafts**, preserving existing records. Before `admin:create`, set `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` in `Backend/.env`. Remove the bootstrap password after creating the account. Publish reviewed content through the administrator workspace.

See [Backend setup](Backend/README.md) for SMTP, Google sign-in, session settings and account workflows. Without SMTP credentials, emails remain queued rather than being delivered.

## Environment configuration

| Setting | Purpose |
| --- | --- |
| `MONGODB_URI` | Existing MongoDB/Atlas connection string; `dev:local` manages its own local connection. |
| `REDIS_URL`, `REDIS_PREFIX` | Shared counters and public cache; Redis is required in production. |
| `FRONTEND_URL`, `ADMIN_FRONTEND_URL` | Exact public/admin URLs used by origin policies and email links. |
| `ADMIN_ACCESS_MODE`, `ADMIN_ACCESS_ISSUER`, `ADMIN_ACCESS_AUDIENCE` | Local or Cloudflare Access mode and production token-verification settings. |
| `SMTP_*`, `MAIL_FROM` | Outbound email delivery. |
| `GOOGLE_CLIENT_ID` | Optional Google authentication client ID. |
| `UPLOAD_DIR` | Persistent filesystem location for uploaded images and learning materials. |
| `TRUST_PROXY` | Trusted reverse-proxy topology; keep `0` for direct local access. |
| `VITE_API_URL` | Browser-visible API base; defaults to `/api`. Admin builds require this same-origin value. |
| `VITE_ADMIN_ORIGIN` | Exact HTTPS admin origin required for a production admin build. |
| `VITE_BASE_PATH`, `VITE_GITHUB_PAGES` | Public asset base and optional GitHub Pages hash routing. |
| `VITE_ASSET_CDN_URL` | Optional HTTPS CDN base for bundled public assets. |

Use [Backend/.env.example](Backend/.env.example) and [Frontend/.env.example](Frontend/.env.example) as the complete configuration references. **Every `VITE_*` value is public in the browser.** Database, Redis and SMTP credentials belong only in backend configuration.

MongoDB stores uploaded-file metadata; file contents live separately under `UPLOAD_DIR`. Back up both together. Local environments, runtime databases, uploads, dependencies, build artifacts and caches are excluded from Git.

## Project structure

```text
ARPC-Final/
|-- .github/                 # CI, security checks and contributor policies
|-- Backend/
|   |-- scripts/             # Local database, seed, bootstrap and mail utilities
|   |-- src/                 # API, models, access policies, validation and workers
|   |-- test/                # Backend integration tests
|   |-- .env.example         # Backend configuration reference
|   `-- README.md            # Backend setup and API documentation
|-- Frontend/
|   |-- public/              # Static images, fonts and public assets
|   |-- scripts/             # Development proxy, site boundary and build checks
|   `-- src/
|       |-- assets/          # Bundled frontend assets
|       |-- Components/
|       |   `-- Admin/       # Administrator editors, previews and shared controls
|       |-- Pages/
|       |   `-- Admin/       # Administrator workspace route and integration tests
|       |-- contexts/        # Shared contexts and their providers
|       |-- data/            # Bundled samples, presets and seed source data
|       |-- test/            # Frontend test setup
|       `-- utils/           # API, content, assets and interaction helpers
|-- docs/                    # Architecture, workflows and interface guidance
|-- infra/                   # Gateway configuration and infrastructure runbook
|-- compose.yaml             # Optional local multi-instance infrastructure
|-- .nvmrc                   # Development Node.js version
`-- README.md
```

Component tests and Tailwind style modules stay beside their implementations. See the [developer guide](docs/DEVELOPMENT.md) for organization and styling conventions.

## Quality checks

From `Frontend`:

```sh
npm run validate
```

This runs lint and style-policy checks, frontend tests, a dependency audit, the public production build and artifact verification.

From `Backend`:

```sh
npm run check
npm test
npm audit --audit-level=high
```

Backend tests use disposable MongoDB instances. Set `REDIS_TEST_URL` to a dedicated test Redis database to include the Redis integration case; otherwise that case is skipped. The [CI workflow](.github/workflows/ci-cd.yml) provides Redis for backend tests.

For the separate administrator build, set `VITE_ADMIN_ORIGIN` to the intended HTTPS origin and run `npm run build:admin` in `Frontend`. Verify that output with `BUILD_DIR=dist-admin` and `VITE_BASE_PATH=/` using `npm run verify:build`; PowerShell environment syntax and further commands are covered in the [developer guide](docs/DEVELOPMENT.md).

## Deployment

The frontend produces two artifacts: `Frontend/dist` for the public site and `Frontend/dist-admin` for the protected administrator site. The Node API and optional mail worker run separately with MongoDB, Redis, persistent uploads and SMTP.

Before deploying on Vercel, Render or another host:

1. Configure public/admin HTTPS domains and the backend's matching origin settings.
2. Protect the **entire admin origin**, including HTML, assets, previews and same-origin `/api` routes, with Cloudflare Access. Configure issuer/audience validation and prevent direct-origin bypass.
3. Route `/api` through the appropriate gateway to the backend. Vite's development proxy does not exist in production.
4. Configure hosted MongoDB, Redis, persistent upload storage, SMTP and any Google OAuth origins. Provide backend secrets through the hosting platform's environment settings.
5. Adapt the supplied Nginx/Compose templates to the hosting network, TLS termination and trusted-proxy arrangement; verify backups, readiness and access boundaries.

The existing GitHub Actions workflow validates both applications. GitHub Pages deployment publishes the **public frontend only**, requires successful frontend/backend checks and a configured repository `VITE_API_URL`, and runs only for eligible `main` executions. It does not provision the API, databases or protected administrator gateway.

See [admin hosting](docs/admin-hosting.md), the [infrastructure runbook](infra/README.md) and [backend system design](docs/backend-system-design.md) for the detailed topology and remaining deployment work.

## Scope and contribution

Payments are recorded and checked manually; there is no integrated payment gateway. Course completion is based on learner-marked lesson progress. Analytics records aggregate page views, including repeat views, rather than unique visitors. Bundled illustrative content and profile placeholders are not live club records until deliberately imported, reviewed and published.

Use focused branches and pull requests, include relevant validation results and provide desktop/mobile screenshots for interface changes. Start with the [contribution guide](.github/CONTRIBUTING.md) and [documentation index](docs/README.md). Report vulnerabilities through the [security policy](.github/SECURITY.md).
