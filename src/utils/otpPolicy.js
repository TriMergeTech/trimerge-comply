const OTP_PURPOSES = Object.freeze({
  EMAIL_VERIFICATION: 'email_verification',
  LOGIN: 'login',
  PASSWORD_RESET: 'password_reset',
});

const DEFAULT_POLICY = Object.freeze({
  maxVerifyAttempts: 5,
  resendCooldownSeconds: 60,
  expiresMinutes: Number.parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 10,
});

const PURPOSE_POLICIES = Object.freeze({
  [OTP_PURPOSES.EMAIL_VERIFICATION]: DEFAULT_POLICY,
  [OTP_PURPOSES.LOGIN]: {
    ...DEFAULT_POLICY,
    maxVerifyAttempts: 3,
    resendCooldownSeconds: 90,
  },
  [OTP_PURPOSES.PASSWORD_RESET]: {
    ...DEFAULT_POLICY,
    maxVerifyAttempts: 5,
    resendCooldownSeconds: 120,
  },
});

const normalizeOtpPurpose = (purpose) => {
  if (!purpose || typeof purpose !== 'string') {
    return OTP_PURPOSES.EMAIL_VERIFICATION;
  }

  return Object.values(OTP_PURPOSES).includes(purpose)
    ? purpose
    : OTP_PURPOSES.EMAIL_VERIFICATION;
};

const getOtpPolicy = (purpose) => {
  const normalizedPurpose = normalizeOtpPurpose(purpose);
  return PURPOSE_POLICIES[normalizedPurpose];
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
  normalizeOtpPurpose,
  canRequestNewOtp,
  hasExceededOtpAttempts,
  buildOtpSecurityEvent,
};
