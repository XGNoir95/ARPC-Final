# Developer guide

## Setup

Use Node.js 24 LTS. Start the API in a terminal from `Backend` (see [first-time backend setup](../Backend/README.md)):

```sh
npm run dev:local
```

Then run these commands in a separate terminal from `Frontend`:

```sh
npm ci
npm run dev
```

Use the URL printed by Vite. Do not run a clean installation over an active Vite process on Windows: native build packages can be locked while the server is running. Stop the server before `npm ci`, then restart it afterward.

Vite waits up to 30 seconds for `/api/health/ready` before listening. During backend restarts, API requests wait up to 12 seconds for readiness; only health checks are retried, never form submissions. A longer outage returns HTTP 503 and logs backend startup instructions. Once the backend recovers, subsequent requests work without restarting Vite. Keep the backend terminal running: restarting the frontend does not start the backend.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot module replacement. |
| `npm run dev:admin` | Start the local admin site at `http://admin.localhost:5174/login`. |
| `npm run build:admin` | Build the separate admin artifact into `dist-admin`; requires `VITE_ADMIN_ORIGIN`. |
| `npm run lint` | Run ESLint with zero warnings allowed. |
| `npm run verify:styles` | Enforce the Tailwind styling policy. Also included in lint and CI. |
| `npm test` | Run component, interaction and deployment tests with Vitest. |
| `npm run test:watch` | Rerun tests while developing. |
| `npm run audit` | Check dependencies for high/critical security advisories. |
| `npm run build` | Generate the production site in `dist/`. |
| `npm run verify:build` | Check built HTML, CSS, fonts and local image paths. |
| `npm run validate` | Run lint, tests, audit, build and artifact verification in sequence. |
| `npm run preview` | Serve the generated production build locally. |

Run `npm run validate` before pushing. It mirrors CI's validation steps; the workflow supplies the Pages environment described below.

## Source organization

- `Frontend/src/Pages` contains route-level views. The administrator workspace lives in `Pages/Admin/Workspace.jsx`.
- `Frontend/src/Components/Admin` groups administrator editors, preview components and workspace controls. Other shared and public components remain under `Components`.
- `Frontend/src/contexts` contains shared context definitions and their providers for authentication, content, theme and route transitions.
- Keep component tests and `*.styles.js` modules beside the code they exercise. Shared test setup belongs in `src/test`.
- Keep API, asset and interaction helpers under `src/utils`. Avoid compatibility re-exports when callers can import the implementation directly.
- `Frontend/src/data` includes bundled sample content and presets. The backend seed script also imports these modules, so check both applications before removing them.
- Backend runtime code belongs in `Backend/src`, operational commands in `Backend/scripts`, and integration tests in `Backend/test`.
- Keep local configuration, uploads, databases and generated artifacts outside tracked source. The root `.gitignore` defines these exclusions.

## Styling

Use Tailwind v4 utilities throughout the website. For complex book, folder and laptop states, complete utility strings live beside the component in `*.styles.js` modules. Semantic class names remain as interaction and test hooks; they do not define separate CSS rules.

`Frontend/src/index.css` contains the Tailwind import, local font declarations, theme tokens, shared keyframes and document defaults. Do not add component stylesheets. Inline styles only supply CSS custom properties for runtime data or measured animation geometry; Tailwind utilities apply them. The ESLint rule and `verify:styles` check enforce this convention during local lint and CI.

`verify:build` also checks that every utility in the style modules appears in the production CSS. Keep these modules as plain constants/functions. Use `String.raw` for selectors containing escaped underscores so the source scanner and runtime class name match.

## Public configuration

Copy `Frontend/.env.example` to `Frontend/.env.local` only when overriding defaults.

| Variable | Local default | GitHub Pages |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/` | `/ARPC-Final/` |
| `VITE_GITHUB_PAGES` | `false` | `true` |
| `VITE_API_URL` | `/api`, proxied to `http://127.0.0.1:4000`. | Set to the deployed API URL. |

`VITE_API_URL` is the public API base URL. It defaults to `/api`, which Vite proxies to the local Express server on port 4000. Requests use the shared cookie/header policy in `src/utils/api.js`. Start the backend alongside Vite; see [Backend setup](../Backend/README.md).

Every `VITE_*` value is exposed to the browser. Never put credentials or private data in these variables.

## Reproduce the Pages build

