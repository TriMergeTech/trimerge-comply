#!/usr/bin/env bash
# ── Evidence Layer QA ─────────────────────────────────────────────────────────
# Tests: CRUD, auto-evidence from flag, governance gate, role guards,
#        lock rules, source auto-population, Swagger shape validation
# ─────────────────────────────────────────────────────────────────────────────
BASE="http://localhost:4000/api"
PASS=0; FAIL=0

pass() { echo "  PASS  $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

login() {
  curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" | jq -r '.data.accessToken'
}

echo ""
echo "══════════════════════════════════════════════════════"
echo "  EVIDENCE LAYER QA"
echo "══════════════════════════════════════════════════════"

# ── Auth ─────────────────────────────────────────────────────────────────────
echo ""
echo "=== Login (all 6 roles) ==="
T_ADM=$(login "qa_admin@trimerge.com"    "TestPass123")
T_DIR=$(login "qa_director@trimerge.com" "TestPass123")
T_MGR=$(login "qa_manager@trimerge.com"  "TestPass123")
T_ANA=$(login "qa_analyst@trimerge.com"  "TestPass123")
T_REV=$(login "qa_reviewer@trimerge.com" "TestPass123")
T_VIE=$(login "qa_viewer@trimerge.com"   "TestPass123")

[ -n "$T_ADM" ] && [ "$T_ADM" != "null" ] && pass "admin token" || fail "admin token"
[ -n "$T_ANA" ] && [ "$T_ANA" != "null" ] && pass "analyst token" || fail "analyst token"
[ -n "$T_VIE" ] && [ "$T_VIE" != "null" ] && pass "viewer token" || fail "viewer token"

# ── Setup: Audit + Flag + Finding ────────────────────────────────────────────
echo ""
echo "=== Setup: audit, flag, finding ==="
AUDIT_ID=$(curl -s -X POST "$BASE/audits" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"name":"Evidence QA Audit","organization":"TriMerge Consulting","clientName":"QA Corp"}' \
  | jq -r '.data.audit._id')
[ "$AUDIT_ID" != "null" ] && [ -n "$AUDIT_ID" ] && pass "audit created ($AUDIT_ID)" || fail "audit created"

# Grab any real flag from org for source testing
FLAG_ID=$(curl -s "$BASE/flags" -H "Authorization: Bearer $T_ANA" | jq -r '.data.flags[0]._id')
[ "$FLAG_ID" != "null" ] && [ -n "$FLAG_ID" ] && pass "flag available for tests ($FLAG_ID)" || fail "flag available"

# Grab any real position doc
POS_ID=$(curl -s "$BASE/positions" -H "Authorization: Bearer $T_ANA" \
  2>/dev/null | jq -r '.data.documents[0]._id // empty')

# Grab any pay equity analysis
PAY_ID=$(curl -s "$BASE/payequity" -H "Authorization: Bearer $T_ANA" \
  2>/dev/null | jq -r '.data.analyses[0]._id // empty')

# ── 1. Finding created WITHOUT flagId — no auto-evidence ─────────────────────
echo ""
echo "=== 1. Finding without flagId — auto-evidence should NOT fire ==="
RESP=$(curl -s -X POST "$BASE/findings" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d "{\"auditId\":\"$AUDIT_ID\",\"observation\":\"Manual finding — no flag linked. Selection criteria lacked documented validation.\"}")
FINDING_MANUAL=$(echo "$RESP" | jq -r '.data.finding._id')
[ "$FINDING_MANUAL" != "null" ] && pass "manual finding created ($FINDING_MANUAL)" || fail "manual finding created"

# Governance: no evidence yet — approve should fail
echo ""
echo "=== 1a. Governance gate — no evidence → cannot approve ==="
# First move to under_review
curl -s -X PATCH "$BASE/findings/$FINDING_MANUAL/status" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"status":"under_review"}' > /dev/null

# Patch in criteria + recommendation so ONLY the evidence gate fires
curl -s -X PATCH "$BASE/findings/$FINDING_MANUAL" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"criteria":"EEOC Uniform Guidelines require documented validation of all selection criteria.","recommendation":"Implement structured validation process within 60 days."}' > /dev/null

R=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/findings/$FINDING_MANUAL/status" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"status":"approved"}')
[ "$R" = "400" ] && pass "[400] approve blocked — no evidence attached" || fail "[400] approve blocked — no evidence attached (got $R)"

