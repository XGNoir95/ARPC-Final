import { rateLimit } from 'express-rate-limit';

// All API limits must use JSON; clients can then report HTTP 429 accurately.
export const jsonLimiter = ({ message, ...options }) => rateLimit({
  standardHeaders: 'draft-8', legacyHeaders: false, ...options,
  message: { message, code: 'RATE_LIMITED' },
});
