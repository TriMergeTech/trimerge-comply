const { parseCsvText, normalizeHeader } = require('../analytics/csvValidation');
const { runOlsRegression } = require('./olsRegression.service');

const PROTECTED_FIELDS = Object.freeze(['gender', 'race', 'ethnicity', 'age', 'disability', 'veteran_status']);

const round = (value, decimals = 4) => Number(value.toFixed(decimals));

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  return Number(String(value).replace(/,/g, '').trim());
};

const normalizeCategory = (value) => String(value || '').trim();

const isNumericColumn = (rows, column) =>
  rows.every(({ data }) => {
    const value = data[column];
    return value !== '' && Number.isFinite(toNumber(value));
  });

const getSeverity = (gapPercent) => {
  const magnitude = Math.abs(gapPercent);

  if (magnitude >= 7) {
    return 'high';
  }

  if (magnitude >= 3) {
    return 'medium';
  }

  return 'low';
};

const average = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const groupRowsByValue = (rows, field) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const value = normalizeCategory(row.data[field]);

    if (!value) {
      return;
    }

    if (!grouped.has(value)) {
      grouped.set(value, []);
    }

    grouped.get(value).push(row);
  });

  return grouped;
};

const buildUnadjustedGapRows = ({ rows, field, labelKey }) => {
  const grouped = groupRowsByValue(rows, field);
  const groupAverages = Array.from(grouped.entries()).map(([group, groupRows]) => ({
    [labelKey]: group,
    averageSalary: average(groupRows.map((row) => row.salary)),
    count: groupRows.length,
  }));

  if (!groupAverages.length) {
    return [];
  }

  const reference = groupAverages.reduce((best, current) =>
    current.averageSalary > best.averageSalary ? current : best
  );

  return groupAverages
    .map((item) => {
      const unadjustedGapPercent = reference.averageSalary
        ? ((item.averageSalary - reference.averageSalary) / reference.averageSalary) * 100
        : 0;

      return {
        ...item,
        averageSalary: round(item.averageSalary, 2),
        comparisonGroup: reference[labelKey],
        unadjustedGapPercent: round(unadjustedGapPercent, 2),
        flagged: unadjustedGapPercent <= -3,
      };
    })
    .sort((left, right) => left.unadjustedGapPercent - right.unadjustedGapPercent);
};

const buildPayEquityUiSummary = ({ rows, protectedFields }) => {
  const departmentRows = rows[0]?.data?.department
    ? buildUnadjustedGapRows({ rows, field: 'department', labelKey: 'department' })
    : [];
  const demographicRows = protectedFields.flatMap((field) =>
    buildUnadjustedGapRows({ rows, field, labelKey: 'demographicGroup' }).map((gap) => ({
      ...gap,
      field,
    }))
  );
  const flaggedDepartmentGaps = departmentRows.filter((gap) => gap.flagged).length;
  const flaggedDemographicGaps = demographicRows.filter((gap) => gap.flagged).length;

  return {
    departmentsAnalyzed: departmentRows.length,
    demographicGroups: demographicRows.length,
    totalEmployees: rows.length,
    flagsGenerated: flaggedDepartmentGaps + flaggedDemographicGaps,
    payGapsByDepartment: departmentRows,
    demographicGapsOverall: demographicRows,
  };
};

