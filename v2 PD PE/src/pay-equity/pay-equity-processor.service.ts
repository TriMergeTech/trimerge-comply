import { Injectable } from '@nestjs/common';
import { CsvService } from './csv.service';
import { OlsService } from './ols.service';

const PROTECTED_FIELDS = ['gender', 'race', 'ethnicity', 'age', 'disability', 'veteran_status'];

@Injectable()
export class PayEquityProcessorService {
  constructor(private readonly csv: CsvService, private readonly ols: OlsService) {}

  private round(value: number, decimals = 4) {
    return Number(value.toFixed(decimals));
  }

  private toNumber(value: any) {
    if (value === null || value === undefined || value === '') return Number.NaN;
    return Number(String(value).replace(/,/g, '').trim());
  }

  private normalizeCategory(value: any) {
    return String(value || '').trim();
  }

  process(csvText: string) {
    const validation = this.validate(csvText);
    if (!validation.valid) {
      return { valid: false, errors: validation.errors, warnings: validation.warnings, dataset: { rowCount: validation.rows.length, columns: validation.headers }, model: null, payGaps: [] };
    }
    const regressionDataset = this.buildRegressionDataset(validation.rows, validation.predictors);
    const model = this.ols.run(regressionDataset);
    const averageSalary = regressionDataset.outcome.reduce((sum, value) => sum + value, 0) / regressionDataset.outcome.length;
    const payGaps = this.analyzePayGaps(model, regressionDataset.categoricalFeatureMeta, validation.protectedFieldsFound, averageSalary);
    const uiSummary = this.buildUiSummary(validation.rows, validation.protectedFieldsFound);
    return {
      valid: true,
      errors: [],
      warnings: validation.warnings,
      dataset: {
        datasetType: 'pay_equity',
        rowCount: validation.rows.length,
        columns: validation.headers,
        outcome: 'salary',
        predictorsUsed: validation.predictors,
        numericPredictors: regressionDataset.numericPredictors,
        categoricalPredictors: regressionDataset.categoricalPredictors,
        protectedFields: validation.protectedFieldsFound,
        averageSalary: this.round(averageSalary, 2),
      },
      model,
      payGaps,
      uiSummary,
      summary: {
        flaggedPayGaps: payGaps.filter((gap) => gap.flagged).length,
        flagsGenerated: uiSummary.flagsGenerated,
        highestSeverity: payGaps.some((gap) => gap.severity === 'high') ? 'high' : payGaps.some((gap) => gap.severity === 'medium') ? 'medium' : 'low',
      },
    };
  }

  private validate(csvText: string) {
    const { headers, rows } = this.csv.parse(csvText);
    const errors = [];
    const warnings = [];
    if (!headers.length) errors.push({ row: null, field: null, message: 'CSV must include a header row.' });
    if (!headers.includes('salary')) errors.push({ row: null, field: 'salary', message: 'Missing required salary column.' });
    const normalizedRows = [];
    rows.forEach(({ rowNumber, data }) => {
      const salary = this.toNumber(data.salary);
      if (!Number.isFinite(salary) || salary <= 0) errors.push({ row: rowNumber, field: 'salary', message: 'Salary must be a number greater than zero.' });
      else normalizedRows.push({ rowNumber, data, salary });
    });
    if (normalizedRows.length < 3) errors.push({ row: null, field: null, message: 'At least 3 valid compensation rows are required.' });
    const predictors = headers.filter((header) => header !== 'salary');
    if (!predictors.length) errors.push({ row: null, field: null, message: 'At least one non-salary predictor column is required.' });
    const protectedFieldsFound = predictors.filter((field) => PROTECTED_FIELDS.includes(this.csv.normalizeHeader(field)));
    if (!protectedFieldsFound.length) warnings.push({ row: null, field: null, message: 'No protected group fields were found. Regression can run, but pay gap reporting may be limited.' });
    return { valid: errors.length === 0, errors, warnings, headers, rows: normalizedRows, predictors, protectedFieldsFound };
  }

