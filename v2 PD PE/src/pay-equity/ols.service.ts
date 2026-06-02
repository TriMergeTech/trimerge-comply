import { Injectable } from '@nestjs/common';
import { MatrixService } from './matrix.service';

@Injectable()
export class OlsService {
  constructor(private readonly matrix: MatrixService) {}

  private round(value: number, decimals = 4) {
    return Number(value.toFixed(decimals));
  }

  run({ designMatrix, outcome, featureNames }: { designMatrix: number[][]; outcome: number[]; featureNames: string[] }) {
    const x = designMatrix;
    const y = outcome.map((value) => [value]);
    const xt = this.matrix.transpose(x);
    const xtx = this.matrix.multiply(xt, x).map((row, rowIndex) =>
      row.map((value, columnIndex) => (rowIndex === columnIndex && rowIndex !== 0 ? value + 1e-8 : value)),
    );
    const coefficients = this.matrix.multiply(this.matrix.multiply(this.matrix.invert(xtx), xt), y).map(([value]) => value);
    const predictions = x.map((row) => row.reduce((sum, value, index) => sum + value * coefficients[index], 0));
    const mean = outcome.reduce((sum, value) => sum + value, 0) / outcome.length;
    const residuals = outcome.map((value, index) => value - predictions[index]);
    const sse = residuals.reduce((sum, value) => sum + value ** 2, 0);
    const sst = outcome.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    const rSquared = sst === 0 ? 1 : 1 - sse / sst;
    return {
      type: 'OLS',
      outcome: 'salary',
      rowCount: outcome.length,
      featureCount: featureNames.length,
      rSquared: this.round(Math.max(0, Math.min(1, rSquared))),
      residualStandardError: this.round(Math.sqrt(sse / Math.max(outcome.length - featureNames.length, 1)), 2),
      coefficients: featureNames.map((feature, index) => ({ feature, coefficient: this.round(coefficients[index], 2) })),
    };
  }
}
