const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const OTP_LENGTH = 6;

/**
 * Generate a cryptographically secure numeric OTP.
 * Uses crypto.randomInt for uniform distribution — NOT Math.random().
 */
const generateOTP = () => {
  const digits = [];
  for (let i = 0; i < OTP_LENGTH; i++) {
    digits.push(crypto.randomInt(0, 10));
  }
  return digits.join('');
};

/**
 * Hash an OTP before storing it.
 * We treat OTPs like passwords — never store plaintext.
 */
const hashOTP = async (otp) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return bcrypt.hash(otp, rounds);
};

/**
 * Compare a raw OTP against a stored hash.
 */
const verifyOTP = async (rawOTP, hashedOTP) => {
  return bcrypt.compare(rawOTP, hashedOTP);
};

/**
 * Return the OTP expiry Date object.
 */
const getOTPExpiry = () => {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check whether an OTP expiry timestamp has passed.
 */
const isOTPExpired = (expiresAt) => {
  return !expiresAt || new Date() > new Date(expiresAt);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
  isOTPExpired,
};
