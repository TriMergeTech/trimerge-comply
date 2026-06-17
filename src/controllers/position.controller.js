const Position = require('../models/Position');
const { sendSuccess, sendError } = require('../utils/response');

// ── Rule-based compliance scanner ────────────────────────────────────────────

const RULES = [
  {
    pattern: /\b(he|him|his|she|her)\s/gi,
    category: 'Gendered Language',
    severity: 'medium',
    title: 'Gendered pronoun usage',
    explanation: 'Job descriptions should use gender-neutral language such as "they/them" to avoid discouraging applicants.',
  },
  {
    pattern: /\b(chairman|manpower|manmade|workmanship|salesman|stewardess|fireman|policeman|foreman)\b/gi,
    category: 'Gendered Language',
    severity: 'medium',
    title: 'Gender-coded job terminology',
    explanation: 'These terms carry gender associations. Consider neutral alternatives (e.g. "workforce", "chair", "police officer").',
  },
  {
    pattern: /\b(young|youthful|recent graduate|fresh graduate|new graduate|digital native|energetic young)\b/gi,
    category: 'Age Bias',
    severity: 'high',
    title: 'Age-biased language',
    explanation: 'This language implies a preference for younger candidates, which may violate age discrimination laws.',
  },
  {
    pattern: /\bmust (be able to )?lift\b/gi,
    category: 'Physical Requirements',
    severity: 'low',
    title: 'Physical requirement without justification',
    explanation: 'Physical requirements should only be included if essential to the role and documented in a physical demands analysis.',
  },
  {
    pattern: /\bcultural?\s+fit\b/gi,
    category: 'Exclusionary Language',
    severity: 'medium',
    title: '"Culture fit" requirement',
    explanation: '"Culture fit" is vague and can mask bias. Use specific, measurable competencies instead.',
  },
  {
    pattern: /\b(native|fluent)\s+(english|language)\s+speaker\b/gi,
    category: 'Language Discrimination',
    severity: 'high',
    title: 'Language fluency requirement',
    explanation: 'Requiring "native" language proficiency may violate Title VII unless directly job-related and business-necessary.',
  },
];

const RECOMMENDATIONS = {
  'Gendered Language':        'Replace gendered pronouns and terms with gender-neutral alternatives (e.g. "they/them", "workforce", "chair").',
  'Age Bias':                 'Remove age-implying language and focus on skills, experience, and competencies.',
  'Physical Requirements':    'Review all physical requirements to confirm they are documented essential job functions.',
  'Exclusionary Language':    'Replace "culture fit" with specific, measurable behavioural competencies.',
  'Language Discrimination':  'Remove or revise language fluency requirements unless directly tied to documented business necessity.',
};

function analyzeText(text) {
  const flagSummary = [];
  const seenCategories = new Set();

  for (const rule of RULES) {
    const matches = [...text.matchAll(rule.pattern)];
    if (matches.length === 0) continue;

    const sample = matches.slice(0, 3).map((m) => m[0].trim()).join(', ');
    const extra  = matches.length > 3 ? ` (+${matches.length - 3} more)` : '';

    flagSummary.push({
      title:       rule.title,
      severity:    rule.severity,
      category:    rule.category,
      evidence:    `Found: "${sample}"${extra}`,
      explanation: rule.explanation,
    });
    seenCategories.add(rule.category);
  }

  const hasHigh = flagSummary.some((f) => f.severity === 'high');
  const overallRisk = flagSummary.length === 0 ? 'low' : hasHigh ? 'high' : 'medium';

  const aiRecommendations = [...seenCategories].map((cat) => RECOMMENDATIONS[cat]).filter(Boolean);

  const summary = `Analysis complete. ${flagSummary.length} compliance issue(s) identified. Overall risk: ${overallRisk}.`;

  return { flagSummary, overallRisk, aiRecommendations, summary };
}

// ── POST /api/position/upload ─────────────────────────────────────────────────

const uploadPosition = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, { statusCode: 400, message: 'No file provided.' });
    }

    const text = req.file.buffer.toString('utf8');

    if (text.trim().length < 20) {
      return sendError(res, { statusCode: 422, message: 'File appears empty or too short to analyse.' });
    }

    const { flagSummary, overallRisk, aiRecommendations, summary } = analyzeText(text);

    const doc = await Position.create({
      documentName:      req.file.originalname.replace(/\.[^.]+$/, ''),
      fileName:          req.file.originalname,
      mimeType:          req.file.mimetype || 'text/plain',
      uploadedBy:        req.user._id,
      status:            'completed',
      summary,
      overallRisk,
      flagSummary,
      aiRecommendations,
      textPreview:       text.slice(0, 3000),
      storage: {
        bytes:            req.file.size,
        originalFilename: req.file.originalname,
        resourceType:     'raw',
        publicId:         '',
        secureUrl:        '',
      },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message:    'Position document analysed successfully.',
      data:       { document: doc },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/position ─────────────────────────────────────────────────────────

const getPositions = async (req, res, next) => {
  try {
    const docs = await Position.find()
      .sort('-createdAt')
      .populate('uploadedBy', 'name email');

    const documents = docs.map((d) => ({
      id:           d._id,
      documentName: d.documentName,
      status:       d.status,
      flags:        d.flagSummary.length,
      uploadedBy:   d.uploadedBy?.name || d.uploadedBy?.email || 'Unknown',
      date:         d.createdAt,
      view:         d.status === 'completed' ? `/position-analysis/${d._id}` : null,
    }));

    return sendSuccess(res, {
      message: 'Position documents retrieved successfully.',
      data:    { documents },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/position/:id ─────────────────────────────────────────────────────

const getPositionById = async (req, res, next) => {
  try {
    const doc = await Position.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!doc) {
      return sendError(res, { statusCode: 404, message: 'Position document not found.' });
    }

    const document = {
      id:               doc._id,
      documentName:     doc.documentName,
      status:           doc.status,
      flags:            doc.flagSummary.length,
      uploadedBy:       doc.uploadedBy?.name || doc.uploadedBy?.email || 'Unknown',
      date:             doc.createdAt,
      fileName:         doc.fileName,
      mimeType:         doc.mimeType,
      storage:          doc.storage,
      summary:          doc.summary,
      overallRisk:      doc.overallRisk,
      flagSummary:      doc.flagSummary.map((f) => ({ id: f._id, ...f.toObject() })),
      aiRecommendations: doc.aiRecommendations,
      analystNotes:     doc.analystNotes,
      resolutionStatus: doc.resolutionStatus,
      reviewedBy:       doc.reviewedBy ? (doc.reviewedBy.name || doc.reviewedBy.email) : null,
      reviewedAt:       doc.reviewedAt,
      textPreview:      doc.textPreview,
    };

    return sendSuccess(res, {
      message: 'Position document detail retrieved successfully.',
      data:    { document },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadPosition, getPositions, getPositionById };
