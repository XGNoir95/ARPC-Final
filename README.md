# Ahsanullah Roh. Peace Club — ARPC

[![CI/CD](https://github.com/XGNoir95/ARPC-Final/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/XGNoir95/ARPC-Final/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/XGNoir95/ARPC-Final/actions/workflows/codeql.yml/badge.svg)](https://github.com/XGNoir95/ARPC-Final/actions/workflows/codeql.yml)

A React and Tailwind website for the AUST student community, with event highlights, club information, team pages, and profile interfaces.

**Website:** [xgnoir95.github.io/ARPC-Final](https://xgnoir95.github.io/ARPC-Final/)

## Project structure

- `Frontend/`: React 19, Vite, Tailwind CSS 4, React Router, and component tests.
- `Backend/`: reserved for future backend work; no API service is implemented yet.
- `.github/`: automated validation, deployment, code scanning, and dependency updates.

Login, registration, and profile interfaces currently use placeholder behavior/data. Publishing the frontend does not create a working authentication backend.

## Local development

Use Node.js 24 LTS (see `.nvmrc`). Node.js 22.12+ is also supported.

```sh
cd Frontend
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` when configuration is needed. `VITE_*` values are embedded in the public browser bundle: use them for deployment paths and API URLs, never passwords or tokens.

```sh
npm run lint
npm test
npm run build
npm run verify:build
npm run preview
```

`npm run validate` runs lint, tests, the production build, and artifact verification in sequence. `npm run test:watch` is available while developing.

## CI/CD

Every pull request and push to `main` runs:

1. Reproducible installation from `Frontend/package-lock.json` with `npm ci`.
2. ESLint with zero warnings, component/deployment tests, and a dependency audit.
3. A production build and verification of generated scripts, styles, fonts, and local images.

Only a successful `main` build is packaged and deployed to the `github-pages` environment. Pull requests run validation without production deployment permissions. Permissions are scoped per job, actions are pinned to verified commit SHAs, and production runs are serialized.

CodeQL runs on pull requests, pushes, and weekly. Dependabot proposes npm and GitHub Actions updates weekly; changes still go through CI.

### Deployment configuration

The workflow sets `VITE_BASE_PATH=/ARPC-Final/` and `VITE_GITHUB_PAGES=true`. Local development keeps standard browser routes; the Pages build uses hash routes such as `/ARPC-Final/#/team`, so navigation and refreshed deep links work on a static host.

Public images use `src/utils/publicAsset.js`, and Vite rewrites CSS/font paths for the configured base. No deployment credential is stored in the repository: Pages uses the workflow's short-lived identity.

In GitHub **Settings → Pages**, the publishing source must be **GitHub Actions**. The `github-pages` environment permits deployment from `main`. See [GitHub's workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite's deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

### Operating the pipeline

- Open **Actions → CI/CD** to see validation and deployment logs.
- Re-run a failed job after fixing its cause, or use **Run workflow** on `main` for a redeploy.
- Revert a problematic source commit through a pull request to deploy the previous behavior. Pages artifacts are retained for three days; source history is the durable rollback record.
- If an audit fails, update the affected package and rerun `npm run validate`; do not disable the audit to bypass it.

## Contribution

Use a feature branch and pull request into `main`. The required `Validate frontend` check must pass before merging. See [CONTRIBUTING.md](CONTRIBUTING.md).
