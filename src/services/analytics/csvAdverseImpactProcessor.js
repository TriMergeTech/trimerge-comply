const { analyzeFourFifthsRule } = require('./fourFifthsRule');
const { validateAnalyticsRows } = require('./csvValidation');

const processAdverseImpactCsv = (csvText, options = {}) => {
  const validation = validateAnalyticsRows(csvText, options);

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors,
      warnings: validation.warnings,
      summary: validation.summary,
      analysis: null,
    };
  }

  const analysis = analyzeFourFifthsRule(validation.normalizedRows, {
    threshold: options.threshold,
  });

  return {
    valid: true,
    errors: [],
    warnings: validation.warnings,
    summary: validation.summary,
    analysis,
  };
};

module.exports = {
  processAdverseImpactCsv,
};
