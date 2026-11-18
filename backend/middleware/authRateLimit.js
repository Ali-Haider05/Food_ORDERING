const { rateLimit } = require('express-rate-limit');

function authRateLimit(limit) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Try again later.' },
  });
}

module.exports = { signupLimit: authRateLimit(10), loginLimit: authRateLimit(20) };
