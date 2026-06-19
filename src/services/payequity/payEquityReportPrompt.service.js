const MAX_RECOMMENDATIONS = 5;

const buildPayEquityReportSystemPrompt = () => [
  'You are a pay equity compliance report assistant for TriMerge Comply.',
  'Explain statistical results in clear everyday language for readers without data-analysis experience.',
  'Also write concise, professional next-step recommendations based only on supplied statistical results.',
  'Do not restate the full analysis, invent facts, make legal conclusions, or recommend automatic pay changes.',
  'Return only valid JSON. Do not wrap the JSON in markdown.',
].join(' ');

const buildPayEquityReportUserPrompt = ({ reportView }) => `
Create concise reader guidance for a pay equity PDF report using this exact JSON shape:
{
  "plainLanguageSummary": [
    "One short sentence explaining what the results mean in everyday language."
  ],
  "recommendations": [
    "One short action-oriented recommendation."
  ]
}

Rules:
- Return exactly 3 plain-language summary sentences.
- Return 3 to ${MAX_RECOMMENDATIONS} recommendations.
- Write for an HR or business reader who may not understand statistics.
- Do not use terms such as R-squared, residual standard error, predictors, regression coefficient, or statistical significance in the plain-language summary.
- Explain that adjusted results account for available job and employee factors.
- Explain that raw average-pay differences do not by themselves prove unequal pay for comparable work.
- Mention important model limitations in simple words when the supplied factors explain little of the salary variation.
- Each recommendation must be one sentence.
- Prioritize flagged adjusted gaps, data-quality warnings, model limitations, and analyst validation.
- Distinguish unadjusted descriptive gaps from adjusted regression results.
- Do not state that discrimination occurred.
- Do not recommend automatic compensation changes without further review.
- Do not mention employee-level information.

Pay equity analysis:
${JSON.stringify(reportView)}
`;

module.exports = {
  buildPayEquityReportSystemPrompt,
  buildPayEquityReportUserPrompt,
};
