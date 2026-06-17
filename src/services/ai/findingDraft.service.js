const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const isConfigured = () => Boolean(process.env.OPENAI_API_KEY);

const buildPrompt = ({ observation, riskLevel, handbookExcerpts, flagContext }) => {
  const excerptBlock = handbookExcerpts.length
    ? handbookExcerpts.map((e, i) => `[Section ${i + 1}]\n${e.trim()}`).join('\n\n')
    : 'No handbook sections were retrieved for this finding.';

  return `You are a senior HR compliance analyst drafting a formal finding for an audit report.

OBSERVATION (what was found):
${observation}

RISK LEVEL: ${riskLevel.toUpperCase()}
${flagContext ? `\nADVERSE IMPACT CONTEXT:\n${flagContext}` : ''}

RELEVANT HANDBOOK / POLICY SECTIONS:
${excerptBlock}

Draft the following two fields. Be specific, professional, and cite the handbook sections where applicable.

Return ONLY valid JSON with exactly these two keys:
{
  "criteria": "The specific policy, regulation, or handbook section this finding is measured against. Quote or paraphrase the relevant handbook excerpt if applicable. If no handbook section is applicable, cite the EEOC 4/5ths Rule or relevant HR best practice.",
  "recommendation": "A concrete, actionable corrective step the organisation must complete. Include a suggested owner (e.g. HR Director) and timeline (e.g. within 30 days)."
}`;
};

/**
 * Uses GPT-4o-mini to draft criteria and recommendation for a Finding.
 * AI role is retrieval + drafting ONLY — analysts must review and approve.
 *
 * @returns {{ configured, skipped, criteria, recommendation }}
 */
const draftFinding = async ({ observation, riskLevel, handbookExcerpts = [], flagContext = null }) => {
  if (!isConfigured()) {
    return { configured: false, skipped: true, criteria: '', recommendation: '' };
  }

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior HR compliance analyst. Produce precise, legally careful compliance findings. Always return valid JSON — no markdown, no explanation.',
        },
        {
          role: 'user',
          content: buildPrompt({ observation, riskLevel, handbookExcerpts, flagContext }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI returned ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI response had no content.');

  const parsed = JSON.parse(content);
  return {
    configured: true,
    skipped: false,
    criteria: (parsed.criteria || '').trim(),
    recommendation: (parsed.recommendation || '').trim(),
  };
};

module.exports = { draftFinding, isConfigured };
