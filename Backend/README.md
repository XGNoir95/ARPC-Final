# ARPC backend

Express, MongoDB/Mongoose, React and Node. The API stores real accounts, content, membership/enrollment applications and learning progress. No payment gateway is used.

## Start locally

Node 22.12+ or 24 is required. In `Backend`:

```powershell
npm ci
Copy-Item .env.example .env # first setup only; do not overwrite your own credentials
npm run dev:local
```

`dev:local` starts a real MongoDB binary on port 27017 and the API on port 4000. It downloads MongoDB on first use to `~/.cache/arpc-mongodb`, and keeps database files in `~/.arpc/dev-db`, outside the repository. The data survives restarts. Set `LOCAL_DB_DIR` to change this location. This directory and `Backend/uploads` need backups. `.npmrc` disables package install scripts to avoid an unsolicited MongoDB download into the workspace.

If MongoDB is already installed/running, use `npm run dev` with its URI in `MONGODB_URI` instead; don't start a second instance on port 27017. Atlas later uses the same `MONGODB_URI` setting.

In a second terminal, in `Backend`:

```powershell
npm run seed
```

The seed imports current sample programmes, featured events, gallery photos, Panel teams, sponsors and homepage slots **as drafts**. It is idempotent and never overwrites existing records or publishes them. Until admins publish drafts, the live catalogue/gallery are empty. The fixed homepage layout retains its fallback copy.

## First superadmin

Admin sign-in now lives on a separate site. Run `npm run dev:admin` in `Frontend`
and use `http://admin.localhost:5174/login`. Public `/login` and `/register` are
unavailable. See [admin hosting and identity-provider setup](../docs/admin-hosting.md).

Set `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, and `SUPERADMIN_PASSWORD` in your ignored `Backend/.env` (at least 12 characters), then run:

```powershell
npm run admin:create
```

Remove `SUPERADMIN_PASSWORD` from `.env` immediately afterwards. The command refuses to overwrite an existing superadmin. Normal registration can never create a superadmin. Sign in at `http://admin.localhost:5174/login`. Direct signup and invitations on the protected admin site both create pending accounts: email verification and superadmin approval are required. Approved admins may publish drafts. Suspending an admin revokes its sessions.

The superadmin can approve a request before email verification. Approval never verifies the address or unlocks the dashboard by itself: every admin API still requires both approval and verified email ownership. Approved accounts offer Suspend, suspended accounts offer Restore access, and rejected requests can be reopened for review. Repeating an unchanged action does not send another approval email or create another revision/audit event. See [administrator action rules](../docs/admin-state-workflows.md).

The superadmin can also delete a non-superadmin account after confirmation. This removes the login record, revokes its sessions and account links, and permits a fresh signup with the same email. Published club content and applications remain. The replacement account requires approval and email verification again; superadmin accounts are protected from deletion.

Start the frontend separately in `Frontend` with `npm run dev`. Vite waits up to 30 seconds for the API/database readiness check, then proxies `/api` to `127.0.0.1:4000`, so no frontend credentials are needed. Keep this backend terminal running; restarting Vite does not start the API. Brief backend restarts are handled by waiting before forwarding requests; longer outages return 503 with instructions in the Vite terminal. In the browser, use `localhost` consistently instead of mixing it with `127.0.0.1`. `FRONTEND_URL` must match your frontend URL. Its default is `http://localhost:5173`; for hash routing use `http://localhost:5173/#`.

## Email and Google setup

