#!/usr/bin/env bash
# QA Role Matrix — tests all 6 roles against every significant endpoint.
# Reports PASS/FAIL with expected vs actual status codes.

BASE="http://localhost:4000"
PASS=0
FAIL=0
ERRORS=()

# ── helpers ────────────────────────────────────────────────────────────────────

login() {
  local email=$1 pass=$2
  curl -s -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\"}" \
    | node -e "
        const d=require('fs').readFileSync('/dev/stdin','utf8');
        try { const j=JSON.parse(d); process.stdout.write(j.data?.accessToken||''); }
        catch(e){ process.stdout.write(''); }
      "
}

check() {
  local label=$1 expected=$2 actual=$3
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  [$actual] $label"
    ((PASS++))
  else
    echo "  FAIL  [got=$actual exp=$expected] $label"
    ((FAIL++))
    ERRORS+=("FAIL [got=$actual exp=$expected] $label")
  fi
}

http_status() {
  local method=$1 url=$2 token=$3 body=$4
  if [ -n "$body" ]; then
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE$url" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$body"
  else
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE$url" \
      -H "Authorization: Bearer $token"
  fi
}

# ── login all roles ─────────────────────────────────────────────────────────────

echo ""
echo "=== LOGGING IN ALL ROLES ==="
T_ADMIN=$(login   "qa_admin@trimerge.com"    "TestPass123")
T_DIR=$(login     "qa_director@trimerge.com" "TestPass123")
T_MGR=$(login     "qa_manager@trimerge.com"  "TestPass123")
T_ANA=$(login     "qa_analyst@trimerge.com"  "TestPass123")
T_REV=$(login     "qa_reviewer@trimerge.com" "TestPass123")
T_VIE=$(login     "qa_viewer@trimerge.com"   "TestPass123")

for role_tok in "admin:$T_ADMIN" "director:$T_DIR" "manager:$T_MGR" "analyst:$T_ANA" "reviewer:$T_REV" "viewer:$T_VIE"; do
  role="${role_tok%%:*}"
  tok="${role_tok#*:}"
  if [ -n "$tok" ]; then
    echo "  PASS  login $role"
    ((PASS++))
  else
    echo "  FAIL  login $role — no token"
    ((FAIL++))
    ERRORS+=("FAIL login $role — no token")
  fi
done

# ── GET /api/auth/me — all roles should get 200 ──────────────────────────────

echo ""
echo "=== GET /api/auth/me (all roles → 200) ==="
check "admin  /me" 200 $(http_status GET /api/auth/me "$T_ADMIN")
check "director /me" 200 $(http_status GET /api/auth/me "$T_DIR")
check "manager /me" 200 $(http_status GET /api/auth/me "$T_MGR")
check "analyst /me" 200 $(http_status GET /api/auth/me "$T_ANA")
check "reviewer /me" 200 $(http_status GET /api/auth/me "$T_REV")
check "viewer  /me" 200 $(http_status GET /api/auth/me "$T_VIE")

# ── GET /api/auth/users — admin only ─────────────────────────────────────────

echo ""
echo "=== GET /api/auth/users (manager+→200, analyst/reviewer/viewer→403) ==="
check "admin   /users" 200 $(http_status GET /api/auth/users "$T_ADMIN")
check "director /users" 200 $(http_status GET /api/auth/users "$T_DIR")
check "manager /users" 200 $(http_status GET /api/auth/users "$T_MGR")
check "analyst /users" 403 $(http_status GET /api/auth/users "$T_ANA")
check "reviewer /users" 403 $(http_status GET /api/auth/users "$T_REV")
check "viewer  /users" 403 $(http_status GET /api/auth/users "$T_VIE")

# ── AUDITS ───────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/audits (all roles → 200) ==="
check "admin   GET audits" 200 $(http_status GET /api/audits "$T_ADMIN")
check "director GET audits" 200 $(http_status GET /api/audits "$T_DIR")
check "manager GET audits" 200 $(http_status GET /api/audits "$T_MGR")
check "analyst GET audits" 200 $(http_status GET /api/audits "$T_ANA")
check "reviewer GET audits" 200 $(http_status GET /api/audits "$T_REV")
check "viewer  GET audits" 200 $(http_status GET /api/audits "$T_VIE")

