const { invert, multiply, transpose } = require('./matrix.service');

const round = (value, decimals = 4) => Number(value.toFixed(decimals));

// Normal CDF approximation (Abramowitz & Stegun 26.2.17) — used for two-tailed p-values
const normalCdf = (z) => {
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp((-absZ * absZ) / 2);
  const poly =
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const p = 1 - d * poly;
  return z < 0 ? 1 - p : p;
};

const twoTailedPValue = (t) => {
  if (!isFinite(t)) return null;
  return Math.min(2 * (1 - normalCdf(Math.abs(t))), 1);
};

const applyRidgeStabilization = (matrix, lambda = 1e-8) =>
  matrix.map((row, rowIndex) =>
    row.map((value, columnIndex) => (rowIndex === columnIndex && rowIndex !== 0 ? value + lambda : value))
  );

const runOlsRegression = ({ designMatrix, outcome, featureNames }) => {
  if (!designMatrix.length || !outcome.length) {
    throw new Error('Regression requires at least one valid row.');
  }

  const x = designMatrix;
  const y = outcome.map((value) => [value]);
  const xTranspose = transpose(x);
  const xtx = multiply(xTranspose, x);
  const xtxInverse = invert(applyRidgeStabilization(xtx));
  const xty = multiply(xTranspose, y);
  const coefficientsMatrix = multiply(xtxInverse, xty);
  const coefficients = coefficientsMatrix.map(([value]) => value);
  const predictions = x.map((row) =>
    row.reduce((sum, value, columnIndex) => sum + value * coefficients[columnIndex], 0)
  );
  const meanOutcome = outcome.reduce((sum, value) => sum + value, 0) / outcome.length;
  const residuals = outcome.map((value, index) => value - predictions[index]);
  const sse = residuals.reduce((sum, value) => sum + value ** 2, 0);
  const sst = outcome.reduce((sum, value) => sum + (value - meanOutcome) ** 2, 0);
  const rSquared = sst === 0 ? 1 : 1 - sse / sst;

  const degreesOfFreedom = Math.max(outcome.length - featureNames.length, 1);
  const mse = sse / degreesOfFreedom;
  const residualStandardError = Math.sqrt(mse);

  return {
    type: 'OLS',
    outcome: 'salary',
    rowCount: outcome.length,
    featureCount: featureNames.length,
    degreesOfFreedom,
    rSquared: round(Math.max(0, Math.min(1, rSquared))),
    residualStandardError: round(residualStandardError, 2),
    coefficients: featureNames.map((featureName, index) => {
      const coef = coefficients[index];
      // SE(β_j) = sqrt(MSE * (X'X)^{-1}_{jj})
      const variance = mse * (xtxInverse[index]?.[index] ?? 0);
      const se = variance > 0 ? Math.sqrt(variance) : null;
      const tStat = se != null && se > 0 ? coef / se : null;
      const pValue = tStat != null ? twoTailedPValue(tStat) : null;
      return {
        feature: featureName,
        coefficient: round(coef, 2),
        standardError: se != null ? round(se, 4) : null,
        tStatistic: tStat != null ? round(tStat, 4) : null,
        pValue: pValue != null ? round(pValue, 6) : null,
        significant: pValue != null ? pValue < 0.05 : null,
      };
    }),
  };
};

module.exports = {
  runOlsRegression,
};