  private buildRegressionDataset(rows: any[], predictors: string[]) {
    const isNumeric = (column: string) => rows.every(({ data }) => data[column] !== '' && Number.isFinite(this.toNumber(data[column])));
    const numericPredictors = predictors.filter(isNumeric);
    const categoricalPredictors = predictors.filter((column) => !numericPredictors.includes(column));
    const categoricalLevels: Record<string, string[]> = {};
    categoricalPredictors.forEach((column) => {
      categoricalLevels[column] = Array.from(new Set(rows.map(({ data }) => this.normalizeCategory(data[column])).filter(Boolean)));
    });
    const featureNames = ['intercept', ...numericPredictors];
    const categoricalFeatureMeta = [];
    categoricalPredictors.forEach((column) => {
      const levels = categoricalLevels[column];
      const referenceGroup = levels[0] || null;
      levels.slice(1).forEach((level) => {
        featureNames.push(`${column}:${level}`);
        categoricalFeatureMeta.push({ feature: `${column}:${level}`, field: column, group: level, referenceGroup });
      });
    });
    const designMatrix = rows.map(({ data }) => {
      const row = [1, ...numericPredictors.map((column) => this.toNumber(data[column]))];
      categoricalPredictors.forEach((column) => {
        const value = this.normalizeCategory(data[column]);
        categoricalLevels[column].slice(1).forEach((level) => row.push(value === level ? 1 : 0));
      });
      return row;
    });
    return { designMatrix, outcome: rows.map(({ salary }) => salary), featureNames, numericPredictors, categoricalPredictors, categoricalFeatureMeta };
  }

  private analyzePayGaps(model: any, meta: any[], protectedFields: string[], averageSalary: number) {
    const coefficients = new Map(model.coefficients.map((coefficient) => [coefficient.feature, coefficient.coefficient]));
    return meta.filter((item) => protectedFields.includes(this.csv.normalizeHeader(item.field))).map((item) => {
      const estimatedGap = Number(coefficients.get(item.feature) || 0);
      const estimatedGapPercent = averageSalary ? (estimatedGap / averageSalary) * 100 : 0;
      const flagged = estimatedGapPercent <= -3;
      const severity = Math.abs(estimatedGapPercent) >= 7 ? 'high' : Math.abs(estimatedGapPercent) >= 3 ? 'medium' : 'low';
      return {
        field: item.field,
        group: item.group,
        comparisonGroup: item.referenceGroup,
        estimatedGap: this.round(estimatedGap, 2),
        estimatedGapPercent: this.round(estimatedGapPercent, 2),
        severity: flagged ? severity : 'low',
        flagged,
        source: 'ols_regression',
        explanation: flagged
          ? `${item.group} has an adjusted salary estimate ${Math.abs(this.round(estimatedGapPercent, 2))}% lower than ${item.referenceGroup} after controlling for all available fields.`
          : `${item.group} does not show a flagged negative adjusted pay gap compared with ${item.referenceGroup}.`,
      };
    });
  }

  private buildUiSummary(rows: any[], protectedFields: string[]) {
    const departments = rows[0]?.data?.department ? this.unadjustedGaps(rows, 'department', 'department') : [];
    const demographics = protectedFields.flatMap((field) => this.unadjustedGaps(rows, field, 'demographicGroup').map((gap) => ({ ...gap, field })));
    return {
      departmentsAnalyzed: departments.length,
      demographicGroups: demographics.length,
      totalEmployees: rows.length,
      flagsGenerated: departments.filter((gap) => gap.flagged).length + demographics.filter((gap) => gap.flagged).length,
      payGapsByDepartment: departments,
      demographicGapsOverall: demographics,
    };
  }

  private unadjustedGaps(rows: any[], field: string, labelKey: string) {
    const grouped = new Map<string, any[]>();
    rows.forEach((row) => {
      const value = this.normalizeCategory(row.data[field]);
      if (!value) return;
      if (!grouped.has(value)) grouped.set(value, []);
      grouped.get(value).push(row);
    });
    const averages = Array.from(grouped.entries()).map(([group, groupRows]) => ({
      [labelKey]: group,
      averageSalary: groupRows.reduce((sum, row) => sum + row.salary, 0) / groupRows.length,
      count: groupRows.length,
    }));
    if (!averages.length) return [];
    const reference = averages.reduce((best, current: any) => (current.averageSalary > best.averageSalary ? current : best), averages[0] as any);
    return averages.map((item: any) => {
      const gap = reference.averageSalary ? ((item.averageSalary - reference.averageSalary) / reference.averageSalary) * 100 : 0;
      return { ...item, averageSalary: this.round(item.averageSalary, 2), comparisonGroup: reference[labelKey], unadjustedGapPercent: this.round(gap, 2), flagged: gap <= -3 };
    }).sort((a: any, b: any) => a.unadjustedGapPercent - b.unadjustedGapPercent);
  }
}
