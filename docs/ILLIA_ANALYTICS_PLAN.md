# Illia - Analytics Engine Plan

## Current Focus

Based on the 10-week backend plan, my main area is analytics and AI/statistical services. The first backend analytics contribution is a reusable 4/5ths Rule engine for adverse impact analysis.

## Code Added

Added `src/services/analytics/fourFifthsRule.js`.

This is a pure JavaScript service that can be called later from the CSV upload or flags API. It does not require MongoDB or Express yet.

## What It Does

- Accepts group-level counts.
- Calculates selection rate for each group.
- Finds the highest-selection-rate group as the reference group.
- Calculates impact ratio for every group.
- Flags groups below the 0.8 threshold.

## Example Input

```js
[
  { group: 'Male', selected: 80, total: 100 },
  { group: 'Female', selected: 30, total: 50 }
]
```

## Next Step

After CSV upload is ready, this service can be connected to parsed CSV rows to generate adverse impact flags automatically.
