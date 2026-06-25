/**
 * One-shot migration: stamps organizationId on every document across every collection.
 *
 * Logic:
 *  1. All Users/records with companyName "TriMerge Consulting" (or null) → TRIMERGE_ORG_ID
 *  2. Any other distinct companyName that already has an organizationId → inherit it
 *  3. Any other distinct companyName with no organizationId yet → generate a new UUID
 *
 * Safe to re-run: uses $set so already-stamped records are just overwritten with the same value.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

// Fixed UUID for TriMerge Consulting — stable across environments
const TRIMERGE_ORG_ID = '7f3d2a1b-4c5e-4f6a-8b7c-9d0e1f2a3b4c';
const TRIMERGE_COMPANY = 'TriMerge Consulting';

const User            = require('../src/models/User');
const Audit           = require('../src/models/Audit');
const Flag            = require('../src/models/Flag');
const Finding         = require('../src/models/Finding');
const Handbook        = require('../src/models/Handbook');
const ActivityLog     = require('../src/models/ActivityLog');
const PositionDocument   = require('../src/models/PositionDocument');
const PayEquityAnalysis  = require('../src/models/PayEquityAnalysis');
const AdverseImpactAnalysis = require('../src/models/AdverseImpactAnalysis');

async function buildOrgMap() {
  // Build a companyName → organizationId map from existing User records that already have an orgId
  const seeded = await User.find({ organizationId: { $ne: null } }).select('companyName organizationId').lean();
  const map = {};
  for (const u of seeded) {
    if (u.companyName && !map[u.companyName]) map[u.companyName] = u.organizationId;
  }
  // Ensure TriMerge is always the fixed UUID
  map[TRIMERGE_COMPANY] = TRIMERGE_ORG_ID;
  return map;
}

function resolveOrgId(companyName, orgMap) {
  if (!companyName || companyName.trim() === TRIMERGE_COMPANY) return TRIMERGE_ORG_ID;
  if (orgMap[companyName]) return orgMap[companyName];
  // New company never seen before — generate a UUID and register it
  const newId = randomUUID();
  orgMap[companyName] = newId;
  return newId;
}

async function stampCollection(Model, orgMap, label) {
  const docs = await Model.find({}).select('companyName organizationId').lean();
  let updated = 0;

  for (const doc of docs) {
    const orgId = resolveOrgId(doc.companyName, orgMap);
    const needsOrgId = !doc.organizationId || doc.organizationId !== orgId;
    const needsCompany = !doc.companyName;

    if (needsOrgId || needsCompany) {
      const patch = { organizationId: orgId };
      if (needsCompany) patch.companyName = TRIMERGE_COMPANY;
      await Model.updateOne({ _id: doc._id }, { $set: patch });
      updated++;
    }
  }

  console.log(`  ${label}: ${updated} / ${docs.length} records updated`);
}

async function stampUsers(orgMap) {
  const users = await User.find({}).select('companyName organizationId').lean();
  let updated = 0;

  for (const u of users) {
    const orgId = resolveOrgId(u.companyName, orgMap);
    if (!u.organizationId || u.organizationId !== orgId) {
      await User.updateOne({ _id: u._id }, { $set: { organizationId: orgId } });
      updated++;
    }
  }

  console.log(`  Users: ${updated} / ${users.length} records updated`);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Starting migration...\n');

  const orgMap = await buildOrgMap();

  // Users first so the map is complete before data collections
  await stampUsers(orgMap);
  await stampCollection(Audit,                orgMap, 'Audits');
  await stampCollection(Flag,                 orgMap, 'Flags');
  await stampCollection(Finding,              orgMap, 'Findings');
  await stampCollection(Handbook,             orgMap, 'Handbooks');
  await stampCollection(ActivityLog,          orgMap, 'ActivityLogs');
  await stampCollection(PositionDocument,     orgMap, 'PositionDocuments');
  await stampCollection(PayEquityAnalysis,    orgMap, 'PayEquityAnalyses');
  await stampCollection(AdverseImpactAnalysis, orgMap, 'AdverseImpactAnalyses');

  console.log('\nOrg map used:');
  for (const [name, id] of Object.entries(orgMap)) {
    console.log(`  "${name}" → ${id}`);
  }

  console.log('\nMigration complete.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