# ── 2. Finding created WITH flagId — auto-evidence fires ─────────────────────
echo ""
echo "=== 2. Finding with flagId — auto-evidence (statistical_result from flag) ==="
RESP=$(curl -s -X POST "$BASE/findings" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d "{\"auditId\":\"$AUDIT_ID\",\"flagId\":\"$FLAG_ID\",\"observation\":\"Flag-linked finding: adverse impact detected in selection stage.\"}")
FINDING_FLAG=$(echo "$RESP" | jq -r '.data.finding._id')
[ "$FINDING_FLAG" != "null" ] && pass "flag-linked finding created ($FINDING_FLAG)" || fail "flag-linked finding created"

EVD_LIST=$(curl -s "$BASE/findings/$FINDING_FLAG/evidence" -H "Authorization: Bearer $T_ANA")
AUTO_COUNT=$(echo "$EVD_LIST" | jq -r '.data.total')
AUTO_SOURCE=$(echo "$EVD_LIST" | jq -r '.data.evidence[0].source')
AUTO_TYPE=$(echo "$EVD_LIST"  | jq -r '.data.evidence[0].type')
[ "$AUTO_COUNT" = "1" ] && pass "auto-evidence created (count=1)" || fail "auto-evidence created (count=$AUTO_COUNT)"
[ "$AUTO_SOURCE" = "flag" ] && pass "auto-evidence source=flag" || fail "auto-evidence source=flag (got $AUTO_SOURCE)"
[ "$AUTO_TYPE" = "statistical_result" ] && pass "auto-evidence type=statistical_result" || fail "auto-evidence type=statistical_result (got $AUTO_TYPE)"

AUTO_EVD_ID=$(echo "$EVD_LIST" | jq -r '.data.evidence[0]._id')
AUTO_CONTENT=$(echo "$EVD_LIST" | jq -r '.data.evidence[0].content')
echo "  Auto-evidence content preview: $(echo "$AUTO_CONTENT" | head -3)"

# ── 3. GET /api/findings/:id — includes evidence array + count + findingId ────
echo ""
echo "=== 3. GET finding by ID — evidence array, evidenceCount, findingId in response ==="
RESP=$(curl -s "$BASE/findings/$FINDING_FLAG" -H "Authorization: Bearer $T_ANA")
EV_COUNT=$(echo "$RESP" | jq -r '.data.evidenceCount')
EV_ARR=$(echo "$RESP"   | jq -r '.data.evidence | length')
FID_SINGLE=$(echo "$RESP" | jq -r '.data.finding.findingId // empty')
[ "$EV_COUNT" = "1" ]        && pass "evidenceCount=1 in getFindingById" || fail "evidenceCount in getFindingById (got $EV_COUNT)"
[ "$EV_ARR" = "1" ]          && pass "evidence array length=1" || fail "evidence array length (got $EV_ARR)"
[ "$FID_SINGLE" = "$FINDING_FLAG" ] && pass "findingId alias present and correct in GET /:id" || fail "findingId alias in GET /:id (got '$FID_SINGLE')"

# ── 4. GET /api/findings — evidenceCount + findingId per finding ──────────────
echo ""
echo "=== 4. GET /api/findings list — evidenceCount + findingId per finding ==="
RESP=$(curl -s "$BASE/findings?auditId=$AUDIT_ID" -H "Authorization: Bearer $T_ANA")
FLAG_FINDING_COUNT=$(echo "$RESP" | jq -r --arg fid "$FINDING_FLAG" '[.data.findings[] | select(._id==$fid) | .evidenceCount][0]')
[ "$FLAG_FINDING_COUNT" = "1" ] && pass "evidenceCount=1 on flag finding in list" || fail "evidenceCount on flag finding in list (got $FLAG_FINDING_COUNT)"

MANUAL_FINDING_COUNT=$(echo "$RESP" | jq -r --arg fid "$FINDING_MANUAL" '[.data.findings[] | select(._id==$fid) | .evidenceCount][0]')
[ "$MANUAL_FINDING_COUNT" = "0" ] && pass "evidenceCount=0 on manual finding in list" || fail "evidenceCount=0 on manual finding in list (got $MANUAL_FINDING_COUNT)"

FID_LIST=$(echo "$RESP" | jq -r --arg fid "$FINDING_FLAG" '[.data.findings[] | select(._id==$fid) | .findingId][0]')
[ "$FID_LIST" = "$FINDING_FLAG" ] && pass "findingId alias present and correct in list response" || fail "findingId alias in list (got '$FID_LIST')"

# ── 5. POST evidence — manual entry (all 5 types) ────────────────────────────
echo ""
echo "=== 5. POST manual evidence — all 5 types ==="

post_evidence() {
  curl -s -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
    -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
    -d "$1" | jq -r '.data.evidence._id // empty'
}

