import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  bytes: number;
  format?: string;
  createdAt?: string;
  originalFilename?: string;
}

@Injectable()
export class CloudinaryStorageService {
  private parseCloudinaryUrl() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (!cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL is required for file storage.');
    }

    const parsedUrl = new URL(cloudinaryUrl);

    return {
      apiKey: decodeURIComponent(parsedUrl.username),
      apiSecret: decodeURIComponent(parsedUrl.password),
      cloudName: parsedUrl.hostname,
    };
  }

  private sanitizePublicId(fileName = 'upload') {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const safeName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${safeName || 'upload'}-${Date.now()}`;
  }

  private signUploadParams(params: Record<string, string | number>, apiSecret: string) {
    const signatureBase = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return createHash('sha1').update(`${signatureBase}${apiSecret}`).digest('hex');
  }

  async uploadRawFile({
    fileContent,
    fileName = 'upload',
    mimeType = 'application/octet-stream',
    folder = 'trimerge-comply/uploads',
  }: {
    fileContent: Buffer | string;
    fileName?: string;
    mimeType?: string;
    folder?: string;
  }): Promise<CloudinaryUploadResult> {
    const { apiKey, apiSecret, cloudName } = this.parseCloudinaryUrl();
    const timestamp = Math.floor(Date.now() / 1000);
    const signedParams = {
      folder,
      public_id: this.sanitizePublicId(fileName),
      timestamp,
    };
    const signature = this.signUploadParams(signedParams, apiSecret);
    const formData = new FormData();
    const blobPart = typeof fileContent === 'string'
      ? fileContent
      : fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
    const blob = new Blob([blobPart as BlobPart], { type: mimeType });

    formData.append('file', blob, fileName);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', signedParams.folder);
    formData.append('public_id', signedParams.public_id);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: formData,
    });
    const result: any = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Cloudinary upload failed.');
    }

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      resourceType: result.resource_type,
      bytes: result.bytes,
      format: result.format,
      createdAt: result.created_at,
      originalFilename: result.original_filename,
    };
  }
}
