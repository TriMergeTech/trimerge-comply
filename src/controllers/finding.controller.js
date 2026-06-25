const Finding   = require('../models/Finding');
const Flag      = require('../models/Flag');
const Audit     = require('../models/Audit');
const Handbook  = require('../models/Handbook');
const Evidence  = require('../models/Evidence');
const ActivityLog = require('../models/ActivityLog');
const { draftFinding } = require('../services/ai/findingDraft.service');
const { searchHandbookChunks } = require('../services/handbook/handbookSearch.service');
const { sendSuccess, sendError } = require('../utils/response');

// Formats a flag's statistical data into structured text for auto-evidence
const flagEvidenceContent = (flag) => {
  const lines = [];
  if (flag.name)                  lines.push(`Flag: ${flag.name}`);
  if (flag.group)                 lines.push(`Group: ${flag.group}`);
  if (flag.referenceGroup)        lines.push(`Reference Group: ${flag.referenceGroup}`);
  if (flag.selectionRate != null) lines.push(`Selection Rate: ${(flag.selectionRate * 100).toFixed(1)}%`);
  if (flag.impactRatio   != null) lines.push(`Impact Ratio: ${(flag.impactRatio * 100).toFixed(1)}%`);
  if (flag.threshold     != null) lines.push(`Threshold (Four-Fifths Rule): ${(flag.threshold * 100).toFixed(0)}%`);
  if (flag.testType)              lines.push(`Statistical Test: ${flag.testType}`);
  if (flag.pValue        != null) lines.push(`P-Value: ${flag.pValue.toFixed(4)}`);
  if (flag.severity)              lines.push(`Severity: ${flag.severity}`);
  const r = flag.results;
  if (r) {
    if (r.jobTitle)               lines.push(`Job Title: ${r.jobTitle}`);
    if (r.stage)                  lines.push(`Selection Stage: ${r.stage}`);
    if (r.demographicGroup)       lines.push(`Demographic Group: ${r.demographicGroup}`);
    if (r.fourFifthsRule != null) lines.push(`Four-Fifths Rule Ratio: ${(r.fourFifthsRule * 100).toFixed(1)}%`);
    if (r.chiSquare      != null) lines.push(`Chi-Square Statistic: ${r.chiSquare.toFixed(4)}`);
    if (r.fishersExact   != null) lines.push(`Fisher's Exact P-Value: ${r.fishersExact.toFixed(4)}`);
  }
  return lines.join('\n');
};

const SEVERITY_TO_RISK = { low: 'low', medium: 'medium', high: 'high' };

const VALID_TRANSITIONS = {
  new: ['under_review'],
  under_review: ['additional_info_required', 'approved', 'rejected'],
  additional_info_required: ['under_review'],
  approved: ['closed'],
  rejected: ['closed'],
  closed: [],
};

const buildFlagContext = (flag) => {
  if (!flag) return null;
  const rate = flag.selectionRate != null ? `${(flag.selectionRate * 100).toFixed(1)}%` : 'N/A';
  const ratio = flag.impactRatio != null ? (flag.impactRatio * 100).toFixed(1) : 'N/A';
  return (
    `Group: "${flag.group}" vs reference group "${flag.referenceGroup}". ` +
    `Selection rate: ${rate}. Impact ratio: ${ratio}%. ` +
    `Test: ${flag.testType}. P-value: ${flag.pValue ?? 'N/A'}. Severity: ${flag.severity}.`
  );
};

// POST /api/findings
const createFinding = async (req, res, next) => {
  try {
    const { auditId, flagId, observation, risk, analystNotes } = req.body;

    if (!auditId) {
      return sendError(res, { statusCode: 400, message: 'auditId is required.' });
    }
    if (!observation?.trim()) {
      return sendError(res, { statusCode: 400, message: 'observation is required.' });
    }

    const audit = await Audit.findOne({ _id: auditId, organizationId: req.user.organizationId });
    if (!audit) return sendError(res, { statusCode: 404, message: 'Audit not found.' });

    let flag = null;
    if (flagId) {
      flag = await Flag.findById(flagId);
      if (!flag) return sendError(res, { statusCode: 404, message: 'Flag not found.' });
    }

    const riskLevel = risk?.level || (flag ? SEVERITY_TO_RISK[flag.severity] || 'medium' : 'medium');
    const riskDesc = risk?.description || (flag ? buildFlagContext(flag) : '');

    // Search all ready handbooks for relevant sections
    const handbooks = await Handbook.find({
      status: 'ready',
      organizationId: req.user.organizationId,
    })
      .select('_id name chunks')
      .lean();

    let handbookExcerpts = [];
    let handbookReference = {};

    for (const hb of handbooks) {
      const hits = searchHandbookChunks(hb.chunks, observation, 2);
      if (hits.length) {
        handbookExcerpts.push(...hits.map((h) => h.content));
        if (!handbookReference.handbookId) {
          handbookReference = {
            handbookId: hb._id,
            section: `Handbook: ${hb.name}`,
            excerpt: hits[0].content.slice(0, 600),
          };
        }
      }
    }

    // AI draft — non-fatal if it fails or is not configured
    let criteria = '';
    let recommendation = '';
    let aiDrafted = false;

    try {
      const draft = await draftFinding({
        observation,
        riskLevel,
        handbookExcerpts: handbookExcerpts.slice(0, 3),
        flagContext: buildFlagContext(flag),
      });
      if (!draft.skipped) {
        criteria = draft.criteria;
        recommendation = draft.recommendation;
        aiDrafted = true;
      }
    } catch (_err) {
      // silently degrade — analyst can fill in manually
    }

    const finding = await Finding.create({
      auditId,
      flagId: flagId || null,
      observation: observation.trim(),
      risk: { level: riskLevel, description: riskDesc },
      criteria,
      recommendation,
      handbookReference: handbookReference.handbookId ? handbookReference : undefined,
      aiDrafted,
      analystNotes: analystNotes || '',
      createdBy: req.user._id,
      organizationId: req.user.organizationId,
    });

    await ActivityLog.create({
      targetType: 'finding',
      targetId: finding._id,
      auditId,
      findingId: finding._id,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'finding_created',
      details: {
        observation: finding.observation,
        riskLevel,
        aiDrafted,
        fromFlag: Boolean(flagId),
      },
    });

    // Auto-evidence: when a flag is the source, immediately attach its statistical data
    if (flag) {
      await Evidence.create({
        findingId:      finding._id,
        auditId:        finding.auditId,
        organizationId: req.user.organizationId,
        type:           'statistical_result',
        source:         'flag',
        sourceId:       flag._id,
        title:          `Adverse Impact Flag: ${flag.name || flag.group || 'Statistical Flag'}`,
        content:        flagEvidenceContent(flag),
        collectedBy:    req.user._id,
        collectedAt:    new Date(),
      });
    }

    const message = aiDrafted
      ? 'Finding created with AI-drafted criteria and recommendation. Review before approving.'
      : 'Finding created. Add OPENAI_API_KEY to enable AI drafting of criteria and recommendation.';

    return sendSuccess(res, { statusCode: 201, message, data: { finding } });
  } catch (err) {
    next(err);
  }
};

// GET /api/findings  or  GET /api/audits/:auditId/findings
const listFindings = async (req, res, next) => {
  try {
    const { status, riskLevel, page = 1, limit = 20 } = req.query;

    // Support both /api/findings?auditId=xxx and /api/audits/:auditId/findings
    const auditId = req.params.auditId || req.query.auditId;

    const filter = { organizationId: req.user.organizationId };
    if (auditId) filter.auditId = auditId;
    if (status) filter.status = status;
    if (riskLevel) filter['risk.level'] = riskLevel;

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.min(parseInt(limit), 100);
    const take = Math.min(parseInt(limit), 100);

    const [findings, total] = await Promise.all([
      Finding.find(filter)
        .populate('auditId', 'name organization clientName')
        .populate('flagId', 'group severity testType pValue selectionRate impactRatio')
        .populate('createdBy', 'name email role')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      Finding.countDocuments(filter),
    ]);

    // Attach evidence counts without N+1 — one aggregation for the whole page
    const findingIds = findings.map((f) => f._id);
    const evidenceCounts = await Evidence.aggregate([
      { $match: { findingId: { $in: findingIds } } },
      { $group: { _id: '$findingId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    evidenceCounts.forEach((e) => { countMap[e._id.toString()] = e.count; });

    const findingsWithCount = findings.map((f) => ({
      ...f.toObject(),
      evidenceCount: countMap[f._id.toString()] || 0,
    }));

    return sendSuccess(res, {
      message: 'Findings retrieved successfully.',
      data: {
        findings: findingsWithCount,
        pagination: {
          total,
          page: parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/findings/:id
const getFindingById = async (req, res, next) => {
  try {
    const finding = await Finding.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    })
      .populate('auditId', 'name organization clientName auditType status')
      .populate('flagId', 'group referenceGroup severity testType pValue selectionRate impactRatio threshold')
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('reviewedBy', 'name email role')
      .populate('handbookReference.handbookId', 'name fileName');

    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });

    const evidence = await Evidence.find({ findingId: finding._id })
      .populate('collectedBy', 'name email role')
      .sort({ createdAt: 1 });

    return sendSuccess(res, {
      message: 'Finding retrieved successfully.',
      data: { finding, evidence, evidenceCount: evidence.length },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/findings/:id
const updateFinding = async (req, res, next) => {
  try {
    const { observation, risk, criteria, recommendation, analystNotes, assignedTo } = req.body;

    const finding = await Finding.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });

    if (['approved', 'rejected', 'closed'].includes(finding.status)) {
      return sendError(res, {
        statusCode: 400,
        message: `Cannot edit a finding with status "${finding.status}". Move to "under_review" first if changes are needed.`,
      });
    }

    const changes = {};
    if (observation !== undefined) {
      changes.observation = { from: finding.observation, to: observation };
      finding.observation = observation.trim();
    }
    if (risk?.level !== undefined) {
      changes.riskLevel = { from: finding.risk.level, to: risk.level };
      finding.risk.level = risk.level;
    }
    if (risk?.description !== undefined) finding.risk.description = risk.description;
    if (criteria !== undefined) finding.criteria = criteria;
    if (recommendation !== undefined) finding.recommendation = recommendation;
    if (analystNotes !== undefined) finding.analystNotes = analystNotes;
    if (assignedTo !== undefined) finding.assignedTo = assignedTo || null;

    await finding.save();

    await ActivityLog.create({
      targetType: 'finding',
      targetId: finding._id,
      auditId: finding.auditId,
      findingId: finding._id,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'finding_updated',
      details: { changes },
    });

    return sendSuccess(res, { message: 'Finding updated successfully.', data: { finding } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/findings/:id/status
const updateFindingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return sendError(res, { statusCode: 400, message: 'status is required.' });
    }

    const finding = await Finding.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });

    const allowed = VALID_TRANSITIONS[finding.status] || [];
    if (!allowed.includes(status)) {
      return sendError(res, {
        statusCode: 400,
        message: `Cannot transition from "${finding.status}" to "${status}". Allowed next states: ${allowed.join(', ') || 'none'}.`,
      });
    }

    // Governance gate: evidence + criteria + recommendation required before approval
    if (status === 'approved') {
      if (!finding.criteria?.trim() || !finding.recommendation?.trim()) {
        return sendError(res, {
          statusCode: 400,
          message: 'Criteria and recommendation must be filled in before a finding can be approved.',
        });
      }
      const evidenceCount = await Evidence.countDocuments({ findingId: finding._id });
      if (evidenceCount === 0) {
        return sendError(res, {
          statusCode: 400,
          message: 'At least one piece of evidence must be attached before a finding can be approved.',
        });
      }
    }

    const prevStatus = finding.status;
    finding.status = status;

    if (['approved', 'rejected'].includes(status)) {
      finding.reviewedBy = req.user._id;
      finding.reviewedAt = new Date();
    }

    await finding.save();

    await ActivityLog.create({
      targetType: 'finding',
      targetId: finding._id,
      auditId: finding.auditId,
      findingId: finding._id,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'finding_status_changed',
      details: { from: prevStatus, to: status, reason: reason || null },
    });

    return sendSuccess(res, {
      message: `Finding moved to "${status}".`,
      data: { finding },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/findings/:id/regenerate-draft
// Re-runs the AI draft with current handbook content. Analyst must re-approve.
const regenerateDraft = async (req, res, next) => {
  try {
    const finding = await Finding.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    if (!finding) return sendError(res, { statusCode: 404, message: 'Finding not found.' });

    if (['approved', 'closed'].includes(finding.status)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Cannot regenerate draft for an approved or closed finding.',
      });
    }

    const handbooks = await Handbook.find({
      status: 'ready',
      organizationId: req.user.organizationId,
    })
      .select('chunks name')
      .lean();

    const excerpts = [];
    for (const hb of handbooks) {
      const hits = searchHandbookChunks(hb.chunks, finding.observation, 2);
      excerpts.push(...hits.map((h) => h.content));
    }

    const draft = await draftFinding({
      observation: finding.observation,
      riskLevel: finding.risk.level,
      handbookExcerpts: excerpts.slice(0, 3),
    });

    if (draft.skipped) {
      return sendError(res, { statusCode: 503, message: 'OPENAI_API_KEY is not configured.' });
    }

    finding.criteria = draft.criteria;
    finding.recommendation = draft.recommendation;
    finding.aiDrafted = true;
    // Bump back to under_review so an analyst is forced to re-review the new draft
    if (finding.status === 'approved' || finding.status === 'rejected') {
      finding.status = 'under_review';
      finding.reviewedBy = null;
      finding.reviewedAt = null;
    }

    await finding.save();

    await ActivityLog.create({
      targetType: 'finding',
      targetId: finding._id,
      auditId: finding.auditId,
      findingId: finding._id,
      performedBy: req.user._id,
      organizationId: req.user.organizationId,
      action: 'finding_updated',
      details: { regeneratedAiDraft: true },
    });

    return sendSuccess(res, {
      message: 'AI draft regenerated. Review and approve before finalising.',
      data: { finding },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFinding,
  listFindings,
  getFindingById,
  updateFinding,
  updateFindingStatus,
  regenerateDraft,
};
