# Illia - CSV Processing Plan

## Goal

Create a small CSV processing layer that can later plug into the shared backend upload endpoint.

This version does not include AI or Claude integration. It focuses only on validating CSV-style analytics data and preparing it for adverse impact analysis.

## Expected CSV Columns

The first test format is group-level data:

```csv
group,selected,total
Male,80,100
Female,30,50
```

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
6. Run the 4/5ths Rule analysis if validation passes.

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

This endpoint accepts either JSON with a `csvText` field or raw `text/csv`.

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

Expected result: the response is valid and flags `Female` because its impact ratio is `0.75`, below the 4/5ths threshold of `0.8`.

## Later Upload Upgrade

The final upload version should receive an actual CSV file, optionally store the original file in Cloudinary, read its contents, call `processAdverseImpactCsv`, and return or persist validation/analysis results.