SMTP credentials are intentionally **blank** in `.env.example`. `SMTP_HOST` defaults to `smtp.gmail.com`, port 587. Set `SMTP_USER` and `SMTP_PASS` in your private environment to your test mailbox credentials; `MAIL_FROM` defaults to `SMTP_USER` if left blank. Gmail requires an **app password**, not the usual account password ([Google instructions](https://support.google.com/accounts/answer/185833)). For another provider, change host/port/security as appropriate.

Without credentials, emails stay in a database outbox; the UI reports queued, not delivered. Once configured and restarted, the worker sends every 30 seconds with bounded retries. Failed deliveries can be retried by the superadmin. For local development only, `npm run mail:inspect` displays queued email messages, including private verification codes and reset/learner links: never share this output. Email verification codes last 10 minutes and work once. Resends wait 60 seconds, with five code emails per hour and five guesses per 15 minutes across resends. Reset/learner links last one hour and invitations last 72 hours. Expired codes/links need a fresh request. Never enter real passwords or secrets in committed files.

All outgoing emails have an ARPC-branded HTML design and a plain-text alternative. The club emblem uses the public AUST image URL instead of a file attachment; `MAIL_LOGO_URL` can override it with another public HTTPS image. Bare sender addresses receive the club's display name. A custom display name in `MAIL_FROM` is respected. Existing queued text-only messages receive the same branded frame when delivered, and queued CID logos are replaced at send time. Both development commands reload backend changes automatically; restart production API processes and any separate mail worker after deploying email changes. Previously delivered emails cannot be changed.

Run `npm run mail:preview` in `Backend` to generate a local preview gallery at `.cache/mail-preview/index.html`, with desktop/mobile views and plain-text examples. It uses fictional content and does not load `.env`, connect to the database or send email. Edit shared branding and wording in `src/emailTemplates.js`. See [the email design notes](../docs/email-design.md) for coverage and validation details.

Google sign-in uses Google Identity Services and server-side ID-token verification. Create an OAuth **Web application** client, configure the authorized JavaScript origin `http://admin.localhost:5174` for local administrator access (and the protected HTTPS admin origin when deploying), and set `GOOGLE_CLIENT_ID` in `Backend/.env`. Restart the API. No frontend secret is required. Both Google and password signup require superadmin approval. To add Google to an existing password account, sign in first and use **Account → Link Google sign-in** with the same email. [Google setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

## Workflows

- **Content:** Homepage is organized into Hero, About us and Featured, with Sponsors managed separately immediately after it. Hero supports ordered images and per-image captions with shared fallback wording; all About card wording and images are editable. Featured supports a manual mix of published programmes and membership or an automatic list based on upcoming dates and recent publications. Programme records remain managed in Programmes. Draft edits preserve published snapshots, and revision checks prevent overwriting another admin's changes. Programmes with applications must be unpublished rather than deleted, preserving enrollment records. See [Homepage and Sponsors](../docs/homepage-content.md).
- **Applications:** The public forms review then submit to MongoDB, with duplicate detection and email receipts. Admins review, approve, reject and delete applications. Membership approval requires manually verified payment; the fee is always set server-side to BDT 100. Review notes are internal.
- **Courses:** Admins create/edit/reorder lesson drafts, separately publish/withdraw them, and upload images or PDFs. Approved course enrollees receive private email access links to `/learn`. Learners cannot access admin APIs. They read lessons, open HTTPS video links, download private materials, mark progress and download a generated PDF certificate after completing all published lessons. Completion is self-reported, not video attendance verification. Rejected/deleted enrollments revoke access to the affected course.
- **Media:** PNG/JPEG/WebP images and PDF materials, max 10 MB; SVG/HTML uploads are rejected. Materials require approved enrollment; images require a published content reference or an admin session. Referenced files cannot be deleted.
- **Analytics:** Aggregate page views by date/page, monthly membership applications, enrollments by programme, application outcomes and manually verified membership fees. Counts include repeated visits and are not unique visitors. No IP or visitor identifier is stored in analytics. Security rate limiting uses separate short-lived counters in Redis when configured, with an in-memory development fallback. No historical traffic is fabricated.

## API boundaries

| Prefix | Access |
| --- | --- |
| `/api/auth` | Registration, password/Google sign-in, verification, reset and session endpoints |
| `/api/public/content` | Published content only |
| `/api/applications` | Validated public submissions |
| `/api/admin` | Verified, approved administrator; approvals/audit/retry need superadmin |
| `/api/admin/content/:resource` | Draft CRUD and explicit publication |
| `/api/admin/courses/:course/lessons` | Lesson draft CRUD and explicit publication |
| `/api/learning` | Separate learner sessions and per-course approval checks |
| `/api/assets/:id` | Published referenced images; uploaded materials never public |

Sessions use random opaque tokens in HttpOnly cookies; only token hashes are stored in MongoDB. Passwords use salted scrypt. Email access/reset tokens are hashed, expire, and are single-use. State-changing API requests require the application header and an allowed Origin. Server validation, upload signature checks, rate limits and Helmet are enabled. The backend is independent of browser storage and unlisted routes.

## Verification and hosting later

```powershell
npm test
npm run check
npm audit --audit-level=high
```

Integration tests use an isolated disposable MongoDB database. External Google and SMTP delivery require your credentials and are not exercised by automated tests. Google verification is stubbed only in the test app.

This release is for local development. Before hosting, use HTTPS, a same-origin API/reverse proxy, persistent media storage, a backup schedule, and configured OAuth/email origins. `NODE_ENV=production` enables Secure session cookies and disables local mailbox inspection. GitHub Pages cannot run this Node server; its deployment is gated until `VITE_API_URL` is configured. Hosting topology and cross-site cookie requirements should be reviewed when selecting a host.

## Authentication and infrastructure changes

Administrator sessions now include idle expiry, login rotation and per-device revocation. A signed-in administrator cannot submit membership or programme applications or access participant learning routes. The frontend checks current sessions before showing login or registration and synchronises logout across tabs.

See [the infrastructure runbook](../infra/README.md) for optional Redis, two API instances behind Nginx, the separate mail worker, CDN boundaries and deployment configuration. See [the system design](../docs/backend-system-design.md) for security, recovery and scaling decisions. These additions do not replace your existing local database or .env credentials.
