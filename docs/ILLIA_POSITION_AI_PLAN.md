# Illia Position Description AI Engine

## Current MVP

- Endpoint: `POST /api/position/upload`
- Accepts `.txt`, `.csv`, `.pdf`, and `.docx` uploads.
- Stores uploaded documents in Cloudinary under `trimerge-comply/position-documents`.
- Extracts readable text and saves upload metadata in MongoDB.
- Uses OpenAI for structured compliance findings when `OPENAI_API_KEY` is configured.

## AI Review Scope

The prompt asks OpenAI to review:

- Vague language such as "energetic" or unclear personality requirements.
- Potential age discrimination signals such as "digital native".
- Unnecessary degree or experience requirements.
- KSA alignment between required qualifications and job duties.

## Environment Variables

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is empty, the endpoint still stores the document and returns `aiConfigured: false`.

## Later Additions

- Persist AI findings into the shared flag workflow as AI-generated flags.

## Government Posting Standards Review

- Endpoint: `POST /api/position/:id/standards-review`
- Uses the full extracted position text saved during upload.
- Compares the posting against a local `usajobs_federal_announcement_v1` checklist.
- Returns a separate concise AI response with no more than 5 important issues.
- Keeps the original risk analysis and PDF report behavior unchanged.

### Standards Review Output

```json
{
  "standardId": "usajobs_federal_announcement_v1",
  "standardName": "USAJOBS Federal Job Announcement Structure",
  "overallReadiness": "needs_revision",
  "score": 68,
  "summary": "The posting needs clearer application instructions and benefits information.",
  "issues": [
    {
      "section": "Benefits",
      "severity": "medium",
      "issue": "Benefits information is missing.",
      "recommendation": "Add a short benefits section covering health, retirement, leave, and insurance eligibility."
    }
  ]
}
```