EVD_STAT=$(post_evidence '{"type":"statistical_result","title":"Chi-Square Analysis Result","content":"Chi-Square Statistic: 4.231\nP-Value: 0.0398\nDegrees of Freedom: 1\nConclusion: Statistically significant disparity at p<0.05."}')
[ -n "$EVD_STAT" ] && pass "POST statistical_result ($EVD_STAT)" || fail "POST statistical_result"

EVD_INT=$(post_evidence "{\"type\":\"interview_note\",\"title\":\"Interview: HR Director\",\"content\":\"Director confirmed structured interview guides were not introduced until Q1 2024. Prior to that, selection decisions were made informally.\",\"interviewee\":\"Jane Smith, HR Director\",\"interviewDate\":\"2026-06-20\"}")
[ -n "$EVD_INT" ] && pass "POST interview_note ($EVD_INT)" || fail "POST interview_note"

EVD_POL=$(post_evidence '{"type":"policy_excerpt","title":"EEOC Uniform Guidelines — Section 3B","content":"All selection procedures must be validated for adverse impact under 29 CFR Part 1607. The Four-Fifths Rule applies to all protected groups."}')
[ -n "$EVD_POL" ] && pass "POST policy_excerpt ($EVD_POL)" || fail "POST policy_excerpt"

EVD_DAT=$(post_evidence '{"type":"data_extract","title":"Applicant Flow Data — Q1 2026","content":"Position: Senior Engineer\nMale Applicants: 100 | Selected: 80 | Rate: 80%\nFemale Applicants: 50 | Selected: 30 | Rate: 60%\nImpact Ratio: 0.75 (Below 0.80 threshold)"}')
[ -n "$EVD_DAT" ] && pass "POST data_extract ($EVD_DAT)" || fail "POST data_extract"

EVD_OBS=$(post_evidence '{"type":"observation_note","title":"Process Walkthrough — Applicant Screening","content":"Observed screening session on 2026-06-18. Hiring manager applied criteria inconsistently across candidates. No written scoring guide was used."}')
[ -n "$EVD_OBS" ] && pass "POST observation_note ($EVD_OBS)" || fail "POST observation_note"

# ── 6. POST evidence — from flag source (explicit) ───────────────────────────
echo ""
echo "=== 6. POST evidence from flag source (explicit) ==="
RESP=$(curl -s -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d "{\"source\":\"flag\",\"sourceId\":\"$FLAG_ID\"}")
EVD_FROM_FLAG=$(echo "$RESP" | jq -r '.data.evidence._id // empty')
EVD_FROM_FLAG_TYPE=$(echo "$RESP" | jq -r '.data.evidence.type')
EVD_FROM_FLAG_SOURCE=$(echo "$RESP" | jq -r '.data.evidence.source')
[ -n "$EVD_FROM_FLAG" ]             && pass "POST evidence from flag source ($EVD_FROM_FLAG)" || fail "POST evidence from flag source"
[ "$EVD_FROM_FLAG_TYPE" = "statistical_result" ] && pass "type=statistical_result from flag" || fail "type from flag (got $EVD_FROM_FLAG_TYPE)"
[ "$EVD_FROM_FLAG_SOURCE" = "flag" ]             && pass "source=flag confirmed" || fail "source=flag (got $EVD_FROM_FLAG_SOURCE)"

# ── 6b. POST from pay equity source (if analysis exists) ─────────────────────
if [ -n "$PAY_ID" ] && [ "$PAY_ID" != "null" ]; then
  echo ""
  echo "=== 6b. POST evidence from payequity source ==="
  RESP=$(curl -s -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
    -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
    -d "{\"source\":\"payequity\",\"sourceId\":\"$PAY_ID\",\"gapIndex\":0}")
  EVD_PAY=$(echo "$RESP" | jq -r '.data.evidence._id // empty')
  [ -n "$EVD_PAY" ] && pass "POST evidence from payequity ($EVD_PAY)" || fail "POST evidence from payequity"
else
  echo "  (skip) No pay equity analysis in DB — skipping payequity source test"
fi

# ── 6c. POST from position source (if doc exists) ────────────────────────────
if [ -n "$POS_ID" ] && [ "$POS_ID" != "null" ]; then
  echo ""
  echo "=== 6c. POST evidence from position doc source ==="
  RESP=$(curl -s -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
    -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
    -d "{\"source\":\"position\",\"sourceId\":\"$POS_ID\"}")
  EVD_POS=$(echo "$RESP" | jq -r '.data.evidence._id // empty')
  [ -n "$EVD_POS" ] && pass "POST evidence from position ($EVD_POS)" || fail "POST evidence from position"
