const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetEmail } = require('../services/email.service');
const { sendSuccess, sendError } = require('../utils/response');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60;

const signup = async (req, res, next) => {
  try {
    const { email, password, phone, name, companyName } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, { statusCode: 400, message: 'Name is required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, { statusCode: 409, message: 'Email already registered' });
    }
    // Inherit org ID from an existing user with the same company, or create a new one
    let organizationId = null;
    if (companyName?.trim()) {
      const orgPeer = await User.findOne({ companyName: companyName.trim(), organizationId: { $ne: null } }).select('organizationId');
      organizationId = orgPeer?.organizationId ?? randomUUID();
    }
    const user = await User.create({ email, password, phone, name, companyName, organizationId });
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    user.otpCode = hashedOtp;
    user.otpExpiresAt = getOTPExpiry();
    user.otpPurpose = 'email_verification';
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();
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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
    }
    if (user.isLocked()) {
      const waitMs = user.lockedUntil - Date.now();
      const waitMin = Math.ceil(waitMs / 60000);
      return sendError(res, { statusCode: 423, message: `Account temporarily locked. Try again in ${waitMin} minute(s).` });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return sendError(res, { statusCode: 403, message: 'Email not verified. Request a new OTP to verify your account.' });
    }
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();
    return sendSuccess(res, {
      message: 'Login successful',
      data: { user: user.toPublicJSON(), accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTPHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otpCode +otpExpiresAt +otpPurpose +otpAttempts');
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }
    if (!user.otpCode) {
      return sendError(res, { statusCode: 400, message: 'No OTP found. Please request a new one.' });
    }
    if (isOTPExpired(user.otpExpiresAt)) {
      return sendError(res, { statusCode: 410, message: 'OTP expired. Please request a new one.' });
    }
    if (user.otpPurpose !== 'email_verification') {
      return sendError(res, { statusCode: 400, message: 'Invalid OTP purpose for this action.' });
    }
    if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      return sendError(res, { statusCode: 429, message: 'Too many invalid OTP attempts. Please request a new OTP.' });
    }
    const isValid = await verifyOTP(otp, user.otpCode);
    if (!isValid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return sendError(res, { statusCode: 400, message: 'Invalid OTP' });
    }
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = undefined;
    user.otpAttempts = undefined;
    user.otpLastSentAt = undefined;
    await user.save();
    return sendSuccess(res, { message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otpLastSentAt');
    if (!user) {
      return sendSuccess(res, { message: 'If that account exists, a new OTP has been sent.' });
    }
    if (user.isVerified) {
      return sendError(res, { statusCode: 400, message: 'Email already verified.' });
    }
    if (user.otpLastSentAt) {
      const secondsSinceLastSent = (Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < OTP_COOLDOWN_SECONDS) {
        const retryAfter = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastSent);
        return sendError(res, { statusCode: 429, message: `Please wait ${retryAfter} second(s) before requesting another OTP.` });
      }
    }
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    user.otpCode = hashedOtp;
    user.otpExpiresAt = getOTPExpiry();
    user.otpPurpose = 'email_verification';
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();
    sendOTPEmail(email, otp, 'email_verification').catch((err) =>
      console.error('[EMAIL] Failed to resend OTP:', err.message)
    );
    return sendSuccess(res, { message: 'If that account exists, a new OTP has been sent.' });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const successMsg = 'If that account exists, a password reset link has been sent.';
    const user = await User.findOne({ email });
    if (!user) {
      return sendSuccess(res, { message: successMsg });
    }
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${rawToken}`;
    sendPasswordResetEmail(email, resetUrl).catch((err) =>
      console.error('[EMAIL] Failed to send reset email:', err.message)
    );
    return sendSuccess(res, { message: successMsg });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +refreshToken');
    if (!user) {
      return sendError(res, { statusCode: 400, message: 'Invalid or expired reset token.' });
    }
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
    return sendSuccess(res, { message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return sendError(res, { statusCode: 401, message: 'Invalid or expired refresh token.' });
    }
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findById(decoded.sub).select('+refreshToken');
    if (!user || user.refreshToken !== hashedToken) {
      return sendError(res, { statusCode: 401, message: 'Refresh token mismatch. Please log in again.' });
    }
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    await user.save();
    return sendSuccess(res, {
      message: 'Tokens refreshed',
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    return sendSuccess(res, { message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -refreshToken -passwordResetToken -passwordResetExpires -otpCode -otpExpiresAt -otpPurpose -otpAttempts -otpLastSentAt -failedLoginAttempts -lockedUntil -isActive -__v'
    );
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }
    return sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
};

// Admin only — scoped to same company
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const ASSIGNABLE_ROLES = ['admin', 'director', 'manager', 'analyst', 'reviewer', 'viewer'];
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return sendError(res, {
        statusCode: 400,
        message: `Role must be one of: ${ASSIGNABLE_ROLES.join(', ')}.`,
      });
    }
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }
    user.role = role;
    await user.save();
    return sendSuccess(res, {
      message: `User role updated to ${role}.`,
      data: { user: user.toPublicJSON() },
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return sendError(res, { statusCode: 400, message: 'Old password and new password are required.' });
    }
    const user = await User.findById(req.user._id).select('+password +otpCode +otpExpiresAt +otpPurpose +otpAttempts +otpLastSentAt +pendingPasswordHash +pendingPasswordHashExpires');
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return sendError(res, { statusCode: 401, message: 'Old password is incorrect.' });
    }
    if (user.otpLastSentAt) {
      const secondsSinceLastSent = (Date.now() - new Date(user.otpLastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < OTP_COOLDOWN_SECONDS) {
        const retryAfter = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastSent);
        return sendError(res, { statusCode: 429, message: `Please wait ${retryAfter} second(s) before requesting another OTP.` });
      }
    }
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, rounds);
    user.otpCode = hashedOtp;
    user.otpExpiresAt = getOTPExpiry();
    user.otpPurpose = 'password_change';
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    user.pendingPasswordHash = hashedNewPassword;
    user.pendingPasswordHashExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    sendOTPEmail(user.email, otp, 'password_change').catch((err) =>
      console.error('[EMAIL] Failed to send password change OTP:', err.message)
    );
    return sendSuccess(res, { message: 'OTP sent to your email. Verify to complete password change.' });
  } catch (err) {
    next(err);
  }
};

const verifyChangePassword = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select(
      '+otpCode +otpExpiresAt +otpPurpose +otpAttempts +pendingPasswordHash +pendingPasswordHashExpires +refreshToken'
    );
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }
    if (!user.otpCode) {
      return sendError(res, { statusCode: 400, message: 'No OTP found. Please request a password change first.' });
    }
    if (isOTPExpired(user.otpExpiresAt)) {
      return sendError(res, { statusCode: 410, message: 'OTP expired. Please request a new one.' });
    }
    if (user.otpPurpose !== 'password_change') {
      return sendError(res, { statusCode: 400, message: 'Invalid OTP purpose.' });
    }
    if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
      return sendError(res, { statusCode: 429, message: 'Too many invalid OTP attempts. Please request a new OTP.' });
    }
    const isValid = await verifyOTP(otp, user.otpCode);
    if (!isValid) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return sendError(res, { statusCode: 400, message: 'Invalid OTP.' });
    }
    if (!user.pendingPasswordHash || new Date() > user.pendingPasswordHashExpires) {
      return sendError(res, { statusCode: 410, message: 'Password change session expired. Please start again.' });
    }
    await User.findByIdAndUpdate(user._id, {
      password: user.pendingPasswordHash,
      pendingPasswordHash: null,
      pendingPasswordHashExpires: null,
      otpCode: null,
      otpExpiresAt: null,
      otpPurpose: null,
      otpAttempts: 0,
      otpLastSentAt: null,
      refreshToken: null,
    });
    return sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

const changeName = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, { statusCode: 400, message: 'A name is required.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found.' });
    }
    user.name = name.trim();
    await user.save();
    return sendSuccess(res, {
      message: 'Profile updated successfully.',
      data: { user: user.toPublicJSON() },
    });
  } catch (err) {
    next(err);
  }
};

// Scoped to same company
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ organizationId: req.user.organizationId })
      .select('_id name email role companyName organizationId isVerified createdAt')
      .sort({ createdAt: -1 });
    return sendSuccess(res, {
      message: 'Users retrieved successfully',
      data: { users, total: users.length },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, verifyOTPHandler, resendOTP, forgotPassword, resetPassword, refreshTokens, logout, getMe, updateUserRole, changePassword, verifyChangePassword, changeName, getUsers };