In PowerShell, from `Frontend`:

```powershell
$env:VITE_BASE_PATH = '/ARPC-Final/'
$env:VITE_GITHUB_PAGES = 'true'
npm run validate
npm run preview
```

In a POSIX shell:

```sh
VITE_BASE_PATH=/ARPC-Final/ VITE_GITHUB_PAGES=true npm run validate
npm run preview
```

Visit `/ARPC-Final/` on the preview server. Navigate to `#/team` and refresh to verify a production deep link.

## Course cover presets

Course records in `Frontend/src/data/catalogue.js` accept `coverTheme` and
`coverImage`. The eleven bundled presets are `reflection`, `writing`, `history`,
`learning`, `nature`, `science`, `community`, `leadership`, `language`,
`creativity` and `technology`. All use the site's forest, sage and gold palette.

```js
coverTheme: "science",
// Optional override: place this file in Frontend/public/images/courses/.
coverImage: "/images/courses/my-course.jpg",
```

`courseCoverPresets` exported from `Frontend/src/utils/courseCovers.js` provides
each preset's stable `id`, readable `label`, preview `cover`, folder `color` and
`ink`. The admin programme editor displays these previews and saves the chosen
`id` as `coverTheme` in its course record. Draft and published course content are
stored by the backend; bundled records also provide the seed script's sample data.

Without an explicit theme, the title and format select a subject illustration;
unmatched subjects use the general learning cover. A custom image takes precedence
and falls back to the selected illustration if it fails to load. Custom images may
also use an HTTPS URL entered in the image field. Bundled preset assets
use Vite imports, so their URLs work under the GitHub Pages deployment base.

## CI and deployment

The workflows live in [`.github/workflows/`](../.github/workflows/). Both frontend and backend validation must pass before an eligible `main` build can deploy the public site to Pages. Deployment is disabled until the repository variable `VITE_API_URL` is configured. CodeQL performs a separate JavaScript analysis. The workflow does not deploy the protected administrator artifact or provision backend services.

Build the administrator artifact separately, with the exact protected HTTPS origin. In PowerShell, from `Frontend`:

```powershell
$env:VITE_ADMIN_ORIGIN = 'https://admin.example.com'
$env:VITE_API_URL = '/api'
npm run build:admin
$env:BUILD_DIR = 'dist-admin'
$env:VITE_BASE_PATH = '/'
npm run verify:build
Remove-Item Env:BUILD_DIR
```

Replace the example origin with your deployment's origin. These environment values affect subsequent commands in the same terminal; restore your public build values before building the public site. The admin artifact still requires the gateway described in [admin hosting](admin-hosting.md).

GitHub Pages must use **GitHub Actions** as its publishing source. Production deployments use the `github-pages` environment and short-lived GitHub credentials. Pull requests validate without production deployment permissions.

Use **Actions → CI/CD** to inspect logs or dispatch a new run. A new push runs checks against the new commit; rerunning an old failed commit does not incorporate local fixes. Roll back with a revert pull request.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `[api] The local API is unavailable` or `/api` returns 503 | Start `npm run dev:local` in `Backend`, inspect that terminal for MongoDB/startup errors, and wait for `ARPC API listening on port 4000`. If Vite exited during startup, run `npm run dev` in `Frontend` again. |
| Dependency audit fails | Read the advisory, update the affected dependency, commit the lockfile and rerun validation. Keep the audit enabled. |
| Tests pass locally but fail in CI | Reproduce with `npm ci`, the supported Node version and the Pages environment. |
| Images or fonts disappear on Pages | Use `publicAsset()` for public images; check the base and run `verify:build`. |
| A refreshed route returns 404 | Ensure the Pages build has `VITE_GITHUB_PAGES=true` and uses hash links. |
| Windows installation reports `EPERM` | Stop Vite/preview processes that hold native package files, then retry `npm ci`. |

See [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite's deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).


## Backend

Public `/login`, `/register`, recovery and `/admin/*` routes are hidden. Use the
separate admin site described in [admin hosting](admin-hosting.md). Local admin
access requires `NODE_ENV=development`; production requires the configured
identity gateway and otherwise denies admin access.

The local MERN API, database, superadmin bootstrap, SMTP and Google configuration are documented in [Backend setup](../Backend/README.md). The public forms now submit to this API; start it alongside Vite. Run `npm test` in `Backend` for MongoDB integration checks.
