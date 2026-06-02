import { Injectable } from '@nestjs/common';

@Injectable()
export class CsvService {
  normalizeHeader(header: any) {
    return String(header || '').replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '_');
  }

  parseLine(line: string) {
    const values: string[] = [];
    let current = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const nextChar = line[i + 1];
      if (char === '"' && insideQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  parse(csvText: string) {
    const lines = String(csvText || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return { headers: [], rows: [] };
    const headers = this.parseLine(lines[0]).map((header) => this.normalizeHeader(header));
    const rows = lines.slice(1).map((line, index) => {
      const values = this.parseLine(line);
      const data: Record<string, string> = {};
      headers.forEach((header, headerIndex) => {
        data[header] = values[headerIndex] ?? '';
      });
      return { rowNumber: index + 2, data };
    });
    return { headers, rows };
  }
}
