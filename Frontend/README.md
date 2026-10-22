# ARPC frontend

React, Vite, and Tailwind CSS application for Ahsanullah Roh. Peace Club.

Start the backend first in a separate terminal (`cd Backend` from the repository root, then `npm run dev:local`; see [backend setup](../Backend/README.md)). From `Frontend`:

```sh
npm ci
npm run dev
```

Vite waits for backend/database readiness before opening port 5173 and briefly holds API requests during backend restarts. Keep both terminals running.

For the separate admin site, run `npm run dev:admin` in another terminal and open
`http://admin.localhost:5174/login`. Admin routes are unavailable on the public
site. See [admin hosting](../docs/admin-hosting.md) for production identity-provider
configuration and `npm run build:admin`.

```sh
npm run validate
```

See the [project README](../README.md) for deployment, environment variables, CI/CD, and operating instructions.