AUDIT_BODY='{"name":"QA Test Audit","description":"role matrix test","organization":"QA Org","clientName":"QA Client","auditType":"Compliance"}'

echo ""
echo "=== POST /api/audits (analyst+→201, reviewer→403, viewer→403) ==="
check "admin   POST audit" 201 $(http_status POST /api/audits "$T_ADMIN" "$AUDIT_BODY")
check "director POST audit" 201 $(http_status POST /api/audits "$T_DIR" "$AUDIT_BODY")
check "manager POST audit" 201 $(http_status POST /api/audits "$T_MGR" "$AUDIT_BODY")
check "analyst POST audit" 201 $(http_status POST /api/audits "$T_ANA" "$AUDIT_BODY")
check "reviewer POST audit" 403 $(http_status POST /api/audits "$T_REV" "$AUDIT_BODY")
check "viewer  POST audit" 403 $(http_status POST /api/audits "$T_VIE" "$AUDIT_BODY")

# Grab an audit ID for further tests
AUDIT_ID=$(curl -s "$BASE/api/audits" -H "Authorization: Bearer $T_ADMIN" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); try{const j=JSON.parse(d); console.log(j.data?.audits?.[0]?._id||'');}catch(e){console.log('')}")

echo ""
echo "=== PATCH /api/audits/:id (all except viewer+reviewer own-only) ==="
if [ -n "$AUDIT_ID" ]; then
  check "admin   PATCH audit" 200 $(http_status PATCH "/api/audits/$AUDIT_ID" "$T_ADMIN" '{"description":"admin updated"}')
  check "director PATCH audit" 200 $(http_status PATCH "/api/audits/$AUDIT_ID" "$T_DIR" '{"description":"director updated"}')
  check "manager PATCH audit" 200 $(http_status PATCH "/api/audits/$AUDIT_ID" "$T_MGR" '{"description":"manager updated"}')
  check "viewer  PATCH audit" 403 $(http_status PATCH "/api/audits/$AUDIT_ID" "$T_VIE" '{"description":"viewer updated"}')
else
  echo "  SKIP  no audit ID available"
fi

# ── FLAGS ────────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/flags (all roles → 200) ==="
check "admin   GET flags" 200 $(http_status GET /api/flags "$T_ADMIN")
check "director GET flags" 200 $(http_status GET /api/flags "$T_DIR")
check "manager GET flags" 200 $(http_status GET /api/flags "$T_MGR")
check "analyst GET flags" 200 $(http_status GET /api/flags "$T_ANA")
check "reviewer GET flags" 200 $(http_status GET /api/flags "$T_REV")
check "viewer  GET flags" 200 $(http_status GET /api/flags "$T_VIE")

# Grab a flag ID for assign/decide tests
FLAG_ID=$(curl -s "$BASE/api/flags" -H "Authorization: Bearer $T_ADMIN" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); try{const j=JSON.parse(d); console.log(j.data?.flags?.[0]?._id||'');}catch(e){console.log('')}")

echo ""
echo "=== PATCH /api/flags/:id/assign (manager+→200, analyst/reviewer/viewer→403) ==="
if [ -n "$FLAG_ID" ]; then
  ASSIGN_BODY='{"assignedTo":"6a32bb2e92b201e347f753aa"}'
  check "admin   assign flag" 200 $(http_status PATCH "/api/flags/$FLAG_ID/assign" "$T_ADMIN" "$ASSIGN_BODY")
  check "director assign flag" 200 $(http_status PATCH "/api/flags/$FLAG_ID/assign" "$T_DIR" "$ASSIGN_BODY")
  check "manager assign flag" 200 $(http_status PATCH "/api/flags/$FLAG_ID/assign" "$T_MGR" "$ASSIGN_BODY")
  check "analyst assign flag" 403 $(http_status PATCH "/api/flags/$FLAG_ID/assign" "$T_ANA" "$ASSIGN_BODY")
  check "reviewer assign flag" 403 $(http_status PATCH "/api/flags/$FLAG_ID/assign" "$T_REV" "$ASSIGN_BODY")
  check "viewer  assign flag" 403 $(http_status PATCH "/api/flags/$FLAG_ID/assign" "$T_VIE" "$ASSIGN_BODY")
