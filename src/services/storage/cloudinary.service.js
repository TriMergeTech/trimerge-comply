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
  publicAccess = false,
}) => {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = sanitizePublicId(fileName);

  // access_control must be in the signed params when supplied
  const accessControl = publicAccess ? '[{"access_type":"anonymous"}]' : null;
  const signedParams = {
    ...(accessControl ? { access_control: accessControl } : {}),
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
  if (accessControl) formData.append('access_control', accessControl);
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
 * Generate a time-limited private download URL for a Cloudinary raw asset.
 *
 * Uses the Cloudinary Admin API download endpoint (api.cloudinary.com) which
 * authenticates via signed query params and bypasses CDN-level ACL restrictions
 * that block direct res.cloudinary.com delivery.  The returned URL is safe to
 * open in a browser — credentials are embedded in the query string.
 *
 * @param {string} publicId - stored on Evidence.file.publicId
 * @returns {string} browser-accessible download URL (1-hour expiry)
 */
const generatePrivateDownloadUrl = (publicId) => {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();
  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + 3600;

  // Cloudinary Admin API requires timestamp in both the signature and the URL.
  // All signed params must also appear in the query string — omitting any one
  // causes the "parameter is signed but missing from URL" validation error.
  const paramsToSign = {
    attachment: 'false',
    expires_at: expiresAt,
    public_id: publicId,
    timestamp,
    type: 'upload',
  };

  const signatureBase = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join('&');

  const signature = crypto.createHash('sha1').update(signatureBase + apiSecret).digest('hex');

  const query = new URLSearchParams({
    api_key: apiKey,
    attachment: 'false',
    expires_at: String(expiresAt),
    public_id: publicId,
    signature,
    timestamp: String(timestamp),
    type: 'upload',
  });

  return `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${query}`;
};

module.exports = {
  uploadRawToCloudinary,
  uploadCsvToCloudinary,
  generatePrivateDownloadUrl,
};
