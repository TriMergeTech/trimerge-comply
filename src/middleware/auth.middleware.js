const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const User = require('../models/User');

/**
 * Protect middleware — attaches req.user on valid JWT.
 * Usage: router.get('/profile', protect, controller)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, { statusCode: 401, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify signature + expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      return sendError(res, { statusCode: 401, message });
    }

    // 3. Confirm user still exists and is active
    const user = await User.findById(decoded.sub).select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    if (!user || !user.isActive) {
      return sendError(res, { statusCode: 401, message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * requireVerified — use AFTER protect.
 * Blocks unverified accounts from accessing sensitive routes.
 */
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return sendError(res, {
      statusCode: 403,
      message: 'Email not verified. Please verify your account first.',
    });
  }
  next();
};

/**
 * requireRole — use AFTER protect.
 * Restricts a route to users with one of the specified roles.
 * Usage: router.get('/export', protect, requireVerified, requireRole('analyst', 'admin'), controller)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, {
      statusCode: 403,
      message: 'Forbidden — insufficient role',
    });
  }
  next();
};

module.exports = { protect, requireVerified, requireRole };
