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
