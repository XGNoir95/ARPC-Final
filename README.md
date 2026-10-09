<p align="center">
  <img src="Frontend/public/newLogo.png" alt="Ahsanullah Roh. Peace Club emblem" width="100" />
</p>

<h1 align="center">ARPC</h1>

<p align="center">
  <strong>Ahsanullah Roh. Peace Club · AUST</strong><br />
  A campus community brought together by learning, friendship and service.
</p>

<p align="center">
  <a href="https://xgnoir95.github.io/ARPC-Final/">Live website</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a> ·
  <a href="docs/DEVELOPMENT.md">Developer guide</a> ·
  <a href=".github/CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/XGNoir95/ARPC-Final/actions/workflows/ci-cd.yml"><img src="https://github.com/XGNoir95/ARPC-Final/actions/workflows/ci-cd.yml/badge.svg" alt="CI/CD status" /></a>
  <a href="https://github.com/XGNoir95/ARPC-Final/actions/workflows/codeql.yml"><img src="https://github.com/XGNoir95/ARPC-Final/actions/workflows/codeql.yml/badge.svg" alt="CodeQL status" /></a>
  <img src="https://img.shields.io/badge/React-19-173d2e?logo=react&amp;logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-173d2e?logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS 4" />
</p>

## The website

ARPC's website introduces the club, its people, events and affiliations. The interface pairs forest green and sage with EB Garamond typography, campus photography and responsive layouts.

| Experience | What it includes |
| --- | --- |
| Home | A rotating hero, interactive club introductions, featured events and an affiliation carousel. |
| Panel | Executive committee and team profiles with local portrait placeholders. |
| Club reflection | A founder's quotation, expandable reflection and club contact links. |
| Member interfaces | Login, registration and a profile view with event and certificate tabs. |

**Current scope:** this repository is a frontend application. Member interfaces use placeholder data and behavior; authentication, registration, certificate generation and a backend service are not implemented.

## Run locally

Use **Node.js 24 LTS** and npm. The supported Node versions are defined in [`Frontend/package.json`](Frontend/package.json); [`.nvmrc`](.nvmrc) selects Node 24.

```sh
git clone https://github.com/XGNoir95/ARPC-Final.git
cd ARPC-Final/Frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. Environment configuration is optional for the default frontend; start from [`Frontend/.env.example`](Frontend/.env.example) when needed.

## Quality checks

Run this from `Frontend` before pushing:

```sh
npm run validate
```

It runs **lint → tests → dependency audit → production build → artifact verification**. CI uses the same checks and installs dependencies from the committed lockfile. CodeQL provides a separate JavaScript security check.

For individual commands, deployment settings and troubleshooting, see the [developer guide](docs/DEVELOPMENT.md).

## Repository layout

```text
ARPC-Final/
├── .github/                 # Workflows, issue forms and contributor policies
├── docs/                    # Architecture and development guidance
├── Frontend/
│   ├── public/              # Club images, local fonts and other static assets
│   ├── scripts/             # Production artifact verification
│   └── src/
│       ├── Components/      # Shared UI and home/profile components
│       ├── Pages/           # Route-level views
│       ├── contexts/        # Shared route-transition state
│       ├── test/            # Test environment setup
│       └── utils/           # Deployment-aware public asset URLs
├── .gitattributes           # Consistent text line endings
├── .gitignore               # Generated files and local configuration
├── .nvmrc                   # Development Node version
└── README.md
```

## Deployment

Successful pushes to `main` deploy to **GitHub Pages** through the [CI/CD workflow](.github/workflows/ci-cd.yml). Pull requests validate changes without deploying them.

The Pages build uses `/ARPC-Final/` as its asset base and hash routing for refresh-safe page links, such as [`#/team`](https://xgnoir95.github.io/ARPC-Final/#/team). The [architecture document](docs/ARCHITECTURE.md) explains this choice and the application's current boundaries.

## Contribute

Use a focused feature branch and a pull request into `main`. Include validation results and, for interface changes, desktop and mobile screenshots. See the [contribution guide](.github/CONTRIBUTING.md).

Report defects through the [issue forms](https://github.com/XGNoir95/ARPC-Final/issues/new/choose). Report security concerns through the [security policy](.github/SECURITY.md).