else
  echo "  (skip) No position document in DB — skipping position source test"
fi

# ── 7. Validation errors ──────────────────────────────────────────────────────
echo ""
echo "=== 7. Validation — missing required fields ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"title":"Title only, no type"}')
[ "$R" = "400" ] && pass "[400] missing type rejected" || fail "[400] missing type rejected (got $R)"

R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"type":"interview_note"}')
[ "$R" = "400" ] && pass "[400] missing title rejected" || fail "[400] missing title rejected (got $R)"

# ── 8. Role guards ────────────────────────────────────────────────────────────
echo ""
echo "=== 8. Role guards ==="

# Viewer — GET allowed
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/findings/$FINDING_MANUAL/evidence" -H "Authorization: Bearer $T_VIE")
[ "$R" = "200" ] && pass "[200] viewer can GET evidence" || fail "[200] viewer GET evidence (got $R)"

# Viewer — POST blocked
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_VIE" -H "Content-Type: application/json" \
  -d '{"type":"observation_note","title":"Viewer note","content":"This should not be allowed."}')
[ "$R" = "403" ] && pass "[403] viewer cannot POST evidence" || fail "[403] viewer POST evidence (got $R)"

# Reviewer — GET allowed
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/findings/$FINDING_MANUAL/evidence" -H "Authorization: Bearer $T_REV")
[ "$R" = "200" ] && pass "[200] reviewer can GET evidence" || fail "[200] reviewer GET evidence (got $R)"

# Reviewer — POST blocked
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_REV" -H "Content-Type: application/json" \
  -d '{"type":"observation_note","title":"Reviewer note","content":"Should not be allowed by reviewer role."}')
[ "$R" = "403" ] && pass "[403] reviewer cannot POST evidence" || fail "[403] reviewer POST evidence (got $R)"

# ── 9. DELETE — ownership rules ───────────────────────────────────────────────
echo ""
echo "=== 9. DELETE — ownership enforcement ==="

# Analyst deletes own evidence (EVD_OBS was created by analyst)
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE/findings/$FINDING_MANUAL/evidence/$EVD_OBS" -H "Authorization: Bearer $T_ANA")
[ "$R" = "200" ] && pass "[200] analyst deletes own evidence" || fail "[200] analyst deletes own evidence (got $R)"

# Analyst tries to delete manager-owned item — create one first
EVD_MGR=$(curl -s -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d '{"type":"observation_note","title":"Manager observation","content":"Manager-added evidence item. Should not be deletable by analyst."}' \
  | jq -r '.data.evidence._id')

R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE/findings/$FINDING_MANUAL/evidence/$EVD_MGR" -H "Authorization: Bearer $T_ANA")
[ "$R" = "403" ] && pass "[403] analyst cannot delete manager's evidence" || fail "[403] analyst cannot delete manager's evidence (got $R)"

# Manager can delete analyst's evidence
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE/findings/$FINDING_MANUAL/evidence/$EVD_INT" -H "Authorization: Bearer $T_MGR")
[ "$R" = "200" ] && pass "[200] manager can delete analyst's evidence" || fail "[200] manager can delete analyst's evidence (got $R)"

# Admin can delete any evidence
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
  "$BASE/findings/$FINDING_MANUAL/evidence/$EVD_POL" -H "Authorization: Bearer $T_ADM")
[ "$R" = "200" ] && pass "[200] admin can delete any evidence" || fail "[200] admin can delete any evidence (got $R)"

# ── 10. Governance gate — now has evidence, can approve ──────────────────────
echo ""
echo "=== 10. Governance gate — evidence present → approve succeeds ==="
COUNT_NOW=$(curl -s "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_ANA" | jq -r '.data.total')
echo "  Evidence count on manual finding: $COUNT_NOW"

R=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/findings/$FINDING_MANUAL/status" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"status":"approved","reason":"All evidence reviewed and confirmed."}')
[ "$R" = "200" ] && pass "[200] finding approved after evidence attached" || fail "[200] finding approved with evidence (got $R)"

# ── 11. Lock rules — approved finding blocks evidence changes ─────────────────
echo ""
echo "=== 11. Lock rules — cannot add/delete evidence on approved finding ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"type":"observation_note","title":"Post-approval note","content":"This should be rejected by the lock rule."}')
[ "$R" = "400" ] && pass "[400] POST evidence blocked on approved finding" || fail "[400] POST evidence blocked on approved (got $R)"

