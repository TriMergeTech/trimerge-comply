# Illia - CSV Processing Plan

## Goal

Create a small CSV processing layer that can later plug into Ibrahim's backend upload endpoint.

This version does not include AI or Claude integration. It focuses only on validating CSV-style analytics data and preparing it for adverse impact analysis.

## Expected CSV Columns

The first test format is group-level data:

```csv
group,selected,total
Male,80,100
Female,30,50
```

## Code Added

- `src/services/analytics/csvValidation.js`
- `src/services/analytics/csvAdverseImpactProcessor.js`

## Processing Flow

1. Parse CSV text.
2. Normalize headers.
3. Validate required columns.
4. Validate numeric fields.
5. Return structured validation errors if the CSV is not usable.
6. Run the 4/5ths Rule analysis if validation passes.

## Current Test Strategy

For now, this can be tested as a service without an Express upload route:

```js
const { processAdverseImpactCsv } = require('./src/services/analytics/csvAdverseImpactProcessor');

const csv = `group,selected,total
Male,80,100
Female,30,50`;

console.log(processAdverseImpactCsv(csv));
```

## Next Backend Integration Step

When we create the backend test branch from Ibrahim's latest backend, this service can be called by:

```text
POST /api/upload/csv
```

The upload endpoint should receive a CSV file, read its text, call `processAdverseImpactCsv`, and return the validation/analysis result.
