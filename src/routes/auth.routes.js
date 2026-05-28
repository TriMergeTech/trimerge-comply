const { Router } = require('express');
const {
  signup,
  login,
  verifyOTPHandler,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshTokens,
  logout,
  getMe,
  updateUserRole,
  changePassword,
  verifyChangePassword,
  changeName,
  getUsers,
} = require('../controllers/auth.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  validate,
  signupRules,
  loginRules,
  verifyOTPRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
} = require('../middleware/validate.middleware');

const router = Router();

// ── Public routes ────────────────────────────────────────────
router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.post('/verify-otp', verifyOTPRules, validate, verifyOTPHandler);
router.post('/resend-otp', forgotPasswordRules, validate, resendOTP);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.post('/refresh', refreshTokenRules, validate, refreshTokens);

// ── Protected routes ─────────────────────────────────────────
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// ── Profile management ───────────────────────────────────────
router.patch('/change-password', protect, changePassword);
router.post('/change-password/verify', protect, verifyChangePassword);
router.patch('/change-name', protect, changeName);

// ── User management ──────────────────────────────────────────
router.get('/users', protect, requireRole('analyst', 'admin'), getUsers);

// ── Admin only ───────────────────────────────────────────────
router.patch('/users/:id/role', protect, requireRole('admin'), updateUserRole);

module.exports = router;