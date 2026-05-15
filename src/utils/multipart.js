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

module.exports = {
  extractFileFromMultipart,
};
