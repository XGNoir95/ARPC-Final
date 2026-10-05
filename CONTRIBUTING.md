# Contributing

1. Use Node.js 24 LTS and run `npm ci` in `Frontend`.
2. Create a feature branch from `main`.
3. Keep styling consistent with the existing Tailwind and EB Garamond conventions.
4. Add meaningful tests for changed interactions, routes, or deployment behavior.
5. Run `npm run validate` in `Frontend` before opening a pull request.

Describe the resulting behavior and include screenshots for interface changes. Do not commit `node_modules`, `dist`, local `.env` files, API credentials, or generated coverage files.

Pull requests run the same checks as production pushes. Deployment happens automatically after a passing change reaches `main`; use a revert pull request to roll back.
