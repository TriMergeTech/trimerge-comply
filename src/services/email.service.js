const FormData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(FormData);

// Lazy-initialize the client so missing env vars only blow up at send time,
// not at module load (which would crash the whole server on startup).
let _client = null;
const getClient = () => {
  if (!_client) {
    _client = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
  }
  return _client;
};

/**
 * Core send function — all other helpers call this.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const client = getClient();
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_SENDER;

  if (!domain || !from) {
    throw new Error('Mailgun MAILGUN_DOMAIN and MAILGUN_SENDER env vars are required');
  }

  const msg = await client.messages.create(domain, {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  });

  return msg;
};

/**
 * Send an OTP code email.
 * @param {string} email   - Recipient address
 * @param {string} otp     - Plaintext OTP (6 digits)
 * @param {'email_verification'|'password_reset'|'login'} purpose
 */
const sendOTPEmail = async (email, otp, purpose = 'email_verification') => {
  const labels = {
    email_verification: 'Verify your email',
    password_reset: 'Reset your password',
    login: 'Your login OTP',
  };

  const subject = labels[purpose] || 'Your OTP code';
  const expiryMinutes = parseInt(process.env.OTP_EXPIRES_MINUTES) || 10;

  const text = `Your OTP code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\nDo not share this code with anyone.`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>${subject}</h2>
      <p>Use the code below to proceed. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 16px 0; color: #1a1a1a;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 13px;">Do not share this code with anyone.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send a password reset link email.
 * @param {string} email       - Recipient address
 * @param {string} resetToken  - Raw (unhashed) reset token
 * @param {string} resetUrl    - Full URL including the token, built by the caller
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Password reset request';
  const text = `You requested a password reset.\n\nClick the link below (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Reset your password</h2>
      <p>Click the button below to set a new password. The link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;">
        Reset password
      </a>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail };
