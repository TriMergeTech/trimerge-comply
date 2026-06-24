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
 * Generate a browser-accessible private download URL for a Cloudinary raw resource.
 *
 * Uses Cloudinary's /raw/download API endpoint (equivalent to the SDK's
 * private_download_url helper). The browser hits api.cloudinary.com which
 * validates the signature + expiry server-side and serves the file directly —
 * no /authenticated/ delivery type involved, so it works in a browser tab.
 *
 * @param {string} publicId        - e.g. "trimerge-comply/evidence/file-1234"
 * @param {number} expiresInSeconds - default 3600 (1 hour)
 */
const generateSignedDownloadUrl = (publicId, expiresInSeconds = 3600) => {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();

  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + expiresInSeconds;

  // Params to sign — must be sorted alphabetically before hashing
  const paramsToSign = {
    expires_at: expiresAt,
    public_id:  publicId,
    timestamp,
    type:       'authenticated',
  };

  const signatureBase = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex');

  const query = new URLSearchParams({
    api_key:    apiKey,
    expires_at: String(expiresAt),
    public_id:  publicId,
    signature,
    timestamp:  String(timestamp),
    type:       'authenticated',
  });

  const url = `https://res.cloudinary.com/${cloudName}/raw/download?${query.toString()}`;

  return { url, expiresAt: new Date(expiresAt * 1000).toISOString() };
};

module.exports = {
  uploadRawToCloudinary,
  uploadCsvToCloudinary,
  generateSignedDownloadUrl,
};
