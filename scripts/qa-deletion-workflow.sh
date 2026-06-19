#!/usr/bin/env bash
BASE="http://localhost:4000/api"
PASS=0; FAIL=0

pass() { echo "  PASS  $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

login() {
  curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" | jq -r '.data.accessToken'
}

T_ADM=$(login "qa_admin@trimerge.com"    "TestPass123")
T_DIR=$(login "qa_director@trimerge.com" "TestPass123")
T_MGR=$(login "qa_manager@trimerge.com"  "TestPass123")
T_ANA=$(login "qa_analyst@trimerge.com"  "TestPass123")
T_REV=$(login "qa_reviewer@trimerge.com" "TestPass123")
T_VIE=$(login "qa_viewer@trimerge.com"   "TestPass123")
DIR_ID=$(curl -s "$BASE/auth/me" -H "Authorization: Bearer $T_DIR" | jq -r '.data.user._id')

echo ""
echo "=== Setup: create test audits ==="
AUDIT1=$(curl -s -X POST "$BASE/audits" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d '{"name":"Deletion Workflow Test Audit","organization":"TriMerge Consulting"}' | jq -r '.data.audit._id')
echo "  Audit 1: $AUDIT1"

echo ""
echo "=== Direct delete without notes → 400 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/audits/$AUDIT1" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" -d '{}')
[ "$R" = "400" ] && pass "[400] director DELETE no notes" || fail "[400] director DELETE no notes (got $R)"

echo ""
echo "=== Direct delete notes too short → 400 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/audits/$AUDIT1" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"deletionNotes":"short"}')
[ "$R" = "400" ] && pass "[400] director DELETE notes too short" || fail "[400] director DELETE notes too short (got $R)"

echo ""
echo "=== viewer cannot submit deletion request → 403 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_VIE" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Please delete this audit now.\",\"directorId\":\"$DIR_ID\"}")
[ "$R" = "403" ] && pass "[403] viewer cannot request deletion" || fail "[403] viewer cannot request deletion (got $R)"

echo ""
echo "=== director cannot use deletion-request route → 403 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Director requesting own deletion here.\",\"directorId\":\"$DIR_ID\"}")
[ "$R" = "403" ] && pass "[403] director cannot use deletion-request route" || fail "[403] director cannot use deletion-request route (got $R)"

echo ""
echo "=== admin cannot use deletion-request route → 403 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_ADM" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Admin requesting deletion workflow.\",\"directorId\":\"$DIR_ID\"}")
[ "$R" = "403" ] && pass "[403] admin cannot use deletion-request route" || fail "[403] admin cannot use deletion-request route (got $R)"

echo ""
echo "=== deletion request empty notes → 400 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"\",\"directorId\":\"$DIR_ID\"}")
[ "$R" = "400" ] && pass "[400] empty deletion notes rejected" || fail "[400] empty deletion notes rejected (got $R)"

echo ""
echo "=== deletion request notes too short → 400 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Too short\",\"directorId\":\"$DIR_ID\"}")
[ "$R" = "400" ] && pass "[400] short deletion notes rejected" || fail "[400] short deletion notes rejected (got $R)"

echo ""
echo "=== no directorId → 400 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d '{"deletionNotes":"Valid notes but no director selected here."}')
[ "$R" = "400" ] && pass "[400] missing directorId rejected" || fail "[400] missing directorId rejected (got $R)"

echo ""
echo "=== manager submits valid deletion request → 201 ==="
RESP=$(curl -s -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Client has ended the engagement and requested all audit data be removed per policy.\",\"directorId\":\"$DIR_ID\"}")
REQ1_ID=$(echo "$RESP" | jq -r '.data.request._id')
[ "$(echo $RESP | jq -r '.success')" = "true" ] && pass "[201] manager submits deletion request" || fail "[201] manager submits deletion request"
echo "  Request ID: $REQ1_ID"

echo ""
echo "=== analyst submits → 201 ==="
AUDIT2=$(curl -s -X POST "$BASE/audits" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"name":"Analyst Deletion Test","organization":"TriMerge Consulting"}' | jq -r '.data.audit._id')
RESP=$(curl -s -X POST "$BASE/audits/$AUDIT2/deletion-request" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Analyst requesting deletion after project closure and sign-off.\",\"directorId\":\"$DIR_ID\"}")
[ "$(echo $RESP | jq -r '.success')" = "true" ] && pass "[201] analyst submits deletion request" || fail "[201] analyst submits deletion request"

echo ""
echo "=== reviewer submits → 201 ==="
AUDIT3=$(curl -s -X POST "$BASE/audits" \
  -H "Authorization: Bearer $T_ANA" -H "Content-Type: application/json" \
  -d '{"name":"Reviewer Deletion Test","organization":"TriMerge Consulting"}' | jq -r '.data.audit._id')
RESP=$(curl -s -X POST "$BASE/audits/$AUDIT3/deletion-request" \
  -H "Authorization: Bearer $T_REV" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Reviewer requesting deletion after SME sign-off on all findings.\",\"directorId\":\"$DIR_ID\"}")
REQ3_ID=$(echo "$RESP" | jq -r '.data.request._id')
[ "$(echo $RESP | jq -r '.success')" = "true" ] && pass "[201] reviewer submits deletion request" || fail "[201] reviewer submits deletion request"

echo ""
echo "=== duplicate pending request → 409 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/audits/$AUDIT1/deletion-request" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d "{\"deletionNotes\":\"Another manager trying to submit a second request.\",\"directorId\":\"$DIR_ID\"}")
[ "$R" = "409" ] && pass "[409] duplicate pending request blocked" || fail "[409] duplicate pending request blocked (got $R)"

