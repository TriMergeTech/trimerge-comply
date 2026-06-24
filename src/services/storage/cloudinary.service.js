const crypto = require('crypto');

const DEFAULT_CLOUDINARY_FOLDER = 'trimerge-comply/uploads';
const CSV_CLOUDINARY_FOLDER = 'trimerge-comply/csv-uploads';

const parseCloudinaryUrl = () => {
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
};

const sanitizePublicId = (fileName = 'upload') => {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeName || 'upload'}-${Date.now()}`;
};

const signUploadParams = (params, apiSecret) => {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex');
};

const uploadRawToCloudinary = async ({
  fileContent,
  fileName = 'upload',
  mimeType = 'application/octet-stream',
  folder = DEFAULT_CLOUDINARY_FOLDER,
}) => {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = sanitizePublicId(fileName);
  const signedParams = {
    folder,
    public_id: publicId,
    timestamp,
  };
  const signature = signUploadParams(signedParams, apiSecret);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
  const formData = new FormData();
  const blob = new Blob([fileContent], { type: mimeType });

  formData.append('file', blob, fileName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('folder', signedParams.folder);
  formData.append('public_id', signedParams.public_id);
  formData.append('signature', signature);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

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
};

const uploadCsvToCloudinary = async ({ csvText, fileName = 'upload.csv' }) =>
  uploadRawToCloudinary({
    fileContent: csvText,
    fileName,
    mimeType: 'text/csv',
    folder: CSV_CLOUDINARY_FOLDER,
  });

/**
 * Generate a short-lived signed delivery URL for a Cloudinary raw resource.
 * Works for both type=upload and type=authenticated assets.
 * @param {string} publicId  - e.g. "trimerge-comply/evidence/file-1234"
 * @param {number} expiresInSeconds - default 300 (5 minutes)
 */
const generateSignedDownloadUrl = (publicId, expiresInSeconds = 300) => {
  const { apiSecret, cloudName } = parseCloudinaryUrl();

  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // Cloudinary signed URL: sign "exp=...&public_id=..." + apiSecret with SHA-256,
  // base64url-encode the binary digest, take the first 8 chars.
  const toSign = `exp=${exp}&public_id=${publicId}`;
  const rawDigest = crypto
    .createHash('sha256')
    .update(`${toSign}${apiSecret}`)
    .digest(); // Buffer (binary)

  const signature = rawDigest
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .substring(0, 8);

  const url = `https://res.cloudinary.com/${cloudName}/raw/authenticated/s--${signature}--/${publicId}`;

  return { url, expiresAt: new Date((exp) * 1000).toISOString() };
};

module.exports = {
  uploadRawToCloudinary,
  uploadCsvToCloudinary,
  generateSignedDownloadUrl,
};
