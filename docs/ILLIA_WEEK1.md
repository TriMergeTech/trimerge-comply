# Illia - Week 1 Backend Notes

## Current Focus

I am working on the OTP and suspicious-activity side of the authentication flow.

## My Initial Scope

- Define OTP policy rules.
- Prepare resend cooldown and attempt-limit logic.
- Prepare simple suspicious-activity event shapes.
- Keep the first version rule-based before adding heavier AI logic.

## Code Added

Added `src/utils/otpPolicy.js` as a safe helper module. It does not change existing auth behavior yet, but it gives the team reusable OTP rules for purpose validation, resend cooldowns, max attempts, and future security event logging.

## Planned Small Updates

- Tomorrow: add OTP attempt/cooldown fields to the user schema or a small security event model, depending on team feedback.
- Friday: connect the policy helper into `verifyOTPHandler` or `resendOTP`, or add basic docs/tests if the auth flow is still being reviewed.

## Open Questions

- Should OTP be used only for signup verification, or also login and password reset?
- What should the final OTP attempt limit be?
- What should the resend cooldown be?