else
  echo "  SKIP  no flag ID available"
fi

# ── DASHBOARD ────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/dashboard/summary (all roles → 200) ==="
check "admin   dashboard" 200 $(http_status GET /api/dashboard/summary "$T_ADMIN")
check "director dashboard" 200 $(http_status GET /api/dashboard/summary "$T_DIR")
check "manager dashboard" 200 $(http_status GET /api/dashboard/summary "$T_MGR")
check "analyst dashboard" 200 $(http_status GET /api/dashboard/summary "$T_ANA")
check "reviewer dashboard" 200 $(http_status GET /api/dashboard/summary "$T_REV")
check "viewer  dashboard" 200 $(http_status GET /api/dashboard/summary "$T_VIE")

echo ""
echo "=== GET /api/dashboard/export (manager+→200, analyst/reviewer/viewer→403) ==="
check "admin   export" 200 $(http_status GET /api/dashboard/export "$T_ADMIN")
check "director export" 200 $(http_status GET /api/dashboard/export "$T_DIR")
check "manager export" 200 $(http_status GET /api/dashboard/export "$T_MGR")
check "analyst export" 403 $(http_status GET /api/dashboard/export "$T_ANA")
check "reviewer export" 403 $(http_status GET /api/dashboard/export "$T_REV")
check "viewer  export" 403 $(http_status GET /api/dashboard/export "$T_VIE")

# ── POSITION ─────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/position (all roles → 200) ==="
check "admin   GET position" 200 $(http_status GET /api/position "$T_ADMIN")
check "director GET position" 200 $(http_status GET /api/position "$T_DIR")
check "manager GET position" 200 $(http_status GET /api/position "$T_MGR")
check "analyst GET position" 200 $(http_status GET /api/position "$T_ANA")
check "reviewer GET position" 200 $(http_status GET /api/position "$T_REV")
check "viewer  GET position" 200 $(http_status GET /api/position "$T_VIE")

# ── HANDBOOKS ────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/handbooks (all roles → 200) ==="
check "admin   GET handbooks" 200 $(http_status GET /api/handbooks "$T_ADMIN")
check "director GET handbooks" 200 $(http_status GET /api/handbooks "$T_DIR")
check "manager GET handbooks" 200 $(http_status GET /api/handbooks "$T_MGR")
check "analyst GET handbooks" 200 $(http_status GET /api/handbooks "$T_ANA")
check "reviewer GET handbooks" 200 $(http_status GET /api/handbooks "$T_REV")
check "viewer  GET handbooks" 200 $(http_status GET /api/handbooks "$T_VIE")

# ── FINDINGS ─────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/findings (all roles → 200) ==="
check "admin   GET findings" 200 $(http_status GET /api/findings "$T_ADMIN")
check "director GET findings" 200 $(http_status GET /api/findings "$T_DIR")
check "manager GET findings" 200 $(http_status GET /api/findings "$T_MGR")
check "analyst GET findings" 200 $(http_status GET /api/findings "$T_ANA")
check "reviewer GET findings" 200 $(http_status GET /api/findings "$T_REV")
check "viewer  GET findings" 200 $(http_status GET /api/findings "$T_VIE")

