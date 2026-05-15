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
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');
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

// POST /api/auth/signup
router.post('/signup', ...signupRules, validate, signup);

// POST /api/auth/login
router.post('/login', ...loginRules, validate, login);

// POST /api/auth/verify-otp
router.post('/verify-otp', ...verifyOTPRules, validate, verifyOTPHandler);

// POST /api/auth/resend-otp
router.post('/resend-otp', ...forgotPasswordRules, validate, resendOTP);

// POST /api/auth/forgot-password
router.post('/forgot-password', ...forgotPasswordRules, validate, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', ...resetPasswordRules, validate, resetPassword);

// POST /api/auth/refresh
router.post('/refresh', ...refreshTokenRules, validate, refreshTokens);

// ── Protected routes (require valid access token) ────────────

// POST /api/auth/logout
router.post('/logout', protect, logout);

module.exports = router;
