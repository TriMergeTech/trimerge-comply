/**
 * TriMerge Comply — Statistical Analysis Engine
 * Implements Fisher's Exact Test and Chi-Square Test
 * for adverse impact analysis in pay equity audits.
 */

// ─── Factorial & Combinatorics ────────────────────────────────
const factorial = (n) => {
  if (n < 0) throw new Error('Factorial undefined for negative numbers');
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const combination = (n, k) => {
  if (k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
};

// ─── Fisher's Exact Test ──────────────────────────────────────
/**
 * Fisher's Exact Test for 2x2 contingency table.
 *
 * Contingency table:
 *          Selected  Not Selected
 * Group A:    a          b
 * Group B:    c          d
 *
 * p-value = sum of probabilities of all tables as extreme or more extreme
 */
const hypergeometricProbability = (a, b, c, d) => {
  const n = a + b + c + d;
  return (
    (combination(a + b, a) * combination(c + d, c)) /
    combination(n, a + c)
  );
};

const fisherExactTest = (a, b, c, d) => {
  if ([a, b, c, d].some((v) => !Number.isFinite(v) || v < 0)) {
    throw new Error('Fisher Exact Test requires non-negative finite numbers.');
  }

  const observed = hypergeometricProbability(a, b, c, d);
  const n = a + b + c + d;
  const rowTotal1 = a + b;
  const rowTotal2 = c + d;
  const colTotal1 = a + c;

  let pValue = 0;

  // Sum all tables with probability <= observed
  const maxA = Math.min(rowTotal1, colTotal1);
  for (let i = 0; i <= maxA; i++) {
    const newA = i;
    const newB = rowTotal1 - i;
    const newC = colTotal1 - i;
    const newD = rowTotal2 - newC;
    if (newB < 0 || newC < 0 || newD < 0) continue;
    const prob = hypergeometricProbability(newA, newB, newC, newD);
    if (prob <= observed + 1e-10) {
      pValue += prob;
    }
  }

  return {
    pValue: Math.min(Number(pValue.toFixed(6)), 1),
    significant: pValue < 0.05,
    table: { a, b, c, d },
  };
};

// ─── Chi-Square Test ──────────────────────────────────────────
/**
 * Chi-Square Test of Independence for 2x2 contingency table.
 *
 * Uses Yates' continuity correction for small samples.
 * p-value approximated from chi-square distribution (1 degree of freedom).
 */
const chiSquareFromContingency = (a, b, c, d) => {
  if ([a, b, c, d].some((v) => !Number.isFinite(v) || v < 0)) {
    throw new Error('Chi-Square Test requires non-negative finite numbers.');
  }

  const n = a + b + c + d;
  if (n === 0) throw new Error('Total count cannot be zero.');

  const expected = {
    a: ((a + b) * (a + c)) / n,
    b: ((a + b) * (b + d)) / n,
    c: ((c + d) * (a + c)) / n,
    d: ((c + d) * (b + d)) / n,
  };

  // Yates' continuity correction
  const chiSquare =
    (n *
      Math.pow(
        Math.max(0, Math.abs(a * d - b * c) - n / 2),
        2
      )) /
    ((a + b) * (c + d) * (a + c) * (b + d));

  // p-value from chi-square CDF (1 df) approximation
  const pValue = Math.exp(-chiSquare / 2);

  return {
    chiSquare: Number(chiSquare.toFixed(6)),
    pValue: Number(Math.min(pValue, 1).toFixed(6)),
    significant: pValue < 0.05,
    expected,
    table: { a, b, c, d },
  };
};

// ─── Severity Scoring ─────────────────────────────────────────
/**
 * Determines severity based on impact ratio and p-value.
 *
 * high   — impact ratio < 0.6 OR p-value < 0.01
 * medium — impact ratio < 0.8 OR p-value < 0.05
 * low    — flagged but borderline
 */
const scoreSeverity = (impactRatio, pValue = null) => {
  if (impactRatio < 0.6 || (pValue !== null && pValue < 0.01)) return 'high';
  if (impactRatio < 0.8 || (pValue !== null && pValue < 0.05)) return 'medium';
  return 'low';
};

// ─── Full Analysis ────────────────────────────────────────────
/**
 * Runs Fisher's Exact + Chi-Square on a group vs reference group.
 * Returns combined result with severity.
 *
 * @param {object} group        — { group, selected, total }
 * @param {object} reference    — { group, selected, total }
 * @param {number} threshold    — default 0.8
 */
const analyzeGroup = (group, reference, threshold = 0.8) => {
  const a = group.selected;
  const b = group.total - group.selected;
  const c = reference.selected;
  const d = reference.total - reference.selected;

  const selectionRate = group.selected / group.total;
  const referenceRate = reference.selected / reference.total;
  const impactRatio = referenceRate === 0 ? 0 : selectionRate / referenceRate;

  const fisher = fisherExactTest(a, b, c, d);
  const chiSquare = chiSquareFromContingency(a, b, c, d);

  const severity = scoreSeverity(impactRatio, fisher.pValue);

  return {
    group: group.group,
    referenceGroup: reference.group,
    selected: group.selected,
    total: group.total,
    selectionRate: Number(selectionRate.toFixed(4)),
    impactRatio: Number(impactRatio.toFixed(4)),
    threshold,
    flagged: impactRatio < threshold,
    fisher,
    chiSquare,
    severity,
  };
};

module.exports = {
  fisherExactTest,
  chiSquareFromContingency,
  scoreSeverity,
  analyzeGroup,
};