echo ""
echo "=== non-directors cannot list deletion requests → 403 ==="
for role_tok in "manager:$T_MGR" "analyst:$T_ANA" "reviewer:$T_REV" "viewer:$T_VIE"; do
  role="${role_tok%%:*}"; tok="${role_tok##*:}"
  R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/audits/deletion-requests" -H "Authorization: Bearer $tok")
  [ "$R" = "403" ] && pass "[403] $role cannot list deletion requests" || fail "[403] $role cannot list deletion requests (got $R)"
done

echo ""
echo "=== director lists pending requests → 200 ==="
LIST=$(curl -s "$BASE/audits/deletion-requests?status=pending" -H "Authorization: Bearer $T_DIR")
TOTAL=$(echo "$LIST" | jq -r '.data.total')
[ "${TOTAL:-0}" -ge "1" ] && pass "[200] director sees pending requests (total: $TOTAL)" || fail "[200] director sees pending requests (got $TOTAL)"

echo ""
echo "=== admin lists all requests → 200 ==="
LIST=$(curl -s "$BASE/audits/deletion-requests" -H "Authorization: Bearer $T_ADM")
TOTAL=$(echo "$LIST" | jq -r '.data.total')
[ "${TOTAL:-0}" -ge "1" ] && pass "[200] admin sees all requests (total: $TOTAL)" || fail "[200] admin sees all requests"

echo ""
echo "=== review: empty approvalNotes → 400 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/audits/deletion-requests/$REQ1_ID/review" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"decision":"approved","approvalNotes":""}')
[ "$R" = "400" ] && pass "[400] review without approval notes rejected" || fail "[400] review without approval notes rejected (got $R)"

echo ""
echo "=== non-directors cannot review → 403 ==="
for role_tok in "manager:$T_MGR" "analyst:$T_ANA" "reviewer:$T_REV"; do
  role="${role_tok%%:*}"; tok="${role_tok##*:}"
  R=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/audits/deletion-requests/$REQ1_ID/review" \
    -H "Authorization: Bearer $tok" -H "Content-Type: application/json" \
    -d '{"decision":"rejected","approvalNotes":"You shall not pass the role check here."}')
  [ "$R" = "403" ] && pass "[403] $role cannot review deletion request" || fail "[403] $role cannot review deletion request (got $R)"
done

echo ""
echo "=== director rejects request → 200 ==="
RESP=$(curl -s -X PATCH "$BASE/audits/deletion-requests/$REQ1_ID/review" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"decision":"rejected","approvalNotes":"Insufficient justification. Please resubmit with full business context and client authorization."}')
[ "$(echo $RESP | jq -r '.data.decision')" = "rejected" ] && pass "[200] director rejects request" || fail "[200] director rejects request"

echo ""
echo "=== re-review already-decided request → 409 ==="
R=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/audits/deletion-requests/$REQ1_ID/review" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"decision":"approved","approvalNotes":"Trying to approve after previous rejection decision."}')
[ "$R" = "409" ] && pass "[409] re-review of decided request blocked" || fail "[409] re-review of decided request blocked (got $R)"

echo ""
echo "=== director approves → audit deleted → 200 + 404 ==="
RESP=$(curl -s -X PATCH "$BASE/audits/deletion-requests/$REQ3_ID/review" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"decision":"approved","approvalNotes":"Confirmed with engagement lead. All deliverables archived in client portal. Safe to delete."}')
[ "$(echo $RESP | jq -r '.data.decision')" = "approved" ] && pass "[200] director approves request" || fail "[200] director approves request"

R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/audits/$AUDIT3" -H "Authorization: Bearer $T_DIR")
[ "$R" = "404" ] && pass "[404] audit deleted after approval" || fail "[404] audit deleted after approval (got $R)"

echo ""
echo "=== director direct delete with notes → 200 ==="
AUDIT4=$(curl -s -X POST "$BASE/audits" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d '{"name":"Direct Delete Test Audit","organization":"TriMerge Consulting"}' | jq -r '.data.audit._id')
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/audits/$AUDIT4" \
  -H "Authorization: Bearer $T_DIR" -H "Content-Type: application/json" \
  -d '{"deletionNotes":"Director closing this audit directly after client sign-off and final deliverable."}')
[ "$R" = "200" ] && pass "[200] director direct delete with notes" || fail "[200] director direct delete with notes (got $R)"

echo ""
echo "=== admin direct delete with notes → 200 ==="
AUDIT5=$(curl -s -X POST "$BASE/audits" \
  -H "Authorization: Bearer $T_MGR" -H "Content-Type: application/json" \
  -d '{"name":"Admin Direct Delete Test","organization":"TriMerge Consulting"}' | jq -r '.data.audit._id')
R=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/audits/$AUDIT5" \
  -H "Authorization: Bearer $T_ADM" -H "Content-Type: application/json" \
  -d '{"deletionNotes":"Admin removing test audit after QA cycle completion and verification."}')
[ "$R" = "200" ] && pass "[200] admin direct delete with notes" || fail "[200] admin direct delete with notes (got $R)"

echo ""
echo "=== audit trail: deletion actions logged ==="
LOG=$(curl -s "$BASE/activity" -H "Authorization: Bearer $T_DIR")
ACTIONS=$(echo "$LOG" | jq -r '[.data.logs[].action] | unique | sort | join(",")')
echo "  Actions in log: $ACTIONS"
for action in deletion_requested deletion_rejected deletion_approved audit_deleted; do
  echo "$ACTIONS" | grep -q "$action" && pass "  $action logged" || fail "  $action logged"
done

echo ""
echo "════════════════════════════════════════"
echo "  DELETION WORKFLOW: $PASS passed, $FAIL failed, $((PASS+FAIL)) total"
echo "════════════════════════════════════════"