const validatePayEquityCsv = (csvText) => {
  const { headers, rows } = parseCsvText(csvText);
  const errors = [];
  const warnings = [];

  if (!headers.length) {
    errors.push({ row: null, field: null, message: 'CSV must include a header row.' });
  }

  if (!headers.includes('salary')) {
    errors.push({ row: null, field: 'salary', message: 'Missing required salary column.' });
  }

  const normalizedRows = [];

  rows.forEach(({ rowNumber, data }) => {
    const salary = toNumber(data.salary);

    if (!Number.isFinite(salary) || salary <= 0) {
      errors.push({ row: rowNumber, field: 'salary', message: 'Salary must be a number greater than zero.' });
      return;
    }

    normalizedRows.push({
      rowNumber,
      data,
      salary,
    });
  });

  if (normalizedRows.length < 3) {
    errors.push({ row: null, field: null, message: 'At least 3 valid compensation rows are required.' });
  }

  const predictors = headers.filter((header) => header !== 'salary');

  if (!predictors.length) {
    errors.push({ row: null, field: null, message: 'At least one non-salary predictor column is required.' });
  }

  const protectedFieldsFound = predictors.filter((field) => PROTECTED_FIELDS.includes(normalizeHeader(field)));

  if (!protectedFieldsFound.length) {
    warnings.push({
      row: null,
      field: null,
      message: 'No protected group fields were found. Regression can run, but pay gap reporting may be limited.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    headers,
    rows: normalizedRows,
    predictors,
    protectedFieldsFound,
  };
};

const buildRegressionDataset = ({ rows, predictors }) => {
  const numericPredictors = predictors.filter((column) => isNumericColumn(rows, column));
  const categoricalPredictors = predictors.filter((column) => !numericPredictors.includes(column));
  const categoricalLevels = {};

  categoricalPredictors.forEach((column) => {
    categoricalLevels[column] = Array.from(
      new Set(rows.map(({ data }) => normalizeCategory(data[column])).filter(Boolean))
    );
  });

  const featureNames = ['intercept', ...numericPredictors];
  const categoricalFeatureMeta = [];

  categoricalPredictors.forEach((column) => {
    const levels = categoricalLevels[column];
    const referenceGroup = levels[0] || null;

    levels.slice(1).forEach((level) => {
      featureNames.push(`${column}:${level}`);
      categoricalFeatureMeta.push({
        feature: `${column}:${level}`,
        field: column,
        group: level,
        referenceGroup,
      });
    });
  });

  const designMatrix = rows.map(({ data }) => {
    const row = [1];

    numericPredictors.forEach((column) => {
      row.push(toNumber(data[column]));
    });

    categoricalPredictors.forEach((column) => {
      const value = normalizeCategory(data[column]);
      categoricalLevels[column].slice(1).forEach((level) => {
        row.push(value === level ? 1 : 0);
      });
    });

    return row;
  });

  return {
    designMatrix,
    outcome: rows.map(({ salary }) => salary),
    featureNames,
    numericPredictors,
    categoricalPredictors,
    categoricalFeatureMeta,
  };
};

const analyzePayGaps = ({ regression, categoricalFeatureMeta, protectedFields, averageSalary }) => {
  const coefficientsByFeature = new Map(
    regression.coefficients.map((coefficient) => [coefficient.feature, coefficient.coefficient])
  );

  return categoricalFeatureMeta
    .filter((meta) => protectedFields.includes(normalizeHeader(meta.field)))
    .map((meta) => {
      const estimatedGap = coefficientsByFeature.get(meta.feature) || 0;
      const estimatedGapPercent = averageSalary ? (estimatedGap / averageSalary) * 100 : 0;
      const flagged = estimatedGapPercent <= -3;

      return {
        field: meta.field,
        group: meta.group,
        comparisonGroup: meta.referenceGroup,
        estimatedGap: round(estimatedGap, 2),
        estimatedGapPercent: round(estimatedGapPercent, 2),
        severity: flagged ? getSeverity(estimatedGapPercent) : 'low',
        flagged,
        source: 'ols_regression',
        explanation: flagged
          ? `${meta.group} has an adjusted salary estimate ${Math.abs(round(estimatedGapPercent, 2))}% lower than ${meta.referenceGroup} after controlling for all available fields.`
          : `${meta.group} does not show a flagged negative adjusted pay gap compared with ${meta.referenceGroup}.`,
      };
    });
};

const processPayEquityCsv = (csvText) => {
  const validation = validatePayEquityCsv(csvText);

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      dataset: {
        rowCount: validation.rows.length,
        columns: validation.headers,
      },
      model: null,
      payGaps: [],
    };
  }

  const regressionDataset = buildRegressionDataset({
    rows: validation.rows,
    predictors: validation.predictors,
  });
  const regression = runOlsRegression(regressionDataset);
  const averageSalary =
    regressionDataset.outcome.reduce((sum, value) => sum + value, 0) / regressionDataset.outcome.length;
  const payGaps = analyzePayGaps({
    regression,
    categoricalFeatureMeta: regressionDataset.categoricalFeatureMeta,
    protectedFields: validation.protectedFieldsFound,
    averageSalary,
  });
  const uiSummary = buildPayEquityUiSummary({
    rows: validation.rows,
    protectedFields: validation.protectedFieldsFound,
  });

  const warnings = [...validation.warnings];

  if (regressionDataset.outcome.length <= regressionDataset.featureNames.length) {
    warnings.push({
      row: null,
      field: null,
      message: 'The model has as many or more features than rows. Results may be unstable with small datasets.',
    });
  }

  return {
    valid: true,
    errors: [],
    warnings,
    dataset: {
      datasetType: 'pay_equity',
      rowCount: validation.rows.length,
      columns: validation.headers,
      outcome: 'salary',
      predictorsUsed: validation.predictors,
      numericPredictors: regressionDataset.numericPredictors,
      categoricalPredictors: regressionDataset.categoricalPredictors,
      protectedFields: validation.protectedFieldsFound,
      averageSalary: round(averageSalary, 2),
    },
    model: regression,
    payGaps,
    uiSummary,
    summary: {
      flaggedPayGaps: payGaps.filter((gap) => gap.flagged).length,
      flagsGenerated: uiSummary.flagsGenerated,
      highestSeverity: payGaps.some((gap) => gap.severity === 'high')
        ? 'high'
        : payGaps.some((gap) => gap.severity === 'medium')
          ? 'medium'
          : 'low',
    },
  };
};

module.exports = {
  buildPayEquityUiSummary,
  processPayEquityCsv,
  validatePayEquityCsv,
};
