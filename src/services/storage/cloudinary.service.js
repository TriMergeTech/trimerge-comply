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
 * Generate a signed CDN delivery URL for a Cloudinary raw resource.
 *
 * The account has strict CDN access enabled, so even type=upload files need
 * a URL signature. The correct format embeds the signature in the URL path
 * as s--{sig}--, not as query params. This URL is browser-accessible.
 *
 * Format: https://res.cloudinary.com/{cloud}/raw/upload/s--{sig}--/v{ver}/{publicId}
 *
 * @param {string} publicId - stored on Evidence.file.publicId
 * @param {string} fileUrl  - stored on Evidence.file.fileUrl (used to extract version)
 */
const generateSignedDownloadUrl = (publicId, fileUrl) => {
  const { apiSecret, cloudName } = parseCloudinaryUrl();

  // Extract the version segment from the stored URL (e.g. "v1782320935")
  const versionMatch = fileUrl && fileUrl.match(/\/(v\d+)\//);
  const version = versionMatch ? versionMatch[1] : null;

  // Cloudinary URL signature: SHA-1 of (publicId + apiSecret) → base64url → first 8 chars
  const rawDigest = crypto
    .createHash('sha1')
    .update(publicId + apiSecret)
    .digest();

  const signature = rawDigest
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .substring(0, 8);

  const versionSegment = version ? `${version}/` : '';
  const url = `https://res.cloudinary.com/${cloudName}/raw/upload/s--${signature}--/${versionSegment}${publicId}`;

  return { url };
};

module.exports = {
  uploadRawToCloudinary,
  uploadCsvToCloudinary,
  generateSignedDownloadUrl,
};
