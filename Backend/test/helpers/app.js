import { createApp as application } from '../../src/app.js';

// These suites exercise ARPC sessions, roles and workflows behind a trusted
// perimeter. adminBoundary.test.js separately exercises the real perimeter,
// including JWT signatures. No runtime environment variable disables it.
export const createApp = (options = {}) => application({ adminBoundary: (req, res, next) => next(), ...options });
