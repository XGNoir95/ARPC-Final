# Contributing to ARPC

1. Use Node.js 24 and run `npm ci` separately in `Frontend` and `Backend`. Follow the [local setup](../README.md#run-locally) when running the application.
2. Create a feature branch from `main`.
3. Keep styling consistent with the existing Tailwind and EB Garamond conventions.
4. Add meaningful tests for changed interactions, routes, or deployment behavior.
5. Run `npm run validate` in `Frontend` before opening a pull request. This includes the dependency audit; commit the lockfile whenever dependencies change.
6. For backend changes, run `npm run check`, `npm test` and `npm audit --audit-level=high` in `Backend`. Use a dedicated `REDIS_TEST_URL` for Redis integration checks.

Describe the resulting behavior and include screenshots for interface changes. Do not commit `node_modules`, `dist`, local `.env` files, API credentials, or generated coverage files.

Pull requests run the same validation checks as production pushes. Eligible changes on `main` deploy the public site to GitHub Pages only when the repository variable `VITE_API_URL` is configured and both validation jobs pass. The administrator site and backend require separate deployment. Use a revert pull request to roll back source changes.

## Keep changes focused

Use descriptive branches such as `feat/event-details`, `fix/mobile-navigation` or `docs/developer-guide`. Explain the resulting behavior in the pull request, rather than listing every edit. Separate unrelated dependency updates from interface changes.

Delete merged branches when they are no longer needed. Preserve branches with active pull requests until their changes are merged or deliberately declined.

The [developer guide](../docs/DEVELOPMENT.md) covers local setup, deployment configuration and troubleshooting. The [architecture document](../docs/ARCHITECTURE.md) describes the application's implemented scope.
