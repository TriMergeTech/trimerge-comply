const MAX_POSITION_TEXT_CHARS = 16000;

const buildPositionSystemPrompt = () => [
  'You are a compliance-focused HR position description analysis assistant for TriMerge Comply.',
  'Review job descriptions for employment compliance risks.',
  'Focus on vague language, possible age discrimination, unnecessary requirements, and KSA misalignment.',
  'Do not make legal conclusions. Identify risk signals and practical improvements for analyst review.',
  'Return only valid JSON. Do not wrap the JSON in markdown.',
].join(' ');

const buildPositionUserPrompt = ({ text, fileName }) => {
  const clippedText = text.slice(0, MAX_POSITION_TEXT_CHARS);

  return `
Analyze this position description and return JSON with this exact shape:
{
  "summary": "Short plain-English summary of the role and main compliance risk level.",
  "overallRisk": "low | medium | high",
  "findings": [
    {
      "source": "ai",
      "generatedBy": "openai",
      "flagType": "position_description",
      "category": "vague_language | age_discrimination | unnecessary_requirement | ksa_misalignment | other",
      "severity": "low | medium | high",
      "finding": "Specific risk finding.",
      "evidence": "Exact phrase or short excerpt from the document.",
      "explanation": "Why this could be a compliance concern.",
      "suggestedImprovement": "Concrete safer wording or action."
    }
  ]
}

Rules:
- Only include findings supported by the document text.
- If the document has no meaningful risks, return an empty findings array and overallRisk "low".
- Keep evidence short.
- Every finding must use source "ai" and generatedBy "openai".

File name: ${fileName || 'position-upload.txt'}

Position description:
${clippedText}
`;
};

module.exports = {
  buildPositionSystemPrompt,
  buildPositionUserPrompt,
};
