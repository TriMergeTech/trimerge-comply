/**
 * Unified API response helpers.
 * Every controller uses these — no raw res.json() calls allowed.
 *
 * Shape:
 *   { success: true,  message, data }
 *   { success: false, message, errors? }
 */

const sendSuccess = (res, { statusCode = 200, message = 'OK', data = null } = {}) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

const sendError = (res, { statusCode = 500, message = 'Internal server error', errors = null } = {}) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
