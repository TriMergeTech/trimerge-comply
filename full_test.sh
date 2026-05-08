#!/bin/bash

BASE="http://localhost:4000/api/auth"
PASS=0
FAIL=0

check() {
  local desc=$1
  local expected=$2
  local actual=$3
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $desc"
    PASS=$((PASS+1))
  else
    echo "  ✗ $desc (expected: $expected, got: $actual)"
    FAIL=$((FAIL+1))
  fi
}

echo ""
echo "================================================"
echo "         FULL LIVE API TEST SUITE"
echo "================================================"

# ── Health Check ─────────────────────────────────────
echo ""
echo "--- HEALTH CHECK ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health)
check "GET /health returns 200" "200" "$STATUS"

# ── Signup ───────────────────────────────────────────
echo ""
echo "--- SIGNUP ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","password":"Password123"}')
check "Valid signup returns 201" "201" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","password":"Password123"}')
check "Duplicate email returns 409" "409" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"password":"Password123"}')
check "Missing email returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","password":"weak"}')
check "Weak password returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"Password123"}')
check "Invalid email format returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"nodigits@trimerge.com","password":"Passwordabc"}')
check "Password without number returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"nouppercase@trimerge.com","password":"password123"}')
check "Password without uppercase returns 422" "422" "$STATUS"

# ── Login before verification ─────────────────────────
echo ""
echo "--- LOGIN (UNVERIFIED) ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","password":"Password123"}')
check "Unverified user login returns 403" "403" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@trimerge.com","password":"Password123"}')
check "Non-existent user returns 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com"}')
check "Missing password returns 422" "422" "$STATUS"

# ── OTP Verification ──────────────────────────────────
echo ""
echo "--- OTP VERIFICATION ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","otp":"12345"}')
check "Short OTP returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","otp":"abcdef"}')
check "Non-numeric OTP returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com","otp":"000000"}')
check "Wrong OTP returns 400" "400" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@trimerge.com","otp":"123456"}')
check "Unknown email returns 404" "404" "$STATUS"

# ── Resend OTP ────────────────────────────────────────
echo ""
echo "--- RESEND OTP ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/resend-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com"}')
check "Resend OTP returns 200" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/resend-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@trimerge.com"}')
check "Resend OTP unknown email returns 200 (no enumeration)" "200" "$STATUS"

# ── Forgot Password ───────────────────────────────────
echo ""
echo "--- FORGOT PASSWORD ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@trimerge.com"}')
check "Forgot password valid email returns 200" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@trimerge.com"}')
check "Forgot password unknown email returns 200 (no enumeration)" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{}')
check "Forgot password missing email returns 422" "422" "$STATUS"

# ── Reset Password ────────────────────────────────────
echo ""
echo "--- RESET PASSWORD ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"faketoken","newPassword":"NewPassword123"}')
check "Invalid reset token returns 400" "400" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"faketoken","newPassword":"weak"}')
check "Weak new password returns 422" "422" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"NewPassword123"}')
check "Missing token returns 422" "422" "$STATUS"

# ── Refresh Token ─────────────────────────────────────
echo ""
echo "--- REFRESH TOKEN ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"fake.token.here"}')
check "Invalid refresh token returns 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/refresh" \
  -H "Content-Type: application/json" \
  -d '{}')
check "Missing refresh token returns 422" "422" "$STATUS"

# ── Logout ────────────────────────────────────────────
echo ""
echo "--- LOGOUT ---"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/logout")
check "Logout without token returns 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/logout" \
  -H "Authorization: Bearer faketoken")
check "Logout with invalid token returns 401" "401" "$STATUS"

# ── Summary ───────────────────────────────────────────
echo ""
echo "================================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
if [ "$FAIL" -eq 0 ]; then
  echo "  ALL TESTS PASSED ✓"
else
  echo "  SOME TESTS FAILED ✗"
fi
echo "================================================"
echo ""
