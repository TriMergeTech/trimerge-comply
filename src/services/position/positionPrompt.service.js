const MAX_POSITION_TEXT_CHARS = 16000;

const buildPositionSystemPrompt = () => [
  'You are a compliance-focused HR position description analysis assistant for TriMerge Comply.',
  'Review job descriptions for employment compliance risks.',
  'Focus on vague language, possible age discrimination, unnecessary requirements, and KSA misalignment.',
  'Do not make legal conclusions. Identify risk signals and practical improvements for analyst review.',
  'Before finalizing, check that findings and suggested improvements are consistent with each other.',
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
- Do not create multiple findings for the same phrase unless each finding is clearly distinct.
- If one phrase creates multiple related concerns, prefer one finding with a complete explanation.
- Suggested improvements must not contradict each other.
- For experience ranges with an upper cap, do not suggest another capped range as the fix. Prefer minimum experience plus equivalent skills, certifications, or demonstrated competence.
- Do not invent a new minimum or maximum years-of-experience number unless the document supports it.

File name: ${fileName || 'position-upload.txt'}

Position description:
${clippedText}
`;
};

module.exports = {
  buildPositionSystemPrompt,
  buildPositionUserPrompt,
};
