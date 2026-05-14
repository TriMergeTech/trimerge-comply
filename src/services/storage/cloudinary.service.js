const crypto = require('crypto');

const CLOUDINARY_FOLDER = 'trimerge-comply/csv-uploads';

const parseCloudinaryUrl = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL is required for CSV file storage.');
  }

  const parsedUrl = new URL(cloudinaryUrl);

  return {
    apiKey: decodeURIComponent(parsedUrl.username),
    apiSecret: decodeURIComponent(parsedUrl.password),
    cloudName: parsedUrl.hostname,
  };
};

const sanitizePublicId = (fileName = 'csv-upload') => {
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const safeName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeName || 'csv-upload'}-${Date.now()}`;
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

const uploadCsvToCloudinary = async ({ csvText, fileName = 'upload.csv' }) => {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = sanitizePublicId(fileName);
  const signedParams = {
    folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    timestamp,
  };
  const signature = signUploadParams(signedParams, apiSecret);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
  const formData = new FormData();
  const csvBlob = new Blob([csvText], { type: 'text/csv' });

  formData.append('file', csvBlob, fileName);
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

module.exports = {
  uploadCsvToCloudinary,
};
