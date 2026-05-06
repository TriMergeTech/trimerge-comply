# Auth Backend — Ibrahim's Deliverable

Secure, modular authentication API built with **Node.js + Express + MongoDB**.

---

## Project Structure

```
src/
├── app.js                      # Entry point — Express setup, middleware, routes
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   └── auth.controller.js      # All auth business logic
├── middleware/
│   ├── auth.middleware.js      # JWT protect + requireVerified
│   ├── validate.middleware.js  # express-validator rule sets
│   └── error.middleware.js     # Global error + 404 handler
├── models/
│   └── User.js                 # Mongoose schema
├── routes/
│   └── auth.routes.js          # Route definitions
├── services/
│   └── email.service.js        # Mailgun transactional email
└── utils/
    ├── jwt.js                  # Token generation + verification
    ├── otp.js                  # OTP generation, hashing, expiry
    └── response.js             # Unified API response helpers
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in MONGODB_URI, JWT secrets, Mailgun keys

# 3. Start dev server
npm run dev
```

---

## Environment Variables

| Variable               | Description                        |
|------------------------|------------------------------------|
| `NODE_ENV`             | `development` / `production`       |
| `PORT`                 | Server port (default 4000)         |
| `MONGODB_URI`          | MongoDB connection string          |
| `JWT_ACCESS_SECRET`    | Secret for signing access tokens   |
| `JWT_REFRESH_SECRET`   | Secret for signing refresh tokens  |
| `JWT_ACCESS_EXPIRES_IN`| Access token TTL (e.g. `15m`)      |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token TTL (e.g. `7d`)     |
| `OTP_EXPIRES_MINUTES`  | OTP TTL in minutes                 |
| `BCRYPT_ROUNDS`        | bcrypt cost factor                 |
| `CORS_ORIGIN`          | Allowed frontend origin            |
| `MAILGUN_API_KEY`      | Mailgun API key                    |
| `MAILGUN_DOMAIN`       | Mailgun sending domain             |
| `MAILGUN_SENDER`       | From address for emails            |

---

## API Endpoints

Base URL: `http://localhost:4000/api`

### Health
```
GET  /health
```

---

### Auth

#### Signup
```
POST /auth/signup
Body: { email, password, phone? }
Response 201: { user }
```
Creates account, sends email verification OTP.

---

#### Verify OTP (email verification)
```
POST /auth/verify-otp
Body: { email, otp }
Response 200: { message }
```
Marks account as verified.

---

#### Resend OTP
```
POST /auth/resend-otp
Body: { email }
Response 200: { message }
```
Issues a new verification OTP.

---

#### Login
```
POST /auth/login
Body: { email, password }
Response 200: { user, accessToken, refreshToken }
```
Returns access token (15m) + refresh token (7d).  
Account locks for 15min after 5 failed attempts.

---

#### Refresh Tokens
```
POST /auth/refresh
Body: { refreshToken }
Response 200: { accessToken, refreshToken }
```
Token rotation — old refresh token is invalidated on use.

---

#### Forgot Password
```
POST /auth/forgot-password
Body: { email }
Response 200: { message }
```
Sends password reset link to email. Always returns success (no user enumeration).

---

#### Reset Password
```
POST /auth/reset-password
Body: { token, newPassword }
Response 200: { message }
```
Validates token, sets new password, invalidates all active sessions.

---

#### Logout
```
POST /auth/logout
Headers: Authorization: Bearer <accessToken>
Response 200: { message }
```
Invalidates refresh token server-side.

---

## Security Design

| Concern                  | Implementation                                      |
|--------------------------|-----------------------------------------------------|
| Password storage         | bcrypt hash (pre-save hook, never returned in queries) |
| JWT access token         | Short-lived (15m), signed with dedicated secret     |
| JWT refresh token        | Long-lived (7d), stored as SHA-256 hash in DB       |
| Refresh token rotation   | New token issued on every refresh, old invalidated  |
| OTP storage              | bcrypt hashed — never stored plaintext              |
| Reset token storage      | SHA-256 hashed — raw token only travels via email   |
| Account lockout          | 5 failed attempts → 15min lock                      |
| User enumeration         | Vague messages on forgot-password + resend-otp      |
| Payload size             | JSON body capped at 10kb                            |
| Rate limiting            | 100 req/15min global, 20 req/15min on /auth         |
| Security headers         | Helmet.js                                           |
| Input sanitization       | express-validator on every endpoint                 |

---

## Illia's Integration Points

| File                     | What Illia plugs into                               |
|--------------------------|-----------------------------------------------------|
| `src/utils/otp.js`       | Replace `generateOTP` / `verifyOTP` with AI-optimized logic |
| `src/app.js`             | Replace `authLimiter` with AI-based rate limiter    |
| `src/controllers/auth.controller.js` | `login()` — hook anomaly detection after successful login |
| `src/models/User.js`     | `failedLoginAttempts`, `lockedUntil`, `lastLoginAt` already exposed |

---

## Git Branch Conventions

```
feat/signup
feat/login
feat/otp-verification
feat/forgot-password
feat/reset-password
feat/refresh-tokens
fix/otp-expiry
```
