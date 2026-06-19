const { getUploaderLabel } = require('../../utils/uploadedBy');

const MAX_ADJUSTED_GAPS = 6;
const MAX_DEPARTMENT_GAPS = 5;
const MAX_DEMOGRAPHIC_GAPS = 6;
const MAX_WARNINGS = 4;

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const sortByGapMagnitude = (left, right, field) =>
  Math.abs(numberOrNull(right[field]) || 0) - Math.abs(numberOrNull(left[field]) || 0);

const prioritizeFlagged = (rows, field) =>
  [...rows].sort((left, right) => {
    if (Boolean(left.flagged) !== Boolean(right.flagged)) {
      return left.flagged ? -1 : 1;
    }

    return sortByGapMagnitude(left, right, field);
  });

const buildAdjustedGaps = (analysis) =>
  prioritizeFlagged(analysis.payGaps || [], 'estimatedGapPercent')
    .slice(0, MAX_ADJUSTED_GAPS)
    .map((gap) => ({
      field: gap.field || 'Protected group',
      group: gap.group || 'Not specified',
      comparisonGroup: gap.comparisonGroup || 'Not specified',
      gapPercent: numberOrNull(gap.estimatedGapPercent),
      gapAmount: numberOrNull(gap.estimatedGap),
      severity: gap.severity || 'low',
      flagged: Boolean(gap.flagged),
      explanation: gap.explanation || '',
    }));

const buildDepartmentGaps = (analysis) =>
  prioritizeFlagged(analysis.uiSummary?.payGapsByDepartment || [], 'unadjustedGapPercent')
    .slice(0, MAX_DEPARTMENT_GAPS)
    .map((gap) => ({
      department: gap.department || 'Not specified',
      comparisonGroup: gap.comparisonGroup || 'Not specified',
      averageSalary: numberOrNull(gap.averageSalary),
      employeeCount: numberOrNull(gap.count),
      gapPercent: numberOrNull(gap.unadjustedGapPercent),
      flagged: Boolean(gap.flagged),
    }));

const buildDemographicGaps = (analysis) =>
  prioritizeFlagged(analysis.uiSummary?.demographicGapsOverall || [], 'unadjustedGapPercent')
    .slice(0, MAX_DEMOGRAPHIC_GAPS)
    .map((gap) => ({
      field: gap.field || 'Protected group',
      group: gap.demographicGroup || 'Not specified',
      comparisonGroup: gap.comparisonGroup || 'Not specified',
      averageSalary: numberOrNull(gap.averageSalary),
      employeeCount: numberOrNull(gap.count),
      gapPercent: numberOrNull(gap.unadjustedGapPercent),
      flagged: Boolean(gap.flagged),
    }));

