# Illia Pay Equity Engine

## Current Endpoint

- `POST /api/payequity/upload`
- Accepts compensation uploads in `.csv`, `.xlsx`, `.xls`, `.pdf`, and `.docx`.
- Spreadsheet files are converted to CSV internally.
- PDF and DOCX files are supported when the extracted text contains a clear table with a `salary` header.
- Stores the original CSV in Cloudinary under `trimerge-comply/pay-equity-uploads`.
- Saves analysis metadata and results in MongoDB.
- Returns model summary, coefficients, and pay gap findings without row-level prediction/residual arrays.

## Regression Approach

- Outcome variable: `salary`
- Predictors: all available non-salary fields in the CSV
- Numeric fields are used directly.
- Categorical fields are one-hot encoded with the first observed group as the reference group.

## Pay Gap Reporting

Protected fields currently checked when present:

- `gender`
- `race`
- `ethnicity`
- `age`
- `disability`
- `veteran_status`

Flag thresholds:

- Medium: adjusted negative gap of at least 3%
- High: adjusted negative gap of at least 7%

The engine is statistical only. It does not call the LLM.