# Get remaining evidence ID to try to delete
REMAINING_EVD=$(curl -s "$BASE/findings/$FINDING_MANUAL/evidence" \
  -H "Authorization: Bearer $T_ANA" | jq -r '.data.evidence[0]._id')
if [ -n "$REMAINING_EVD" ] && [ "$REMAINING_EVD" != "null" ]; then
  R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    "$BASE/findings/$FINDING_MANUAL/evidence/$REMAINING_EVD" -H "Authorization: Bearer $T_ADM")
  [ "$R" = "400" ] && pass "[400] DELETE evidence blocked on approved finding" || fail "[400] DELETE evidence blocked on approved (got $R)"
fi

# ── 12. Governance for flag-linked finding ────────────────────────────────────
echo ""
echo "=== 12. Flag-linked finding — auto-evidence satisfies governance gate ==="
curl -s -X PATCH "$BASE/findings/$FINDING_FLAG/status" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"status":"under_review"}' > /dev/null

curl -s -X PATCH "$BASE/findings/$FINDING_FLAG" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"criteria":"Four-Fifths Rule threshold breached per EEOC guidelines.","recommendation":"Conduct validation study within 90 days."}' > /dev/null

R=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/findings/$FINDING_FLAG/status" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"status":"approved","reason":"Statistical evidence confirmed."}')
[ "$R" = "200" ] && pass "[200] flag finding approves — auto-evidence satisfies gate" || fail "[200] flag finding approves (got $R)"

# ── 13. 404 handling ─────────────────────────────────────────────────────────
echo ""
echo "=== 13. 404 handling ==="
FAKE="000000000000000000000001"

# Unknown finding ID
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/findings/$FAKE/evidence" -H "Authorization: Bearer $T_ANA")
[ "$R" = "404" ] && pass "[404] list evidence — unknown finding" || fail "[404] list evidence unknown finding (got $R)"

R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FAKE/evidence" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"type":"observation_note","title":"Ghost","content":"Should 404."}')
[ "$R" = "404" ] && pass "[404] add evidence — unknown finding" || fail "[404] add evidence unknown finding (got $R)"

# Unknown sourceId — use a fresh unlocked finding so the lock check doesn't fire first
FINDING_404=$(curl -s -X POST "$BASE/findings" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d "{\"auditId\":\"$AUDIT_ID\",\"observation\":\"Temp finding for 404 sourceId test.\"}" \
  | jq -r '.data.finding._id')
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/findings/$FINDING_404/evidence" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d "{\"source\":\"flag\",\"sourceId\":\"$FAKE\"}")
[ "$R" = "404" ] && pass "[404] add evidence — unknown flag sourceId" || fail "[404] add evidence unknown flag sourceId (got $R)"

# ── 14. ActivityLog trail ────────────────────────────────────────────────────
echo ""
echo "=== 14. ActivityLog — evidence actions recorded ==="
LOG=$(curl -s "$BASE/activity" -H "Authorization: Bearer $T_ANA")
ACTIONS=$(echo "$LOG" | jq -r '[.data.logs[].action] | unique | sort | join(",")')
echo "  Actions in log: $ACTIONS"
echo "$ACTIONS" | grep -q "evidence_added"   && pass "evidence_added in ActivityLog"   || fail "evidence_added in ActivityLog"
echo "$ACTIONS" | grep -q "evidence_removed" && pass "evidence_removed in ActivityLog" || fail "evidence_removed in ActivityLog"

# ── 15. Swagger spec — Evidence paths and schema ─────────────────────────────
echo ""
echo "=== 15. Swagger spec validates ==="
SPEC=$(curl -s http://localhost:4000/api/docs.json)
EV_PATHS=$(echo "$SPEC" | jq -r '[.paths | keys[] | select(contains("evidence"))] | length')
EV_SCHEMA=$(echo "$SPEC" | jq -r '.components.schemas.Evidence.type // empty')
EV_TYPES=$(echo "$SPEC" | jq -r '.components.schemas.Evidence.properties.type.enum | length')
[ "$EV_PATHS" = "2" ] && pass "Swagger: 2 evidence paths documented" || fail "Swagger: evidence paths (got $EV_PATHS)"
[ "$EV_SCHEMA" = "object" ] && pass "Swagger: Evidence schema defined" || fail "Swagger: Evidence schema (got '$EV_SCHEMA')"
[ "$EV_TYPES" = "5" ] && pass "Swagger: 5 evidence types in schema" || fail "Swagger: evidence types (got $EV_TYPES)"

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
echo "  EVIDENCE QA: $PASS passed, $FAIL failed, $((PASS+FAIL)) total"
echo "════════════════════════════════════════════════════"
