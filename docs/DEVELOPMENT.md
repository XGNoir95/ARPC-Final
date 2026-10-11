# Developer guide

## Setup

Use Node.js 24 LTS, then run these commands from `Frontend`:

```sh
npm ci
npm run dev
```

Use the URL printed by Vite. Do not run a clean installation over an active Vite process on Windows: native build packages can be locked while the server is running. Stop the server before `npm ci`, then restart it afterward.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot module replacement. |
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
| `VITE_API_ORIGIN` | No service configured; the example suggests `http://localhost:5000`. | Not configured by the workflow. |

`VITE_API_ORIGIN` is reserved for a future backend. The Axios client appends `/api` to a configured origin and otherwise uses `/api`; there is no implemented backend in this repository.

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
`ink`. A future admin cover picker can display these previews and save the chosen
`id` as `coverTheme` in its course record. No admin or backend is implemented yet.

Without an explicit theme, the title and format select a subject illustration;
unmatched subjects use the general learning cover. A custom image takes precedence
and falls back to the selected illustration if it fails to load. Custom images may
also use an HTTPS URL supplied by a future upload service. Bundled preset assets
use Vite imports, so their URLs work under the GitHub Pages deployment base.

## CI and deployment

The workflows live in [`.github/workflows/`](../.github/workflows/). `Validate frontend` must pass before a `main` build can deploy. CodeQL performs a separate JavaScript analysis.

GitHub Pages must use **GitHub Actions** as its publishing source. Production deployments use the `github-pages` environment and short-lived GitHub credentials. Pull requests validate without production deployment permissions.

Use **Actions → CI/CD** to inspect logs or dispatch a new run. A new push runs checks against the new commit; rerunning an old failed commit does not incorporate local fixes. Roll back with a revert pull request.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| Dependency audit fails | Read the advisory, update the affected dependency, commit the lockfile and rerun validation. Keep the audit enabled. |
| Tests pass locally but fail in CI | Reproduce with `npm ci`, the supported Node version and the Pages environment. |
| Images or fonts disappear on Pages | Use `publicAsset()` for public images; check the base and run `verify:build`. |
| A refreshed route returns 404 | Ensure the Pages build has `VITE_GITHUB_PAGES=true` and uses hash links. |
| Windows installation reports `EPERM` | Stop Vite/preview processes that hold native package files, then retry `npm ci`. |

See [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite's deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).
