const OTP_PURPOSES = Object.freeze({
  EMAIL_VERIFICATION: 'email_verification',
});

const DEFAULT_POLICY = Object.freeze({
  maxVerifyAttempts: 5,
  resendCooldownSeconds: 60,
});

const normalizeOtpPurpose = (purpose) => {
  if (purpose === OTP_PURPOSES.EMAIL_VERIFICATION) {
    return purpose;
  }

  return OTP_PURPOSES.EMAIL_VERIFICATION;
};

const getOtpPolicy = (purpose) => {
  normalizeOtpPurpose(purpose);
  return DEFAULT_POLICY;
};

const canRequestNewOtp = ({ lastSentAt, purpose, now = new Date() }) => {
  if (!lastSentAt) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const policy = getOtpPolicy(purpose);
  const elapsedMs = now.getTime() - new Date(lastSentAt).getTime();
  const cooldownMs = policy.resendCooldownSeconds * 1000;

  if (elapsedMs >= cooldownMs) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000),
  };
};

const hasExceededOtpAttempts = ({ attempts = 0, purpose }) => {
  const policy = getOtpPolicy(purpose);
  return attempts >= policy.maxVerifyAttempts;
};

const buildOtpSecurityEvent = ({ email, purpose, eventType, ip, userAgent }) => ({
  type: eventType,
  email,
  purpose: normalizeOtpPurpose(purpose),
  ip: ip || null,
  userAgent: userAgent || null,
  createdAt: new Date(),
});

module.exports = {
  OTP_PURPOSES,
  getOtpPolicy,
  canRequestNewOtp,
  hasExceededOtpAttempts,
  buildOtpSecurityEvent,
};
