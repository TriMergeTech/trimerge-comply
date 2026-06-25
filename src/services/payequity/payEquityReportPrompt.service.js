const MAX_RECOMMENDATIONS = 5;

const buildPayEquityReportSystemPrompt = () => [
  'You are a senior pay equity consultant preparing an executive-facing report for TriMerge Comply.',
  'Explain statistical results in clear everyday language for readers without data-analysis experience.',
  'Translate verified analytics into concise business insight and practical next steps.',
  'Do not restate the full analysis, invent facts, make legal conclusions, or recommend automatic pay changes.',
  'Return only valid JSON. Do not wrap the JSON in markdown.',
].join(' ');

const buildPayEquityReportUserPrompt = ({ reportView }) => `
Create concise reader guidance for a pay equity PDF report using this exact JSON shape:
{
  "executiveSummary": "Three concise sentences covering overall risk, the most important observation, and the immediate review priority.",
  "plainLanguageSummary": [
    "One short sentence explaining what the results mean in everyday language."
  ],
  "keyInsights": [
    {
      "finding": "One short sentence stating what was found.",
      "whyItMatters": "One short sentence explaining the business or workforce importance.",
      "nextStep": "One short sentence explaining what should be reviewed next."
    }
  ],
  "recommendations": [
    "One short action-oriented recommendation."
  ]
}

Rules:
- Return one executive summary with no more than 90 words.
- Return exactly 3 plain-language summary sentences.
- Return 1 to 3 key insights.
- Return 3 to ${MAX_RECOMMENDATIONS} recommendations.
- Write for an HR or business reader who may not understand statistics.
- Do not use terms such as R-squared, residual standard error, predictors, regression coefficient, or statistical significance in the plain-language summary.
- Explain that adjusted results account for available job and employee factors.
- Explain that raw average-pay differences do not by themselves prove unequal pay for comparable work.
- Mention important model limitations in simple words when the supplied factors explain little of the salary variation.
- Each recommendation must be one sentence.
- Every key insight must clearly separate the finding, why it matters, and the next review step.
- Prioritize flagged adjusted gaps, data-quality warnings, model limitations, and analyst validation.
- Distinguish unadjusted descriptive gaps from adjusted regression results.
- Do not state that discrimination occurred.
- Do not describe a flagged result as confirmed pay inequity or a compliance violation.
- Use wording such as "the model estimates" or "the analysis identified a result requiring review."
- Do not call a result statistically significant unless statistical-significance evidence is explicitly supplied.
- Do not invent effects on morale, retention, reputation, employee trust, or legal exposure.
- Preserve the rounded percentages supplied in the analysis instead of adding unsupported precision.
- Do not recommend automatic compensation changes without further review.
- Do not mention employee-level information.
- Use only facts supplied in the pay equity analysis object.

Pay equity analysis:
${JSON.stringify(reportView)}
`;

module.exports = {
  buildPayEquityReportSystemPrompt,
  buildPayEquityReportUserPrompt,
};
