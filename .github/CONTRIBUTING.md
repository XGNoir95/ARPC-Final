# Contributing to ARPC

1. Use Node.js 24 LTS and run `npm ci` in `Frontend`.
2. Create a feature branch from `main`.
3. Keep styling consistent with the existing Tailwind and EB Garamond conventions.
4. Add meaningful tests for changed interactions, routes, or deployment behavior.
5. Run `npm run validate` in `Frontend` before opening a pull request. This includes the dependency audit; commit the lockfile whenever dependencies change.

Describe the resulting behavior and include screenshots for interface changes. Do not commit `node_modules`, `dist`, local `.env` files, API credentials, or generated coverage files.

Pull requests run the same checks as production pushes. Deployment happens automatically after a passing change reaches `main`; use a revert pull request to roll back.

## Keep changes focused

Use descriptive branches such as `feat/event-details`, `fix/mobile-navigation` or `docs/developer-guide`. Explain the resulting behavior in the pull request, rather than listing every edit. Separate unrelated dependency updates from interface changes.

Delete merged branches when they are no longer needed. Preserve branches with active pull requests until their changes are merged or deliberately declined.

The [developer guide](../docs/DEVELOPMENT.md) covers local setup, deployment configuration and troubleshooting. The [architecture document](../docs/ARCHITECTURE.md) describes the application's implemented scope.
