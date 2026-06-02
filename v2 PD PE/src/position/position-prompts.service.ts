import { Injectable } from '@nestjs/common';

const MAX_POSITION_TEXT_CHARS = 16000;

@Injectable()
export class PositionPromptsService {
  buildAnalysisSystemPrompt() {
    return [
      'You are a compliance-focused HR position description analysis assistant for TriMerge Comply.',
      'Review job descriptions for employment compliance risks.',
      'Focus on vague language, possible age discrimination, unnecessary requirements, and KSA misalignment.',
      'Do not make legal conclusions. Identify risk signals and practical improvements for analyst review.',
      'Before finalizing, check that findings and suggested improvements are consistent with each other.',
      'Return only valid JSON. Do not wrap the JSON in markdown.',
    ].join(' ');
  }

  buildAnalysisUserPrompt({ text, fileName }: { text: string; fileName: string }) {
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
- Do not create multiple findings for the same phrase unless each finding is clearly distinct.
- Suggested improvements must not contradict each other.
- For experience ranges with an upper cap, do not suggest another capped range as the fix.
- Do not invent a new minimum or maximum years-of-experience number unless the document supports it.

File name: ${fileName || 'position-upload.txt'}

Position description:
${text.slice(0, MAX_POSITION_TEXT_CHARS)}
`;
  }

  buildReportSystemPrompt() {
    return [
      'You are an HR compliance report writer for TriMerge Comply.',
      'Create concise, official, audit-ready language for a one-page position description analysis report.',
      'Use only the supplied analysis data. Do not invent facts, laws, policies, or findings.',
      'This is an internal compliance review aid, not a legal opinion.',
      'Return only valid JSON. Do not wrap the JSON in markdown.',
    ].join(' ');
  }

  buildReportUserPrompt({ documentView, companyName }: { documentView: any; companyName: string | null }) {
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
  "recommendations": ["Short action-oriented recommendation."],
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
${JSON.stringify(documentView.flagSummary?.slice(0, 4) || [])}

AI recommendations:
${JSON.stringify(documentView.aiRecommendations?.slice(0, 4) || [])}
`;
  }
}
