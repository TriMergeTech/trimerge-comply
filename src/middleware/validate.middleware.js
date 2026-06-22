const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Run after validation chains.
 * If there are errors, returns 422 with a structured error array.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Rule sets ───────────────────────────────────────────────

const signupRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Must be a valid phone number'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const verifyOTPRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),
];

const resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Must contain at least one number'),
];

const refreshTokenRules = [
  body('refreshToken')
    .trim()
    .notEmpty().withMessage('Refresh token is required'),
];

const DEMO_INTERESTS = [
  'adverse_impact_analysis',
  'pay_equity_analysis',
  'position_description_review',
  'all_of_the_above',
];

const demoRequestRules = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 80 }).withMessage('First name must be 80 characters or fewer'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 80 }).withMessage('Last name must be 80 characters or fewer'),
  body('workEmail')
    .trim()
    .notEmpty().withMessage('Work email is required')
    .isEmail().withMessage('Must be a valid work email')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Work email must be 254 characters or fewer'),
  body('organization')
    .trim()
    .notEmpty().withMessage('Organization is required')
    .isLength({ max: 160 }).withMessage('Organization must be 160 characters or fewer'),
  body('jobTitle')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ max: 120 }).withMessage('Job title must be 120 characters or fewer'),
  body('phoneNumber')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 40 }).withMessage('Phone number must be 40 characters or fewer')
    .matches(/^[+()\-\s.\d]+$/).withMessage('Phone number contains invalid characters'),
  body('companySize')
    .trim()
    .notEmpty().withMessage('Company size is required')
    .isLength({ max: 80 }).withMessage('Company size must be 80 characters or fewer'),
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isLength({ max: 100 }).withMessage('Role must be 100 characters or fewer'),
  body('interests')
    .optional()
    .isArray({ max: 4 }).withMessage('Interests must be an array with no more than 4 items'),
  body('interests.*')
    .isIn(DEMO_INTERESTS)
    .withMessage('Interest must be one of: adverse_impact_analysis, pay_equity_analysis, position_description_review, all_of_the_above'),
  body('additionalDetails')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 }).withMessage('Additional details must be 2000 characters or fewer'),
];

const demoRequestStatusRules = [
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['new', 'contacted', 'scheduled', 'closed'])
    .withMessage('Status must be one of: new, contacted, scheduled, closed'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  verifyOTPRules,
  forgotPasswordRules,
  resetPasswordRules,
  refreshTokenRules,
  demoRequestRules,
  demoRequestStatusRules,
};
