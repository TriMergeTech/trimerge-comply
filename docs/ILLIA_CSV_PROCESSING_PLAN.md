# Illia - CSV Processing Plan

## Goal

Create a small CSV processing layer that can later plug into the shared backend upload endpoint.

This version does not include AI or Claude integration. It focuses only on validating CSV-style analytics data and preparing it for adverse impact analysis.

## Supported CSV Columns

The endpoint supports group-level adverse-impact data:

```csv
group,selected,total
Male,80,100
Female,30,50
```

It also supports applicant-flow data from the supervisor's sample file:

```csv
job,stage,demographicGroup,selected
Software Engineer,screening,Asian,False
HR Analyst,application,Female,True
```

Applicant-flow data is aggregated by `demographicGroup`, then passed into the 4/5ths Rule engine.

It also validates pay-equity data:

```csv
salary,grade,tenure,performance,gender,race,department
86704,8,1.7,2.2,Male,Black,Operations
```

Pay-equity CSVs return a validation/preview response. OLS regression and pay gap analysis are planned for the pay equity engine.

## Code Added

- `src/services/analytics/fourFifthsRule.js`
- `src/services/analytics/csvValidation.js`
- `src/services/analytics/csvAdverseImpactProcessor.js`

## Processing Flow

1. Parse CSV text.
2. Normalize headers.
3. Validate required columns.
4. Validate numeric fields.
5. Return structured validation errors if the CSV is not usable.
6. Run the 4/5ths Rule analysis if the file is adverse-impact/applicant-flow data.
7. Return a validation preview if the file is pay-equity data.
8. Store valid uploaded CSV files in Cloudinary.

## Service Test Strategy

This can be tested directly as a service:

```js
const { processAdverseImpactCsv } = require('./src/services/analytics/csvAdverseImpactProcessor');

const csv = `group,selected,total
Male,80,100
Female,30,50`;

console.log(processAdverseImpactCsv(csv));
```

## Endpoint Test Strategy

The first backend test endpoint is:

```text
POST /api/upload/csv
```

This endpoint accepts a CSV file upload from Swagger, JSON with a `csvText` field, or raw `text/csv`.

Swagger test:

1. Start the backend.
2. Open `http://localhost:4000/api/docs`.
3. Use `POST /api/upload/csv`.
4. Upload a CSV file using the `file` field.

Example JSON request:

```bash
curl -X POST http://localhost:4000/api/upload/csv \
  -H "Content-Type: application/json" \
  -d "{\"csvText\":\"group,selected,total\nMale,80,100\nFemale,30,50\"}"
```

Example raw CSV request:

```bash
curl -X POST http://localhost:4000/api/upload/csv \
  -H "Content-Type: text/csv" \
  --data-binary "group,selected,total
Male,80,100
Female,30,50"
```

Expected result for applicant-flow/adverse-impact data: the response is valid, includes 4/5ths Rule analysis, and includes Cloudinary storage metadata under `data.upload.storage`.

## Cloudinary Storage

The endpoint reads `CLOUDINARY_URL` from `.env` and stores valid uploaded CSV files in the `trimerge-comply/csv-uploads` Cloudinary folder.

Do not commit real Cloudinary credentials. Keep them only in local `.env`.

## Later Upload Upgrade

The next storage upgrade is saving upload metadata and validation/analysis results to MongoDB so the dashboard and flags pages can retrieve past uploads.