# ── ACTIVITY ─────────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/activity (manager+→200, analyst/reviewer see own, viewer→403) ==="
check "admin   GET activity" 200 $(http_status GET /api/activity "$T_ADMIN")
check "director GET activity" 200 $(http_status GET /api/activity "$T_DIR")
check "manager GET activity" 200 $(http_status GET /api/activity "$T_MGR")
check "analyst GET activity" 200 $(http_status GET /api/activity "$T_ANA")
check "reviewer GET activity" 200 $(http_status GET /api/activity "$T_REV")
check "viewer  GET activity" 403 $(http_status GET /api/activity "$T_VIE")

# ── CSV UPLOAD LIST ───────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/upload/csv (analyst+→200, viewer→403) ==="
check "admin   GET csv list" 200 $(http_status GET /api/upload/csv "$T_ADMIN")
check "director GET csv list" 200 $(http_status GET /api/upload/csv "$T_DIR")
check "manager GET csv list" 200 $(http_status GET /api/upload/csv "$T_MGR")
check "analyst GET csv list" 200 $(http_status GET /api/upload/csv "$T_ANA")
check "reviewer GET csv list" 200 $(http_status GET /api/upload/csv "$T_REV")
check "viewer  GET csv list" 403 $(http_status GET /api/upload/csv "$T_VIE")

# ── PAY EQUITY ───────────────────────────────────────────────────────────────

echo ""
echo "=== GET /api/payequity (analyst+→200, viewer→403) ==="
check "admin   GET payequity" 200 $(http_status GET /api/payequity "$T_ADMIN")
check "director GET payequity" 200 $(http_status GET /api/payequity "$T_DIR")
check "manager GET payequity" 200 $(http_status GET /api/payequity "$T_MGR")
check "analyst GET payequity" 200 $(http_status GET /api/payequity "$T_ANA")
check "reviewer GET payequity" 200 $(http_status GET /api/payequity "$T_REV")
check "viewer  GET payequity" 403 $(http_status GET /api/payequity "$T_VIE")

# ── ROLE ASSIGNMENT (admin only) ─────────────────────────────────────────────

# Get the viewer QA user ID
VIEWER_ID=$(curl -s "$BASE/api/auth/users" -H "Authorization: Bearer $T_ADMIN" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); try{const j=JSON.parse(d); const u=j.data?.users?.find(x=>x.email==='qa_viewer@trimerge.com'); console.log(u?._id||'');}catch(e){console.log('')}")

echo ""
echo "=== PATCH /api/auth/users/:id/role (admin→200, others→403) ==="
if [ -n "$VIEWER_ID" ]; then
  check "admin   assign role" 200 $(http_status PATCH "/api/auth/users/$VIEWER_ID/role" "$T_ADMIN" '{"role":"viewer"}')
  check "director assign role" 403 $(http_status PATCH "/api/auth/users/$VIEWER_ID/role" "$T_DIR" '{"role":"viewer"}')
  check "manager assign role" 403 $(http_status PATCH "/api/auth/users/$VIEWER_ID/role" "$T_MGR" '{"role":"viewer"}')
  check "analyst assign role" 403 $(http_status PATCH "/api/auth/users/$VIEWER_ID/role" "$T_ANA" '{"role":"viewer"}')
  # Verify admin can assign every role
  echo ""
  echo "=== Admin can assign all 6 roles ==="
  for role in admin director manager analyst reviewer viewer; do
    check "admin sets $role" 200 $(http_status PATCH "/api/auth/users/$VIEWER_ID/role" "$T_ADMIN" "{\"role\":\"$role\"}")
  done
  # Restore to viewer
  http_status PATCH "/api/auth/users/$VIEWER_ID/role" "$T_ADMIN" '{"role":"viewer"}' > /dev/null
else
  echo "  SKIP  could not retrieve viewer user ID"
fi

# ── SUMMARY ──────────────────────────────────────────────────────────────────

TOTAL=$((PASS + FAIL))
echo ""
echo "════════════════════════════════════════"
echo "  RESULTS: $PASS passed, $FAIL failed, $TOTAL total"
echo "════════════════════════════════════════"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "FAILURES:"
  for e in "${ERRORS[@]}"; do echo "  $e"; done
fi
