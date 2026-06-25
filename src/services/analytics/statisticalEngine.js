/**
 * TriMerge Comply — Statistical Analysis Engine
 * Implements Fisher's Exact Test and Chi-Square Test
 * for adverse impact analysis in pay equity audits.
 */

// ─── Log-space combinatorics ──────────────────────────────────
// Avoids integer overflow for n > 170 by working in log-space throughout.
const logFactorial = (n) => {
  if (n <= 1) return 0;
  let result = 0;
  for (let i = 2; i <= n; i++) result += Math.log(i);
  return result;
};

const logHypergeometric = (a, b, c, d) =>
  logFactorial(a + b) +
  logFactorial(c + d) +
  logFactorial(a + c) +
  logFactorial(b + d) -
  logFactorial(a + b + c + d) -
  logFactorial(a) -
  logFactorial(b) -
  logFactorial(c) -
  logFactorial(d);

// ─── Fisher's Exact Test ──────────────────────────────────────
/**
 * Fisher's Exact Test for 2x2 contingency table.
 * Computed in log-space to handle large n without overflow.
 *
 *          Selected  Not Selected
 * Group A:    a          b
 * Group B:    c          d
 *
 * p-value = sum of probabilities of all tables as extreme or more extreme.
 */
const fisherExactTest = (a, b, c, d) => {
  if ([a, b, c, d].some((v) => !Number.isFinite(v) || v < 0)) {
    throw new Error('Fisher Exact Test requires non-negative finite numbers.');
  }

  const rowTotal1 = a + b;
  const rowTotal2 = c + d;
  const colTotal1 = a + c;

  const logObserved = logHypergeometric(a, b, c, d);
  let pValue = 0;

  const maxA = Math.min(rowTotal1, colTotal1);
  for (let i = 0; i <= maxA; i++) {
    const nb = rowTotal1 - i;
    const nc = colTotal1 - i;
    const nd = rowTotal2 - nc;
    if (nb < 0 || nc < 0 || nd < 0) continue;
    const logProb = logHypergeometric(i, nb, nc, nd);
    if (logProb <= logObserved + 1e-10) {
      pValue += Math.exp(logProb);
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
 * Uses Yates' continuity correction for small samples.
 * p-value is the complementary error function (erfc) approximation
 * for chi-square with 1 degree of freedom.
 */

// Abramowitz & Stegun erfc approximation — max |error| < 1.5e-7
const erfc = (x) => {
  if (x < 0) return 2 - erfc(-x);
  const t = 1 / (1 + 0.3275911 * x);
  const poly =
    t *
    (0.254829592 +
      t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return poly * Math.exp(-x * x);
};

const chiSquarePValue1df = (chiSquare) => {
  if (chiSquare <= 0) return 1;
  return erfc(Math.sqrt(chiSquare / 2));
};

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
    (n * Math.pow(Math.max(0, Math.abs(a * d - b * c) - n / 2), 2)) /
    ((a + b) * (c + d) * (a + c) * (b + d));

  const pValue = chiSquarePValue1df(chiSquare);

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
 * critical — impact ratio < 0.5 (egregious; protected group selected at less than half the reference rate)
 * high     — impact ratio < 0.6 OR p-value < 0.01
 * medium   — impact ratio < 0.8 OR p-value < 0.05
 * low      — flagged but borderline
 */
const scoreSeverity = (impactRatio, pValue = null) => {
  if (impactRatio < 0.5) return 'critical';
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
  chiSquarePValue1df,
  fisherExactTest,
  chiSquareFromContingency,
  scoreSeverity,
  analyzeGroup,
};