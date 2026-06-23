const getBoundary = (contentType = '') => {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : null;
};

const extractFileFromMultipart = (bodyBuffer, contentType, fieldName = 'file') => {
  const boundary = getBoundary(contentType);

  if (!boundary) {
    return null;
  }

  const body = bodyBuffer.toString('binary');
  const parts = body.split(`--${boundary}`);

  for (const part of parts) {
    if (!part.includes('Content-Disposition')) {
      continue;
    }

    const headerEndIndex = part.indexOf('\r\n\r\n');

    if (headerEndIndex === -1) {
      continue;
    }

    const rawHeaders = part.slice(0, headerEndIndex);
    const isTargetField = new RegExp(`name="${fieldName}"`, 'i').test(rawHeaders);
    const fileNameMatch = rawHeaders.match(/filename="([^"]+)"/i);
    const contentTypeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);

    if (!isTargetField) {
      continue;
    }

    let binaryContent = part.slice(headerEndIndex + 4);
    binaryContent = binaryContent.replace(/\r\n$/, '');

    return {
      fileBuffer: Buffer.from(binaryContent, 'binary'),
      fileName: fileNameMatch?.[1] || 'upload.txt',
      mimeType: contentTypeMatch?.[1] || 'text/plain',
    };
  }

  return null;
};

// Parses a multipart body in one pass — returns the binary file and all text fields.
// fields: { fieldName: value } — any non-file part
// file:   { fileBuffer, fileName, mimeType } | null
const extractMultipartData = (bodyBuffer, contentType, fileField = 'file') => {
  const boundary = getBoundary(contentType);
  if (!boundary) return null;

  const body  = bodyBuffer.toString('binary');
  const parts = body.split(`--${boundary}`);
  const fields = {};
  let file = null;

  for (const part of parts) {
    if (!part.includes('Content-Disposition')) continue;

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const rawHeaders   = part.slice(0, headerEnd);
    const nameMatch    = rawHeaders.match(/name="([^"]+)"/i);
    const fileNameMatch = rawHeaders.match(/filename="([^"]+)"/i);
    const ctMatch      = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);

    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    let content = part.slice(headerEnd + 4);
    content = content.replace(/\r\n$/, '');

    if (fieldName === fileField && fileNameMatch) {
      file = {
        fileBuffer: Buffer.from(content, 'binary'),
        fileName:   fileNameMatch[1],
        mimeType:   ctMatch?.[1]?.trim() || 'application/octet-stream',
      };
    } else {
      fields[fieldName] = content.trim();
    }
  }

  return { file, fields };
};

module.exports = {
  extractFileFromMultipart,
  extractMultipartData,
};
