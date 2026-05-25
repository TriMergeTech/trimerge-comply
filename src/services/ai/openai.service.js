const {
  buildPositionSystemPrompt,
  buildPositionUserPrompt,
} = require('../position/positionPrompt.service');
const {
  buildPositionReportSystemPrompt,
  buildPositionReportUserPrompt,
} = require('../position/positionReportPrompt.service');

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

module.exports = {
  analyzePositionDescription,
  generatePositionReportDraft,
  isOpenAIConfigured,
};