const buildPayEquityReportView = (analysis) => {
  const flaggedAdjustedGaps = (analysis.payGaps || []).filter((gap) => gap.flagged).length;
  const flagsGenerated = numberOrNull(analysis.uiSummary?.flagsGenerated)
    ?? numberOrNull(analysis.summary?.flagsGenerated)
    ?? flaggedAdjustedGaps;

  return {
    analysisId: analysis._id,
    fileName: analysis.fileName,
    companyName: analysis.companyName || analysis.uploadedBy?.companyName || null,
    uploadedBy: getUploaderLabel(analysis.uploadedBy),
    createdAt: analysis.createdAt,
    status: analysis.status || 'processed',
    overallRisk: analysis.summary?.highestSeverity || (flagsGenerated ? 'high' : 'low'),
    dataset: {
      employeeCount: numberOrNull(analysis.dataset?.rowCount) || 0,
      averageSalary: numberOrNull(analysis.dataset?.averageSalary),
      columns: Array.isArray(analysis.dataset?.columns) ? analysis.dataset.columns : [],
      predictorsUsed: Array.isArray(analysis.dataset?.predictorsUsed)
        ? analysis.dataset.predictorsUsed
        : [],
      protectedFields: Array.isArray(analysis.dataset?.protectedFields)
        ? analysis.dataset.protectedFields
        : [],
      departmentsAnalyzed: numberOrNull(analysis.uiSummary?.departmentsAnalyzed) || 0,
      demographicGroups: numberOrNull(analysis.uiSummary?.demographicGroups) || 0,
    },
    model: {
      type: analysis.model?.type || 'OLS',
      rSquared: numberOrNull(analysis.model?.rSquared),
      residualStandardError: numberOrNull(analysis.model?.residualStandardError),
      featureCount: numberOrNull(analysis.model?.featureCount) || 0,
      degreesOfFreedom: numberOrNull(analysis.model?.degreesOfFreedom),
    },
    summary: {
      flagsGenerated,
      flaggedAdjustedGaps,
      flaggedDepartmentGaps:
        (analysis.uiSummary?.payGapsByDepartment || []).filter((gap) => gap.flagged).length,
      flaggedDemographicGaps:
        (analysis.uiSummary?.demographicGapsOverall || []).filter((gap) => gap.flagged).length,
    },
    adjustedGaps: buildAdjustedGaps(analysis),
    departmentGaps: buildDepartmentGaps(analysis),
    demographicGaps: buildDemographicGaps(analysis),
    warnings: (analysis.warnings || [])
      .map((warning) => warning?.message || String(warning || ''))
      .filter(Boolean)
      .slice(0, MAX_WARNINGS),
  };
};

const buildFallbackPayEquityRecommendations = (reportView) => {
  const recommendations = [];

  if (reportView.summary.flaggedAdjustedGaps) {
    recommendations.push(
      'Review flagged adjusted pay gaps with compensation, job-level, performance, and tenure context before taking corrective action.'
    );
  }

  if (reportView.summary.flaggedDepartmentGaps) {
    recommendations.push(
      'Examine departments with material unadjusted gaps for differences in role mix, seniority, hiring, promotion, and pay-setting practices.'
    );
  }

  if (reportView.warnings.length) {
    recommendations.push(
      'Resolve the listed data-quality or model-stability warnings and rerun the analysis before final reporting.'
    );
  }

  if ((reportView.model.rSquared ?? 0) < 0.5) {
    recommendations.push(
      'Consider adding relevant legitimate pay factors to improve model explanatory power and reduce omitted-variable risk.'
    );
  }

  recommendations.push(
    'Have a qualified analyst validate the statistical results and document any remediation decisions.'
  );

  return Array.from(new Set(recommendations)).slice(0, 5);
};

const buildFallbackPayEquityPlainLanguageSummary = (reportView) => {
  const summary = [];
  const primaryFlag = reportView.adjustedGaps.find((gap) => gap.flagged);

  if (primaryFlag) {
    summary.push(
      `${primaryFlag.group} shows an estimated ${Math.abs(primaryFlag.gapPercent || 0).toFixed(1)}% lower pay level than ${primaryFlag.comparisonGroup} after accounting for the available job and employee factors.`
    );
  } else {
    summary.push(
      'The adjusted analysis did not identify a negative demographic pay gap at the current reporting threshold.'
    );
  }

  if (reportView.summary.flaggedDepartmentGaps || reportView.summary.flaggedDemographicGaps) {
    summary.push(
      'Some raw average-pay differences are large enough to review, but they do not by themselves show that employees performing comparable work were paid differently.'
    );
  }

  if ((reportView.model.rSquared ?? 0) < 0.5) {
    summary.push(
      'The available factors explain only part of the salary differences, so additional information may change the results.'
    );
  } else {
    summary.push(
      'The available factors explain a meaningful portion of salary differences, but analyst review is still required before drawing conclusions.'
    );
  }

  return summary.slice(0, 3);
};

module.exports = {
  buildFallbackPayEquityRecommendations,
  buildFallbackPayEquityPlainLanguageSummary,
  buildPayEquityReportView,
};
