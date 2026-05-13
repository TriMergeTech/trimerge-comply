const { analyzeFourFifthsRule } = require('./fourFifthsRule');
const { validateAnalyticsRows } = require('./csvValidation');

const processAdverseImpactCsv = (csvText, options = {}) => {
  const validation = validateAnalyticsRows(csvText, options);

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      datasetType: validation.summary?.datasetType || 'unknown',
      summary: validation.summary,
      analysis: null,
    };
  }

  if (validation.summary?.datasetType === 'pay_equity') {
    return {
      valid: true,
      errors: [],
      warnings: validation.warnings,
      datasetType: 'pay_equity',
      summary: validation.summary,
      analysis: {
        type: 'pay_equity_preview',
        message: 'Pay equity CSV validated. OLS regression and pay gap analysis will be added in the pay equity engine.',
      },
    };
  }

  const analysis = analyzeFourFifthsRule(validation.normalizedRows, {
    threshold: options.threshold,
  });

  return {
    valid: true,
    errors: [],
    warnings: validation.warnings,
    datasetType: validation.summary?.datasetType || 'grouped_adverse_impact',
    summary: validation.summary,
    analysis,
  };
};

module.exports = {
  processAdverseImpactCsv,
};
