import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const TEXT_MIME_TYPES = new Set(['text/plain', 'text/csv', 'application/csv']);
const PDF_MIME_TYPES = new Set(['application/pdf']);
const DOCX_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

@Injectable()
export class PositionTextService {
  private normalizeMimeType(mimeType = '') {
    return mimeType.split(';')[0].trim().toLowerCase();
  }

  getFileType({ fileName = '', mimeType = '' }) {
    const extension = path.extname(fileName).toLowerCase();
    const normalizedMimeType = this.normalizeMimeType(mimeType);

    if (TEXT_MIME_TYPES.has(normalizedMimeType) || extension === '.txt' || extension === '.csv') {
      return 'text';
    }

    if (PDF_MIME_TYPES.has(normalizedMimeType) || extension === '.pdf') {
      return 'pdf';
    }

    if (DOCX_MIME_TYPES.has(normalizedMimeType) || extension === '.docx') {
      return 'docx';
    }

    return null;
  }

  async extract({ fileBuffer, fileName, mimeType }: { fileBuffer: Buffer; fileName: string; mimeType: string }) {
    const fileType = this.getFileType({ fileName, mimeType });

    if (!fileType) {
      return {
        supported: false,
        fileType: null,
        text: '',
        reason: 'Only .txt, .csv, .pdf, and .docx position description uploads are supported.',
      };
    }

    let text = '';

    if (fileType === 'pdf') {
      const parser = new PDFParse({ data: fileBuffer });
      try {
        const result = await parser.getText();
        text = result.text || '';
      } finally {
        await parser.destroy();
      }
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value || '';
    } else {
      text = fileBuffer.toString('utf8');
    }

    text = text.replace(/^\uFEFF/, '').trim();

    return {
      supported: true,
      fileType,
      text,
      reason: text ? null : 'The uploaded document did not contain readable text.',
    };
  }
}
