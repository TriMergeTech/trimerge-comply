const { invert, multiply, transpose } = require('./matrix.service');

const round = (value, decimals = 4) => Number(value.toFixed(decimals));

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

  return {
    type: 'OLS',
    outcome: 'salary',
    rowCount: outcome.length,
    featureCount: featureNames.length,
    rSquared: round(Math.max(0, Math.min(1, rSquared))),
    residualStandardError: round(Math.sqrt(sse / Math.max(outcome.length - featureNames.length, 1)), 2),
    coefficients: featureNames.map((featureName, index) => ({
      feature: featureName,
      coefficient: round(coefficients[index], 2),
    })),
  };
};

module.exports = {
  runOlsRegression,
};
