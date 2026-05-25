const MAX_FLAGS = 4;
const MAX_RECOMMENDATIONS = 4;

const buildPositionReportSystemPrompt = () => [
  'You are an HR compliance report writer for TriMerge Comply.',
  'Create concise, official, audit-ready language for a one-page position description analysis report.',
  'Use only the supplied analysis data. Do not invent facts, laws, policies, or findings.',
  'This is an internal compliance review aid, not a legal opinion.',
  'Return only valid JSON. Do not wrap the JSON in markdown.',
].join(' ');

const buildPositionReportUserPrompt = ({ documentView, companyName }) => {
  const flags = documentView.flagSummary.slice(0, MAX_FLAGS).map((flag) => ({
    title: flag.title,
    severity: flag.severity,
    category: flag.category,
    evidence: flag.evidence,
    explanation: flag.explanation,
  }));
  const recommendations = documentView.aiRecommendations.slice(0, MAX_RECOMMENDATIONS);

  return `
Create concise report copy for a one-page PDF using this exact JSON shape:
{
  "reportTitle": "Position Description Analysis",
  "organizationLine": "Company or organization line.",
  "executiveSummary": "2 concise sentences summarizing the review and overall risk.",
  "keyFindings": [
    {
      "title": "Finding title.",
      "severity": "low | medium | high",
      "summary": "One short sentence explaining the issue."
    }
  ],
  "recommendations": [
    "Short action-oriented recommendation."
  ],
  "reviewConclusion": "One concise sentence stating that analyst review is required before final reporting."
}

Rules:
- Keep all text short enough for a single-page PDF.
- Include no more than 4 key findings and 4 recommendations.
- Keep a professional official compliance tone.
- Do not include legal conclusions.
- Do not claim final compliance approval.

Company name: ${companyName || 'Not provided'}
Document name: ${documentView.documentName}
Overall risk: ${documentView.overallRisk || 'not specified'}
AI summary: ${documentView.summary || 'No summary available.'}
Resolution status: ${documentView.resolutionStatus || 'not_reviewed'}
Analyst notes: ${documentView.analystNotes || 'No analyst notes provided.'}

AI findings:
${JSON.stringify(flags)}

AI recommendations:
${JSON.stringify(recommendations)}
`;
};

module.exports = {
  buildPositionReportSystemPrompt,
  buildPositionReportUserPrompt,
};
