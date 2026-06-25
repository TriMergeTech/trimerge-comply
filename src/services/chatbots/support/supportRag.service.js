const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const ChatbotKnowledgeChunk = require('../../../models/ChatbotKnowledgeChunk');
const { createEmbedding } = require('../../ai/openai.service');

const SUPPORT_CHATBOT_KEY = 'support';
const SUPPORT_MANUAL_FILE_NAME = 'TriMerge_Comply_User_Admin_Manual.pdf';
const SUPPORT_MANUAL_PATH = path.join(__dirname, '../../../../docs', SUPPORT_MANUAL_FILE_NAME);
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_CHUNK_CHARS = 1600;
const CHUNK_OVERLAP_CHARS = 180;

const normalizeText = (text = '') =>
  String(text)
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const cleanManualText = (text = '') =>
  normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^TriMerge Comply \| User & Administration Manual CONFIDENTIAL$/i.test(line)) return false;
      if (/^Version 1\.0 \| June 2026 .* Page \d+$/i.test(line)) return false;
      if (/^.*2026 TriMerge Consulting\. All rights reserved\.$/i.test(line)) return false;
      return true;
    })
    .join('\n')
    .replace(/\b(GET|POST|PATCH|PUT|DELETE)\s+\/api\/[^\s,.;)]+/gi, 'the related platform action')
    .replace(/\/api\/[^\s,.;)]+/gi, 'the related platform area')
    .replace(/\b(request body|json|payload|endpoint|route path)\b/gi, 'platform details')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const getSourceHash = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

const getSectionTitle = (text, pageNumber) => {
  const lines = normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const heading = lines.find((line) => {
    if (line.length > 90) return false;
    if (/^(trimerge comply|user & administration manual|version|release date|classification|prepared for)$/i.test(line)) {
      return false;
    }
    return /[A-Za-z]/.test(line);
  });

  return heading || `Manual page ${pageNumber}`;
};

const splitPageIntoChunks = ({ text, pageNumber, startIndex }) => {
  const normalized = cleanManualText(text);
  if (!normalized) return [];

  const chunks = [];
  let cursor = 0;
  const sectionTitle = getSectionTitle(normalized, pageNumber);

  while (cursor < normalized.length) {
    const remaining = normalized.length - cursor;
    let end = remaining <= MAX_CHUNK_CHARS
      ? normalized.length
      : cursor + MAX_CHUNK_CHARS;

    if (end < normalized.length) {
      const paragraphBreak = normalized.lastIndexOf('\n\n', end);
      const sentenceBreak = normalized.lastIndexOf('. ', end);
      const breakPoint = Math.max(paragraphBreak, sentenceBreak);

      if (breakPoint > cursor + Math.floor(MAX_CHUNK_CHARS * 0.55)) {
        end = breakPoint + (breakPoint === sentenceBreak ? 1 : 0);
      }
    }

    const content = normalized.slice(cursor, end).trim();

    if (content) {
      chunks.push({
        chunkIndex: startIndex + chunks.length,
        pageNumber,
        sectionTitle,
        content,
        contentPreview: content.slice(0, 220),
      });
    }

    if (end >= normalized.length) break;
    cursor = Math.max(end - CHUNK_OVERLAP_CHARS, cursor + 1);
  }

  return chunks;
};

const extractSupportManualChunks = async () => {
  if (!fs.existsSync(SUPPORT_MANUAL_PATH)) {
    throw new Error(`Support manual not found at ${SUPPORT_MANUAL_PATH}`);
  }

  const fileBuffer = fs.readFileSync(SUPPORT_MANUAL_PATH);
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    const pages = Array.isArray(result.pages) ? result.pages : [];
    const chunks = [];

    pages.forEach((page, index) => {
      const pageNumber = Number(page.num) || index + 1;
      const pageChunks = splitPageIntoChunks({
        text: page.text || '',
        pageNumber,
        startIndex: chunks.length,
      });
      chunks.push(...pageChunks);
    });

    return {
      chunks,
      pageCount: result.total || pages.length,
      sourceHash: getSourceHash(fileBuffer),
      sizeBytes: fileBuffer.length,
    };
  } finally {
    await parser.destroy();
  }
};

