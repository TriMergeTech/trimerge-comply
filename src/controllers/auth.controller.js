const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/email.service');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Constants ───────────────────────────────────────────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// ────────────────────────────────────────────────────────────
// POST /auth/signup
// ────────────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;

    // Check duplicate (belt-and-suspenders — schema unique handles DB level)
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, { statusCode: 409, message: 'Email already registered' });
    }

    // Create user — password hashed in pre-save hook
    const user = await User.create({ email, password, phone });

    // Send email verification OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    user.otp = {
      code: hashedOtp,
      expiresAt: getOTPExpiry(),
      purpose: 'email_verification',
    };
    await user.save();

    // Fire and forget — don't let email failure block signup response
    sendOTPEmail(email, otp, 'email_verification').catch((err) =>
      console.error('[EMAIL] Failed to send verification OTP:', err.message)
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created. Check your email for the verification code.',
      data: { user: user.toPublicJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/login
// ────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user WITH password (field is select: false)
    const user = await User.findOne({ email }).select('+password +refreshToken +otp');
    if (!user) {
      // Use vague message to prevent user enumeration
      return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
    }

    // Check account lock
    if (user.isLocked()) {
      const waitMs = user.lockedUntil - Date.now();
      const waitMin = Math.ceil(waitMs / 60000);
      return sendError(res, {
        statusCode: 423,
        message: `Account temporarily locked. Try again in ${waitMin} minute(s).`,
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0; // reset counter after lock
      }
      await user.save();
      return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return sendError(res, {
        statusCode: 403,
        message: 'Email not verified. Request a new OTP to verify your account.',
      });
    }

    // Successful login — reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();

    // Issue tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token (don't store raw JWT in DB)
    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    return sendSuccess(res, {
      message: 'Login successful',
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/verify-otp
// ────────────────────────────────────────────────────────────
const verifyOTPHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.purpose');
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    // Guard: OTP must exist
    if (!user.otp?.code) {
      return sendError(res, { statusCode: 400, message: 'No OTP found. Please request a new one.' });
    }

    // Guard: expiry check
    if (isOTPExpired(user.otp.expiresAt)) {
      return sendError(res, { statusCode: 410, message: 'OTP expired. Please request a new one.' });
    }

    // Guard: purpose must be email_verification (this endpoint is for signup flow)
    if (user.otp.purpose !== 'email_verification') {
      return sendError(res, { statusCode: 400, message: 'Invalid OTP purpose for this action.' });
    }

    // Verify
    const isValid = await verifyOTP(otp, user.otp.code);
    if (!isValid) {
      return sendError(res, { statusCode: 400, message: 'Invalid OTP' });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/resend-otp
// ────────────────────────────────────────────────────────────
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.purpose');
    if (!user) {
      // Vague — don't leak whether email exists
      return sendSuccess(res, { message: 'If that account exists, a new OTP has been sent.' });
    }

    if (user.isVerified) {
      return sendError(res, { statusCode: 400, message: 'Email already verified.' });
    }

    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);

    user.otp = {
      code: hashedOtp,
      expiresAt: getOTPExpiry(),
      purpose: 'email_verification',
    };
    await user.save();

    sendOTPEmail(email, otp, 'email_verification').catch((err) =>
      console.error('[EMAIL] Failed to resend OTP:', err.message)
    );

    return sendSuccess(res, { message: 'If that account exists, a new OTP has been sent.' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/forgot-password
// ────────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always return the same message regardless of whether email exists
    const successMsg = 'If that account exists, a password reset link has been sent.';

    const user = await User.findOne({ email });
    if (!user) {
      return sendSuccess(res, { message: successMsg });
    }

    // Generate a secure random token (raw) — hash it for storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Build reset URL — frontend handles the form
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${rawToken}`;

    sendPasswordResetEmail(email, resetUrl).catch((err) =>
      console.error('[EMAIL] Failed to send reset email:', err.message)
    );

    return sendSuccess(res, { message: successMsg });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/reset-password
// ────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the incoming raw token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +refreshToken');

    if (!user) {
      return sendError(res, { statusCode: 400, message: 'Invalid or expired reset token.' });
    }

    // Update password — pre-save hook will hash it
    user.password = newPassword;

    // Invalidate the reset token AND any active sessions
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // force re-login

    await user.save();

    return sendSuccess(res, { message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/refresh
// ────────────────────────────────────────────────────────────
const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify JWT signature
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return sendError(res, { statusCode: 401, message: 'Invalid or expired refresh token.' });
    }

    // Compare hashed token with DB record
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findById(decoded.sub).select('+refreshToken');

    if (!user || user.refreshToken !== hashedToken) {
      return sendError(res, { statusCode: 401, message: 'Refresh token mismatch. Please log in again.' });
    }

    // Issue new tokens (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.save();

    return sendSuccess(res, {
      message: 'Tokens refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────────────────────
// POST /auth/logout
// ────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return sendSuccess(res, { message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login,
  verifyOTPHandler,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshTokens,
  logout,
};
