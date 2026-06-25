const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, { statusCode: 401, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const message =
        err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      return sendError(res, { statusCode: 401, message });
    }

    const user = await User.findById(decoded.sub).select(
      '-password -refreshToken -passwordResetToken -passwordResetExpires -otpCode -otpExpiresAt -otpPurpose -otpAttempts -otpLastSentAt'
    );
    if (!user || !user.isActive) {
      return sendError(res, { statusCode: 401, message: 'User not found or deactivated' });
    }

    if (!user.isVerified) {
      return sendError(res, {
        statusCode: 403,
        message: 'Email not verified. Please verify your account first.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return sendError(res, {
      statusCode: 403,
      message: 'Email not verified. Please verify your account first.',
    });
  }
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, { statusCode: 401, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, { statusCode: 403, message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select(
      '-password -refreshToken -passwordResetToken -passwordResetExpires -otpCode -otpExpiresAt -otpPurpose -otpAttempts -otpLastSentAt'
    );

    if (user && user.isActive) {
      req.user = user;
    }

    return next();
  } catch (err) {
    return next();
  }
};

module.exports = { protect, optionalProtect, requireVerified, requireRole };