const reindexSupportManual = async ({ user } = {}) => {
  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
  const extracted = await extractSupportManualChunks();

  if (!extracted.chunks.length) {
    throw new Error('Support manual did not contain readable text to index.');
  }

  const indexedChunks = [];

  for (const chunk of extracted.chunks) {
    const embedding = await createEmbedding(chunk.content);
    indexedChunks.push({
      chatbotKey: SUPPORT_CHATBOT_KEY,
      sourceName: SUPPORT_MANUAL_FILE_NAME,
      sourceType: 'pdf',
      sourceHash: extracted.sourceHash,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      sectionTitle: chunk.sectionTitle,
      content: chunk.content,
      contentPreview: chunk.contentPreview,
      embedding,
      embeddingModel,
      metadata: {
        pageCount: extracted.pageCount,
        sizeBytes: extracted.sizeBytes,
      },
      indexedBy: {
        userId: user?._id || null,
        email: user?.email || null,
        role: user?.role || null,
      },
    });
  }

  await ChatbotKnowledgeChunk.deleteMany({
    chatbotKey: SUPPORT_CHATBOT_KEY,
    sourceName: SUPPORT_MANUAL_FILE_NAME,
  });
  await ChatbotKnowledgeChunk.insertMany(indexedChunks);

  return {
    chatbotKey: SUPPORT_CHATBOT_KEY,
    sourceName: SUPPORT_MANUAL_FILE_NAME,
    sourceHash: extracted.sourceHash,
    pageCount: extracted.pageCount,
    chunkCount: indexedChunks.length,
    embeddingModel,
  };
};

const getSupportManualStatus = async () => {
  const latestChunk = await ChatbotKnowledgeChunk.findOne({
    chatbotKey: SUPPORT_CHATBOT_KEY,
    sourceName: SUPPORT_MANUAL_FILE_NAME,
  })
    .sort({ updatedAt: -1 })
    .select('+embedding')
    .lean();

  const chunkCount = await ChatbotKnowledgeChunk.countDocuments({
    chatbotKey: SUPPORT_CHATBOT_KEY,
    sourceName: SUPPORT_MANUAL_FILE_NAME,
  });

  return {
    chatbotKey: SUPPORT_CHATBOT_KEY,
    sourceName: SUPPORT_MANUAL_FILE_NAME,
    indexed: chunkCount > 0,
    chunkCount,
    sourceHash: latestChunk?.sourceHash || null,
    embeddingModel: latestChunk?.embeddingModel || null,
    lastIndexedAt: latestChunk?.updatedAt || null,
  };
};

const cosineSimilarity = (a = [], b = []) => {
  if (!a.length || !b.length || a.length !== b.length) return 0;

  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aMagnitude += a[i] * a[i];
    bMagnitude += b[i] * b[i];
  }

  if (!aMagnitude || !bMagnitude) return 0;
  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
};

const searchSupportManualChunks = async ({ question, topK = 5 }) => {
  const questionEmbedding = await createEmbedding(question);
  const chunks = await ChatbotKnowledgeChunk.find({
    chatbotKey: SUPPORT_CHATBOT_KEY,
    sourceName: SUPPORT_MANUAL_FILE_NAME,
  })
    .select('+embedding')
    .lean();

  return chunks
    .map((chunk) => ({
      id: chunk._id,
      chatbotKey: chunk.chatbotKey,
      sourceName: chunk.sourceName,
      pageNumber: chunk.pageNumber,
      sectionTitle: chunk.sectionTitle,
      content: chunk.content,
      contentPreview: chunk.contentPreview,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

module.exports = {
  SUPPORT_CHATBOT_KEY,
  SUPPORT_MANUAL_FILE_NAME,
  getSupportManualStatus,
  reindexSupportManual,
  searchSupportManualChunks,
};
