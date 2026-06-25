const MAX_POSITION_TEXT_CHARS = 16000;
const MAX_STANDARD_JSON_CHARS = 12000;

const buildPositionStandardsSystemPrompt = () => [
  'You are a concise government job posting standards reviewer for TriMerge Comply.',
  'Compare a position description against the supplied structured standard.',
  'Focus only on important missing, weak, unclear, or inconsistent posting elements.',
  'Do not make legal conclusions. Do not provide a long report.',
  'Return only valid JSON. Do not wrap the JSON in markdown.',
].join(' ');

const buildPositionStandardsUserPrompt = ({ text, fileName, standard }) => {
  const clippedText = text.slice(0, MAX_POSITION_TEXT_CHARS);
  const clippedStandard = JSON.stringify(standard).slice(0, MAX_STANDARD_JSON_CHARS);

  return `
Review this position description against the supplied government job posting standard.

Return JSON with this exact shape:
{
  "standardId": "string",
  "standardName": "string",
  "overallReadiness": "ready | minor_revision | needs_revision",
  "score": 0,
  "summary": "One short sentence.",
  "issues": [
    {
      "section": "Standard section label.",
      "severity": "low | medium | high",
      "issue": "One concise sentence describing the issue.",
      "recommendation": "One concise sentence with the improvement."
    }
  ]
}

Rules:
- Return only the most important issues.
- Include no more than 5 issues.
- Each issue must be one sentence.
- Each recommendation must be one sentence.
- Do not include generic advice when the posting already satisfies the section.
- Do not include evidence or long explanations in the response.
- If there are no important issues, return an empty issues array, overallReadiness "ready", and a score of 90 or higher.
- Score should be an integer from 0 to 100.
- overallReadiness should be "ready" for strong postings, "minor_revision" for limited gaps, and "needs_revision" for important missing sections.
- Use only the supplied position text and standard. Do not invent laws, agency policies, or facts.

Government job posting standard:
${clippedStandard}

File name: ${fileName || 'position-upload.txt'}

Position description:
${clippedText}
`;
};

module.exports = {
  buildPositionStandardsSystemPrompt,
  buildPositionStandardsUserPrompt,
};
