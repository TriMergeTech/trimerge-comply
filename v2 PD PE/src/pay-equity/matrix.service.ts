import { Injectable } from '@nestjs/common';

@Injectable()
export class MatrixService {
  transpose(matrix: number[][]) {
    return matrix[0].map((_, columnIndex) => matrix.map((row) => row[columnIndex]));
  }

  multiply(left: number[][], right: number[][]) {
    const result = Array.from({ length: left.length }, () => Array(right[0].length).fill(0));
    for (let i = 0; i < left.length; i += 1) {
      for (let j = 0; j < right[0].length; j += 1) {
        for (let k = 0; k < right.length; k += 1) {
          result[i][j] += left[i][k] * right[k][j];
        }
      }
    }
    return result;
  }

  invert(matrix: number[][]) {
    const size = matrix.length;
    const augmented = matrix.map((row, rowIndex) => [
      ...row,
      ...Array.from({ length: size }, (_, columnIndex) => (rowIndex === columnIndex ? 1 : 0)),
    ]);
    for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
      let bestRow = pivotIndex;
      for (let rowIndex = pivotIndex + 1; rowIndex < size; rowIndex += 1) {
        if (Math.abs(augmented[rowIndex][pivotIndex]) > Math.abs(augmented[bestRow][pivotIndex])) bestRow = rowIndex;
      }
      if (Math.abs(augmented[bestRow][pivotIndex]) < 1e-12) throw new Error('Regression matrix is singular.');
      [augmented[pivotIndex], augmented[bestRow]] = [augmented[bestRow], augmented[pivotIndex]];
      const pivot = augmented[pivotIndex][pivotIndex];
      augmented[pivotIndex] = augmented[pivotIndex].map((value) => value / pivot);
      for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
        if (rowIndex === pivotIndex) continue;
        const factor = augmented[rowIndex][pivotIndex];
        augmented[rowIndex] = augmented[rowIndex].map((value, columnIndex) => value - factor * augmented[pivotIndex][columnIndex]);
      }
    }
    return augmented.map((row) => row.slice(size));
  }
}
