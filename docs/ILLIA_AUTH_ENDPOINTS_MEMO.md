# Illia - Auth Endpoint Memo

## Confirmed Direction

- Backend: JavaScript with Node.js and Express
- Auth strategy: JWT access token plus refresh token
- OTP scope: signup verification only
- Password reset: secure email reset link, not OTP
- Secrets: MongoDB URI, JWT secrets, and Mailgun keys stay in local `.env`

## Auth Endpoints

| Method | Endpoint | Purpose | Illia Focus |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Create account and send signup OTP | OTP policy starts here |
| POST | `/api/auth/verify-otp` | Verify signup OTP and activate account | Attempt tracking |
| POST | `/api/auth/resend-otp` | Send a new signup OTP | Resend cooldown |
| POST | `/api/auth/login` | Return access and refresh tokens | Future suspicious login events |
| POST | `/api/auth/refresh` | Rotate refresh token | No OTP |
| POST | `/api/auth/forgot-password` | Send reset link | Link token only |
| POST | `/api/auth/reset-password` | Set new password | Invalidate sessions |
| POST | `/api/auth/logout` | Clear refresh token | No OTP |

## Today’s OTP Update

Added policy support for signup OTP verification:

- OTP failed-attempt tracking
- OTP resend cooldown
- OTP purpose constant for signup verification
- Reusable OTP policy helper for future suspicious-activity logging
