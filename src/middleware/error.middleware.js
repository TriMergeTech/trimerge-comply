const { sendError } = require('../utils/response');

/**
 * Global error handler.
 * Must be registered LAST in Express middleware chain (after all routes).
 *
 * Handles:
 *   - Mongoose ValidationError
 *   - Mongoose duplicate key (E11000)
 *   - JWT errors
 *   - Generic errors
 */
const errorHandler = (err, req, res, next) => {
  // Already sent a response — let Express handle it
  if (res.headersSent) return next(err);

  const isDev = process.env.NODE_ENV === 'development';

  // Log every error server-side
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: isDev ? err.stack : undefined,
  });

  // ── Mongoose validation error ──────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, { statusCode: 400, message: 'Validation error', errors });
  }

  // ── Mongoose duplicate key ─────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, {
      statusCode: 409,
      message: `An account with that ${field} already exists`,
    });
  }

  // ── JWT errors (shouldn't reach here if middleware is correct) ──
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { statusCode: 401, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { statusCode: 401, message: 'Token expired' });
  }

  // ── Generic / unknown ──────────────────────────────────────
  return sendError(res, {
    statusCode: err.statusCode || 500,
    message: isDev ? err.message : 'Internal server error',
  });
};

/**
 * 404 handler — register BEFORE errorHandler but AFTER all routes.
 */
const notFound = (req, res) => {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
