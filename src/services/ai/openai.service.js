const {
  buildPositionSystemPrompt,
  buildPositionUserPrompt,
} = require('../position/positionPrompt.service');
const {
  buildPositionReportSystemPrompt,
  buildPositionReportUserPrompt,
} = require('../position/positionReportPrompt.service');
const {
  buildPositionStandardsSystemPrompt,
  buildPositionStandardsUserPrompt,
} = require('../position/positionStandardsPrompt.service');
const {
  buildPayEquityReportSystemPrompt,
  buildPayEquityReportUserPrompt,
} = require('../payequity/payEquityReportPrompt.service');

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

const isOpenAIConfigured = () => Boolean(process.env.OPENAI_API_KEY);

const parseJsonResponse = (content) => {
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error('OpenAI returned a response that was not valid JSON.');
  }
};

const normalizePositionAnalysis = (analysis) => ({
  summary: analysis?.summary || '',
  overallRisk: ['low', 'medium', 'high'].includes(analysis?.overallRisk)
    ? analysis.overallRisk
    : 'low',
  findings: Array.isArray(analysis?.findings)
    ? analysis.findings.map((finding) => ({
        source: 'ai',
        generatedBy: 'openai',
        flagType: 'position_description',
        category: finding.category || 'other',
        severity: ['low', 'medium', 'high'].includes(finding.severity)
          ? finding.severity
          : 'low',
        finding: finding.finding || '',
        evidence: finding.evidence || '',
        explanation: finding.explanation || '',
        suggestedImprovement: finding.suggestedImprovement || '',
      }))
    : [],
});

const normalizePositionStandardsReview = (review, standard) => ({
  standardId: review?.standardId || standard.standardId,
  standardName: review?.standardName || standard.standardName,
  overallReadiness: ['ready', 'minor_revision', 'needs_revision'].includes(review?.overallReadiness)
    ? review.overallReadiness
    : 'needs_revision',
  score: Number.isFinite(Number(review?.score))
    ? Math.max(0, Math.min(100, Math.round(Number(review.score))))
    : 0,
  summary: review?.summary || '',
  issues: Array.isArray(review?.issues)
    ? review.issues.slice(0, 5).map((issue) => ({
        section: issue.section || 'General',
        severity: ['low', 'medium', 'high'].includes(issue.severity)
          ? issue.severity
          : 'medium',
        issue: issue.issue || '',
        recommendation: issue.recommendation || '',
      }))
    : [],
});

const analyzePositionDescription = async ({ text, fileName }) => {
  if (!isOpenAIConfigured()) {
    return {
      configured: false,
      skipped: true,
      analysis: null,
    };
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildPositionSystemPrompt() },
        { role: 'user', content: buildPositionUserPrompt({ text, fileName }) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'OpenAI position analysis failed.');
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not include analysis content.');
  }

  return {
    configured: true,
    skipped: false,
    analysis: normalizePositionAnalysis(parseJsonResponse(content)),
  };
};

const generatePositionReportDraft = async ({ documentView, companyName }) => {
  if (!isOpenAIConfigured()) {
    return {
      configured: false,
      skipped: true,
      draft: null,
    };
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildPositionReportSystemPrompt() },
        { role: 'user', content: buildPositionReportUserPrompt({ documentView, companyName }) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.15,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'OpenAI position report drafting failed.');
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not include report draft content.');
  }

  return {
    configured: true,
    skipped: false,
    draft: parseJsonResponse(content),
  };
};

const analyzePositionStandards = async ({ text, fileName, standard }) => {
  if (!isOpenAIConfigured()) {
    return {
      configured: false,
      skipped: true,
      review: null,
    };
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildPositionStandardsSystemPrompt() },
        { role: 'user', content: buildPositionStandardsUserPrompt({ text, fileName, standard }) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.15,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'OpenAI position standards review failed.');
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not include standards review content.');
  }

  return {
    configured: true,
    skipped: false,
    review: normalizePositionStandardsReview(parseJsonResponse(content), standard),
  };
};

const generatePayEquityReportRecommendations = async ({ reportView }) => {
  if (!isOpenAIConfigured()) {
    return {
      configured: false,
      skipped: true,
      executiveSummary: null,
      plainLanguageSummary: null,
      keyInsights: null,
      recommendations: null,
    };
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildPayEquityReportSystemPrompt() },
        { role: 'user', content: buildPayEquityReportUserPrompt({ reportView }) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.15,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'OpenAI pay equity report recommendations failed.');
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response did not include pay equity report recommendations.');
  }

  const parsed = parseJsonResponse(content);
  const executiveSummary = String(parsed?.executiveSummary || '')
    .replace(/\s+/g, ' ')
    .trim();
  const plainLanguageSummary = Array.isArray(parsed?.plainLanguageSummary)
    ? parsed.plainLanguageSummary
        .map((item) => String(item || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const keyInsights = Array.isArray(parsed?.keyInsights)
    ? parsed.keyInsights
        .map((insight) => ({
          finding: String(insight?.finding || '').replace(/\s+/g, ' ').trim(),
          whyItMatters: String(insight?.whyItMatters || '').replace(/\s+/g, ' ').trim(),
          nextStep: String(insight?.nextStep || '').replace(/\s+/g, ' ').trim(),
        }))
        .filter((insight) => insight.finding && insight.whyItMatters && insight.nextStep)
        .slice(0, 3)
    : [];
  const recommendations = Array.isArray(parsed?.recommendations)
    ? parsed.recommendations
        .map((recommendation) => String(recommendation || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    configured: true,
    skipped: false,
    executiveSummary,
    plainLanguageSummary,
    keyInsights,
    recommendations,
  };
};

module.exports = {
  analyzePositionDescription,
  analyzePositionStandards,
  generatePayEquityReportRecommendations,
  generatePositionReportDraft,
  isOpenAIConfigured,
};
