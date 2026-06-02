# Illia V2 Feature Migration Notes

## Purpose

This folder contains the v2 NestJS/Prisma rewrite of the Position Description Analysis Engine and Pay Equity Engine. The goal was to move the existing backend work into the new v2 stack while keeping the same endpoint names and the same core feature behavior expected by the UI.

## Position Description Analysis

Implemented the Position Description feature under the existing endpoint path:

- `GET /api/position`
- `POST /api/position/upload`
- `GET /api/position/:id`
- `PATCH /api/position/:id/review`
- `GET /api/position/:id/report`

Current behavior:

- Uploads position description documents.
- Stores uploaded files in Cloudinary.
- Extracts text from supported documents.
- Sends extracted text to OpenAI for compliance analysis when `OPENAI_API_KEY` is configured.
- Returns AI-generated findings, severity levels, evidence, explanations, and recommendations.
- Supports UI detail data for flag summary, AI recommendations, analyst notes, review status, uploaded by, and date.
- Allows analyst notes and review status to be saved.
- Generates a one-page PDF review report for download.

## Pay Equity Engine

Implemented the Pay Equity feature under the existing endpoint path:

- `GET /api/payequity`
- `POST /api/payequity/upload`

Current behavior:

- Uploads compensation/pay equity files.
- Stores uploaded files in Cloudinary.
- Parses supported file formats into analyzable data.
- Runs OLS regression using salary as the outcome.
- Uses all available valid fields as predictors.
- Calculates adjusted pay gaps for protected groups.
- Calculates UI summary fields, including departments analyzed, demographic groups, total employees, flags generated, pay gaps by department, and demographic gaps overall.
- Returns a trimmed list response for UI display instead of sending the full regression output every time.

## Shared Additions

Added shared support code for:

- Cloudinary raw file storage.
- OpenAI JSON response handling.
- Uploaded-by metadata formatting.
- Prisma models for position documents and pay equity analyses.
- File parsing support for CSV, TXT, XLS, XLSX, PDF, and DOCX where applicable.

## Environment Variables

The `.env.example` file was updated with the needed placeholders:

```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

## Testing Status

The NestJS build passes with:

```bash
npm run build
```

Pay equity processing was smoke-tested with the existing sample pay equity CSV and produced the expected regression summary and UI metrics.

## Remaining Setup Before Live Testing

Before running this against MongoDB, Prisma still needs to be generated and pushed from a normal terminal environment:

```bash
npm install
npm run db:generate
npm run db:push
npm run start:dev
```

Prisma generation was blocked locally by Windows permission issues during setup, so this step should be rerun in the normal development terminal.

## Notes

The controllers were kept version-neutral so the endpoint names remain compatible with the existing UI contract. This means the migrated features keep using `/api/position` and `/api/payequity` instead of requiring a versioned `/api/v1/...` path.
