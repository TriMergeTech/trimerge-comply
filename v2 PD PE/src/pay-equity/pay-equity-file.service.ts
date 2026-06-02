import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';
import { CsvService } from './csv.service';

@Injectable()
export class PayEquityFileService {
  constructor(private readonly csv: CsvService) {}

  getFileType({ fileName = '', mimeType = '' }) {
    const extension = path.extname(fileName).toLowerCase();
    const normalizedMimeType = mimeType.split(';')[0].trim().toLowerCase();
    if (['text/csv', 'text/plain', 'application/csv'].includes(normalizedMimeType) || ['.csv', '.txt'].includes(extension)) return 'csv';
    if (['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(normalizedMimeType) || ['.xlsx', '.xls'].includes(extension)) return 'spreadsheet';
    if (normalizedMimeType === 'application/pdf' || extension === '.pdf') return 'pdf';
    if (normalizedMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === '.docx') return 'docx';
    return null;
  }

  async extract({ fileBuffer, fileName, mimeType }: { fileBuffer: Buffer; fileName: string; mimeType: string }) {
    const fileType = this.getFileType({ fileName, mimeType });
    if (!fileType) {
      return { supported: false, fileType: null, csvText: '', warnings: [], error: 'Unsupported pay equity file type. Upload .csv, .xlsx, .xls, .pdf, or .docx.' };
    }
    if (fileType === 'csv') {
      return { supported: true, fileType, csvText: fileBuffer.toString('utf8').replace(/^\uFEFF/, ''), warnings: [], error: null };
    }
    if (fileType === 'spreadsheet') {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
      const sheetName = workbook.SheetNames[0];
      const csvText = sheetName ? XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]) : '';
      return { supported: true, fileType, csvText, warnings: [], error: null };
    }
    const text = fileType === 'pdf' ? await this.extractPdf(fileBuffer) : await this.extractDocx(fileBuffer);
    const table = this.textTableToCsv(text);
    return {
      supported: true,
      fileType,
      csvText: table.csvText,
      warnings: table.csvText ? [
        { row: null, field: null, message: `${fileType.toUpperCase()} text was converted into a CSV-like table before analysis.` },
        ...table.warnings,
      ] : [],
      error: table.csvText ? null : `Could not detect a pay equity table in the ${fileType.toUpperCase()} file. Include a table with a salary column.`,
    };
  }

  private async extractPdf(fileBuffer: Buffer) {
    const parser = new PDFParse({ data: fileBuffer });
    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  private async extractDocx(fileBuffer: Buffer) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value || '';
  }

  private splitTableLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return [];
    if (trimmed.includes(',')) return trimmed.split(',').map((value) => value.trim());
    if (trimmed.includes('\t')) return trimmed.split(/\t+/).map((value) => value.trim());
    return trimmed.split(/\s{2,}/).map((value) => value.trim());
  }

  private textTableToCsv(text: string) {
    const rows = text.split(/\r?\n/).map((line) => this.splitTableLine(line)).filter((row) => row.length > 1);
    const headerIndex = rows.findIndex((row) => row.map((header) => this.csv.normalizeHeader(header)).includes('salary'));
    if (headerIndex === -1) return { csvText: '', warnings: [] };
    const headers = rows[headerIndex];
    const dataRows = rows.slice(headerIndex + 1).filter((row) => row.length === headers.length);
    const repaired = this.repairMergedPerformanceGender([headers, ...dataRows]);
    return { csvText: repaired.rows.map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\n'), warnings: repaired.warnings };
  }

  private repairMergedPerformanceGender(rows: string[][]) {
    if (!rows.length) return { rows, warnings: [] };
    const mergedIndex = rows[0].findIndex((header) => {
      const normalized = this.csv.normalizeHeader(header);
      return normalized.includes('gender') && normalized.startsWith('perform');
    });
    if (mergedIndex === -1) return { rows, warnings: [] };
    const repairedRows = rows.map((row, rowIndex) => {
      if (rowIndex === 0) return [...row.slice(0, mergedIndex), 'performance', 'gender', ...row.slice(mergedIndex + 1)];
      const merged = String(row[mergedIndex] || '').trim();
      const match = merged.match(/^(-?\d+(?:\.\d+)?)\s+(.+)$/);
      return [...row.slice(0, mergedIndex), match?.[1] || merged, match?.[2] || '', ...row.slice(mergedIndex + 1)];
    });
    return {
      rows: repairedRows,
      warnings: [{ row: null, field: 'performance/gender', message: 'Merged performance and gender columns were repaired after document text extraction.' }],
    };
  }

  private escapeCsv(value: any) {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
}
